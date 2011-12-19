<?php
//[[GPL]]

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
        // Get scan id.
        $scanId = self::getInteger($data, 'scan');
        
        // Get cache entry.
        $entry = Cache::getFileEntry('pdf', $scanId);
        
        // Check for expiration.
        if ($entry->hasExpired())
        {
            // Generate PDF.
            $scan = new Scan($scanId);
            $pdf = new Pdf($scan);
            
            // Set content.
            $content = $pdf->getContent();
            $entry->setContent($content);
        }
        else
        {
            $entry->update();
        }
    }
    
    /**
     * Outputs the PDF as a file for downloading. Also sets the correct headers for file download.
     */
    public function actionDownload($data)
    {
        // Get scan id.
        $scanId = self::getInteger($data, 'scan');
        
        // Get cache entry.
        $entry = Cache::getFileEntry('pdf', $scanId);
        
        // Check for expiration.
        if ($entry->hasExpired())
        {
            throw new PdfException('pdf-has-expired');
        }
        
        // Update timestamp on entry.
        $entry->update();
        
        // Get scan and book for filename.
        $scan = new Scan($scanId);
        $book = new Book($scan->getBookId());
        
        // Calculate filename.
        $filename = preg_replace('/[^\w\-\., ()\[\]\']+/i', '',
            $book->getTitle() . '-' . $scan->getPage() . '.pdf');
        
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
