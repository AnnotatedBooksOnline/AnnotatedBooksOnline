<?php
//[[GPL]]

require_once 'framework/util/configuration.php';
require_once 'framework/util/cache.php';
require_once 'models/scan/scan.php';
require_once 'models/book/book.php';
//require_once 'models/binding/binding.php';

// Exceptions.
class PdfException extends ExceptionBase
{
    public function __construct()
    {
        parent::__construct();
    }
}

class Pdf
{
    private $identifier;
    private $path;
    private $dpi = 250;
    private $textMargins = 72;
    private $fontSize = 12;
    private $lineSpread = 2;
    
    private $pageWidth;
    private $pageHeight;
    private $autoPrint = false;
    
    private $objectHandles = array();
    private $numObjects = 0;
    private $resources = '';
    private $draws = '';
    private $output = '';
    private $fonts = '';
    private $font;
    private $fontSizes = array();
    private $fontInfo = array();
    private $x = null;
    private $y = null;
    private $pages = array();
    private $pagesId = null;
    private $resourcesId = null;
    private $catalogId = null;
    private $lastFontSize = null;
    private $scanAttr = array();
    
    private $scan;
    private $book;
    private $binding;
    
    private $outputEntry = null;

    /**
     * Creates a new PDF based on the given scan. When possible, the resolution
     * will be at least the configured dpi.
     *
     * scan: the scan to turn into a PDF
     * dimensions: the page dimensions
     *    - width: the width in points (1/72 inch)
     *    - height: the height in points (1/72 inch)
     * print: whether to insert JavaScript to trigger printing on open
     */
    public function __construct($scan, $cacheEntry = null, $dimensions = null, $print = false)
    {
        $this->identifier = uniqid('pdf', true);
        $this->outputEntry = $cacheEntry;
        
        $this->path = Configuration::getInstance()->getString('tile-output-path', '../tiles/tile');
        
        $this->autoPrint = $print;
        
        $this->book = new Book($scan->getBookId());
        //$this->binding = new Binding($book->getBindingId());
        
        if ($dimensions !== null &&
            is_array($dimensions) &&
            isset($dimensions['width']) &&
            isset($dimensions['height']))
        {
            $this->setPageSize($dimensions['width'], $dimensions['height']);
        }
        else
        {
            $this->setPageSize(595, 842);
        }
        
        // Load the default font.
        $this->addFont('DejaVuSans', 'dejavusans.php');
        $this->font = 'DejaVuSans';
        
        $this->createSingleScan($scan);
    }

    /**
     * Returns the generated PDF contents as a binary string.
     * Normally you do not want to use this, as it might use quite a lot of memory.
     */
    public function getContent()
    {
        if ($this->outputEntry === null)
        {
            return $this->output;
        }
        else
        {
            return $this->outputEntry->getContent();
        }
    }
   
    /**
     * Creates the PDF file based on the scan.
     */
    private function createSingleScan($scan, $transcriptions = null)
    {
        $this->scan = $scan;
        $this->textMargins = 36; // 1,25 cm
        
        $minYear = $this->book->getMinYear();
        $maxYear = $this->book->getMaxYear();
        $year = $minYear == $maxYear ? $minYear : ($minYear . ' - ' . $maxYear);
        $title = 'Collaboratory';
        $title .= "\n" . implode(', ', array(
            'Author',
            $this->book->getTitle(),
            $year
        ));
        $title .= "\n" . implode(', ', array(
            $this->book->getPlacePublished(),
            $this->book->getPublisher(),
            'Library',
            'Signature'
        ));
        $title .= "\nPage number: " . $this->scan->getPage();
        $this->drawText($title);
        
        $scanWidth = $this->pageWidth - 2 * $this->textMargins;
        $scanHeight = $this->y - $this->textMargins - 2 * 28 - $this->fontSize;
        
        $this->draw(sprintf('q 1 0 0 1 %F %F cm', $this->textMargins, $this->pageHeight - $this->y - 28 + $this->fontSize));
        
        $points = array(array(10,10), array(60,50), array(110,10), array(110,110), array(60,150), array(10,110));
        $this->drawScan($this->scan, $scanWidth, $scanHeight);
        $this->drawAnnotationPolygon(1, $points);
        
        $this->draw('Q');
        
        $this->y -= $scanHeight + 2 * 28 + $this->fontSize;
        $this->drawText('<internet address> - generated ' . date('l, d M Y H:i:s T'));

        // Finalize the page.
        $this->writePage();
        
        // Produce the final PDF file.
        $this->make();
    }
    
