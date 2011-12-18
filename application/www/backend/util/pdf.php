<?php
//[[GPL]]

require_once 'framework/util/configuration.php';
require_once 'framework/util/exceptionbase.php';
require_once 'models/scan/scan.php';
require_once 'models/book/book.php';
//require_once 'models/binding/binding.php';

// Exceptions.
class PDFCreationFailedException extends ExceptionBase
{
    public function __construct()
    {
        parent::__construct('pdf-creation-failed');
    }
}

class PDF
{
    private $path;
    private $dpi = 150;
    private $textMargins = 72;
    private $fontSize = 12;
    private $lineSpread = 2;

    private $pageWidth;
    private $pageHeight;
    
    private $objects = array();
    private $numObjects = 0;
    private $resources = '';
    private $draws = '';
    private $output = '';
    private $fonts = '';
    private $font;
    private $fontSizes = array();
    private $x = null;
    private $y = null;
    private $pages = array();
    private $pagesId = null;
    private $resourcesId = null;
    private $catalogId = null;
    private $lastFontSize = null;
    
    private $scanInfo;
    private $imageAttr = array();
    
    private $scan;
    private $book;
    private $binding;

    /**
     * Creates a new PDF based on the given scan. When possible, the resolution
     * will be at least the configured dpi.
     *
     * scan: the scan to turn into a PDF
     * dimensions: the page dimensions
     *    - width: the width in points (1/72 inch)
     *    - height: the height in points (1/72 inch)
     */
    public function __construct($scan, $dimensions = null)
    {
        $this->path = Configuration::getInstance()->getString('tile-output-path', '../tiles/tile');
        
        $this->scanInfo = array(
            'width' => $scan->getWidth(),
            'height' => $scan->getHeight(),
            'zoomLevel' => $scan->getZoomLevel()
        );
        
        $this->scan = $scan;
        $this->book = new Book($scan->getBookId());
        //$this->binding = new Binding($book->getBindingId());
        
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
        
        $this->setPageSize($this->imageAttr['pageWidth'], $this->imageAttr['pageHeight']);
        $this->createPDF();
    }

