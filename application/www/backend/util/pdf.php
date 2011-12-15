<?php
//[[GPL]]

$path = '/tmp/tiles/tile';
$width = 5;
$height = 7;
$zoomlevel = 3;
$tilesize = 256;

// Outputs a PDF file containing the given tiles.
function outputPDF($path, $zoomlevel, $tilesize, $width, $height)
{
    header('Content-type: application/pdf');
    header('Content-disposition: attachment; filename=scan.pdf');
    
    $i = 6;
    $out = '%PDF-1.7
';

    $draw = '';
    $objlist = '';
    $objects = array();

    $size = getimagesize($path . '_' . $zoomlevel . '_' . ($width - 1) . '_' . ($height - 1) . '.jpg');
    $compx = 1 - $size[0] / $tilesize;
    $compy = 1 - $size[1] / $tilesize;

    $scale = min(595 / ($width - $compx), 842 / ($height - $compy));

    for ($y = 0; $y < $height; $y++)
    for ($x = 0; $x < $width; $x++)
    {
        $size = getimagesize($path . '_' . $zoomlevel . '_' . $x . '_' . $y . '.jpg');
        $file = file_get_contents($path . '_' . $zoomlevel . '_' . $x . '_' . $y . '.jpg');
        
         $objects[$i] = $i . ' 0 obj
<<
/Subtype /Image
/Width ' . $size[0] . '
/Height ' . $size[1] . '
/ColorSpace /DeviceRGB
/BitsPerComponent 8
/Filter /DCTDecode
/Length ' . strlen($file) . '
>>
stream
' . $file . '
endstream endobj
';
    
        $objlist .= '/tilex' . $x . 'y' . $y . ' ' . $i . ' 0 R
';
        
        $sx = $scale * $size[0] / $tilesize;
        $sy = $scale * $size[1] / $tilesize;
        
        $ox = $x * $tilesize / $size[0];
        $oy = ($height - $y - $compy) * $tilesize / $size[1] - 1;
        
        $draw .= 'q
' . $sx . ' 0 0 ' . $sy . ' 0 0 cm
1 0 0 1 ' . $ox . ' ' . $oy . ' cm
/tilex' . $x . 'y' . $y . ' Do Q
';
        
        $i++;
    }

    $objects[5] = '5 0 obj
<<
/Length ' . strlen($draw) . '
>>
stream
' . $draw . '
endstream endobj
';

    $objects[1] = '1 0 obj << /Type /Catalog /Pages 2 0 R /OpenAction [ 4 0 R /Fit ] >> endobj
';
    $objects[2] = '2 0 obj << /Type /Pages /Count 1 /Kids [ 4 0 R ] >> endobj
';
    $objects[4] = '4 0 obj << /Type /Page /Parent 2 0 R /Resources 3 0 R /Contents 5 0 R /MediaBox [ 0 0 ' . $scale * ($width - $compx) . ' ' . $scale * ($height - $compy) . ' ] >> endobj
';

    $objects[3] = '3 0 obj << /XObject <<
' . $objlist . '
>> >> endobj
';

    $xref = '0000000000 65535 f 
';

    $off = strlen($out);
    echo $out;
    
    ksort($objects);
    foreach ($objects as $key => $value)
    {
    $xref .= sprintf('%010d 00000 n ', $off) . '
';

        $off += strlen($value);
        echo $value;
    }

    echo 'xref
0 ' . (count($objects) + 1) . '
' . $xref . 
'trailer << /Size ' . (count($objects) + 1) . ' /Root 1 0 R >>
startxref
' . $off . '
%%EOF';
}
