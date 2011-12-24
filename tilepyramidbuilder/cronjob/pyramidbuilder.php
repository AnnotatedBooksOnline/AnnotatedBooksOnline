<?php

// Set backend as current working directory and include path.
$backendPath = dirname(__FILE__) . '/../../application/www/backend/';

chdir($backendPath);
set_include_path($backendPath);


require_once 'framework/util/translator.php';
require_once 'framework/util/singleton.php';
require_once 'framework/util/configuration.php';
require_once 'framework/util/log.php';
require_once 'framework/database/database.php';
require_once 'models/scan/scan.php';
require_once 'models/upload/upload.php';

/**
 * An exception thrown when the pyramid builder fails for some reason.
 */
class PyramidBuilderException extends ExceptionBase
{
    
}

/**
 * A class that can be used to register newly uploaded scans which will be put in a queue to be processed.
 */
class PyramidBuilder extends Singleton
{
    /** Singleton instance. */
    protected static $instance;
    
    
    /** An SplQueue of scan id's representing scans waiting to be processed. */
    private $queue;
     
    protected function __construct()
    {
        $this->queue = new SplQueue();
    }
    
    /**
     * Runs the pyramid builder on an image. Blocks until the image has been completely processed.
     * 
     * @param $scan A scan entity.
     * 
     * @throws PyramidBuilderException When the builder returns with a nonzero error code, meaning 
     *                                 an error has occured.
     */
    private function run($scan)
    {
        // Determine builder paths and arguments.
        $conf = Configuration::getInstance();
        
        //$imgfile = $conf->getString('install-base') . $conf->getString('image-input-path') . '/' . $scanid;
        $upload = new Upload($scan->getUploadId());

        $scantype = $scan->getScanType();
        $imgfile = $conf->getString('install-base') . $conf->getString('upload-path') . $upload->getToken() . ".upload";
        $output = array();
        $rval = 0;
        $outpath = $conf->getString('install-base') . $conf->getString('tile-output-path') . '/' . $scan->getScanId();
        $quality = $conf->getInteger('tile-quality', 60);
        $builderpath = $conf->getString('install-base') . $conf->getString('builder-path'); 
        $tileformat = '%z_%x_%y.%e';
        
        // Create tile output directory.
        if(!mkdir($outpath))
        {
            throw new PyramidBuilderException('makedir-failed');
        }
        
        // Execute builder.
        $command = "$builderpath -q $quality -i $scantype -p $outpath -f $tileformat $imgfile";
        echo $command;
        Log::debug('Running builder.');
        exec($command, $output, $rval);
        
        // Check return value to see whether operation succeeded.
        if($rval != 0)
        {
            throw new PyramidBuilderException('builder-failed', print_r($output, true));
        }
        Log::debug('done');
    }
    
    /**
     * Creates a thumbnail from a scan with a certain ID. This scan should have already been 
     * successfully processed.
     * 
     * @param int $scanid The ID the processed scan to create a thumbnail from.
     */
    private function createThumbnail($scanid)
    {        
        $conf = Configuration::getInstance();
        
        // Determine paths.
        $thumb = $conf->getString('install-base') . $conf->getString('thumbnail-path') . '/' . $scanid . 'jpg';
        $tile = $conf->getString('install-base') . $conf->getString('tile-output-path') . '/' . $scanid . '/0_0_0.jpg';
        
        // Determine thumbnail dimensions.
        $width = $conf->getInteger('thumbnail-width', 100);
        $height = $conf->getInteger('thumbnail-height', 100);
        
        Log::debug('Creating thumbnail for ' . $scanid);
        
        // Create thumbnail.
        $img = new Imagick($tile);
        $success = $img->scaleImage($width, $height);
        $img->writeImage($thumb);
        
        if(!$success)
        {
            Log::error('Failed creating thumbnail of scan with ID %d.', $scanid);
        }
        
        Log::info('Succesfully created thumbnail for ' . $scanid);
    }
    
