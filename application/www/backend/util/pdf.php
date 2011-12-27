<?php
//[[GPL]]

require_once 'framework/util/configuration.php';
require_once 'framework/util/cache.php';
require_once 'models/scan/scan.php';
require_once 'models/book/book.php';
require_once 'models/annotation/annotation.php';
require_once 'models/binding/binding.php';
require_once 'models/library/library.php';
require_once 'models/author/author.php';
require_once 'models/person/person.php';
require_once 'framework/util/log.php';

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
    private $textMarginL = 72;
    private $textMarginT = 72;
    private $textMarginR = 72;
    private $textMarginB = 72;
    private $fontSize = 12;
    private $lineSpread = 2;
    private $productName = 'Collaboratory';
    private $productLogo = 'util/logo.jpg';
    private $productUrl = 'http://sp.urandom.nl/devtest/';
    
    private $pageWidth;
    private $pageHeight;
    private $autoPrint = false;
    
    private $objectHandles = array();
    private $numObjects = 0;
    private $bufferedObjectSizes = array();
    private $buffer = "%PDF-1.7\n";
    private $bufferSize = 9;
    private $maxBufferSize;
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
    private $annots = array();
    private $resourcesId = null;
    private $catalogId = null;
    private $lastFontSize = null;
    private $scanAttr = array();
    private $unicodeId = null;
    private $bookmarks = array();
    private $headerText = '';
    private $headerContinued = false;
    private $pageHasText = false;
    
    private $countPages = false;
    private $pageCountNum = 0;
    private $pageCountState;
    
    private $outputEntry = null;
    
    private $permanentLink;

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
    public function __construct($binding, $cacheEntry, $range = null, $transcriptions = false, $annotations = false)
    {
        $this->identifier = uniqid('pdf', true);
        $this->outputEntry = $cacheEntry;
        $this->outputEntry->clear();
        
        // Use a safe maximal buffer size, knowing that the Cache will double the memory usage.
        $this->maxBufferSize = $this->iniToBytes('memory_limit') / 4;
        
        $this->path = Configuration::getInstance()->getString('install-base', '../');
        $this->path .= Configuration::getInstance()->getString('tile-output-path', '/tiles');
        
        $this->autoPrint = false;
        $this->setPageSize(595, 842);
        
        // Load the default font.
        $this->addFont('DejaVuSans', 'dejavusans.php');
        $this->font = 'DejaVuSans';
        
        if ($range !== null && !is_array($range))
        {
            $scan = Scan::fromBindingPage($binding, $range);
            $book = Book::fromBindingPage($binding, $range);
            $this->permanentLink = $this->productUrl . '#binding-' . $binding->getBindingId() . '-' . $scan[0]->getPage();
            $this->createSingleScan($scan[0], isset($book[0]) ? $book[0] : null, $binding, $transcriptions, $annotations);
        }
        else
        {
            if ($range === null)
            {
                $scans = Scan::fromBinding($binding);
                $books = Book::fromBinding($binding);
                $this->permanentLink = $this->productUrl . '#binding-' . $binding->getBindingId();
            }
            else
            {
                $scans = Scan::fromBindingPage($binding, $range);
                $books = Book::fromBindingPage($binding, $range);
                $this->permanentLink = $this->productUrl . '#binding-' . $binding->getBindingId() . '-' . $scans[0]->getPage();
            }
            $this->createMultiple($scans, $books, $binding, $transcriptions, $annotations, $range !== null);
        }
    }
    
    private function setHeaderText($text = '')
    {
        $this->headerText = $text;
        $this->headerContinued = false;
    }
    
    private function getAuthorNames($book)
    {
        return implode(', ', array_map(function($author)
        {
            $person = new Person($author->getPersonId());
            return $person->getName();
        }, Author::fromBook($book)));
    }
    
    private function iniToBytes($config)
    {
        $val = trim(ini_get($config));
        $last = strtolower($val[strlen($val)-1]);
        switch($last) {
            case 'g':
                $val *= 1024;
            case 'm':
                $val *= 1024;
            case 'k':
                $val *= 1024;
        }
        return $val;
    }

    /**
     * Creates the PDF file based on (a subset of) a binding.
     */
    private function createMultiple($scans, $books, $binding, $transcriptions = false, $annotations = false, $subset = false)
    {
        /*
        $this->startCountPages();
        $this->setFontSize(18);
        $this->drawText('Index' . "\n\n");
        for ($i = 0; $i < 20; $i++)
        {
            $this->setFontSize(14);
            $this->drawText('Book');
            $this->setFontSize(12);
            $this->drawText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean varius dictum nulla et interdum. Sed ut odio non arcu elementum hendrerit et quis justo. Sed id sem velit. Phasellus semper auctor justo, sit amet tempor lectus ultricies at. Fusce et mauris lorem. Nunc erat lorem, cursus sodales dictum sed, gravida sed enim. Sed sed lorem condimentum ligula sollicitudin pharetra quis vel metus. Quisque a dolor at neque auctor varius quis non odio. ' . "\n");
        }
        $indexPages = $this->stopCountPages();
        $this->drawText((string)$indexPages);*/
        
        if (count($books) == 1)
        {
            $this->setFontSize(18);
            $this->drawText($books[0]->getTitle());
            $this->y -= 20;
            
            $minYear = $books[0]->getMinYear();
            $maxYear = $books[0]->getMaxYear();
            $year = $minYear == $maxYear ? $minYear : ($minYear . ' – ' . $maxYear);
            
            $this->setFontSize(14);
            $this->drawText($this->getAuthorNames($books[0]) . ', ' . $year);
            $this->y -= 40;
            
            $this->setFontSize(12);
            if ($books[0]->getPlacePublished() != null)
            {
                $this->drawText($books[0]->getPlacePublished());
            }
            if ($books[0]->getPublisher() != null)
            {
                $this->drawText($books[0]->getPublisher());
            }
        }
        else
        {
            $this->setFontSize(18);
            foreach ($books as $book)
            {
                $this->drawText($book->getTitle());
                $this->y -= 10;
            }
            $this->setFontSize(12);
            $this->y -= 40;
        }
        $library = new Library($binding->getLibraryId());
        $this->drawText($library->getLibraryName() . ', ' . $binding->getSignature());
        $this->y -= 20;
        
        $this->drawText('Generated on ' . date('l, d M Y H:i:s T'));
        $this->addLink($this->drawText($this->permanentLink), $this->permanentLink);
        
        $this->y -= 20;
        if ($transcriptions !== false)
        {
            $this->drawText('With transcriptions');
        }
        if ($subset !== false)
        {
            $this->drawText('Pages ' . $scans[0]->getPage() . ' – ' . $scans[count($scans)-1]->getPage());
        }
        
        list($y, , $x,) = $this->drawJPEGImage($this->productLogo, $this->textMarginL, $this->textMarginB, 0.5, 0.5);
        $this->x = $x + 15;
        $this->y = $y;
        $this->drawText($this->productName);
        
        $this->writePage();
        
        $indexStart = count($this->pages);
        if (count($books) > 1)
        {
            $this->startCountPages();
            $this->setFontSize(18);
            $this->drawText("Index\n");
            foreach ($books as $book)
            {
                $this->textMarginR -= 30;
                $this->setFontSize(14);
                list(, $bottom) = $this->drawText($book->getTitle());
                $this->textMarginR += 30;
                $this->y -= 2;
                
                $minYear = $book->getMinYear();
                $maxYear = $book->getMaxYear();
                $year = $minYear == $maxYear ? $minYear : ($minYear . ' – ' . $maxYear);
                
                $this->setFontSize(12);
                $this->textMarginL += 18;
                $this->x = $this->textMarginL;
                $this->drawText($this->getAuthorNames($book));
                $this->drawText($year);
                if ($book->getPlacePublished() != null)
                {
                    $this->drawText($book->getPlacePublished());
                }
                if ($book->getPublisher() != null)
                {
                    $this->drawText($book->getPublisher());
                }
                $this->y -= 20;
                $this->textMarginL -= 18;
                $this->x = $this->textMarginL;
            }
            $indexPages = $this->stopCountPages();
        }
        
        $first = true;
        foreach($scans as $scan)
        {
            // Add bookmarks for the index.
            foreach($books as $book)
            {
                if ($first || $book->getFirstPage() == $scan->getPage())
                {
                    $this->addBookmark($book);
                }
                $first = false;
            }
            
            if ($transcriptions !== false)
            {
                $anns = Annotation::fromScan($scan);
            }
            
            $this->setPageMargin(36); // 1,25 cm
            $this->resetPosition();
            
            $scanWidth = $this->pageWidth - $this->textMarginL - $this->textMarginR;
            $scanHeight = $this->pageHeight - $this->textMarginT - $this->textMarginB - 28 - $this->fontSize;
            
            $this->draw(sprintf('q 1 0 0 1 %F %F cm', $this->textMarginL, $this->textMarginB + $this->fontSize + 28));

            $this->drawScan($scan, $scanWidth, $scanHeight);

            if ($transcriptions !== false && $annotations !== false)
            {
                for ($i = 1; $i <= count($anns); $i++)
                {
                    $this->drawAnnotationPolygon($i, $anns[$i-1]->getPolygon(), $scan);
                }
            }
            
            $this->draw('Q');
            
            $this->y = $this->textMarginB;
            
            $this->drawText('Page ' . $scan->getPage());
            $this->writePage();
            
            $this->setPageMargin(72); // 2,5 cm
            $this->resetPosition();
            
            if ($transcriptions !== false)
            {
                $this->drawTranscriptions($anns, $scan);
            }
        }
        
        if (count($books) > 1)
        {
            $this->setFontSize(18);
            $this->drawText("Index\n");
            foreach ($this->bookmarks as $bookmark)
            {
                $book = $bookmark[0];
                $page = $bookmark[1] + $indexPages;
                
                $this->textMarginR -= 30;
                $this->setFontSize(14);
                list(, $bottom, , $top) = $this->drawText($book->getTitle());
                $this->textMarginR += 30;
                $this->draw(sprintf('q %F %F m %F %F l h 0 0 0 RG 1 w S Q', $this->textMarginL, $bottom, $this->pageWidth - $this->textMarginR, $bottom));
                $this->y -= 2;
                
                // Draw page number.
                $bottom -= $this->fontInfo[$this->font]['Descent'] * $this->fontSize / 1000;
                $this->setFontSize(12);
                $width = $this->numberWidth($page);
                $this->draw('q 1 0 0 1 ' . ($this->pageWidth - $this->textMarginR - $width) . ' ' . $bottom . ' cm');
                $this->draw('BT /' . $this->font . ' ' . $this->fontSize . ' Tf ' . $this->fromUTF8((string)$page) . ' Tj ET Q');
                
                $minYear = $book->getMinYear();
                $maxYear = $book->getMaxYear();
                $year = $minYear == $maxYear ? $minYear : ($minYear . ' – ' . $maxYear);
                
                $this->setFontSize(12);
                $this->textMarginL += 18;
                $this->x = $this->textMarginL;
                $this->drawText($this->getAuthorNames($book));
                $this->drawText($year);
                if ($book->getPlacePublished() != null)
                {
                    $this->drawText($book->getPlacePublished());
                }
                if ($book->getPublisher() != null)
                {
                    $this->drawText($book->getPublisher());
                }
                $bottom = $this->y;
                $this->textMarginL -= 18;
                $this->x = $this->textMarginL;
                $this->y -= 20;
                $this->addLink(array($this->textMarginL, $bottom, $this->pageWidth - $this->textMarginR, $top), null, false, $this->pages[$bookmark[1]-1]);
            }
            $this->writePage();
            
            //$this->pages = array_slice(array_splice($this->pages, $indexStart, 0, array_slice($this->pages, -$indexPages)), 0, count($this->pages));
            $this->pages = array_merge(
                array_slice($this->pages, 0, $indexStart),
                array_slice($this->pages, -$indexPages),
                array_slice($this->pages, $indexStart, count($this->pages) - $indexStart - $indexPages)
            );
        }
        
        $this->make($books[0]);
    }
    
    /**
     * Creates the PDF file based on the scan.
     */
    private function createSingleScan($scan, $book, $binding, $transcriptions = false, $annotations = false)
    {
        if ($transcriptions !== false)
        {
            $anns = Annotation::fromScan($scan);
        }
        
        $this->setPageMargin(36); // 1,25 cm
        
        // Draw the header.
        $library = new Library($binding->getLibraryId());
        $title = $this->productName;
        $fields = array();
        if ($book !== null)
        {
            $minYear = $book->getMinYear();
            $maxYear = $book->getMaxYear();
            $year = $minYear == $maxYear ? $minYear : ($minYear . ' – ' . $maxYear);
            $fields[] = $this->getAuthorNames($book);
            $fields[] = $book->getTitle();
            $fields[] = $year;
            if ($book->getPlacePublished() != null)
            {
                $fields[] = $book->getPlacePublished();
            }
            if ($book->getPublisher() != null)
            {
                $fields[] = $book->getPublisher();
            }
        }
        $fields[] = $library->getLibraryName();
        $fields[] = $binding->getSignature();
        $title .= "\n" . implode(', ', $fields);
        $title .= "\nPage number: " . $scan->getPage();
        $this->drawText($title);
        
        // Draw the scan, with annotations if required.
        $scanWidth = $this->pageWidth - $this->textMarginL - $this->textMarginR;
        $scanHeight = $this->y - $this->textMarginB - 2 * 28;
        $this->draw(sprintf('q 1 0 0 1 %F %F cm', $this->textMarginL, $this->textMarginB + $this->fontSize + 28));
        $this->drawScan($scan, $scanWidth, $scanHeight);
        if ($transcriptions !== false && $annotations !== false)
        {
            for ($i = 1; $i <= count($anns); $i++)
            {
                $this->drawAnnotationPolygon($i, $anns[$i-1]->getPolygon(), $scan);
            }
        }
        $this->draw('Q');
        
        // Draw the footer.
        $this->y -= $scanHeight + 2 * 28;
        $this->addLink($this->drawText($this->permanentLink, false, true), $this->permanentLink);
        $this->drawText(' — ' . date('l, d M Y H:i:s T'));
        
        $this->writePage();
        
        $this->setPageMargin(72); // 2,5 cm
        $this->resetPosition();
        if ($transcriptions !== false)
        {
            $this->drawTranscriptions($anns, $scan);
        }
        
        // Produce the final PDF file.
        $this->make($book);
    }
    
    /**
     * Outputs raw data to the PDF output followed by a newline.
     */
    private function out($value)
    {
        $this->output .= $value . "\n";
    }
    
    private function startCountPages()
    {
        $this->pageCountState = array(
            $this->x,
            $this->y,
            $this->pageHasText
        );
        $this->countPages = true;
        $this->pageCountNum = 0;
    }
    
    private function stopCountPages()
    {
        list(
            $this->x,
            $this->y,
            $this->pageHasText
        ) = $this->pageCountState;
        $this->countPages = false;
        return $this->pageCountNum + 1;
    }
    
    private function drawJPEGImage($file, $x, $y, $sx = 1, $sy = 1)
    {
        list($width, $height) = getimagesize($file);
        
        $objectNum = $this->newStream("/Subtype /Image\n"
                                    . "/Width " . $width . "\n"
                                    . "/Height " . $height . "\n"
                                    . "/ColorSpace /DeviceRGB\n"
                                    . "/BitsPerComponent 8\n"
                                    . "/Filter /DCTDecode\n"
                                    , file_get_contents($file));
        $resourceName = $this->addResource($objectNum);
        
        $this->draw('q');
        $this->draw('1 0 0 1 ' . $x . ' ' . $y . ' cm');
        $this->draw($sx . ' 0 0 ' . $sy . ' 0 0 cm');
        $this->draw($width . ' 0 0 ' . $height . ' 0 0 cm');
        $this->draw($resourceName . ' Do Q');
        
        return array($x, $y, $x + $width * $sx, $y + $height * $sy);
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
     * Adds a Link Annotation to the specified area.
     */
    private function addLink($area, $uri, $bottomline = true, $pageId = null)
    {
        if ($uri === null && $pageId !== null)
        {
            $action = "/Dest [ " . $pageId . " 0 R /Fit]\n";
        }
        else
        {
            $action = "/A << /S /URI /URI " . $this->escapeString($uri) . " /Type /Action >>\n";
        }
        $this->annots[] = $this->newObject("<<\n" .
        "/Type /Annot\n" .
        "/Subtype /Link\n" .
        "/Rect [ " . vsprintf('%F %F %F %F', $area) . " ]\n" .
        "/Border [0 0 0]\n" .
        $action .
        ">>", true);
        if ($bottomline)
        {
            $this->draw(sprintf('q %F %F m %F %F l h 0 0 0 RG S Q', $area[0], $area[1], $area[2], $area[1]));
        }
    }
    
    private function drawTranscriptions($annotations, $scan)
    {
        if (count($annotations) == 0)
        {
            return;
        }
        
        $this->setHeaderText('Transcriptions for page ' . $scan->getPage());
        for ($i = 1; $i <= count($annotations); $i++)
        {
            $this->setFontSize(14);
            $numPages = count($this->pages);
            $this->drawText('Transcription ' . $i);
            if ($numPages == count($this->pages))
            {
                $this->y -= 7;
            }
            $this->setFontSize(12);
            $this->drawText($annotations[$i-1]->getTranscriptionOrig() . "\n");
        }
        $this->setHeaderText();
        $this->writePage();
    }
    
    /**
     * Adds a bookmark to the current page for the index.
     */
    private function addBookmark($book)
    {
        $this->bookmarks[] = array($book, count($this->pages) + 1);
    }
    
    /**
     * Draws the given scan with the given size.
     */
    private function drawScan($scan, $width, $height)
    {
        $z = $scan->getZoomLevel();
        $sid = $scan->getScanId();
        if ($z == 1)
        {
            $size = getimagesize($this->tileName($sid, 0, 0, 0));
            $this->scanAttr['tileSize'] = max($size[0], $size[1]);
        }
        else
        {
            $size = getimagesize($this->tileName($sid, 0, 0, 1));
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
        $cornerSize = getimagesize($this->tileName($sid, $cols - 1, $rows - 1), $zoomLevel);
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
            
            $this->newTile($sid, $x, $y, $tileWidth, $tileHeight);
        }
        
        $this->draw('Q');
    }
    
    /**
     * Draws given points as an annotation polygon with number i.
     */
    private function drawAnnotationPolygon($i, $points, $scan)
    {
        // Colors for the polygons in 'r g b' format.
        $edgeColor = '0 0 0';
        $circleColor = '0 0 0';
        $circleFillColor = '1.0 1.0 1.0';
        
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
        $sx = $scale * ($cols - $compx) / $scan->getWidth();
        $sy = $scale * ($rows - $compy) / $scan->getHeight();
        
        // Calculate the resulting scan height.
        $ph = $scale * ($rows - $compy);
        
        $transformedPoints = array();
        foreach($points as $p)
        {
            $transformedPoints[] = array($sx*$p['x'], $ph-$sy*$p['y']);
        }
        
        // Draw the edges of the polygon as lines.
        $this->draw('q 2 w');
        $first = true;
        foreach($transformedPoints as $p)
        {
            list($x, $y) = $p;
            $this->draw($x . ' ' . $y . ($first ? ' m' : ' l'));
            $first = false;
        }
        $this->draw('h');
        $this->draw($edgeColor . ' RG S Q');
        
        // Draw the first vertex of the polygon as point.
        list($x, $y) = $transformedPoints[0];
        $this->draw('q');
        $this->putCircle($x, $y, 10);
        $this->draw('1 w ' . $circleFillColor . ' rg ' . $circleColor . ' RG B Q');
        $first = false;
        
        // Draw the number of the annotation in the first vertex.
        $width = $this->numberWidth($i);
        list($x, $y) = $transformedPoints[0];
        $this->draw('q 1 0 0 1 ' . ($x - $width / 2) . ' ' . ($y - $this->fontSize / 2 + $this->fontInfo[$this->font]['XHeight'] * $this->fontSize / 1000 / 4) . ' cm');
        $this->draw('BT /' . $this->font . ' ' . $this->fontSize . ' Tf ' . $this->fromUTF8((string)$i) . ' Tj ET Q');
        
        $this->draw('Q');
    }
    
    private function numberWidth($number)
    {
        $num = str_split((string)$number);
        $width = 0;
        foreach ($num as $char)
        {
            $width += isset($this->fontSizes[$this->font][ord($char)]) ? $this->fontSizes[$this->font][ord($char)] : 600;
        }
        $width *= $this->fontSize / 1000;
        return $width;
    }
    
    /**
     * Creates a new PDF object with the given contents.
     */
    private function newObject($contents, $final = false)
    {
        $this->numObjects++;
        return $this->updateObject($this->numObjects, $contents, $final);
    }
    
    private function updateObject($id, $contents, $final = false)
    {
        if ($id <= $this->numObjects)
        {
            $value = $id
                   . " 0 obj\n"
                   . $contents
                   . "\nendobj\n";
            if ($final)
            {
                $this->objectHandles[$id] = null;
                $this->bufferedObjectSizes[$id] = strlen($value);
                $this->buffer .= $value;
                $this->bufferSize += $this->bufferedObjectSizes[$id];
                if ($this->bufferSize > $this->maxBufferSize)
                {
                    $this->outputEntry->append($this->buffer);
                    $this->buffer = '';
                    $this->bufferSize = 0;
                }
            }
            else
            {
                $handle = array($this->identifier, $id);
                $this->objectHandles[$id] = $handle;
                if ($handle === null)
                {
                    throw new PdfException('pdf-creation-error');
                }
                Cache::getFileEntry($handle)->setContent($value);
            }
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
                              . "\nendstream", true);
    }
    
    /**
     * Adds a new PDF resource reference.
     */
    private function addResource($objectNum)
    {
        $name = 'r' . $objectNum;
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
    private function newTile($scanId, $x, $y, $width, $height)
    {
        $file = file_get_contents($this->tileName($scanId, $x, $y));
        $objectNum = $this->newStream("/Subtype /Image\n"
                                    . "/Width " . $width . "\n"
                                    . "/Height " . $height . "\n"
                                    . "/ColorSpace /DeviceRGB\n"
                                    . "/BitsPerComponent 8\n"
                                    . "/Filter /DCTDecode\n"
                                    , $file);
        $resourceName = $this->addResource($objectNum);

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
        $this->draw($resourceName . ' Do Q');
        
        return $objectNum;
    }
    
    /**
     * Returns the filename of the image at the position requested.
     */
    private function tileName($scanId, $x, $y, $z = null)
    {
        if ($z === null)
        {
            $z = $this->scanAttr['zoomLevel'];
        }
        return $this->path . '/' . $scanId . '/tile_' . $z . '_' . $x . '_' . $y . '.jpg';
    }
    
    /**
     * Creates the final PDF based on the previously generated pages / objects.
     */
    private function make($book)
    {
        if (strlen($this->draws) > 0)
        {
            $this->writePage();
        }
        
        $javascript = '';
        if ($this->autoPrint)
        {
            $jsEmbedId = $this->newObject('');
            $jsId = $this->newObject('<< /Names [(EmbeddedJS) ' . $jsEmbedId . ' 0 R] >>', true);
            $this->updateObject($jsEmbedId, "<< /S /JavaScript /JS (print\(true\);) >>");
            $javascript = '/Names << /JavaScript ' . $jsId . ' 0 R >>';
        }
        $this->catalogId = $this->newObject('<< /Type /Catalog /Pages ' . $this->pagesId . ' 0 R /OpenAction [ ' . $this->pages[0] . ' 0 R /Fit ] ' . $javascript . ' >>');
        
        $pages = implode(' 0 R ', array_values($this->pages)) . ' 0 R';
        $this->updateObject($this->pagesId, '<< /Type /Pages /Count ' . count($this->pages) . ' /Kids [ ' . $pages . ' ] >>');
        
        $infoId = $this->newObject("<<\n" .
            ($book !== null ? ("/Title " . $this->fromUTF8($book->getTitle()) . "\n" .
            "/Author " . $this->fromUTF8($this->getAuthorNames($book)) . "\n") : '') . 
            "/Creator " . $this->fromUTF8($this->productName) . "\n" .
            "/CreationDate " . date("(\D:YmdHis)") . "\n" .
            ">>");
        
        $xref = "0000000000 65535 f \n";

        $offset = 9;
        
        $this->outputEntry->append($this->output);
        $this->output = '';
        
        foreach ($this->bufferedObjectSizes as $key => $size)
        {
            $this->bufferedObjectSizes[$key] = $offset;
            $offset += $size;
        }
        $this->outputEntry->append($this->buffer);
        
        foreach ($this->objectHandles as $key => $handle)
        {
            if ($handle === null)
            {
                $xref .= sprintf("%010d 00000 n \n", $this->bufferedObjectSizes[$key]);
            }
            else
            {
                $xref .= sprintf("%010d 00000 n \n", $offset);
                $entry = Cache::getFileEntry($handle);
                $offset += $entry->getLength();
                $this->outputEntry->append($entry->getContent());
                $entry->clear();
            }
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
        return "<" . $result . '>';
    }
    
    /**
     * Creates a safe text string from the given string.
     */
    private function escapeString($text)
    {
        return '(' . strtr($text, array(')' => '\\)', '(' => '\\(', '\\' => '\\\\', chr(13) => '\r')) . ')';
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
        
        if ($this->unicodeId === null)
        {
            $table  = "/CIDInit /ProcSet findresource begin\n";
            $table .= "12 dict begin\n";
            $table .= "begincmap\n";
            $table .= "/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n";
            $table .= "/CMapName /Adobe-Identity-UCS def\n";
            $table .= "/CMapType 2 def\n";
            $table .= "/WMode 0 def\n";
            $table .= "1 begincodespacerange\n";
            $table .= "<0000> <FFFF>\n";
            $table .= "endcodespacerange\n";
            for ($i = 0; $i < 256; $i++)
            {
                if ($i % 100 == 0)
                {
                    if ($i != 0)
                    {
                        $table .= "endbfrange\n";
                    }
                    $table .= min(100, 256-$i) . " beginbfrange\n";
                }
                $table .= sprintf("<%02x00> <%02xff> <%02x00>\n", $i, $i, $i);
            }
            $table .= "endbfrange\n";
            $table .= "endcmap\n";
            $table .= "CMapName currentdict /CMap defineresource pop\n";
            $table .= "end\n";
            $table .= "end";
            $this->unicodeId = $this->newStream('/Filter /FlateDecode', gzcompress($table));
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
            ">>", true);
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
            ">>", true);
        $fontId = $this->newObject("<<\n" .
            "/Type /Font\n" .
            "/Subtype /Type0\n" .
            "/BaseFont /" . $name . "\n" .
            "/Name /" . $fontName . "\n" .
            "/ToUnicode " . $this->unicodeId . " 0 R\n" .
            "/Encoding /Identity-H\n" .
            "/DescendantFonts [" . $descendantFontsId . " 0 R]\n" .
            ">>", true);
            
        $this->fonts .= "/" . $fontName . " " . $fontId . " 0 R\n";
            
        return $cw;
    }
    
    /**
     * Sets the text position pointer to the upperleft corner.
     */
    private function resetPosition()
    {
        $this->x = $this->textMarginL;
        $this->y = $this->pageHeight - $this->textMarginT - $this->fontSize;
    }
    
    private function setPageMargin($margin)
    {
        $this->textMarginL = $margin;
        $this->textMarginT = $margin;
        $this->textMarginR = $margin;
        $this->textMarginB = $margin;
    }
    
    private function drawText($text = '', $center = false, $omitNewLine = false)
    {
        $numPages = 0;
        
        if ($this->x === null || $this->y === null)
        {
            $this->resetPosition();
        }
        if ($this->lastFontSize !== null)
        {
            $this->y += $this->lastFontSize - $this->fontSize;
        }
        $this->lastFontSize = $this->fontSize;
        
        if ($this->headerText != '' && !$this->pageHasText)
        {
            $this->pageHasText = true;
            $oldFontSize = $this->fontSize;
            $this->setFontSize(12);
            if ($this->countPages)
            {
                /*$numPages += */$this->drawText($this->headerText .
                    ($this->headerContinued ? ' (continued)' : '') . 
                    "\n");
            }
            else
            {
                list(, $bottom) = $this->drawText($this->headerText .
                    ($this->headerContinued ? ' (continued)' : '') . 
                    "\n");
                $bottom -= $this->fontInfo[$this->font]['Descent'] * $this->fontSize / 1000 * 0.5;
                $this->draw(sprintf('q %F %F m %F %F l h 0 0 0 RG 0.5 w S Q', $this->textMarginL, $bottom, $this->pageWidth - $this->textMarginR, $bottom));
            }
            $this->setFontSize($oldFontSize);
        }
        $this->headerContinued = true;
        
        $minY = $this->y;
        $maxY = $this->y + $this->fontSize;
        $minX = $this->x;
        $maxX = $this->x;
        $tempX = $this->x;
        
        $lines = mb_split("\n", $text);
        $numlines = count($lines);
        for ($l = 0; $l < $numlines; $l++)
        {
            $text = $lines[$l];
            
            if (strlen($text) == 0)
            {
                $this->y -= $this->fontSize + $this->lineSpread;
                $this->x = $this->textMarginL;
                $tempX = $this->x;
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
                if ($this->y < $this->textMarginB)
                {
                    if ($this->countPages)
                    {
                        $numPages++;
                        $this->resetPosition();
                    }
                    else
                    {
                        $this->writePage();
                    }
                    if ($this->headerText != '')
                    {
                        $this->drawText();
                        $this->y += $this->fontSize + $this->lineSpread;
                    }
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
                if ($x >= $this->pageWidth - $this->textMarginR || $endOfString)
                {
                    $minY = min($this->y, $minY);
                    if ($endOfString)
                    {
                        $maxX = max($x, $maxX);
                        $tempX = max($x, $tempX);
                    }
                    if (!$this->countPages)
                    {
                        $this->draw('q');
                        if ($center)
                        {
                            $offset = ($this->pageWidth - $this->textMarginL - $this->textMarginR - ($x - $this->x) + ($endOfString ? 0 : $widthSinceSpace + $charWidth * $this->fontSize / 1000)) / 2;
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
                    }
                    if (!$endOfString || $l < $numlines - 1 || !$omitNewLine)
                    {
                        $this->y -= $this->fontSize + $this->lineSpread;
                        $this->x = $this->textMarginL;
                        $tempX = $this->x;
                    }
                    $x = $this->x + $widthSinceSpace;
                    $prevEnd = $lastSpace + 1;
                }
                else
                {
                    $minX = min($x, $minX);
                    $maxX = max($x, $maxX);
                    $tempX = max($x, $tempX);
                }
            }
        }
        $this->x = $tempX;
        $minY += ($this->fontInfo[$this->font]['Descent']) * $this->fontSize / 1000;
        $maxY += ($this->fontInfo[$this->font]['Ascent'] - 1000) * $this->fontSize / 1000;
        if ($this->countPages)
        {
            $this->pageCountNum += $numPages;
        }
        return array($minX, $minY, $maxX, $maxY);
    }
    
    private function writePage($enforce = true)
    {
        if (!$enforce && $this->draws == '')
        {
            return;
        }
        
        $drawId = $this->newStream('/Filter /FlateDecode', gzcompress($this->draws));
        $this->draws = '';
        $annots = count($this->annots) == 0 ? '' : (' /Annots [ ' . implode(' 0 R ', $this->annots) . ' 0 R ] ');
        $this->annots = array();
        
        if ($this->pagesId === null)
        {
            $this->pagesId = $this->newObject('');
        }
        $resourcesId = $this->newObject("<< /XObject <<\n" . $this->resources . "\n>> /Font <<\n" . $this->fonts . "\n>> >>", true);
        $this->resources = '';
        
        $pageId = $this->newObject('<< /Type /Page /Parent ' . $this->pagesId . ' 0 R /Resources ' . $resourcesId . ' 0 R /Contents ' . $drawId . ' 0 R /MediaBox [ 0 0 ' . $this->pageWidth . ' ' . $this->pageHeight . ' ] ' . $annots . '>>', true);
        $this->pages[] = $pageId;
        $this->resetPosition();
        $this->pageHasText = false;
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

