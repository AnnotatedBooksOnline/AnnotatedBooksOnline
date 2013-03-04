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

require_once 'controllers/controllerbase.php';
require_once 'util/authentication.php';
require_once 'models/book/booklist.php';
require_once 'models/binding/binding.php';

/**
 * Exceptions.
 */
class BookNotFoundException extends ExceptionBase
{
    public function __construct($bookId)
    {
        parent::__construct('book-not-found', $bookId);
    }
}

/**
 * Book controller class.
 */
class BookController extends ControllerBase
{
    /**
     * Loads books.
     */
    public function actionLoad($data)
    {
        // Handle load.
        $defaultSorters = array(
            array('column' => 'firstPage', 'direction' => 'ASC')
        );
        return $this->handleLoad($data, 'Book', 'bookId', null, $defaultSorters);
    }
    
    /**
     * Sets the first and last pages of the books
     */
    public function actionFirstLastPages($data)
    {               
        // Assert the user has permission to upload bindings.
        Authentication::assertPermissionTo('upload-bindings');
        
        Database::getInstance()->startTransaction();
        
        // Collect the binding id and selected book pages from the request.
        $inputBindingId     = self::getInteger($data, 'bindingId');
        $inputSelectedBooks = self::getArray($data, 'selectedBooks');
        
        // Load the binding to be modified from the database.
        $binding = new Binding($inputBindingId);
        $binding->loadDetails();
        
        // Iterate over all selected books and store their values in the database.
        foreach ($inputSelectedBooks as $inputSelectedBook) 
        {
            $firstPage = self::getInteger($inputSelectedBook, 'firstPage');
            $lastPage = self::getInteger($inputSelectedBook, 'lastPage');
            
            if ($firstPage > $lastPage)
            {
                throw new ControllerException('faulty-page-order');
            }
            
            $book = $binding->getBookList()->getByKeyValue('bookId', self::getInteger($inputSelectedBook, 'bookId'));
            $book->setFirstPage($firstPage);
            $book->setLastPage($lastPage);
            
            $book->setMarkedAsUpdated(true);
        }
        
        // Update the binding status.
        $binding->setStatus(Binding::STATUS_SELECTED);
        $binding->saveWithDetails();
                    
        Database::getInstance()->commit();
    }
}