    /**
     * Outputs raw data to the PDF output followed by a newline.
     */
    private function out($value)
    {
        $this->output .= $value . "\n";
    }
    
    /**
     * Creates a circle subpath with radius r centered at point (x,y).
     */
    private function putCircle($x, $y, $r)
    {
        $k = 4*(sqrt(2)-1)/3;
        $circle = array(0, 0, 0, $k, 1-$k, 1, 1, 1, 1+$k, 1, 2, $k, 2, 0, 2, -$k, 1+$k, -1, 1, -1, 1-$k, -1, 0, -$k, 0, 0);
        for ($i = 0; $i < count($circle); $i+=2)
        {
            $circle[$i] = $circle[$i] * $r + $x - $r;
            $circle[$i+1] = $circle[$i+1] * $r + $y;
        }
        $this->draw(vsprintf('%F %F m %F %F %F %F %F %F c %F %F %F %F %F %F c %F %F %F %F %F %F c %F %F %F %F %F %F c h', $circle));
    }
    
    /**
     * Draws the given scan with the given size.
     */
    private function drawScan($scan, $width, $height)
    {
        $z = $scan->getZoomLevel();
        if ($z == 1)
        {
            $size = getimagesize($this->tileName(0, 0, 0));
            $this->scanAttr['tileSize'] = max($size[0], $size[1]);
        }
        else
        {
            $size = getimagesize($this->tileName(0, 0, 1));
            $this->scanAttr['tileSize'] = $size[0];
        }
        
        $this->scanAttr['pageWidth'] = $width;
        $this->scanAttr['pageHeight'] = $height;
        
        $ts = $this->scanAttr['tileSize'];
        $pw = $width;
        $ph = $height;
        $w = $scan->getWidth();
        $h = $scan->getHeight();
        
        // Calculate the desired zoomlevel for the configured dpi.
        for ($zoomLevel = 0; $zoomLevel < $z - 1; $zoomLevel++)
        {
            if (min($w, $h) * pow(2, $zoomLevel) * 72 / $this->dpi >= min($pw, $ph))
            {
                break;
            }
        }
        $cols = ceil($w * pow(2, $zoomLevel) / $ts);
        $rows = ceil($h * pow(2, $zoomLevel) / $ts);
        $this->scanAttr['zoomLevel'] = $zoomLevel;
        $this->scanAttr['cols'] = $cols;
        $this->scanAttr['rows'] = $rows;

        // Calculate the scale of the images.
        // Compensate for the possibility of the edge tiles being smaller.
        $cornerSize = getimagesize($this->tileName($cols - 1, $rows - 1), $zoomLevel);
        $compx = 1 - $cornerSize[0] / $ts;
        $compy = 1 - $cornerSize[1] / $ts;
        $scale = min($pw / ($cols - $compx), $ph / ($rows - $compy));
        $this->scanAttr['compX'] = $compx;
        $this->scanAttr['compY'] = $compy;
        $this->scanAttr['scale'] = $scale;

        // Center the scan on the page.
        $this->draw(sprintf('q 1 0 0 1 %F %F cm',
            ($width - $scale * ($cols - $compx))/2,
            ($height - $scale * ($rows - $compy))/2
        ));

        // Add the tiles.
        for ($y = 0; $y < $rows; $y++)
        for ($x = 0; $x < $cols; $x++)
        {
            $tileWidth = $x == $cols - 1 ? $cornerSize[0] : $ts;
            $tileHeight = $y == $rows - 1 ? $cornerSize[1] : $ts;
            
            $this->newTile($x, $y, $tileWidth, $tileHeight);
        }
        
        $this->draw('Q');
    }
    
