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

require_once 'framework/util/translator.php';
require_once 'framework/util/singleton.php';
require_once 'framework/util/configuration.php';
require_once 'framework/util/log.php';
require_once 'framework/database/database.php';
require_once 'models/scan/scan.php';
require_once 'models/upload/upload.php';

/**
 * An exception thrown when the tile pyramid builder fails for some reason.
 */
class TilePyramidBuilderException extends ExceptionBase { }

/**
 * A class that can be used to register newly uploaded scans which will be put in a queue to be processed.
 */
class TilePyramidBuilder extends Singleton
{
    /** Singleton instance. */
    protected static $instance;
    
    /** A queue of scan ids representing scans waiting to be processed. */
    private $queue;
     
    protected function __construct()
    {
        $this->queue = new SplQueue();
    }
    
    /**
     * Runs the pyramid builder on an image. Blocks until the image has been completely processed.
     * 
     * @param Scan   $scan   A scan entity with its fields filled in.
     * @param Upload $upload The upload associated with the scan.
     * 
     * @throws TilePyramidBuilderException When the builder returns with a nonzero error code, meaning
     *                                 an error has occured.
     */
    private function run($scan, $upload)
    {
        // Determine builder paths and arguments.
        $conf = Configuration::getInstance();
        
        // Determine arguments to builder command. Make sure bash injection is not possible.
        $scantype = escapeshellarg($scan->getScanType());
        $imgfile = escapeshellarg($upload->getFileLocation());
        $output = array();
        $rval = 0;
        $outpath = '../data/tiles/' . ((int) $scan->getScanId());
        $quality = $conf->getInteger('tile-quality', 60);
        $builderpath = $conf->getString('builder-path'); 
        $tileformat = 'tile_%z_%x_%y.%e';
        
        // Create tile output directory.
        if (!is_dir($outpath) && !mkdir($outpath))
        {
            throw new TilePyramidBuilderException('makedir-failed');
        }
        
        // Set builder command.
        Log::debug('Running builder.');
        
        $command = "$builderpath -q $quality -i $scantype -p $outpath -f $tileformat $imgfile";
        
        // Check for a relative path, and make it absolute.
        if (preg_match('#^\.[\.]?/#', $builderpath))
        {
            $command = getcwd() . '/' . $command;
        }
        
        // Execute builder
        Log::debug('Executing: %s', $command);
        exec($command, $output, $rval);
        
        // Check return value to see whether operation succeeded.
        if ($rval != 0)
        {
            throw new TilePyramidBuilderException('builder-failed', print_r($output, true));
        }
        
        Log::debug('Done.');
    }
    
    /**
     * Creates a thumbnail from a scan with a certain id. This scan should have already been 
     * successfully processed.
     * 
     * @param int $scanId The id the processed scan to create a thumbnail from.
     */
    private function createThumbnail($scanId)
    {
        Log::debug('Creating thumbnail for scan with id %d.', $scanId);
        
        // Determine paths.
        $input  = '../data/tiles/' . $scanId . '/tile_0_0_0.jpg';
        $output = '../data/thumbnails/' . $scanId . '.jpg';
        
        // Determine thumbnail dimensions.
        $conf = Configuration::getInstance();
        
        $newWidth  = $conf->getInteger('thumbnail-width', 100);
        $newHeight = $conf->getInteger('thumbnail-height', 100);
        
        if (function_exists('imagecreatefromjpeg'))
        {
            // Prefer to use GD.
            $this->createThumbnailGD($input, $output, $newWidth, $newHeight);
        }
        else if (class_exists('Imagick'))
        {
            // Otherwise use ImageMagick.
            $this->createThumbnailImagick($input, $output, $newWidth, $newHeight);
        }
        else
        {
            // As a last resort, just copy the source tile.
            copy($input, $output);
        }
        
        Log::info('Succesfully created thumbnail for scan with id %d.', $scanId);
    }
    
    private function createThumbnailImagick($tile, $thumb, $width, $height)
    {
        // Create thumbnail.
        $img = new Imagick($tile);
        $success = $img->scaleImage($width, $height, true);
        $img->writeImage($thumb);
        
        if(!$success)
        {
            throw new TilePyramidBuilderException('thumbnail-creation-failed');
        }
    }
    
