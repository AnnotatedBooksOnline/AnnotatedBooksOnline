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

require_once 'framework/controller/controller.php';
require_once 'framework/util/cache.php';
require_once 'util/authentication.php';
require_once 'util/pdf.php';

/**
 * PDF controller class.
 */
class PdfController extends Controller
{
    /**
     * Generates the PDF and stores it in a cache file.
     */
    public function actionGenerate($data)
    {
        $scanId = self::getInteger($data, 'scanId');
        $transcriptions = null;
        $annotations = false;
        $range = null;
        
        if (isset($data['transcriptions']) && $data['transcriptions'] == 'on')
        {
            $languages = array('English' => 'Eng');
            if (isset($data['language']))
            {
                switch ($data['language'])
                {
                    case 'eng':
                        $languages = array('English' => 'eng');
                        break;
                    case 'orig':
                        $languages = array('Original' => 'orig');
                        break;
                    case 'both':
                        $languages = array('Original' => 'orig', 'English' => 'eng');
                        break;
                    default:
                        break;
                }
            }
            $transcriptions = function(Annotation $annotation) use ($languages)
            {
                $trans = array();
                foreach ($languages as $name => $getter)
                {
                    $getter = 'getTranscription' . ucfirst($getter);
                    $text = $annotation->{$getter}();
                    if (trim($text) != '')
                    {
                        $trans[$name] = $text;
                    }
                    else
                    {
                        if ($name == "Original")
                        {
                            $trans[$name] = 'This transcription is not available in the original language.';
                        }
                        else
                        {
                            $trans[$name] = 'This transcription is not available in ' . $name . '.';
                        }
                    }
                }
                return $trans;
            };
            if (isset($data['polygons']) && $data['polygons'] == 'on')
            {
                $annotations = true;
            }
        }
        if (isset($data['page']) && $data['page'] == 'range')
        {
            if (isset($data['pageFrom']) && isset($data['pageTo']))
            {
                $range = array($data['pageFrom'], $data['pageTo']);
            }
        }
        else if (isset($data['page']) && $data['page'] == 'scan')
        {
            $scan = new Scan($scanId);
            $range = $scan->getPage();
        }
        
        $currentScan = new Scan($scanId);
        $binding = new Binding($currentScan->getBindingId());
        
        // Get cache entry.
        if ($transcriptions || $annotations)
        {
            // Transcriptions and annotations are highly likely to change.
            // Therefore, we should not cache them.
            $id = md5(uniqid('pdfgen', true));
            $entry = Cache::getFileEntry('pdf', $id);
        }
        else
        {
            $id = md5(serialize(array($binding->getBindingId(), $range)));
            $entry = Cache::getFileEntry('pdf', $id);
        }
        
        // Check for expiration.
        if ($entry->hasExpired())
        {
            try
            {
                // Generate PDF.
                $pdf = new Pdf($binding, $entry, $range, $transcriptions, $annotations);
            }
            catch (Exception $e)
            {
                // On failure, clear the cache entry.
                $entry->clear();
                throw $e;
            }
        }
        else
        {
            $entry->update();
        }
        
        $textRange = '';
        if (is_array($range))
        {
            $textRange = ' (' . $range[0] . '-' . $range[1] . ')';
        }
        else if ($range !== null)
        {
            $textRange = ' ' . $range;
        }
        return array('id' => $id, 'title' => $binding->getSignature() . $textRange);
    }
    
    /**
     * Outputs the PDF as a file for downloading. Also sets the correct headers for file download.
     */
    public function actionDownload($data)
    {
        $id = $data['id'];
        $title = $data['title'];
        
        // Get cache entry.
        $entry = Cache::getFileEntry('pdf', $id);
        
        // Check for expiration.
        if ($entry->hasExpired())
        {
            throw new PdfException('pdf-has-expired');
        }
        
        // Update timestamp on entry.
        $entry->update();
        
        // Calculate filename.
        $filename = preg_replace('/[^\w\-\.,_ ()\[\]\']+/i', '',
            $title . '.pdf');
        
        // Set headers.
        header('Pragma: public');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Content-type: application/pdf');
        header('Content-length: ' . $entry->getLength());
        header('Content-disposition: attachment; filename="' . $filename . '"');
        
        // Output entry.
        $entry->output();
    }
}