    /**
     * When the builder crashes while processing a scan but does not succeed to set its error flag,
     * this method can be used to change the PROCESSING status of every scan to ERROR.
     * 
     * NOTE: Only call this when there are no other threads running the PyramidBuilder 
     * simultaniously.
     * 
     * TODO: Let this remove erronous input or output files.
     */
    public function resolveInconsistencies()
    {
        Query::update('Scans', array('status' => Scan::STATUS_ERROR))
                ->where('status = :status')
                ->execute(array('status' => Scan::STATUS_PROCESSING));
    }
    
    /**
     * First checks whether the queue is empty and, if so, fills it with new scans.
     * 
     * Then all scans in the queue are processed one by one.
     * 
     * @throws Exception If processing a single scan fails or another error occurs while doing so.
     *                   The method will try to set that scan's status to ERROR. There might be 
     *                   other scans left in the queue, so calling doIteration again will make
     *                   it continue with the rest.
     *                   
     */
    public function doIteration()
    {
        // Check whether there is an image in the queue.
        if($this->queue->isEmpty())
        {            
            Log::debug('Looking for new scans.');
            
            // Queue should be updated by all scans in the database with a PENDING status.
            $result = Query::select('scanId', 'scanType')
                            ->from('Scans')
                            ->where('status = :status')
                            ->execute(array('status' => Scan::STATUS_PENDING));
            
            foreach($result as $row)
            {
                $this->queue->enqueue($row->getValue('scanId'));
                Log::info('Enqueued scan with ID ' . $row->getValue('scanId') . '.');
            }
        }
        
        
        // Now process contents of the queue, if any.
        while(!$this->queue->isEmpty())
        {
            // Now dequeue an image for processing.
            $scanid = $this->queue->dequeue();
            
            // Load the corresponding scan entity.
            $scan = new Scan($scanid);
            
            Log::debug('Processing ' . $scanid . '.');
            
            try
            {
                // Set status to PROCESSING and save.
                $scan->setStatus(Scan::STATUS_PROCESSING);
                $scan->save();
                
                // Process the image.
                $this->run($scan);
                
                // Create a thumbnail.
                $this->createThumbnail($scanid); 
                                
                // No exception, therefore success!
                $scan->setStatus(Scan::STATUS_PROCESSED);
                $scan->save();
                
                Log::info('Succesfully processed scan with ID ' . $scanid . '.');
            }
            catch(Exception $ex)
            {
                // Something went wrong. Set the error status.
                $scan->setStatus(Scan::STATUS_ERROR);
                $scan->save();
                throw $ex;
            }
        }
    }
    
    /**
     * Continuously keep running the pyramid builder.
     * 
     * NOTE: This method calls resolveInconsistencies every 20 rounds, so make sure only a single 
     * thread is executing runBuilder at a time.
     * 
     * @param int $iteration_pause The timeout in seconds after each iteration.
     */
    public function runBuilder($iteration_pause = 5)
    {       
        $round = 0;
        
        while(true)
        {
            // Call resolveInconsistencies every 20 rounds.
            if($round >= 20)
            {
                $this->resolveInconsistencies();
                $round = 0;
            }
            
            try
            {               
                // Do a single iteration.
                $this->doIteration();
            }
            catch(PyramidBuilderException $pex)
            {
                // Log builder error. Probably a mistake on the part of the user.
                Log::warn('Pyramid builder error:\n%s', $pex->getMessage());
            }
            catch(Exception $ex)
            {
                // Log other exceptions.
                Log::error('Miscelanous error while processing scans:\n%s', $ex);
            }
            
            ++$round;
            
            // Timeout.
            if(sleep($iteration_pause) !== 0)
            {
                Log::warn('Builder sleep() was interrupted.');
            }
        }
    }
}

date_default_timezone_set('Europe/Berlin');
// Running the builder.
PyramidBuilder::getInstance()->runBuilder();