    private function createThumbnailGD($input, $output, $newWidth, $newHeight)
    {
        // Create image from original.
        $image = @imagecreatefromjpeg($input);
        if ($image === false)
        {
            throw new TilePyramidBuilderException('thumbnail-creation-failed');
        }
        
        // Get input its size.
        $width  = imagesx($image);
        $height = imagesy($image);
        
        // Calculate ratios.
        $widthRatio  = $width  / $newWidth;
        $heightRatio = $height / $newHeight;
        
        // Calculate resize size.
        if ($widthRatio < $heightRatio) {
            $resizeWidth  = $newWidth;
            $resizeHeight = $height / $widthRatio;
        } else {
            $resizeHeight = $newHeight;
            $resizeWidth  = $width / $heightRatio;
        }
        
        // Create resized and thumbnail image.
        $thumbnail = imagecreatetruecolor($resizeWidth, $resizeHeight);
        if ($thumbnail === false)
        {
            throw new TilePyramidBuilderException('thumbnail-creation-failed');
        }
        
        // Copy image resized.
        $result = imagecopyresampled($thumbnail, $image, 0, 0, 0, 0, $resizeWidth, $resizeHeight, $width, $height);
        if ($result === false)
        {
            throw new TilePyramidBuilderException('thumbnail-creation-failed');
        }
        
        // Destroy orginal image.
        imagedestroy($image);
        
        // Save thumbnail.
        $result = imagejpeg($thumbnail, $output, 90);
        if ($result === false)
        {
            throw new TilePyramidBuilderException('thumbnail-creation-failed');
        }
        
        // Destroy thumbnail image.
        imagedestroy($thumbnail);
    }
    
    /**
     * When the builder crashes while processing a scan but does not succeed to set its error flag,
     * this method can be used to change the processing status of every scan to the error status.
     * 
     * NOTE: Only call this when there are no other threads running the tile pyramid builder 
     * simultaniously.
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
     *                   The method will try to set that scan's status to error. There might be
     *                   other scans left in the queue, so calling doIteration again will make
     *                   it continue with the rest.
     *
     */
    public function doIteration()
    {
        // Check whether there is an image in the queue.
        if ($this->queue->isEmpty())
        {
            Log::debug('Looking for new scans.');
            
            // Queue should be updated by all scans in the database with a pending status.
            $result = Query::select('scanId', 'scanType')
                            ->from('Scans')
                            ->where('status = :status')
                            ->execute(array('status' => Scan::STATUS_PENDING));
            
            foreach ($result as $row)
            {
                $this->queue->enqueue($row->getValue('scanId'));
                
                Log::info('Enqueued scan with id %d.', $row->getValue('scanId'));
            }
        }
        
        // Now process contents of the queue, if any.
        while (!$this->queue->isEmpty())
        {
            // Now dequeue an image for processing.
            $scanid = $this->queue->dequeue();
            
            // Load the corresponding scan entity.
            $scan = new Scan($scanid);
            
            Log::debug('Processing %d.', $scanid);
            
            try
            {
                // Set status to PROCESSING and save.
                $scan->setStatus(Scan::STATUS_PROCESSING);
                $scan->save();
                
                // Retrieve the upload associated with the scan.
                $upload = new Upload($scan->getUploadId());
                
                // Process the image.
                $this->run($scan, $upload);
                
                // Create a thumbnail.
                $this->createThumbnail($scanid);
                
                // No exception, therefore success!
                $scan->setStatus(Scan::STATUS_PROCESSED);
                $scan->setUploadId(null);
                $scan->save();
                
                // Delete the upload associated with the scan.
                $upload->delete();
                
                Log::info('Succesfully processed scan with id %d.', $scanid);
            }
            catch (Exception $e)
            {
                // Something went wrong. Set the error status.
                $scan->setStatus(Scan::STATUS_ERROR);
                $scan->save();
                
                throw $e;
            }
        }
    }
    
    /**
     * Continuously keep running the pyramid builder.
     * 
     * NOTE: This method resolves inconsistencies every 20 rounds, so make sure only a single 
     * thread is executing this method at a time.
     * 
     * @param int $iterationPause The timeout in seconds after each iteration.
     */
/*    public function runBuilder($iterationPause = 5)
    {
        $round = 0;
        
        while (true)
        {
            // Resolve inconsistencies every 200 rounds.
            if ($round >= 200)
            {
                $this->resolveInconsistencies();
                $round = 0;
            }
            
            try
            {
                // Do a single iteration.
                $this->doIteration();
            }
            catch (TilePyramidBuilderException $e)
            {
                // Log builder error. Probably a mistake on the part of the user.
                Log::warn("Pyramid builder error:\n%s", $e->getMessage());
            }
            catch (Exception $e)
            {
                // Log other exceptions.
                Log::error("Miscelanous error while processing scans:\n%s", $e);
            }
            
            ++$round;
            
            // Timeout.
            if (sleep($iterationPause) === false)
            {
                Log::warn('Builder sleep() was interrupted.');
            }
        }

    }*/
}