    /**
     * Outputs the PDF as a file for downloading.
     * Also sets the correct headers for file download.
     */
    public function outputPDF()
    {
        $filename = preg_replace('/[^a-zA-Z0-9_]/', '', 
                    preg_replace('/ /', '_', $this->book->getTitle()))
                    . '-' . $this->scan->getPage();
        header('Content-type: application/pdf');
        header('Content-length: ' . strlen($this->output));
        header('Content-disposition: attachment; filename=' . $filename . '.pdf');
        
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
     * Creates the PDF file based on the scan.
     */
    private function createPDF()
    {
        $this->addFont('DejaVuSans', 'dejavusans.php');
        $this->font = 'DejaVuSans';
        
        $this->setFontSize(24);
        $this->drawText($this->book->getTitle() . "\n\n", true);
        $this->setFontSize(12);
        $this->drawText("Page number: " . $this->scan->getPage());
        $this->writePage();
        
        $z = $this->scanInfo['zoomLevel'];
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
        $w = $this->scanInfo['width'];
        $h = $this->scanInfo['height'];
        
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

        // Finalize the page.
        $this->setPageSize($scale * ($cols - $compx), $scale * ($rows - $compy));
        $this->writePage();
        
        $this->setPageSize($this->imageAttr['pageWidth'], $this->imageAttr['pageHeight']);

        $this->drawText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sit amet purus eu libero faucibus rhoncus. Sed nunc elit, interdum non tempor a, rutrum eu metus. Curabitur id tellus vitae leo sodales venenatis. Aenean pellentesque, lacus vel dictum imperdiet, quam nulla dictum turpis, id fringilla elit sem quis neque. Integer fringilla purus non erat aliquet a dapibus justo auctor. Donec magna sem, facilisis id porttitor id, vulputate a turpis. Morbi consequat aliquet dui eu tempor. Donec et tellus augue, at lacinia purus. Curabitur interdum mauris ac nulla tristique sollicitudin. Mauris eu purus ut nibh auctor aliquam sit amet a lacus.

Integer dictum aliquet enim, sit amet viverra tellus luctus sit amet. Aliquam iaculis imperdiet auctor. Quisque vitae dui nec dolor tristique lacinia quis in lacus. Donec lacus risus, bibendum id accumsan sed, mattis ut neque. Nulla facilisi. Aliquam nulla sapien, feugiat ut dapibus semper, fringilla vitae neque. Fusce sit amet nulla sapien, ut vulputate risus. Nunc faucibus, odio eu blandit condimentum, tortor tortor consectetur ipsum, vel sagittis diam justo in ante. Sed vitae leo mauris, et ornare lacus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris venenatis urna id felis luctus vel luctus ligula vehicula. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean consequat lacus eget diam vestibulum adipiscing.

Curabitur rutrum molestie erat, sit amet lacinia est condimentum eget. Integer euismod malesuada urna eu vestibulum. Donec pellentesque mollis varius. Curabitur sagittis tristique condimentum. Morbi nec sem augue, egestas vestibulum urna. Aenean purus neque, imperdiet non convallis ut, rhoncus vel urna. Mauris auctor tincidunt iaculis. In quis arcu lorem. Curabitur nec tellus velit. Quisque dapibus, quam et dictum sodales, eros neque rhoncus nibh, id lobortis nisl turpis eget arcu.

Phasellus bibendum malesuada placerat. Suspendisse ac lectus in quam molestie volutpat vitae ac eros. Ut vel sem turpis. In porttitor purus sed sem congue fermentum. Vestibulum accumsan fringilla aliquet. Nullam erat sapien, malesuada eu mattis a, feugiat sit amet dolor. Donec viverra ligula at libero aliquet laoreet. Maecenas accumsan dignissim faucibus.

Quisque quis neque sit amet mauris sollicitudin sagittis. Aliquam ut orci nisl, vel consectetur ligula. Nunc faucibus nulla ac nulla fringilla sed aliquet sapien vestibulum. Sed eu vehicula sapien. In varius, dui non tristique aliquam, lorem nisl bibendum quam, non euismod metus nisi quis sem. Vivamus urna lorem, euismod ornare lacinia nec, iaculis a neque. Ut vulputate urna at est dictum ac rhoncus felis varius. Pellentesque nec metus vitae lacus sodales lacinia eget quis massa.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc euismod auctor suscipit. Aenean ut est sed metus eleifend sodales non vel sapien. Aliquam posuere ante sit amet tellus tempus bibendum malesuada ipsum dapibus. Cras eros justo, malesuada a pretium sed, consectetur vestibulum mauris. Aliquam erat volutpat. Praesent iaculis lectus vitae ante ultrices dictum euismod tortor fringilla. Etiam ac orci et libero lobortis porta. Integer tempus, tellus vel ornare elementum, risus magna dapibus turpis, eu dignissim purus odio eu risus. Etiam pulvinar sem sit amet ligula luctus sit amet commodo dui venenatis. Vestibulum molestie sodales consequat. Nullam velit turpis, dignissim ullamcorper euismod vitae, aliquam nec metus. Donec nec magna in mi gravida tempor. Aliquam erat volutpat. Fusce fermentum volutpat ante sed dictum. Ut vel venenatis enim.

Praesent sollicitudin, dui nec blandit rhoncus, justo metus aliquam nulla, in euismod nibh mauris quis eros. In sagittis risus eu lorem vehicula nec porta sapien volutpat. Praesent congue blandit orci at mattis. Praesent posuere velit quis lacus tincidunt sed rhoncus leo ullamcorper. Aenean aliquet ligula quis eros vestibulum facilisis. Curabitur auctor dapibus elementum. Praesent pharetra facilisis nisi, et rutrum enim bibendum eget. Nulla nec elit nisl. Ut at mi ligula, eu viverra eros. Vivamus dapibus tempor mi, eget gravida nisl iaculis eget. Maecenas eget metus magna. Nullam sit amet nunc ac nunc scelerisque sollicitudin.

Suspendisse potenti. Pellentesque nisi leo, euismod interdum feugiat nec, varius egestas velit. Curabitur a eros id est euismod fermentum. Nullam id odio nec dui auctor lobortis quis id nibh. Cras pretium aliquam est, et tristique erat condimentum non. Fusce ultrices placerat mi a convallis. Ut sollicitudin tellus in eros porttitor quis sagittis ante consequat. Mauris lacinia nunc convallis neque vehicula sit amet feugiat tellus hendrerit. Praesent feugiat ipsum ut diam suscipit ac viverra arcu tincidunt.

Aenean ut augue ac magna aliquet facilisis ac vitae tellus. Nulla ac magna sit amet leo eleifend viverra et a nisi. Curabitur semper condimentum eleifend. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed elementum nisl ut turpis dapibus id volutpat urna consequat. Morbi ultricies molestie condimentum. Nulla facilisi. Aliquam quam ante, sollicitudin vel faucibus nec, placerat et nulla. Quisque pellentesque justo sed urna condimentum condimentum. Phasellus gravida, enim sit amet blandit dictum, nisi ligula imperdiet dolor, quis tempus massa magna eget justo. Fusce tortor metus, suscipit sit amet sodales fermentum, iaculis vel enim. Nulla facilisi. Praesent semper nisl eget dolor aliquet blandit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec ut libero metus.

Donec aliquam, nisl eu dignissim fermentum, nibh mauris tempor lorem, quis interdum urna est ut diam. Suspendisse vitae turpis nec eros egestas auctor et non leo. Sed ullamcorper, nunc at interdum gravida, arcu odio aliquet neque, ac varius nunc dolor vitae velit. Vestibulum eu ligula velit. Nunc consectetur gravida dolor nec iaculis. Curabitur diam arcu, mattis eget lobortis quis, scelerisque vel nibh. Praesent facilisis fermentum mauris, lacinia vehicula purus scelerisque sed. Nulla tristique dolor ut nibh faucibus fringilla. Donec eget felis ut mi ornare hendrerit. Vivamus libero ligula, adipiscing et mollis et, dapibus eu augue. ');

        $this->writePage();

        $this->setFontSize(18);
        $this->drawText("Testing UTF-8 text rendering\n", true);
        $this->setFontSize(12);
        $this->drawText('From Laȝamon\'s Brut (The Chronicles of England, Middle English, West Midlands):

    An preost wes on leoden, Laȝamon was ihoten
    He wes Leovenaðes sone -- liðe him be Drihten.
    He wonede at Ernleȝe at æðelen are chirechen,
    Uppen Sevarne staþe, sel þar him þuhte,
    Onfest Radestone, þer he bock radde. 

From the Tagelied of Wolfram von Eschenbach (Middle High German):

    Sîne klâwen durh die wolken sint geslagen,
    er stîget ûf mit grôzer kraft,
    ich sih in grâwen tägelîch als er wil tagen,
    den tac, der im geselleschaft
    erwenden wil, dem werden man,
    den ich mit sorgen în verliez.
    ich bringe in hinnen, ob ich kan.
    sîn vil manegiu tugent michz leisten hiez.

Some lines of Odysseus Elytis (Greek):

    Monotonic:

    Τη γλώσσα μου έδωσαν ελληνική
    το σπίτι φτωχικό στις αμμουδιές του Ομήρου.
    Μονάχη έγνοια η γλώσσα μου στις αμμουδιές του Ομήρου.

    από το Άξιον Εστί
    του Οδυσσέα Ελύτη
    
    Polytonic:

    Τὴ γλῶσσα μοῦ ἔδωσαν ἑλληνικὴ 
    τὸ σπίτι φτωχικὸ στὶς ἀμμουδιὲς τοῦ Ὁμήρου.
    Μονάχη ἔγνοια ἡ γλῶσσα μου στὶς ἀμμουδιὲς τοῦ Ὁμήρου.

    ἀπὸ τὸ Ἄξιον ἐστί
    τοῦ Ὀδυσσέα Ἐλύτη

The first stanza of Pushkin\'s Bronze Horseman (Russian):

    На берегу пустынных волн
    Стоял он, дум великих полн,
    И вдаль глядел. Пред ним широко
    Река неслася; бедный чёлн
    По ней стремился одиноко.
    По мшистым, топким берегам
    Чернели избы здесь и там,
    Приют убогого чухонца;
    И лес, неведомый лучам
    В тумане спрятанного солнца,
    Кругом шумел.

Šota Rustaveli\'s Veṗxis Ṭq̇aosani, ̣︡Th, The Knight in the Tiger\'s Skin (Georgian):

    ვეპხის ტყაოსანი შოთა რუსთაველი

    ღმერთსი შემვედრე, ნუთუ კვლა დამხსნას სოფლისა შრომასა, ცეცხლს, წყალსა და მიწასა, ჰაერთა თანა მრომასა; მომცნეს ფრთენი და აღვფრინდე, მივჰხვდე მას ჩემსა ნდომასა, დღისით და ღამით ვჰხედვიდე მზისა ელვათა კრთომაასა. 
');

        // Produce the final PDF file.
        $this->makePDF();
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
    
    private function updateObject($id, $contents)
    {
        if ($id < $this->numObjects)
        {
            $this->objects[$id] = $id
                                  . " 0 obj\n"
                                  . $contents
                                  . "\nendobj\n";
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
     * Creates the final PDF based on the previously generated pages / objects.
     */
    private function makePDF()
    {
        if (strlen($this->draws) > 0)
        {
            $this->writePage();
        }
        
        $pages = implode(' 0 R ', array_values($this->pages)) . ' 0 R';
        $this->updateObject($this->pagesId, '<< /Type /Pages /Count ' . count($this->pages) . ' /Kids [ ' . $pages . ' ] >>');
        $this->updateObject($this->resourcesId, "<< /XObject <<\n" . $this->resources . "\n>> /Font <<\n" . $this->fonts . "\n>> >>");
        
        $infoId = $this->newObject("<<\n" .
            "/Title " . $this->fromUTF8($this->book->getTitle()) . "\n" .
            ">>");
        
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
        $this->out('trailer << /Size ' . ($this->numObjects + 1) . ' /Root ' . $this->catalogId . ' 0 R /Info ' . $infoId . ' 0 R >>');
        $this->out('startxref');
        $this->out($offset);
        $this->out('%%EOF');
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
            throw new PDFCreationFailedException();
        }
        
        $this->fontSizes[$name] = $cw;
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
                if ($this->y <= $this->textMargins)
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
        if (count($this->pages) == 0)
        {
            $this->catalogId = $this->newObject('<< /Type /Catalog /Pages ' . $this->pagesId . ' 0 R /OpenAction [ ' . $pageId . ' 0 R /Fit ] >>');
        }
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

