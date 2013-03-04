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

require_once 'framework/util/configuration.php';
require_once 'framework/util/cache.php';
require_once 'models/scan/scan.php';
require_once 'models/book/book.php';
require_once 'models/annotation/annotation.php';
require_once 'models/binding/binding.php';
require_once 'models/library/library.php';
require_once 'models/author/author.php';
require_once 'models/person/person.php';
require_once 'models/language/language.php';
require_once 'models/language/booklanguage.php';
require_once 'models/language/booklanguagelist.php';
require_once 'models/setting/setting.php';
require_once 'framework/util/log.php';

// Exceptions.
class PdfException extends ExceptionBase
{
    public function __construct()
    {
        parent::__construct();
    }
}

/**
 * A PDF exporting class. Exports bindings or a subset thereof to the PDF format.
 *
 * This class has no public methods other than its constructor: it immediately exports to the given CacheEntry.
 *
 * All dimensions are in points, equalling 1/72 inch, unless indicated otherwise.
 */
class Pdf
{
    private $identifier;
    private $path = '../data/tiles/';
    private $dpi = 250;
    private $textMarginL = 72;
    private $textMarginT = 72;
    private $textMarginR = 72;
    private $textMarginB = 72;
    private $fontSize = 12;
    private $lineSpread = 2;
    private $productLogo = 'util/logo.jpg';
    private $productName;
    private $productShowName = false;
    private $productUrl;
    
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
    
    private $stackDepth = 0;
    
    private $outputEntry = null;
    
    private $permanentLink;

    /**
     * Creates a new PDF based on the given scan.
     *
     * @param Binding    $binding        The Binding to export.
     * @param CacheEntry $cacheEntry     The CacheEntry to export to.
     * @param mixed      $range          The range of pages to export. This may be null for all, a number for a single page and an array of two numbers for a range.
     * @param callback   $transcriptions Function that extracts required transcription languages from Annotations.
     * @param boolean    $annotations    Whether to include annotations on the scans. Only valid on combination with transcriptions parameter set.
     */
    public function __construct(Binding $binding, CacheEntry $cacheEntry, $range = null, $transcriptions = null, $annotations = false)
    {              
        // Start a transaction. We don't really need to worry about rolling back in case of an exception or 
        // such since only reads are being done on the DB.
        Database::getInstance()->startTransaction();
        
        $this->productUrl = Configuration::getBaseURL();
        $this->productName = Setting::getSetting('project-title');
        $this->identifier = uniqid('pdf', true);
        $this->outputEntry = $cacheEntry;
        $this->outputEntry->clear();
        
        // Use a safe maximal buffer size, knowing that the Cache will double the memory usage.
        $this->maxBufferSize = $this->iniToBytes('memory_limit') / 8;
        
        $this->autoPrint = false;
        $this->setPageSize(595, 842);
        
        // Load the default font.
        $this->addFont('FullUnicodeSans', 'fullunicodesans.php');
        $this->font = 'FullUnicodeSans';
        
        if ($range !== null && !is_array($range))
        {
            $scan = Scan::fromBindingPage($binding, $range);
            $book = Book::fromBindingPage($binding, $range);
            $this->permanentLink = $this->productUrl . '#view-' . $scan[0]->getPage();
            if (count($scan) > 0)
            {
                $this->createSingleScan($scan[0], isset($book[0]) ? $book[0] : null, $binding, $transcriptions, $annotations);
            }
            else
            {
                throw new PdfException('pdf-no-scans');
            }
        }
        else
        {
            if ($range === null)
            {
                $scans = Scan::fromBinding($binding);
                $books = Book::fromBinding($binding);
                $this->permanentLink = $this->productUrl . '#view';
            }
            else
            {
                $scans = Scan::fromBindingPage($binding, $range);
                $books = Book::fromBindingPage($binding, $range);
                if (count($scans) > 0)
                {
                    $this->permanentLink = $this->productUrl . '#view-' . $scans[0]->getPage();
                }
            }
            if (count($scans) > 0)
            {
                $this->createMultiple($scans, $books, $binding, $transcriptions, $annotations, $range !== null);
            }
            else
            {
                throw new PdfException('pdf-no-scans');
            }
        }
        
        // Commit.
        Database::getInstance()->commit();
    }
    
    /**
     * Sets the header text, which will be displayed on top of every (next, when the current page has text) page.
     *
     * @param string $text The header text. Omit this argument or use the empty string to disable header text.
     */
    private function setHeaderText($text = '')
    {
        $this->headerText = $text;
        $this->headerContinued = false;
    }
    
