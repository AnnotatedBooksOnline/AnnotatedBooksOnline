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
require_once 'util/authentication.php';

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
        
        Database::getInstance()->doTransaction(function() use ($data)
        {
            // Collect the binding id and selected book pages from the request.
            $inputBindingId     = BookController::getInteger($data, 'bindingId');
            $inputSelectedBooks = BookController::getArray($data, 'selectedBooks');
            
            // Load the binding to be modified from the database.
            $binding = new Binding($inputBindingId);
            $binding->loadDetails(true);
            
            // Iterate over all selected books and store their values in the database.
            foreach ($inputSelectedBooks as $inputSelectedBook) 
            {
                $firstPage = BookController::getInteger($inputSelectedBook, 'firstPage');
                $lastPage = BookController::getInteger($inputSelectedBook, 'lastPage');
                
                if ($firstPage > $lastPage)
                {
                    throw new ControllerException('faulty-page-order');
                }
                
                $book = $binding->getBookList()->getByKeyValue('bookId', BookController::getInteger($inputSelectedBook, 'bookId'));
                $book->setFirstPage($firstPage);
                $book->setLastPage($lastPage);
                
                $book->setMarkedAsUpdated(true);
            }
            
            // Update the binding status.
            $binding->setStatus(Binding::STATUS_SELECTED);
            $binding->saveWithDetails();

            // Since this user are now done with the binding, set their currentBindingId to NULL.
            $user = Authentication::getInstance()->getUser();
            $user->setCurrentBindingId(null);
            $user->save();
        });
    }
    
    /**
     * Searches for books.
     */
    public function actionSearch($data)
    {
        Database::getInstance()->startTransaction();
        
        $query = Query::select('COUNT(books.bookId) AS count')
            ->from('Books books')
            ->join('BooksFT booksft', array('books.bookId = booksft.bookId'), 'LEFT')
            ->join('Bindings bindings', array('books.bindingId = bindings.bindingId'), 'LEFT')
            ->join(
                'Libraries libraries', 
                array('bindings.libraryId = libraries.libraryId'), 
                'LEFT'
                )
            ->join(
                'Scans invalidScans',
                array('bindings.bindingId = invalidScans.bindingId','invalidScans.status < :scanStatus'),
                'LEFT'
                )
            ->join(
                'Scans firstScan',
                array('bindings.bindingId = firstScan.bindingId', 'books.firstPage = firstScan.page'),
                'LEFT INNER'
                )
            ->where('bindings.status = :bindingStatus', 'invalidScans.status IS NULL');
        
        // The bindings accumulator.
        $binds = array('bindingStatus' => Binding::STATUS_SELECTED, 'scanStatus' => Scan::STATUS_PROCESSED);
        // The bindings counter.
        $c = 0;
        
        $headline = '';
        
        // Adds a fulltext search to the query.
        $addFulltext = function(
            $name, $column, $value, $headline = null, $fast = false
        ) 
            use (&$query, &$binds, &$c)
        {
            BookController::addFulltext(
                $name, $column, $value, $headline,
                $fast, $query, $binds, $c
            );
        };
        
        // Process all search selectors and add them to the query.
        $selectors = self::getArray($data, 'selectors');
        foreach ($selectors as $selector)
        {
            // If any data is missing or invalid, do not process the selector.
            if (isset($selector['type'])      &&
                isset($selector['value'])     && 
                (is_array($selector['value']) ||
                trim($selector['value']) != "")) 
            {
                $value = $selector['value'];
                switch ((string) $selector['type'])
                {
                    case 'year':
                        $query = $query->where('books.maxYear >= :from' . $c);
                        $binds['from' . $c] = self::getInteger($value, 'from', -16535);
                        $query = $query->where('books.minYear <= :to' . $c);
                        $binds['to' . $c] = self::getInteger($value, 'to', 16534);
                        break;
                    case 'title':
                        $addFulltext('title', 'books.title', $value);
                        break;
                    case 'author':
                        $addFulltext('author', 'authorNames(books.bookId)', $value);
                        break;
                    case 'provenance':
                        $addFulltext('provenance', 'provenanceNames(bindings.bindingId)', $value);
                        break;
                    case 'any':
                        $addFulltext('any', 'booksft.text', $value, 'headline', true);
                        $headline .= ' ' . $value;
                        break;
                    case 'place':
                        $addFulltext('place', 'books.placePublished', $value);
                        break;
                    case 'publisher':
                        $addFulltext('publisher', 'books.publisher', $value);
                        break;
                    case 'library':
                        $addFulltext('library', 'libraries.libraryName', $value);
                        break;
                    case 'signature':
                        $query = $query->where('bindings.signature LIKE :signature'. $c);
                        $binds['signature'. $c] = '%' . trim($value) . '%';
                        break;
                    case 'language':
                        $addFulltext('booklanguage', 'bookLanguageNames(books.bookId)', $value);
                        break;
                    case 'annotlanguage':
                        $addFulltext('bindinglanguage', 'bindingLanguageNames(bindings.bindingId)', $value);
                        break;
                    case 'version':
                        $query = $query->where('books.printVersion = :version' . $c);
                        $binds['version' . $c] = (int)$value;
                        break;
                    default:
                        break;
                }
                $c++;
            }
        }

        $results = $query->execute($binds);
        $total = $results->getFirstRow()->getValue('count');

        $query->clear('columns');
        $query->columns('books.bookId');
        $sortFields = array(
            'year'          => 'books.minYear',
            'title'         => 'books.title',
            'author'        => 'authorNames(books.bookId)',
            'binding'       => 'bindings.provenance',
            'library'       => 'libraries.libraryName',
            'signature'     => 'bindings.signature',
            'provenance'    => 'provenanceNames(bindings.bindingId)',
            'place'         => 'books.placePublished',
            'publisher'     => 'books.publisher',
            'language'      => 'bookLanguageNames(books.bookId)',
            'annotlanguage' => 'bindingLanguageNames(bindings.bindingId)',
            'version'       => 'books.printVersion',
            'id'            => 'books.bookId'
        );
        $sorters = self::getArray($data, 'sorters');
        foreach ($sorters as $sorter)
        {
            if (is_array($sorter) && isset($sorter['property']) && isset($sortFields[$sorter['property']]))
            {
                $sortField = $sortFields[$sorter['property']];
                $sortDirection = isset($sorter['direction']) ? $sorter['direction'] : 'ASC';
                $query->orderBy($sortField, $sortDirection);
            }
        }
        $query->orderBy('books.bookId', 'DESC');
        $limit = self::getInteger($data, 'limit', 5, true);
        $offset = $limit * (self::getInteger($data, 'page', 0, true) - 1);
        $query->limit($limit, $offset);
        $query->groupBy(
            'books.bookId', 'books.title', 'books.minYear',
            'books.maxYear', 'books.placePublished', 'books.publisher',
            'books.firstPage', 'bindings.bindingId', 'bindings.signature',
            'libraries.libraryName', 'books.printVersion', 'booksft.text'
            );

        $results = $query->execute($binds);

        $query = Query::select(
            'books.bookId', 'books.title', 'books.minYear', 'books.maxYear',
            'books.placePublished', 'books.publisher', 'books.firstPage',
            'bindings.bindingId', 'bindings.signature', 'libraries.libraryName',
            'authorNames(books.bookId) AS authornames', 'provenanceNames(bindings.bindingId) AS provenancenames',
            'scans.scanId', 'bookLanguageNames(books.bookId) AS booklanguagenames',
            'bindingLanguageNames(bindings.bindingId) AS bindinglanguagenames', 'books.printVersion',
            'booksft.text'
            )
            ->from('Books books')
            ->join('Bindings bindings', array('books.bindingId = bindings.bindingId'), 'LEFT')
            ->join('Libraries libraries', array('bindings.libraryId = libraries.libraryId'), 'LEFT')
            ->join('Scans scans',
                array('bindings.bindingId = scans.bindingId', 'books.firstPage = scans.page'),
                'LEFT INNER'
                )
            ->join('BooksFT booksft', array('books.bookId = booksft.bookId'), 'LEFT')
            ->groupBy(
                'books.bookId', 'books.title', 'books.minYear', 'books.maxYear',
                'books.placePublished', 'books.publisher', 'books.firstPage',
                'bindings.bindingId', 'bindings.signature', 'libraries.libraryName',
                'authornames', 'provenancenames', 'scans.scanId', 'bindinglanguagenames',
                'booklanguagenames', 'books.printVersion'
                )
            ->where('books.bookId = :bookId');
        $binds = array();
        
        $records = array();
        foreach ($results as $result)
        {
            $binds['bookId'] = $result->getValue('bookId');
            $book = $query->execute($binds)->getFirstRow();
            if ($book->getValue('minYear') == $book->getValue('maxYear'))
            {
                $year = $book->getValue('minYear');
            }
            else
            {
                $year = $book->getValue('minYear') . ' - ' . $book->getValue('maxYear');
            }
            
            $records[] = array(
                'title'         => $book->getValue('title'),
                'author'        => $book->getValue('authornames'),
                'year'          => (string) $year,
                'place'         => $book->getValue('placePublished'),
                'publisher'     => $book->getValue('publisher'),
                'library'       => $book->getValue('libraryName'),
                'signature'     => $book->getValue('signature'),
                'provenance'    => $book->getValue('provenancenames'),
                'headline'      => $headline != "" ? BookController::headline($book->getValue('text'), $headline) : NULL,
                'thumbnail'     => 'data/thumbnails/' . $book->getValue('scanId') . '.jpg',
                'id'            => $book->getValue('bookId'),
                'bindingId'     => $book->getValue('bindingId'),
                'firstPage'     => $book->getValue('firstPage'),
                'language'      => $book->getValue('booklanguagenames'),
                'annotlanguage' => $book->getValue('bindinglanguagenames'),
                'version'       => $book->getValue('printVersion')
            );
        }
        
        Database::getInstance()->commit();
        
        return array(
            'records' => $records,
            'total'   => $total
        );
    }
    
    /**
     * Adds a fulltext query to the given query.
     *
     * @param string  $name        The name of this fulltext query (for binding name).
     * @param column  $column      The text column to search on.
     * @param string  $value       The user-supplied search string.
     * @param string  $headline    The headline identifier for the given fulltext query, or null.
     * @param Query   $query       The query to operate on.
     * @param array   $binds       The current array of bindings.
     * @param int     $c           The current binding counter.
     */
    public static function addFulltext(
        $name, $column, $value, $headline = null /* TODO: to be removed*/,
        $fast = false, Query &$query, array &$binds, &$c)
    {
        // Check if there are only negative queries: in such a case, we also want to find empty results.
        $onlyNegative = true;
        foreach (explode(' ', $value) as $v)
        {
            if (trim($v) != '' && $v[0] != '-')
            {
                $onlyNegative = false;
                break;
            }
        }
        
        $query = $query->whereFulltext($column, ':' . $name . $c, null, $onlyNegative, $fast);
        $binds[$name . $c] = $value;
    }
    
    public static function headline($text, $query, $num = 40)
    {
        $query = array_flip(mb_split('\s+', mb_strtolower(mb_ereg_replace('[^[:alnum:][:space:]]', '', $query))));
        $text = mb_split('\s+', $text);

        $val = 0;
        $pos = 0;
        $maxval = 0;
        $maxpos = 0;
        
        for ( ; $pos < count($text); $pos++)
        {
            $text[$pos] = htmlspecialchars($text[$pos]);
            $stripped = mb_strtolower(mb_ereg_replace('[^[:alnum:]]', '', $text[$pos]));
            if ($stripped == "")
            {
                if ($val > 0)
                {
                    $val--;
                }
                continue;
            }
            if (array_key_exists($stripped, $query))
            {
                $val += $num;
                $text[$pos] = '<b>' . $text[$pos] . '</b>';
            }
            if ($val > $maxval)
            {
                $maxval = $val;
                $maxpos = $pos;
            }
            else if ($val > 0)
            {
                $val--;
            }
        }
        
        if ($maxpos < $num)
        {
            $maxpos = 0;
        }
        else
        {
            $maxpos = $maxpos - $num + 1;
        }
        
        return implode(' ', array_slice($text, $maxpos, $num));
    }
    
}

