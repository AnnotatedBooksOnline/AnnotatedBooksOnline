<?php

/**
 * An exception thrown when the pyramid builder fails for some reason.
 */
class PyramidBuilderException extends ExceptionBase
{
    
}


/**
 * A class that can be used to register newly uploaded scans which will be put in a queue to be processed.
 */
class PyramidBuilder extends Singleton
{
    /** Singleton instance. */
    protected static $instance;
    
    
    /** An SplQueue of image filenames representing scans waiting to be processed. */
    private $queue;
     
    
    protected function __construct()
    {
        $this->queue = new SplQueue();
    }
    
    /**
     * Runs the pyramid builder on an image. Blocks until the image has been completely processed.
     * 
     * @param string The file name of the image. If it does not start with a '/' the 'input-path' 
     *               configuration is prepended. Otherwise it is seen as the full path of the image.
     * 
     * @throws PyramidBuilderException When the builder returns with a nonzero error code, meaning 
     *                                 an error has occured.
     */
    private function run($image)
    {
        // Determine builder paths and arguments.
        $conf = Configuration::getInstance();
        
        if($image[0] != '/')
        {
            $image = $conf->getString('image-input-path', '.') . '/' . $image;
        }
        
        $output = array();
        $rval = 0;
        $outpath = $conf->getString('tile-output-path', '.');
        $quality = $conf->getInteger('tile-quality', 60);
        $builderpath = $conf->getString('builder-path', './builder');
        
        // Execute builder.
        $command = "$builderpath -q $quality -p $outpath $image";
        exec($command, output, rval);
        
        // Check return value to see whether operation succeeded.
        if($rval != 0)
        {
            throw new PyramidBuilderExeption('builder-failed', $output);
        }
    }
    
    
    
}