    /**
     * Draws given points as an annotation polygon with number i.
     */
    private function drawAnnotationPolygon($i, $points)
    {
        // Colors for the polygons in 'r g b' format.
        $edgeColor = '0 0 0';
        $circleColor = '0 0 0';
        $circleFillColor = '0.9 0.9 0.9';
        $firstCircleFillColor = '0.7 0.7 0.9';
        
        if (count($points) == 0)
        {
            return;
        }
        
        $scale = $this->scanAttr['scale'];
        $cols = $this->scanAttr['cols'];
        $rows = $this->scanAttr['rows'];
        $compx = $this->scanAttr['compX'];
        $compy = $this->scanAttr['compY'];
        $width = $this->scanAttr['pageWidth'];
        $height = $this->scanAttr['pageHeight'];
        
        $this->draw(sprintf('q 1 0 0 1 %F %F cm',
            ($width - $scale * ($cols - $compx))/2,
            ($height - $scale * ($rows - $compy))/2
        ));
        
        // Calculate X and Y scales.
        $sx = $scale * ($cols - $compx) / $this->scan->getWidth();
        $sy = $scale * ($rows - $compy) / $this->scan->getHeight();
        
        // Calculate the resulting scan height.
        $ph = $scale * ($rows - $compy);
        
        $transformedPoints = array();
        foreach($points as $p)
        {
            list($x, $y) = $p;
            $transformedPoints[] = array($sx*$x, $ph-$sy*$y);
        }
        
        // Draw the edges of the polygon as lines.
        $this->draw('q 1 w');
        $first = true;
        foreach($transformedPoints as $p)
        {
            list($x, $y) = $p;
            $this->draw($x . ' ' . $y . ($first ? ' m' : ' l'));
            $first = false;
        }
        $this->draw('h');
        $this->draw($edgeColor . ' RG S Q');
        
        // Draw the vertices of the polygon as points.
        $first = true;
        foreach($transformedPoints as $p)
        {
            list($x, $y) = $p;
            $this->draw('q');
            $this->putCircle($x, $y, $first ? 10 : 5);
            $this->draw('1 w ' . ($first ? $firstCircleFillColor : $circleFillColor) . ' rg ' . $circleColor . ' RG B Q');
            $first = false;
        }
        
        // Draw the number of the annotation in the first vertex.
        $num = str_split((string)$i);
        $width = 0;
        foreach ($num as $char)
        {
            $width += isset($this->fontSizes[$this->font][ord($char)]) ? $this->fontSizes[$this->font][ord($char)] : 600;
        }
        $width *= $this->fontSize / 1000;
        list($x, $y) = $transformedPoints[0];
        $this->draw('q 1 0 0 1 ' . ($x - $width / 2) . ' ' . ($y - $this->fontSize / 2 + $this->fontInfo[$this->font]['XHeight'] * $this->fontSize / 1000 / 4) . ' cm');
        $this->draw('BT /' . $this->font . ' ' . $this->fontSize . ' Tf ' . $this->fromUTF8((string)$i) . ' Tj ET Q');
        
        $this->draw('Q');
    }
    
    /**
     * Creates a new PDF object with the given contents.
     */
    private function newObject($contents)
    {
        $this->numObjects++;
        return $this->updateObject($this->numObjects, $contents);
    }
    
