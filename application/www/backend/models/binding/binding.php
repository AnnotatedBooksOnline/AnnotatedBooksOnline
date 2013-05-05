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
require_once 'models/book/booklist.php';
require_once 'models/provenance/provenancelist.php';
require_once 'models/library/library.php';
require_once 'models/language/bindinglanguagelist.php';

/**
 * Class representing a binding entity.
 */
class Binding extends Entity
{
    /** Binding status constants. */
    const STATUS_UPLOADED  = 0,
          STATUS_REORDERED = 1,
          STATUS_SELECTED  = 2,
          STATUS_DELETED   = 3;
    
    /** Id of this binding. */
    protected $bindingId;
    
    /** Signature of the binding */
    protected $signature;
    
    /** Summary of the contents of the binding. */
    protected $summary;
    
    /** Library */
    protected $libraryId;
    
    /** Binding status */
    protected $status;
    
    /** Books for this binding. */
    protected $bookList;
    
    /** User this binding was created by. */
    protected $userId;

    /** List of all scans for this book. */
    protected $scanList;
    
    /** List of all provenances for this book. */
    protected $provenanceList;
    
    /** List of all languages of the annotations in this book. */
    protected $bindingLanguageList;
    
    /**
     * Constructs a binding by id.
     *
     * @param  $id  Id of the binding. Default (null) will create a new binding.
     */
    public function __construct($id = null)
    {
        if ($id !== null)
        {
            $this->bindingId = $id;
    
            $this->load();
        }
        
        $this->bookList = new BookList();
        $this->scanList = new ScanList();
        
        $this->provenanceList      = new ProvenanceList();
        $this->bindingLanguageList = new BindingLanguageList();
    }
    
    /**
     * Loads all associtated entity lists.
     */
    public function loadDetails($forUpdate = null)
    {
        $bindingId = $this->bindingId;
        list($this->bookList, $this->scanList, $this->provenanceList, $this->bindingLanguageList) 
            = Database::getInstance()->doTransaction(function() use ($bindingId, $forUpdate)
        {
            if ($forUpdate === true)
            {
                $bookList = BookList::findForUpdate(array('bindingId' => $bindingId));
                $scanList = ScanList::findForUpdate(array('bindingId' => $bindingId));
                $provenanceList = ProvenanceList::findForUpdate(array('bindingId' => $bindingId));
                $bindingLanguageList = BindingLanguageList::findForUpdate(array('bindingId' => $bindingId));
            }
            else
            {
                $bookList = BookList::find(array('bindingId' => $bindingId));
                $scanList = ScanList::find(array('bindingId' => $bindingId));
                $provenanceList = ProvenanceList::find(array('bindingId' => $bindingId));
                $bindingLanguageList = BindingLanguageList::find(array('bindingId' => $bindingId));
            }
            
            return array($bookList, $scanList, $provenanceList, $bindingLanguageList);
        });
    }
    
    /**
     * Saves all associated entity lists.
     */
    public function saveDetails() 
    {
        $bindingId = $this->bindingId;
        $bookList = $this->bookList;
        $scanList = $this->scanList;
        $provenanceList = $this->provenanceList;
        $bindingLanguageList = $this->bindingLanguageList;
        return Database::getInstance()->doTransaction(function() use ($bindingId, $bookList, $scanList, 
                                                                         $provenanceList, $bindingLanguageList)
        {
            // Save the book list.
            $bookList->setValue('bindingId', $bindingId);
            $bookList->save();
            
            // Load all book details.
            foreach($bookList as $book)
            {
                $book->loadDetails();    
            }
            
            // Save the scan list.
            $scanList->setValue('bindingId', $bindingId);
            $scanList->save();
            
            // Save the provenance list.
            $provenanceList->setValue('bindingId', $bindingId);
            $provenanceList->save();
            
            // Save the language list.
            $bindingLanguageList->setValue('bindingId', $bindingId);
            $bindingLanguageList->save();
        });
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    public static function getTableName()
    {
        return 'Bindings';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('bindingId');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    public static function getColumns()
    {
        return array('libraryId', 'signature', 'summary', 'status', 'userId');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'bindingId' => 'int',
            'libraryId' => 'int',
            'signature' => 'istring',
            'summary'   => 'istring',
            'status'    => 'int',
        );
    }
    
    /**
     * Getters and setters.
     */
    
    public function getBindingId()           { return $this->bindingId;       }
    public function setBindingId($bindingId) { $this->bindingId = $bindingId; }
    
    public function getLibraryId()           { return $this->libraryId;       }
    public function setLibraryId($libraryId) { $this->libraryId = $libraryId; }
    
    public function getSignature()           { return $this->signature;       }
    public function setSignature($signature) { $this->signature = $signature; }
    
    public function getSummary()         { return $this->summary;     }
    public function setSummary($summary) { $this->summary = $summary; }
    
    public function getStatus()        { return $this->status;    }
    public function setStatus($status) { $this->status = $status; }

    public function getBookList()          { return $this->bookList;      }
    public function setBookList($bookList) { $this->bookList = $bookList; }
    
    public function getScanList()          { return $this->scanList;      }
    public function setScanList($scanList) { $this->scanList = $scanList; }
    
    public function getProvenanceList()                { return $this->provenanceList;            }
    public function setProvenanceList($provenanceList) { $this->provenanceList = $provenanceList; }
    
    public function getBindingLanguageList()                     { return $this->bindingLanguageList;                 }
    public function setBindingLanguageList($bindingLanguageList) { $this->bindingLanguageList = $bindingLanguageList; }
    
    public function getUserId()                     { return $this->userId; }
    public function setUserId($userId)              { $this->userId = $userId; }
}
