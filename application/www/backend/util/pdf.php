<?php
//[[GPL]]

class PDF
{
    private $path = '/tmp/tiles/tile';
    
    private $objects = array();
    private $numObjects = 0;
    private $resources = '';
    private $draws = '';
    private $output = '';
    
    private $scan;
    private $imageAttr = array();

    /**
     * Creates a new PDF based on the given scan. When possible, the resolution
     * will be at least 150 dpi.
     *
     * scan: the scan to turn into a PDF
     * dimensions: the page dimensions
     *    - width: the width in points (1/72 inch)
     *    - height: the height in points (1/72 inch)
     */
    public function __construct($scan, $dimensions = null)
    {
        $this->scan = array(
            'width' => $scan->getWidth(),
            'height' => $scan->getHeight(),
            'zoomLevel' => $scan->getZoomLevel()
        );
        
        if ($dimensions !== null &&
            is_array($dimensions) &&
            isset($dimensions['width']) &&
            isset($dimensions['height']))
        {
            $this->imageAttr['pageWidth'] = (int)$dimensions['width'];
            $this->imageAttr['pageHeight'] = (int)$dimensions['height'];
        }
        else
        {
            // Assume A4 paper size.
            $this->imageAttr['pageWidth'] = 595;
            $this->imageAttr['pageHeight'] = 842;
        }
        
        $this->createPDF();
    }

    /**
     * Outputs the PDF as a file for downloading.
     * Also sets the correct headers for file download.
     */
    public function outputPDF()
    {
        header('Content-type: application/pdf');
        header('Content-length: ' . strlen($this->output));
        header('Content-disposition: attachment; filename=scan.pdf');
        
        echo $this->output;
    }

    /**
     * Returns the generated PDF contents as a binary string for storage purposes.
     */
    public function getPDF()
    {
        return $this->output;
    }
    
    /**
     * Outputs raw data to the PDF output followed by a newline.
     */
    private function out($value)
    {
        $this->output .= $value . "\n";
    }
    
    /**
     * Creates a new PDF object with the given contents.
     */
    private function newObject($contents)
    {
        $this->numObjects++;
        $this->objects[$this->numObjects] = $this->numObjects 
                              . " 0 obj\n"
                              . $contents
                              . "\nendobj\n";
        return $this->numObjects;
    }
    
    /**
     * Creates a new PDF stream with the given contents.
     */
    private function newStream($headers, $contents)
    {
        return $this->newObject("<<\n"
                              . $headers
                              . "\n/Length " . strlen($contents) . "\n"
                              . ">>\n"
                              . "stream\n"
                              . $contents
                              . "\nendstream");
    }
    
    /**
     * Adds a new PDF resource reference.
     */
    private function addResource($name, $objectNum)
    {
        $this->resources .= "/" . $name . " " . $objectNum . " 0 R\n";
        return "/" . $name;
    }
    
    /**
     * Adds a drawing command to the draw queue.
     */
    private function draw($command)
    {
        $this->draws .= $command . "\n";
    }
    
    /**
     * Adds a new tile to the output.
     */
    private function newTile($x, $y, $width, $height)
    {
        $file = file_get_contents($this->imageName($x, $y));
        $objectNum = $this->newStream("/Subtype /Image\n"
                                    . "/Width " . $width . "\n"
                                    . "/Height " . $height . "\n"
                                    . "/ColorSpace /DeviceRGB\n"
                                    . "/BitsPerComponent 8\n"
                                    . "/Filter /DCTDecode\n"
                                    , $file);
        $resource = $this->addResource('tilex' . $x . 'y' . $y, $objectNum);

        $scale = $this->imageAttr['scale'];
        $rows = $this->imageAttr['rows'];
        $tileSize = $this->imageAttr['tileSize'];
        $compy = $this->imageAttr['compY'];
        
        $sx = $scale * $width / $tileSize;
        $sy = $scale * $height / $tileSize;
        
        $ox = $x * $tileSize / $width;
        $oy = ($rows - $y - $compy) * $tileSize / $height - 1;
        
        $this->draw('q');
        $this->draw($sx . ' 0 0 ' . $sy . ' 0 0 cm');
        $this->draw('1 0 0 1 ' . $ox . ' ' . $oy . ' cm');
        $this->draw($resource . ' Do Q');
        
        return $objectNum;
    }
    
