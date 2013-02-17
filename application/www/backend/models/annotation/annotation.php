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

require_once 'framework/database/entity.php';
require_once 'framework/database/database.php';
require_once 'models/scan/scan.php';
require_once 'models/annotation/annotationlist.php';

/**
 * Class representing an annotation entity.
 */
class Annotation extends Entity
{
    /** Id of this annotation. */
    protected $annotationId;
    
    /** Id of the scan to which this annotation belongs. */
    protected $scanId;
    
    /** The polygon of this annotation. */
    protected $polygon;
    
    /** The Id of the user who created this annotation. */
    protected $createdUserId;
    
    /** The time and date on which this annotation was created. */
    protected $timeCreated;
    
    /** The position of this annotation on the list of annotation which belong to one scan. */
    protected $order;
    
    /** The Id of the user who last modified this annotation. */
    protected $changedUserId;
    
    /** the time and date on which this annotation was last modified. */
    protected $timeChanged;
    
    /**
     *  Contains user-supplied information about the annotation, such as transcriptions, 
     *  descriptions, translations and comments. 
     *  
     *  Formatted as a comma-seperated list that can be converted to an array through 
     *  fromCommaList.
     */
    protected $annotationInfo;
    
    /**
     * Constructs an annotation entity.
     *
     * @param $id  Id of the annotation. Default (null) will create a new annotation.
     */
    public function __construct($id = null)
    {
        if ($id !== null)
        {
            $this->annotationId = $id;
            
            $this->load();
        }
    }
    
    /**
     * Returns all the annotations which belong to one scan
     *
     * @param $scan  The scan model
     * @return  Array of annotation models
     */
    public static function fromScan($scan)
    {
        $annotations = AnnotationList::find(array('scanId' => $scan->getScanId()))->getEntities();
        return $annotations;
    }
    
    /**
     * Get the name of the corresponding table.
     */
    public static function getTableName()
    {
        return 'Annotations';
    }
    
    /**
     * Get an array with the primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('annotationId');
    }
    
    /**
     * Gets all the columns that are not primary keys as an array.
     */
    public static function getColumns()
    {
        return array('scanId', 'polygon', 'annotationInfo', 'createdUserId',
            'timeCreated', 'order', 'changedUserId', 'timeChanged');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'annotationId'      => 'int',
            'scanId'            => 'int',
            'polygon'           => 'base64',
            'annotationInfo'    => 'string',
            'createdUserId'     => 'int',
            'timeCreated'       => 'timestamp',
            'order'             => 'int',
            'changedUserId'     => 'int',
            'timeChanged'       => 'timestamp',
        );
    }
    
    /**
     * Takes a string seperated by comma's and creates an array of substrings delimited by these
     * comma's. Comma's escaped as '\,' are unescaped and not seen as delimiters. Backslashes 
     * escaped as '\\' are also unescaped.
     * 
     * @param string $commaList An UTF-8 string containing the comma-seperated list.
     * 
     * @return array(string) The array substrings of the string, splitted on comma's.
     */
    public static function fromCommaList($commaList)
    {
        // Ensure the input string is UTF-8, to prevent freaky errors.
        mb_check_encoding($commaList, 'UTF-8');
        
        $result = array();
        $last = '';
        for($i = 0; $i < strlen($commaList); ++$i)
        {
            $c = $commaList[$i];
            if($c == ',')
            {
                // Add last element to resulting array.
                $result[] = $last;
                $last = '';
            }
            else if($c == "\\")
            {
                // Escaped character.
                ++$i;
                $last .= $commaList[$i];
            }
            else
            {
                // Other bytes.
                $last .= $c;
            }
        }
        
        $result[] = $last;
        
        return $result;
    }
    
    /**
     * Inverse of fromCommaList. Produces a comma-seperated string containing the elements from
     * the array. Comma's and backslashes are escaped.
     * 
     * @param array(string) $arr An array of strings to convert into a comma list.
     * 
     * @return string A string containing the array elements seperated by comma's.
     */
    public static function toCommaList($arr)
    {
        // Escape function.
        $doEscape = function($str)
        {
            return str_replace(',', '\\,', str_replace('\\', '\\\\', $str));
        };
        
        // Glue the list together,
        return implode(',', array_map($doEscape, $arr));
    }
    
    /**
     * Getters and setters.
     */
    
    public function getAnnotationId()    { return $this->annotationId; }
    public function setAnnotationId($id) { $this->annotationId = $id; } 
    
    public function getScanId()        { return $this->scanId;    }
    public function setScanId($scanId) { $this->scanId = $scanId; }
    
    public function getPolygon()
    {
        return array_map(function($vertex)
        {
            return array(
                'x' => $vertex[0],
                'y' => $vertex[1]
            );
        }, array_chunk(unpack('f*', $this->polygon), 2));
    }
    
    public function setPolygon($vertices)
    {
        $this->polygon = '';
        foreach ($vertices as $vertex)
        {
            $this->polygon .= pack('f2', $vertex['x'], $vertex['y']);
        }
    }
    
    public function getCreatedUserId()    { return $this->createdUserId; }
    public function setCreatedUserId($id) { $this->createdUserId = $id;  }
    
    public function getTimeCreated()      { return $this->timeCreated;  }
    public function setTimeCreated($time) { $this->timeCreated = $time; }
    
    public function getOrder()       { return $this->order;   }
    public function setOrder($order) { $this->order = $order; }
    
    public function getChangedUserId()    { return $this->changedUserId; }
    public function setChangedUserId($id) { $this->changedUserId = $id;  }
    
    public function getTimeChanged()      { return $this->timeChanged;  }
    public function setTimeChanged($time) { $this->timeChanged = $time; }
    
    
    // Returns annotation info as indexed array.
    public function getAnnotationInfo()
    {
        return self::fromCommaList($this->annotationInfo);
    }
    public function setAnnotationInfo($info)
    {
        $this->annotationInfo = self::toCommaList($info);
    }
    
    
    // For compatibility. About to be deprecated.
    public function getTranscriptionEng()      
    {
        $info = $this->getAnnotationInfo();
        Log::debug('!!!!!' . print_r($info, true));
        return $info[0];
    }
    public function getTranscriptionOrig() 
    {
        $info = $this->getAnnotationInfo();
        Log::debug('!!!!!' . print_r($info, true));
        return $info[1];
    }
    
    public function setTranscriptionEng($text)
    {
        $info = $this->getAnnotationInfo();
        $info[0] = $text;
        $this->setAnnotationInfo($info);
    }
    
    public function setTranscriptionOrig($text)
    {
        $info = $this->getAnnotationInfo();
        $info[1] = $text;
        $this->setAnnotationInfo($info);
    }
}
