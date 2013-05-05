<?php
/*
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * Copyright: Mathijs Baaijens, Iris Bekker, Renze Droog,
 * Maarten van Duren, Jeroen Hanselman, Bert Massop, Robin van der Ploeg,
 * Tom Tervoort, Gerben van Veenendaal, Tom Wennink.
 */

require_once 'framework/util/cache.php';
require_once 'framework/database/entity.php';
require_once 'models/setting/setting.php';
require_once 'util/jsmin.php';
require_once 'util/cssmin.php';

/**
 * Main controller class.
 */
class MainController extends Controller
{
    /**
     * Loads index page.
     */
    public function actionIndex($data)
    {        
        // Get modification date
        $modified = filemtime('../frontend/main.html');
        
        // Check whether minification is wanted.
        $minify = Configuration::getInstance()->getBoolean('minify-resources', false);
        
        // Fetch main content.
        $content = $this->getContent('../frontend/main.html', $minify);
        
        // Minify if wanted.
        if ($minify)
        {
            // Remove Javascript and stylesheet references.
            $regexp = '#<script[^>]*src="([^"]+)"[^>]*></\s*script>|<link[^>]*href="([^"]+)"[^>]*/>#i';
            $content = preg_replace(
                $regexp,
                '',
                $content
            );
            
            // Replace them with our own references.
            $content = preg_replace(
                '#</\s*head>#i',
                '<link rel="stylesheet" type="text/css" href="?action=style" />' .
                '<script type="text/javascript" src="?action=script"></script></head>',
                $content
            );
        }
        
        // Insert title.
        $content = str_replace('[TITLE]', Setting::getSetting('project-title'), $content);
        
        // Insert current public settings.
        $settings = json_encode(Setting::getSettings(true));
        $content = str_replace('[SETTINGS]', $settings, $content);
        
        // Send headers.
        $this->sendCachingHeaders(strlen($content), 'text/html', $modified);
        
        return $content;
    }
    
    /**
     * Loads Javascript.
     */
    public function actionScript($data)
    {        
        // Fetch Javascript files.
        $files = $this->getJavascriptFilenames();
        
        // Get cache entry.
        $entry = Cache::getFileEntry('script');
        $entry->setDependencyFiles($files);
        
        // Get cache timestamp.
        $modified = $entry->getDependencyTimestamp();
        
        // Handle modified since header.
        $this->handleModifiedSince($modified);
        
        // Check for expiration.
        if ($entry->hasExpired())
        {
            // Fetch Javascript content and set it.
            $this->setMinifiedJavascriptCache($entry, $files);
        }
        else
        {
            $entry->update();
        }
        
        // Send headers.
        $this->sendCachingHeaders($entry->getLength(), 'application/javascript', $modified);
        
        // Output entry.
        $entry->output();
    }
    
    /**
     * Loads stylesheets.
     */
    public function actionStyle($data)
    {
        // Fetch stylesheet files.
        $files = $this->getStylesheetFilenames();
        
        // Get cache entry.
        $entry = Cache::getFileEntry('style');
        $entry->setDependencyFiles($files);
        
        // Get cache timestamp.
        $modified = $entry->getDependencyTimestamp();
        
        // Handle modified since header.
        $this->handleModifiedSince($modified);
        
        // Check for expiration.
        if ($entry->hasExpired())
        {
            // Fetch CSS content and set it.
            $this->setMinifiedStylesheetCache($entry, $files);
        }
        else
        {
            $entry->update();
        }
        
        // Send headers.
        $this->sendCachingHeaders($entry->getLength(), 'text/css', $modified);
        
        // Output entry.
        $entry->output();
    }
    
    private function getJavascriptFilenames()
    {
        // Fetch main content.
        $content = $this->getContent('../frontend/main.html', false);
        
        // Remove comments.
        $content = preg_replace('/<!--(.*?)-->/', '', $content);
        
        // Fetch javascript references.
        $regexp = '#<script.*?src="([^"]+)".*?></\s*script>#i';
        
        $matches = array();
        preg_match_all($regexp, $content, $matches);
        
        $filenames = array();
        foreach ($matches[1] as $filename)
        {
            if (!preg_match('#^(/|http[s]?://)#', $filename))
            {
                $filename = '../' . $filename;
            }
            
            $filenames[] = $filename;
        }
        
        return $filenames;
    }
    
    // Gets minified Javasript from files and puts it in cache.
    private function setMinifiedJavascriptCache($entry, $files)
    {
        // Unset time limit.
        set_time_limit(0);
        
        // Fetch javascript content, and put it in cache entry.
        $entry->clear();
        foreach ($files as $location)
        {
            $content = file_get_contents($location);

            if (substr($location, -6) == 'min.js')
            {
                $entry->append($content);
                $entry->append(";\n");
            }
            else
            {
                $entry->append(JavascriptMinifier::minify($content));
                $entry->append(";\n");
            }
        }
    }
    
    // Gets stylesheet filenames.
    private function getStylesheetFilenames()
    {
        // Fetch main content.
        $content = $this->getContent('../frontend/main.html', false);
        
        // Remove comments.
        $content = preg_replace('/<!--(.*?)-->/', '', $content);
        
        // Fetch stylesheet references.
        $regexp = '#<link.*?href="([^"]+)".*?/>#i';
        
        $matches = array();
        preg_match_all($regexp, $content, $matches);
        
        $filenames = array();
        foreach ($matches[1] as $filename)
        {
            if (!preg_match('#^(/|http[s]?://)#', $filename))
            {
                $filename = '../' . $filename;
            }
            
            $filenames[] = $filename;
        }
        
        return $filenames;
    }
    
    // Gets minified CSS from files and puts it in cache.
    private function setMinifiedStylesheetCache($entry, $files)
    {
        // Fetch stylesheet content, and put it in cache entry.
        $entry->clear();
        foreach ($files as $location)
        {
            $content = file_get_contents($location);
            
            if (substr($location, -6) == 'min.js')
            {
                $entry->append($content);
            }
            else
            {
                $entry->append(StylesheetMinifier::minify($content, 'backend/' . $location));
            }
        }
    }
    
    // Gets HTML content of a file in frontend.
    private function getContent($filename, $minify = true)
    {
        $content = file_get_contents($filename);
        
        if ($minify)
        {
            $content = preg_replace('/<!--(.*?)-->/', '', $content);
            $content = preg_replace('/\s+/', ' ', $content);
            $content = preg_replace('/> </i', '><', $content);
            $content = preg_replace('/<html/i', "\n<html", $content);
        }
        
        return $content;
    }
    
    // Sends caching headers.
    private function sendCachingHeaders($length, $mime, $modified)
    {
        // Send headers.
        header('Pragma: public');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . $length);
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $modified) . ' GMT');
    }
    
    // Handles modified since header.
    private function handleModifiedSince($modified)
    {
        // Handle modified since header.
        if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE']))
        {
            $since = strtotime(current(explode(';', $_SERVER['HTTP_IF_MODIFIED_SINCE'])));
            if ($modified <= $since)
            {
                header('HTTP/1.1 304 Not Modified');
                exit;
            }
        }
    }
}
