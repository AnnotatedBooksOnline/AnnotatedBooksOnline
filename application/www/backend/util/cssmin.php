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

/**
 * Stylesheet minifier class.
 */
class StylesheetMinifier
{
    private $input;
    private $directory;
    
    /**
     * Minifies CSS.
     *
     * @param string $css CSS to be minified.
     *
     * @return string Minified CSS.
     */
    public static function minify($css, $location)
    {
        $cssmin = new StylesheetMinifier($css, $location);
        return $cssmin->min();
    }
    
    /**
     * Constructor
     *
     * @param string $input    CSS to be minified.
     * @param string $filename Location of the minified file.
     */
    public function __construct($input, $filename)
    {
        $this->input     = $input;
        $this->directory = dirname($filename) . '/';
    }
    
    /**
     * Minifies CSS.
     *
     * @return Minified CSS.
     */
    public function min()
    {
        // Remove comments and unnecessary spaces.
        $input = preg_replace('#/\*(\*[^/]|[^*]+)*\*/#m', '', $this->input);
        $input = preg_replace('/\s+/', ' ', $input);
        $input = preg_replace('/[ ]?([:{};,>]) /', '\1', $input);
        
        // Replace urls with their new locations.
        $input = preg_replace_callback(
            '/url\([\'"\)]?([^\'"\)]+)[\'"\)]?\)/i',
            array($this, 'replaceUrl'),
            $input
        );
        
        return $input;
    }
    
    /**
     * Replaces a CSS url.
     */
    private function replaceUrl($match)
    {
        $url = $match[1];
        
        // Check for absolute links.
        if (preg_match('#^(http[s]?://|/)#', $url))
        {
            return $match[0];
        }
        
        return 'url(' . $this->relativeRealpath($this->directory . $url) . ')';
    }
    
    /**
     * Returns the relative real path.
     */
    private function relativeRealpath($path)
    {
        do
        {
            $oldPath = $path;
            $path = preg_replace('#[\w-]+/\.\./#', '', $oldPath);
        } while ($path != $oldPath);
        
        return $path;
    }
}