    private function updateObject($id, $contents)
    {
        if ($id <= $this->numObjects)
        {
            $value = $id
                   . " 0 obj\n"
                   . $contents
                   . "\nendobj\n";
            $handle = array($this->identifier, $id);
            $this->objectHandles[$id] = $handle;
            Cache::getFileEntry($handle)->setContent($value);
            return $id;
        }
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
        $file = file_get_contents($this->tileName($x, $y));
        $objectNum = $this->newStream("/Subtype /Image\n"
                                    . "/Width " . $width . "\n"
                                    . "/Height " . $height . "\n"
                                    . "/ColorSpace /DeviceRGB\n"
                                    . "/BitsPerComponent 8\n"
                                    . "/Filter /DCTDecode\n"
                                    , $file);
        $resource = $this->addResource('tilex' . $x . 'y' . $y, $objectNum);

        $scale = $this->scanAttr['scale'];
        $rows = $this->scanAttr['rows'];
        $tileSize = $this->scanAttr['tileSize'];
        $compy = $this->scanAttr['compY'];
        
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
    private function tileName($x, $y, $z = null)
    {
        if ($z === null)
        {
            $z = $this->scanAttr['zoomLevel'];
        }
        return $this->path . '_' . $z . '_' . $x . '_' . $y . '.jpg';
    }
    
    /**
     * Creates the final PDF based on the previously generated pages / objects.
     */
    private function make()
    {
        if (strlen($this->draws) > 0)
        {
            $this->writePage();
        }
        
        $javascript = '';
        if ($this->autoPrint)
        {
            $jsEmbedId = $this->newObject('');
            $jsId = $this->newObject('<< /Names [(EmbeddedJS) ' . $jsEmbedId . ' 0 R] >>');
            $this->updateObject($jsEmbedId, "<< /S /JavaScript /JS (print\(true\);) >>");
            $javascript = '/Names << /JavaScript ' . $jsId . ' 0 R >>';
        }
        $this->catalogId = $this->newObject('<< /Type /Catalog /Pages ' . $this->pagesId . ' 0 R /OpenAction [ ' . $this->pages[0] . ' 0 R /Fit ] ' . $javascript . ' >>');
        
        $pages = implode(' 0 R ', array_values($this->pages)) . ' 0 R';
        $this->updateObject($this->pagesId, '<< /Type /Pages /Count ' . count($this->pages) . ' /Kids [ ' . $pages . ' ] >>');
        $this->updateObject($this->resourcesId, "<< /XObject <<\n" . $this->resources . "\n>> /Font <<\n" . $this->fonts . "\n>> >>");
        
        $infoId = $this->newObject("<<\n" .
            "/Title " . $this->fromUTF8($this->book->getTitle()) . "\n" .
            ">>");
        
        $this->out('%PDF-1.7');
    
        $xref = "0000000000 65535 f \n";

        $offset = strlen($this->output);
        
        $useForeignEntry = true;
        if ($this->outputEntry === null)
        {
            $this->outputEntry = Cache::getFileEntry($this->identifier, 'output');
            $useForeignEntry = false;
        }
        $this->outputEntry->append($this->output);
        $this->output = '';
        
        foreach ($this->objectHandles as $handle)
        {
            $xref .= sprintf("%010d 00000 n \n", $offset);
            $entry = Cache::getFileEntry($handle);
            $offset += $entry->getLength();
            $this->outputEntry->append($entry->getContent());
            $entry->clear();
        }
        
        $this->out('xref');
        $this->out('0 ' . ($this->numObjects + 1));
        $this->out($xref);
        $this->out('trailer << /Size ' . ($this->numObjects + 1) . ' /Root ' . $this->catalogId . ' 0 R /Info ' . $infoId . ' 0 R >>');
        $this->out('startxref');
        $this->out($offset);
        $this->out('%%EOF');
        
        $this->outputEntry->append($this->output);
        
        // Unset all unneeded variables for memory savings.
        foreach (array_keys(get_object_vars($this)) as $var)
        {
            if ($var != 'outputEntry')
            {
                unset($this->$var);
            }
        }
        
        if (!$useForeignEntry)
        {
            Log::debug('We should really be using a foreign CacheEntry here...');
            $this->output = $this->outputEntry->getContent();
            $this->outputEntry->clear();
            unset($this->outputEntry);
            $this->outputEntry = null;
        }
    }
    
    /**
     * Creates a PDF-formatted UTF-16BE string from the given UTF-8 string.
     */
    private function fromUTF8($s)
    {
        if (strlen($s) == 0)
        {
            return '()';
        }
        $result = '';
        $s = mb_convert_encoding($s, 'UTF-16BE', 'UTF-8');
        foreach (str_split($s) as $char)
        {
            $result .= sprintf('%02X', ord($char));
        }
        return '<FEFF' . $result . '>';
    }
    
    /**
     * Creates a PDF-formatted UTF-16BE string from the given UTF-16BE array.
     */
    private function fromUTF16BEArray($s)
    {
        if (count($s) == 0)
        {
            return '()';
        }
        $result = '';
        foreach ($s as $char)
        {
            $result .= sprintf('%02X%02X', ord($char[0]), ord($char[1]));
        }
        return '<FEFF' . $result . '>';
    }
    
    private function toUTF16BEArray($text)
    {
        $text = mb_convert_encoding($text, 'UTF-16BE', 'UTF-8');
        $text = array_chunk(str_split($text), 2);
        return $text;
    }
    
    /**
     * Adds a font for drawing text.
     */
    private function addFont($fontName, $fontFile)
    {
        $fontPath = 'util/fonts/';
        include($fontPath . $fontFile);
        
        if ($type != 'TrueTypeUnicode')
        {
            throw new PdfException('pdf-creation-failed');
        }
        
        $this->fontSizes[$name] = $cw;
        $this->fontInfo[$name] = $desc;
        ksort($cw);
        $prevchar = -1;
        $w = '[ 0 [';
        foreach ($cw as $char => $width)
        {
            for ($c = $prevchar + 1; $c < $char; $c++)
            {
                $w .= ' ' . $dw;
            }
            $w .= ' ' . $width;
            $prevchar = $char;
        }
        $w .= ' ] ]';
        $fontFileId = $this->newStream('/Filter /FlateDecode /Length1 ' . $originalsize, file_get_contents($fontPath . $file));
        $ctgId = $this->newStream('/Filter /FlateDecode', file_get_contents($fontPath . $ctg));
        $fontDescId = $this->newObject("<<\n" .
            "/Type /FontDescriptor\n" .
            "/FontName /" . $name . "\n" .
            "/Flags " . $desc['Flags'] . "\n" .
            "/FontBBox " . $desc['FontBBox'] . "\n" .
            "/ItalicAngle " . $desc['ItalicAngle'] . "\n" .
            "/Ascent " . $desc['Ascent'] . "\n" .
            "/Descent " . $desc['Descent'] . "\n" .
            "/Leading " . $desc['Leading'] . "\n" .
            "/CapHeight " . $desc['CapHeight'] . "\n" .
            "/XHeight " . $desc['XHeight'] . "\n" .
            "/StemV " . $desc['StemV'] . "\n" .
            "/StemH " . $desc['StemH'] . "\n" .
            "/AvgWidth " . $desc['AvgWidth'] . "\n" .
            "/MaxWidth " . $desc['MaxWidth'] . "\n" .
            "/MissingWidth " . $desc['MissingWidth'] . "\n" .
            "/FontFile2 " . $fontFileId. " 0 R\n" .
            ">>");
        $descendantFontsId = $this->newObject("<<\n" .
            "/Type /Font\n" .
            "/Subtype /CIDFontType2\n" .
            "/BaseFont /" . $name . "\n" .
            "/CIDSystemInfo\n<<\n" .
            "/Registry (Adobe)\n" .
            "/Ordering (Identity)\n" .
            "/Supplement 0\n" .
            ">>\n" .
            "/FontDescriptor " . $fontDescId . " 0 R\n" .
            "/DW " . $dw . "\n" .
            "/W " . $w . "\n" .
            "/CIDToGIDMap " . $ctgId . " 0 R\n" .
            ">>");
        $fontId = $this->newObject("<<\n" .
            "/Type /Font\n" .
            "/Subtype /Type0\n" .
            "/BaseFont /" . $name . "\n" .
            "/Name /" . $fontName . "\n" .
            "/Encoding /Identity-H\n" .
            "/DescendantFonts [" . $descendantFontsId . " 0 R]\n" .
            ">>");
            
        $this->fonts .= "/" . $fontName . " " . $fontId . " 0 R\n";
            
        return $cw;
    }
    
    /**
     * Sets the text position pointer to the upperleft corner.
     */
    private function resetPosition()
    {
        $this->x = $this->textMargins;
        $this->y = $this->pageHeight - $this->textMargins - $this->fontSize;
    }
    
    private function drawText($text, $center = false)
    {
        if ($this->x === null || $this->y === null)
        {
            $this->resetPosition();
        }
        if ($this->lastFontSize !== null)
        {
            $this->y += $this->lastFontSize - $this->fontSize;
        }
        $this->lastFontSize = $this->fontSize;
        
        $lines = mb_split("\n", $text);
        foreach($lines as $text)
        {
            if (strlen($text) == 0)
            {
                $this->y -= $this->fontSize + $this->lineSpread;
                $this->x = $this->textMargins;
                continue;
            }
            
            $text = $this->toUTF16BEArray($text);
            $length = count($text);
        
            $x = $this->x;
            $prevEnd = 0;
            $lastSpace = 0;
            $widthSinceSpace = 0;
            $endOfString = false;
            $endOfLine = false;
            for ($i = 0; $i < $length; $i++)
            {
                if ($this->y < $this->textMargins)
                {
                    $this->writePage();
                }
                $charOrd = ord($text[$i][0]) * 256 + ord($text[$i][1]);
                $charWidth = isset($this->fontSizes[$this->font][$charOrd]) ? $this->fontSizes[$this->font][$charOrd] : 600;
                if ($charOrd == ord(' '))
                {
                    $lastSpace = $i;
                    $widthSinceSpace = 0;
                }
                else
                {
                    $widthSinceSpace += $charWidth * $this->fontSize / 1000;
                }
                $x += $charWidth * $this->fontSize / 1000;
                if ($i == $length - 1)
                {
                    $endOfString = true;
                    $lastSpace = $i + 1;
                }
                if ($x >= $this->pageWidth - $this->textMargins || $endOfString)
                {
                    $this->draw('q');
                    if ($center)
                    {
                        $offset = ($this->pageWidth - 2 * $this->textMargins - ($x - $this->x) + ($endOfString ? 0 : $widthSinceSpace + $charWidth * $this->fontSize / 1000)) / 2;
                        $this->draw('1 0 0 1 ' . ($this->x + $offset) . ' ' . $this->y . ' cm');
                    }
                    else
                    {
                        $this->draw('1 0 0 1 ' . $this->x . ' ' . $this->y . ' cm');
                    }
                    $this->draw('BT');
                    $this->draw('/' . $this->font . ' ' . $this->fontSize . ' Tf');
                    if ($endOfString && $text[$i][1] == "\n" && $text[$i][0] == "\0")
                    {
                        $this->draw($this->fromUTF16BEArray(array_slice($text, $prevEnd, $lastSpace - $prevEnd)) . ' Tj');
                    }
                    else
                    {
                        $this->draw($this->fromUTF16BEArray(array_slice($text, $prevEnd, $lastSpace - $prevEnd)) . ' Tj');
                    }
                    $this->draw('ET');
                    $this->draw('Q');
                    $this->y -= $this->fontSize + $this->lineSpread;
                    $this->x = $this->textMargins;
                    $x = $this->x + $widthSinceSpace;
                    $prevEnd = $lastSpace + 1;
                }
            }
        }
    }
    
    private function writePage()
    {
        $drawId = $this->newStream('/Filter /FlateDecode', gzcompress($this->draws));
        $this->draws = '';
        
        if ($this->pagesId === null)
        {
            $this->pagesId = $this->newObject('');
        }
        if ($this->resourcesId === null)
        {
            $this->resourcesId = $this->newObject('');
        }
        
        $pageId = $this->newObject('<< /Type /Page /Parent ' . $this->pagesId . ' 0 R /Resources ' . $this->resourcesId . ' 0 R /Contents ' . $drawId . ' 0 R /MediaBox [ 0 0 ' . $this->pageWidth . ' ' . $this->pageHeight . ' ] >>');
        $this->pages[] = $pageId;
        $this->resetPosition();
    }
    
    private function setPageSize($width, $height)
    {
        $this->pageWidth = $width;
        $this->pageHeight = $height;
    }    
    
    private function setFontSize($points)
    {
        $this->lastFontSize = $this->fontSize;
        $this->fontSize = $points;
    }
}