    /**
     * Returns the filename of the image at the position requested.
     */
    private function imageName($x, $y, $z = null)
    {
        if ($z === null)
        {
            $z = $this->imageAttr['zoomLevel'];
        }
        return $this->path . '_' . $z . '_' . $x . '_' . $y . '.jpg';
    }
    
    /**
     * Creates the final PDF based on the objects generated by createPDF.
     */
    private function makePDF($catalogId)
    {
        $this->out('%PDF-1.7');
    
        $xref = "0000000000 65535 f \n";

        $offset = strlen($this->output);
    
        ksort($this->objects);
        foreach ($this->objects as $key => $value)
        {
            $xref .= sprintf("%010d 00000 n \n", $offset);
            $offset += strlen($value);
            $this->output .= $value;
        }
        
        $this->out('xref');
        $this->out('0 ' . ($this->numObjects + 1));
        $this->out($xref);
        $this->out('trailer << /Size ' . ($this->numObjects + 1) . ' /Root ' . $catalogId . ' 0 R >>');
        $this->out('startxref');
        $this->out($offset);
        $this->out('%%EOF');
    }

    /**
     * Creates the PDF file based on the scan.
     */
    private function createPDF()
    {
        $z = $this->scan['zoomLevel'];
        if ($z == 1)
        {
            $size = getimagesize($this->imageName(0, 0, 0));
            $this->imageAttr['tileSize'] = max($size[0], $size[1]);
        }
        else
        {
            $size = getimagesize($this->imageName(0, 0, 1));
            $this->imageAttr['tileSize'] = $size[0];
        }
        
        $ts = $this->imageAttr['tileSize'];
        $pw = $this->imageAttr['pageWidth'];
        $ph = $this->imageAttr['pageHeight'];
        $w = $this->scan['width'];
        $h = $this->scan['height'];
        
        // Calculate the desired zoomlevel for 150 dpi.
        for ($zoomLevel = 0; $zoomLevel < $z; $zoomLevel++)
        {
            if (min($w, $h) * pow(2, $zoomLevel) * 72 / 150 >= min($pw, $ph))
            {
                break;
            }
        }
        $cols = ceil($w * pow(2, $zoomLevel) / $ts);
        $rows = ceil($h * pow(2, $zoomLevel) / $ts);
        $this->imageAttr['zoomLevel'] = $zoomLevel;
        $this->imageAttr['cols'] = $cols;
        $this->imageAttr['rows'] = $rows;

        // Calculate the scale of the images.
        // Compensate for the possibility of the edge tiles being smaller.
        $cornerSize = getimagesize($this->imageName($cols - 1, $rows - 1), $zoomLevel);
        $compx = 1 - $cornerSize[0] / $ts;
        $compy = 1 - $cornerSize[1] / $ts;
        $scale = min($pw / ($cols - $compx), $ph / ($rows - $compy));
        $this->imageAttr['compX'] = $compx;
        $this->imageAttr['compY'] = $compy;
        $this->imageAttr['scale'] = $scale;

        // Add the tiles.
        for ($y = 0; $y < $rows; $y++)
        for ($x = 0; $x < $cols; $x++)
        {
            $tileWidth = $x == $cols - 1 ? $cornerSize[0] : $ts;
            $tileHeight = $y == $rows - 1 ? $cornerSize[1] : $ts;
            
            $this->newTile($x, $y, $tileWidth, $tileHeight);
        }

        // Add the objects to finalize the PDF.
        $drawId = $this->newStream('', $this->draws);
        $pagesId = $this->newObject('<< /Type /Pages /Count 1 /Kids [ ' . ($drawId + 2) . ' 0 R ] >>');
        $firstPageId = $this->newObject('<< /Type /Page /Parent ' . $pagesId . ' 0 R /Resources ' . ($pagesId + 2) . ' 0 R /Contents ' . $drawId . ' 0 R /MediaBox [ 0 0 ' . $scale * ($cols - $compx) . ' ' . $scale * ($rows - $compy) . ' ] >>');
        $resourcesId = $this->newObject("<< /XObject <<\n" . $this->resources . "\n>> >>");
        $catalogId = $this->newObject('<< /Type /Catalog /Pages ' . $pagesId . ' 0 R /OpenAction [ ' . $firstPageId . ' 0 R /Fit ] >>');

        // Produce the final PDF file.
        $this->makePDF($catalogId);
    }
}
