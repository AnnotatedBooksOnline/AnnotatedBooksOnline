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
        // Get binding id.
        $bindingId = self::getInteger($data, 'binding');
        // TODO
        $bindingId = 1;
        
        // Get cache entry.
        $entry = Cache::getFileEntry('pdf', $bindingId);
        
        // Check for expiration.
        if ($entry->hasExpired())
        {
            // Generate PDF.
            $binding = new Binding($bindingId);
            $pdf = new Pdf($binding, $entry);
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
        $bindingId = self::getInteger($data, 'binding');
        // TODO
        $bindingId = 1;
        
        // Get cache entry.
        $entry = Cache::getFileEntry('pdf', $bindingId);
        
        // Check for expiration.
        if ($entry->hasExpired())
        {
            throw new PdfException('pdf-has-expired');
        }
        
        // Update timestamp on entry.
        $entry->update();
        
        // Get scan and book for filename.
        $binding = new Binding($bindingId);
        $scans = Scan::fromBinding($binding);
        $scan = $scans[0];
        $books = Book::fromBinding($binding);
        $book = $books[0];
        
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