    /**
     * Gets pretty formatted author names of a book.
     *
     * @param Book $book The book.
     */
    private function getAuthorNames(Book $book)
    {
        $authors = implode(', ', array_map(function($author)
        {
            $person = new Person($author->getPersonId());
            return $person->getName();
        }, Author::fromBook($book)));
        
        if ($authors == '')
        {
            $authors = "Unknown author";
        }
        return $authors;
    }
    
    /**
     * Gets pretty formatted languages of a book.
     *
     * @param Book $book The book.
     */
    private function getLanguageNames(Book $book)
    {
        $list = BookLanguageList::find(array('bookId' => $book->getBookId()));
        $langs = array();
        foreach ($list as $booklang)
        {
            $lang = new Language($booklang->getLanguageId());
            $langs[] = $lang->getLanguageName();
        }
        $langs = implode(', ', $langs);
        return $langs;
    }
    
    /**
     * Helper function to convert a php.ini numeric value to an integer.
     *
     * @param string $config The configuration option to read and convert.
     */
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
     *
     * @param array    $scans          An array of scans to export.
     * @param array    $books          An array of books that match the given scans.
     * @param Binding  $binding        The encapsulating binding.
     * @param callback $transcriptions Function that extracts required transcription languages from Annotations.
     * @param boolean  $annotations    Whether to include annotations on top of the scans. Only valid in conjunction with a set transcriptions parameter.
     * @param boolean  $subset         Whether this selection of pages is a subset of the binding.
     */
    private function createMultiple(array $scans, array $books, Binding $binding, $transcriptions = null, $annotations = false, $subset = false)
    {
        // Make title page.

        $this->setFontSize(18);
        foreach ($books as $book)
        {
            $this->drawText($book->getTitle());
            $this->y -= 10;
        }
        $this->setFontSize(12);
        $this->y -= 40;
                
        $this->drawText('From ' . $this->productName . ', ' . date('l, d M Y H:i:s T'));
        $this->addLink($this->drawText($this->permanentLink), $this->permanentLink);
        
        $this->y -= 20;
        if ($transcriptions !== null)
        {
            $this->drawText('With annotations');
        }
        if ($subset !== false)
        {
            $this->drawText('Pages ' . $scans[0]->getPage() . ' – ' . $scans[count($scans)-1]->getPage());
        }
        
        list($y, , $x,) = $this->drawJPEGImage($this->productLogo, $this->textMarginL, $this->textMarginB, 0.5, 0.5);
        
        if ($this->productShowName)
        {
            $this->x = $x + 15;
            $this->y = $y;
            $this->drawText($this->productName);
        }
        
        $this->writePage();
        
        // Initialize index if necessary: count the number of pages it will use.
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
                
                $publish = "";
                if ($book->getPlacePublished() != null)
                {
                    $publish = $book->getPlacePublished();
                }
                if ($book->getPublisher() != null)
                {
                    if ($publish != "")
                    {
                        $publish .= ": ";
                    }
                    $publish .= $book->getPublisher();
                }
                if ($publish != "")
                {
                    $publish .= ", ";
                }
                $publish .= $year;
                if ($book->getPrintVersion() != null)
                {
                    $publish .= ", edition " . $book->getPrintVersion();
                }
                $this->drawText($publish);

                $langs = $this->getLanguageNames($book);
                if ($langs != '')
                {
                    $this->drawText($langs);
                }
                $this->y -= 20;
                $this->textMarginL -= 18;
                $this->x = $this->textMarginL;
            }
            $indexPages = $this->stopCountPages();
        }
        
        // Output scans and transcriptions.
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
            
            if ($transcriptions !== null)
            {
                $anns = Annotation::fromScan($scan);
            }
            
            $this->setPageMargin(36); // 1,25 cm
            $this->resetPosition();
            
            $scanWidth = $this->pageWidth - $this->textMarginL - $this->textMarginR;
            $scanHeight = $this->pageHeight - $this->textMarginT - $this->textMarginB - 28 - $this->fontSize;
            
            $this->pushState();
                $this->translate($this->textMarginL, $this->textMarginB + $this->fontSize + 28);
                $this->drawScan($scan, $scanWidth, $scanHeight);
                if ($transcriptions !== null && $annotations !== false)
                {
                    for ($i = 1; $i <= count($anns); $i++)
                    {
                        $this->drawAnnotationPolygon($i, $anns[$i-1]->getPolygon(), $scan);
                    }
                }
            $this->popState();
            
            $this->y = $this->textMarginB;
            
            $this->drawText('Page ' . $scan->getPage());
            $this->writePage();
            
            $this->setPageMargin(72); // 2,5 cm
            $this->resetPosition();
            
            if ($transcriptions !== null)
            {
                $this->drawTranscriptions($anns, $scan, $transcriptions);
            }
            
            // Use at max 5 seconds per scan.
            set_time_limit(5);
        }
        
        // Write the index.
        if (count($books) > 1)
        {
            $this->setFontSize(18);
            $this->drawText("Index\n");
            foreach ($this->bookmarks as $bookmark)
            {
                $book = $bookmark[0];
                $page = $bookmark[1] + $indexPages;
                
                // Draw book title.
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
                $this->pushState();
                    $this->translate($this->pageWidth - $this->textMarginR - $width, $bottom);
                    $this->addToSubset($this->toUTF16BEArray((string)$page));
                    $this->draw('BT /' . $this->font . ' ' . $this->fontSize . ' Tf ' . $this->fromUTF8((string)$page) . ' Tj ET');
                $this->popState();
                
                $minYear = $book->getMinYear();
                $maxYear = $book->getMaxYear();
                $year = $minYear == $maxYear ? $minYear : ($minYear . ' – ' . $maxYear);
                
                // Draw book information.
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
                if ($book->getPrintVersion() != null)
                {
                    $this->drawText('Edition ' . $book->getPrintVersion());
                }
                $langs = $this->getLanguageNames($book);
                if ($langs != '')
                {
                    $this->drawText($langs);
                }
                $bottom = $this->y;
                $this->textMarginL -= 18;
                $this->x = $this->textMarginL;
                $this->y -= 20;
                $this->addLink(array($this->textMarginL, $bottom, $this->pageWidth - $this->textMarginR, $top), null, false, $this->pages[$bookmark[1]-1]);
            }
            $this->writePage();
            
            // Put the index in front of the scans.
            $this->pages = array_merge(
                array_slice($this->pages, 0, $indexStart),
                array_slice($this->pages, -$indexPages),
                array_slice($this->pages, $indexStart, count($this->pages) - $indexStart - $indexPages)
            );
        }
        
        $this->make(count($books) > 0 ? $books[0] : null);
    }
    
    /**
     * Creates the PDF file based on the scan.
     *
     * @param Scan     $scan           The scan to export.
     * @param Book     $book           The encapsulating book, or null if none.
     * @param Binding  $binding        The encapsulating binding.
     * @param callback $transcriptions Function that extracts required transcription languages from Annotations.
     * @param boolean  $annotations    Whether to include annotations on top of the scans. Only valid in conjunction with a set transcriptions parameter.
     */
    private function createSingleScan(Scan $scan, Book $book = null, Binding $binding, $transcriptions = null, $annotations = false)
    {
        if ($transcriptions !== null)
        {
            $anns = Annotation::fromScan($scan);
        }
        
        $this->setPageMargin(36); // 1,25 cm
        
        // Draw the header.
        $title = "\nPage " . $scan->getPage();
        $this->drawText($title);
        
        // Draw the scan, with annotations if required.
        $footerHeight = 2 * $this->fontSize;
        $scanMargin = 28;
        $scanWidth = $this->pageWidth - $this->textMarginL - $this->textMarginR;
        $scanHeight = $this->y - $this->textMarginB - 2 * $scanMargin - $footerHeight;

        $this->pushState();
            $this->translate($this->textMarginL, $this->textMarginB + $this->fontSize + $scanMargin + $footerHeight);
            $this->drawScan($scan, $scanWidth, $scanHeight);
            if ($transcriptions !== null && $annotations !== false)
            {
                for ($i = 1; $i <= count($anns); $i++)
                {
                    $this->drawAnnotationPolygon($i, $anns[$i-1]->getPolygon(), $scan);
                }
            }
        $this->popState();
        
        // Draw the footer.
        $this->y -= $scanHeight + 2 * $scanMargin;
        $this->drawText('From ' . $this->productName . ', ' . date('l, d M Y H:i:s T'));
        $this->addLink($this->drawText($this->permanentLink, false, true), $this->permanentLink);
        
        $this->writePage();
        
        $this->setPageMargin(72); // 2,5 cm
        $this->resetPosition();
        if ($transcriptions !== null)
        {
            $this->drawTranscriptions($anns, $scan, $transcriptions);
        }
        
        // Produce the final PDF file.
        $this->make($book);
    }
    
    /**
     * Outputs raw data to the PDF output followed by a newline.
     *
     * @param string $value The raw data to output.
     */
    private function out($value)
    {
        $this->output .= $value . "\n";
    }
    
    /**
     * Starts page counting mode, disabling any kind of textual output.
     * This is a dry run mode to determine how many pages a specific text output will take.
     */
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
    
    /**
     * Stops page counting mode.
     *
     * @return integer The number of pages the text occupied.
     */
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
    
    /**
     * Draws a JPEG image at the given location.
     *
     * A scale of one corresponds with scaling each image pixel to a point (1/72 inch) in the output.
     *
     * @param string  $file The filename.
     * @param integer $x    The X position in the document.
     * @param integer $y    The Y position in the document.
     * @param number  $sx   The X scale of the image, defaults to 1.
     * @param number  $sy   The Y scale of the image, defaults to 1.
     *
     * @return array The bounding box of the image.
     */
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
        
        $this->pushState();
            $this->translate($x, $y);
            $this->scale($sx, $sy);
            $this->scale($width, $height);
            $this->draw($resourceName . ' Do');
        $this->popState();
        
        return array($x, $y, $x + $width * $sx, $y + $height * $sy);
    }
    
    /**
     * Creates a circle subpath with radius r centered at point (x,y).
     *
     * @param number $x The X coordinate of the circle.
     * @param number $y The Y coordinate of the circle.
     * @param number $r The radius of the circle, in points.
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
     * Adds a Link Annotation to the specified area. This can be an external link or a page link.
     *
     * @param array   $area       The bounding box of the link.
     * @param string  $uri        The URI to link to, or null for page link.
     * @param boolean $bottomline Whether to draw a line underneath the link.
     * @param integer $pageId     The page object ID to link to, in case of a page link.
     */
    private function addLink(array $area, $uri, $bottomline = true, $pageId = null)
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
    
    /**
     * Exports the transcriptions.
     *
     * @param array    $annotations    The annotations that contain the transcriptions.
     * @param Scan     $scan           The encapsulating scan.
     * @param callback $transcriptions Function that extracts required transcription languages from Annotations.
     */
    private function drawTranscriptions(array $annotations, Scan $scan, $transcriptions)
    {
        if (count($annotations) == 0)
        {
            return;
        }
        
        $this->setHeaderText('Annotations for page ' . $scan->getPage());
        for ($i = 1; $i <= count($annotations); $i++)
        {
            $this->setFontSize(16);
            $this->drawText('Annotation ' . $i);
            $this->y -= 7;
            foreach ($transcriptions($annotations[$i-1]) as $name => $text)
            {
                $this->setFontSize(14);
                $numPages = count($this->pages);
                $this->drawText($name);
                if ($numPages == count($this->pages))
                {
                    $this->y -= 7;
                }
                $this->setFontSize(12);
                $this->drawText($text . "\n");
            }
        }
        $this->setHeaderText();
        $this->writePage();
    }
    
    /**
     * Adds a bookmark to the current page for the index.
     *
     * @param Book $book The book to add a bookmark to.
     */
    private function addBookmark(Book $book)
    {
        $this->bookmarks[] = array($book, count($this->pages) + 1);
    }
    
    /**
     * Draws a scan, scaling it to fit in the given width and height.
     *
     * @param Scan   $scan   The scan to draw.
     * @param number $width  The maximum width of the scan in points.
     * @param number $height The maximum height of the scan in points.
     */
    private function drawScan($scan, $width, $height)
    {
        $this->pushState();
        
            $z = $scan->getZoomLevel();
            $sid = $scan->getScanId();
            $w = $scan->getWidth();
            $h = $scan->getHeight();
            
            $this->scanAttr['rotate'] = $w > 1.1 * $h;
            
            if ($this->scanAttr['rotate'])
            {
                $this->rotate(90);
                $this->translate(0, -$width);
                list($width, $height) = array($height, $width);
            }
            
            $size = getimagesize($this->tileName($sid, 0, 0, $z - 1));
            $this->scanAttr['tileSize'] = max($size[0], $size[1]);
            
            $this->scanAttr['pageWidth'] = $width;
            $this->scanAttr['pageHeight'] = $height;
            
            $ts = $this->scanAttr['tileSize'];
            $pw = $width;
            $ph = $height;
            
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
            $this->translate(($width - $scale * ($cols - $compx))/2, ($height - $scale * ($rows - $compy))/2);

            // Add the tiles.
            for ($y = 0; $y < $rows; $y++)
            for ($x = 0; $x < $cols; $x++)
            {
                $tileWidth = $x == $cols - 1 ? $cornerSize[0] : $ts;
                $tileHeight = $y == $rows - 1 ? $cornerSize[1] : $ts;
                
                $this->newTile($sid, $x, $y, $tileWidth, $tileHeight);
            }
        
        $this->popState();
    }
    
    /**
     * Draws given points as an annotation polygon with number i.
     *
     * @param integer $i      The index of the polygon for reference to the transcription.
     * @param array   $points The points of the polygon.
     * @param Scan    $scan   The encapsulating scan.
     */
    private function drawAnnotationPolygon($i, array $points, Scan $scan)
    {
        // Colors for the polygons in 'r g b' format.
        $edgeColor = '0 0 0';
        $circleColor = '0 0 0';
        $circleFillColor = '0.961 0.894 0.612';
        
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
        
        $this->pushState();
            
            if ($this->scanAttr['rotate'])
            {
                $this->rotate(90);
                $this->translate(0, -$height);
            }
            
            $this->translate(($width - $scale * ($cols - $compx))/2, ($height - $scale * ($rows - $compy))/2);
            
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
            $this->pushState();
                $this->draw('2 w');
                $first = true;
                foreach($transformedPoints as $p)
                {
                    list($x, $y) = $p;
                    $this->draw($x . ' ' . $y . ($first ? ' m' : ' l'));
                    $first = false;
                }
                $this->draw('h');
                $this->draw($edgeColor . ' RG S');
            $this->popState();
            
            // Draw the first vertex of the polygon as point.
            list($x, $y) = $transformedPoints[0];
            $this->pushState();
                $this->putCircle($x, $y, 10);
                $this->draw('1 w ' . $circleFillColor . ' rg ' . $circleColor . ' RG B');
            $this->popState();
            $first = false;
            
            // Draw the number of the annotation in the first vertex.
            $width = $this->numberWidth($i);
            list($x, $y) = $transformedPoints[0];
            $this->translate($x, $y);
            $this->translate(-$width / 2, -$this->fontSize / 2 + $this->fontInfo[$this->font]['XHeight'] * $this->fontSize / 1000 / 4);
            $this->addToSubset($this->toUTF16BEArray((string)$i));
            $this->draw('BT /' . $this->font . ' ' . $this->fontSize . ' Tf ' . $this->fromUTF8((string)$i) . ' Tj ET');
        
        $this->popState();
    }
    
    /**
     * Calculates the width of a numerical string. It is assumed that the input is numeric and the number will fit on the line.
     *
     * @param integer $number The number to calculate the textual width of.
     */
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
     *
     * @param string  $contents The raw content data.
     * @param boolean $final    Whether this object can immediately be written to the output (when true, updateObject() cannot be used).
     *
     * @return integer The object ID.
     */
    private function newObject($contents, $final = false)
    {
        $this->numObjects++;
        return $this->updateObject($this->numObjects, $contents, $final);
    }
    
    /**
     * Updates an existing PDF object.
     *
     * @param integer $id       The object ID to manipulate.
     * @param string  $contents The raw content data.
     * @param boolean $final    Whether this object can immediately be written to the output (when true, updateObject() can no longer be used).
     *
     * @return integer The object ID.
     */
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
     * Creates a new PDF stream object with the given contents.
     *
     * @param string $headers  Additional stream dictionary contents (/Length is generated automatically).
     * @param string $contents The raw content data.
     *
     * @return integer The object ID.
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
     * Sets the contents of the given PDF object to a stream with the given contents and finalizes the object.
     *
     * @param integer $id       The object ID to manipulate.
     * @param string  $headers  Additional stream dictionary contents (/Length is generated automatically).
     * @param string  $contents The raw content data.
     *
     * @return integer The object ID.
     */
    private function setStream($id, $headers, $contents)
    {
        return $this->updateObject($id, "<<\n"
                                 . $headers
                                 . "\n/Length " . strlen($contents) . "\n"
                                 . ">>\n"
                                 . "stream\n"
                                 . $contents
                                 . "\nendstream", true);
    }
    
    /**
     * Adds a new PDF resource reference.
     *
     * @param integer $objectId The object ID to add as a reference.
     *
     * @return string The generated reference name.
     */
    private function addResource($objectId)
    {
        $name = 'r' . $objectId;
        $this->resources .= "/" . $name . " " . $objectId . " 0 R\n";
        return "/" . $name;
    }
    
    /**
     * Affine transforms the current transformed origin with matrix
     * \verbatim
       a b e
       c d f
       0 0 1
       \endverbatim
     *
     * @param number $a
     * @param number $b
     * @param number $c
     * @param number $d
     * @param number $e
     * @param number $f
     */
    private function affine($a, $b, $c, $d, $e, $f)
    {
        $this->draw(sprintf('%F %F %F %F %F %F cm', $a, $b, $c, $d, $e, $f));
    }
    
    /**
     * Pushes the current graphics tranformation state on the stack.
     */
    private function pushState()
    {
        $this->stackDepth++;
        $this->draw('q');
    }
    
    /**
     * Pops a previous graphics tranformation state from the stack.
     */
    private function popState()
    {
        if ($this->stackDepth-- == 0)
        {
            throw new PdfException('pdf-creation-error');
        }
        $this->draw('Q');
    }
    
    /**
     * Translates the current transformed origin by the given amount.
     *
     * @param number $x
     * @param number $y
     */
    private function translate($x, $y)
    {
        $this->affine(1, 0, 0, 1, $x, $y);
    }
    
    /**
     * Rotates the current transformed origin by the given amount.
     *
     * @param number $theta The (counterclockwise) angle in degrees.
     */
    private function rotate($theta)
    {
        $theta = $theta * M_PI / 180;
        $c = cos($theta);
        $s = sin($theta);
        $this->affine($c, $s, -$s, $c, 0, 0);
    }
    
    /**
     * Scales the current transformed origin by the given amount.
     *
     * @param number $sx
     * @param number $sy
     */
    private function scale($sx, $sy)
    {
        $this->affine($sx, 0, 0, $sy, 0, 0);
    }
    
    /**
     * Adds a drawing command to the draw queue.
     *
     * @param string $command The drawing command. The command is assumed to be valid.
     */
    private function draw($command)
    {
        $this->draws .= $command . "\n";
    }
    
    /**
     * Adds a new tile to the output.
     *
     * @param integer $scanId The ID of the encapsulating scan.
     * @param integer $x      The column of the tile.
     * @param integer $y      The row of the tile.
     * @param integer $width  The width of the image.
     * @param integer $height The height of the image.
     *
     * @return integer The object ID of the generated tile.
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
        
        $this->pushState();
            $this->scale($sx, $sy);
            $this->translate($ox, $oy);
            $this->draw($resourceName . ' Do');
        $this->popState();
        
        return $objectNum;
    }
    
    /**
     * Returns the filename of the tile at the position requested.
     *
     * @param integer $scanId The ID of the scan to which the tile belongs.
     * @param integer $x      The column of the tile.
     * @param integer $y      The row of the tile.
     * @param integer $z      The zoom level of the tile.
     *
     * @return string The filename.
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
     *
     * @param Book $book The book to get information dictionary information from, or null if none.
     */
    private function make(Book $book = null)
    {
        if (strlen($this->draws) > 0)
        {
            $this->writePage();
        }
        
        // Insert automatic printing script of required.
        $javascript = '';
        if ($this->autoPrint)
        {
            $jsEmbedId = $this->newObject('');
            $jsId = $this->newObject('<< /Names [(EmbeddedJS) ' . $jsEmbedId . ' 0 R] >>', true);
            $this->updateObject($jsEmbedId, "<< /S /JavaScript /JS (print\(true\);) >>");
            $javascript = '/Names << /JavaScript ' . $jsId . ' 0 R >>';
        }
        
        // Write the subsetted fonts to the output.
        $this->writeFonts();
        
        // TODO: index/outline? See PDF1.7 specs at page 367+
        
        // Fill the page catalog.
        $this->catalogId = $this->newObject('<< /Type /Catalog /Pages ' . $this->pagesId . ' 0 R /OpenAction [ ' . $this->pages[0] . ' 0 R /Fit ] ' . $javascript . ' >>');
        $pages = implode(' 0 R ', array_values($this->pages)) . ' 0 R';
        $this->updateObject($this->pagesId, '<< /Type /Pages /Count ' . count($this->pages) . ' /Kids [ ' . $pages . ' ] >>');
        
        // Fill the document information catalog.
        $infoId = $this->newObject("<<\n" .
            ($book !== null ? ("/Title " . $this->fromUTF8($book->getTitle()) . "\n") : '') .
            "/Creator " . $this->fromUTF8($this->productName) . "\n" .
            "/CreationDate " . date("(\D:YmdHis)") . "\n" .
            ">>");
        
        // Initialize the XREF table.
        $xref = "0000000000 65535 f \n";
        $offset = 9;
        
        // Output the file, while keeping track of the object positions.
        $this->outputEntry->append($this->output);
        $this->output = '';
        foreach ($this->bufferedObjectSizes as $key => $size)
        {
            $this->bufferedObjectSizes[$key] = $offset;
            $offset += $size;
        }
        $this->outputEntry->append($this->buffer);
        
        // Calculate the XREF table.
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
        
        // Output the XREF table and finalize the file.
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
     * Writes the font files.
     */
    private function writeFonts()
    {
        $fontPath = 'util/fonts/';
        
        foreach ($this->fontInfo as $fontName => $fontInfo)
        {
            include($fontPath . $fontInfo['FontFile']);
            
            require $fontPath . 'subset.php';
            
            ksort($cw);
            $ws = $cw;
            $prevwidth = -1;
            $inRange = false;
            $inList = false;
            $w = '[';
            foreach ($ws as $char => $width)
            {
                if (isset($ws[$char+1]) && $ws[$char+1] == $width && isset($ws[$char+2]) && $ws[$char+2] == $width && $prevwidth != $width)
                {
                    if ($inList)
                    {
                        $w .= ' ]'."\n";
                    }
                    $w .= ' ' . $char;
                    $prevwidth = $width;
                    $inRange = true;
                    $inList = false;
                    continue;
                }
                else if ((!isset($ws[$char+1]) || $ws[$char+1] != $width) && $prevwidth == $width && $inRange && !$inList)
                {
                    $w .= ' ' . $char . ' ' . $width."\n";
                    $inRange = false;
                    continue;
                }
                else if ($prevwidth != $width && isset($ws[$char+1]) && !$inList)
                {
                    $w .= ' ' . $char . ' [ ' . $width;
                    $inList = true;
                }
                else if ($inList)
                {
                    $w .= ' ' . $width;
                    if (!isset($ws[$char+1]))
                    {
                        $w .= ' ]'."\n";
                        $inList = false;
                    }
                }
                else if ($prevwidth != $width)
                {
                    $w .= ' ' . $char . ' [ ' . $width . ' ]'."\n";
                }
                $prevwidth = $width;
            }
            $w .= ' ]';

            $subsetFont = _getTrueTypeFontSubset(gzuncompress(file_get_contents($fontPath . $file)), $fontInfo['SubsetChars']);
            $subsetIdentifier = strtoupper(strtr(substr(md5($subsetFont), 0, 6), '0123456789','GHIJKLMNOP'));

            $fontFileId = $this->newStream('/Filter /FlateDecode /Length1 ' . strlen($subsetFont), gzcompress($subsetFont));
            $ctgId = $this->newStream('/Filter /FlateDecode', file_get_contents($fontPath . $ctg));
            $fontDescId = $this->newObject("<<\n" .
                "/Type /FontDescriptor\n" .
                "/FontName /" . $subsetIdentifier . '+' . $name . "\n" .
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
                "/BaseFont /" . $subsetIdentifier . '+' . $name . "\n" .
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
            $this->updateObject($fontInfo['FontObject'],
                "<<\n" .
                "/Type /Font\n" .
                "/Subtype /Type0\n" .
                "/BaseFont /" . $subsetIdentifier . '+' . $name . "\n" .
                "/Name /" . $fontName . "\n" .
                "/ToUnicode " . $this->unicodeId . " 0 R\n" .
                "/Encoding /Identity-H\n" .
                "/DescendantFonts [" . $descendantFontsId . " 0 R]\n" .
                ">>", true);
        }
    }
    
    /**
     * Creates a PDF-formatted UTF-16BE string from the given UTF-8 string.
     *
     * @param string $s The string to convert.
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
     *
     * @param array $s The multibyte character array to convert.
     */
    private function fromUTF16BEArray(array $s)
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
     *
     * @param string $text The plain input string.
     *
     * @return string A text string with escaped (, ), \ and \r.
     */
    private function escapeString($text)
    {
        return '(' . strtr($text, array(')' => '\\)', '(' => '\\(', '\\' => '\\\\', chr(13) => '\r')) . ')';
    }
    
    /**
     * Converts a string to an UTF-16BE multibyte character array.
     *
     * @param string  $text      The string to convert.
     * @param boolean $isUTF16BE Whether the string already is UTF-16BE. If not, it will assume UTF-8.
     *
     * @return array A multibyte character array.
     */
    private function toUTF16BEArray($text, $isUTF16BE = false)
    {
        if (!$isUTF16BE)
        {
            $text = mb_convert_encoding($text, 'UTF-16BE', 'UTF-8');
        }
        $text = array_chunk(str_split($text), 2);
        return $text;
    }
    
    /**
     * Adds a font for drawing text.
     *
     * @param string $fontName The name of the font for future reference.
     * @param string $fontFile The php file in which the font information is contained.
     */
    private function addFont($fontName, $fontFile)
    {
        $fontPath = 'util/fonts/';
        include($fontPath . $fontFile);
        
        if ($type != 'TrueTypeUnicode')
        {
            throw new PdfException('pdf-creation-error');
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
        
        $this->fontSizes[$fontName] = $cw;
        $this->fontInfo[$fontName] = $desc;

        $fontId = $this->newObject('', false);

        $this->fontInfo[$fontName]['FontFile'] = $fontFile;
        $this->fontInfo[$fontName]['FontObject'] = $fontId;
        $this->fontInfo[$fontName]['SubsetChars'] = array();

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
    
    /**
     * Sets all page margins to the given margin.
     *
     * @param number $margin The margin to set all page margins to.
     */
    private function setPageMargin($margin)
    {
        $this->textMarginL = $margin;
        $this->textMarginT = $margin;
        $this->textMarginR = $margin;
        $this->textMarginB = $margin;
    }
    
    /**
     * Adds all glyphs of the current text to the subset cache.
     *
     * @param array $text The text, compatible with the output of toUTF16BEAray.
     */
    private function addToSubset($text)
    {
        foreach ($text as $char)
        {
            $c = ((ord($char[0]) << 8) + ord($char[1]));
            $this->fontInfo[$this->font]['SubsetChars'][$c] = true;
        }
    }
    
    /**
     * Draws a (potentially long) string.
     *
     * @param string  $text        The string to draw.
     * @param boolean $center      Whether to center the text.
     * @param boolean $omitNewLine Whether to omit the extra newline at the end of the string.
     *
     * @return array The estimated bounding box of the resulting string.
     */
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
                $this->drawText($this->headerText .
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
        
        // First, convert to UTF-16BE to split the lines correctly.
        $text = mb_convert_encoding($text, 'UTF-16BE', 'UTF-8');
        $lines = mb_split("\0\n", $text);
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
            
            $text = $this->toUTF16BEArray($text, true);
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
                        $this->pushState();
                            if ($center)
                            {
                                $offset = ($this->pageWidth - $this->textMarginL - $this->textMarginR - ($x - $this->x) + ($endOfString ? 0 : $widthSinceSpace + $charWidth * $this->fontSize / 1000)) / 2;
                                $this->translate($this->x + $offset, $this->y);
                            }
                            else
                            {
                                $this->translate($this->x, $this->y);
                            }
                            $this->draw('BT');
                            $this->draw('/' . $this->font . ' ' . $this->fontSize . ' Tf');
                            $textToDraw = array_slice($text, $prevEnd, $lastSpace - $prevEnd);
                            $this->addToSubset($textToDraw);
                            $this->draw($this->fromUTF16BEArray($textToDraw) . ' Tj');
                            $this->draw('ET');
                        $this->popState();
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
    
    /**
     * Writes a page to the output, resetting the position for the next page.
     *
     * @param boolean $enforce Whether to enforce drawing a page, even if it is empty.
     */
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
    
    /**
     * Sets the page size.
     *
     * @param number $width  The width in points.
     * @param number $height The height in points.
     */
    private function setPageSize($width, $height)
    {
        $this->pageWidth = $width;
        $this->pageHeight = $height;
    }    
    
    /**
     * Sets the font size.
     *
     * @param number $points The font size.
     */
    private function setFontSize($points)
    {
        $this->lastFontSize = $this->fontSize;
        $this->fontSize = $points;
    }
}

