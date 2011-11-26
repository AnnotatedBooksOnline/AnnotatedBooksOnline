<?php
//[[GPL]]

// Exceptions.
//class SettingNotFoundException extends ExceptionBase { }

/**
 * Cache entry class.
 */
class CacheEntry
{
    protected $filename;
    protected $content;
    protected $dependencyTimestamp;
    
    /**
     * Constructor.
     */
    public function __construct($key)
    {
        $this->filename   = 'cache/' . $key . '.cache';
        $this->dependency = 0;
        $this->content    = null;
    }
    
    /*
     * Dependency methods.
     */
    
    public function setDependencyFiles($files)
    {
        $this->setDependencyTimestamp(max(array_map('filemtime', $files)));
    }
    
    public function setDependencyTimestamp($timestamp)
    {
        $this->dependencyTimestamp = max($this->dependencyTimestamp, $timestamp);
    }
    
    public function getDependencyTimestamp()
    {
        return $this->dependencyTimestamp;
    }
    
    public function getTimestamp()
    {
        $timestamp = -1;
        if (file_exists($this->filename))
        {
            $timestamp = filemtime($this->filename);
        }
        
        return $timestamp;
    }
    
    public function hasExpired()
    {
        return $this->dependencyTimestamp > $this->getTimestamp();
    }
    
    public function update()
    {
        touch($this->filename);
    }
    
    public function clear()
    {
        if (file_exists($this->filename))
        {
            unlink($this->filename);
        }
    }
    
    /*
     * Content methods.
     */
    
    public function getLength()
    {
        return strlen($this->getContent());
    }
    
    public function getContent()
    {
        if ($this->content !== null)
        {
            return $this->content;
        }
        
        if (file_exists($this->filename))
        {
            $this->content = unserialize(file_get_contents($this->filename));
        }
        else
        {
            $this->content = null;
        }
        
        return $this->content;
    }
    
    public function setContent($content)
    {
        file_put_contents($this->filename, serialize($content));
        
        $this->content = $content;
    }
    
    public function output()
    {
        echo $this->getContent();
    }
}

/**
 * File cache entry class.
 */
class FileCacheEntry extends CacheEntry
{
    /*
     * Content methods.
     */
    
    public function getContent()
    {
        if (file_exists($this->filename))
        {
            return file_get_contents($this->filename);
        }
        else
        {
            return null;
        }
    }
    
    public function append($content)
    {
        file_put_contents($this->filename, $content, FILE_APPEND);
        
        $this->content = ($this->content === null) ? null : $this->content . $content;
    }
    
    public function getLength()
    {
        return filesize($this->filename);
    }
    
    public function setContent($content)
    {
        file_put_contents($this->filename, (string) $content);
        
        $this->content = $content;
    }
    
    public function output()
    {
        // Unset time limit.
        set_time_limit(0);
        
        // Pass file through.
        readfile($this->filename);
    }
}

/**
 * APC cache entry class.
 */
class APCCacheEntry extends CacheEntry
{
    // TODO: Implement.
}

/**
 * Cache class.
 */
class Cache
{
    private static $apcEnabled = null;
    
    /**
     * Construction is not allowed.
     */
    private function __construct() { }
    
    /**
     * Gets a cache entry.
     *
     * @param  ...  Values on which cache depends.
     *
     * @return  The cache entry.
     */
    public static function getEntry()
    {
        // Calculate key.
        $key = md5(serialize(func_get_args()));
        
        // Check for the APC extension.
        if (self::$apcEnabled === null)
        {
            self::$apcEnabled = extension_loaded('apc');
        }
        
        // Get a normal or APC cache entry.
        if (self::$apcEnabled)
        {
            return new APCCacheEntry($key);
        }
        else
        {
            return new CacheEntry($key);
        }
    }
    
    /**
     * Gets a file cache entry.
     *
     * @param  ...  Values on which cache depends.
     *
     * @return  The cache entry.
     */
    public static function getFileEntry()
    {
        // Calculate key.
        $key = md5('file' . serialize(func_get_args()));
        
        // Get a file cache entry.
        return new FileCacheEntry($key);
    }
}
