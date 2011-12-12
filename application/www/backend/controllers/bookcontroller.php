<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';

// Exceptions.
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
class BookController extends Controller
{
    protected function __construct()
    {
        ;
    }
    
    /**
     * Loads book(s).
     */
    public function actionLoad($data)
    {
        // Retrieve the book id of a specific book from the request.
        $id = self::getInteger($data, 'id', 0);
        
        // Determine id a specific book was requested. If this is the case retrieve this book
        // from the database and return.
        
        $title = Query::select('books.title')
            ->from('Books books')
            ->where('books.bookId = :id')
            ->execute(array(':id' => $id));
        
        if ($title->getAmount() != 1)
        {
            throw new BookNotFoundException($id);
        }
        $title = $title->getFirstRow()->getValue('title');
        
        $scans = Query::select('scans.scanId', 'scans.width', 'scans.height', 'scans.zoomLevel')
            ->from('Scans scans')
            ->where('scans.bookId = :id')
            ->execute(array(':id' => $id));
        
        $scanResult = array();
        foreach ($scans as $scan)
        {
            $scanResult[] = $scan->getValues();
        }
        
        // TODO: remove this - for testing purposes only.
        if (count($scanResult) == 0)
        {
            $scanResult = array(
                array('scanId' => 1, 'width' => 151, 'height' => 225, 'zoomLevel' => 6)
            );
        }
        
        if ($id)
        {
            return array('records' => array(
                'bookId' => $id,
                'title' => $title,
                'scans' => $scanResult
            ), 'total' => 1);
        }
    }
    
    /**
     * Searches for books.
     */
    public function actionSearch($data)
    {
        $query = Query::select(array('books.bookId', 'books.title', 'books.minYear', 'books.maxYear', 'books.placePublished', 'books.publisher', 'bindings.summary', 'bindings.signature', 'libraries.libraryName'))
            ->unsafeAggregate('array_to_string(array_accum', 'DISTINCT "personsList"."name"), \', \'', 'authorNames')
            ->from('Books books')
            ->join('Bindings bindings', array('books.bindingId = bindings.bindingId'), 'LEFT')
            ->join('Libraries libraries', array('bindings.libraryId = libraries.libraryId'), 'LEFT')
            ->join('Authors authorsList', array('books.bookId = authorsList.bookId'), 'LEFT')
            ->join('Persons personsList', array('authorsList.authorId = personsList.personId'), 'LEFT')
            ->join('Authors authorsFind', array('books.bookId = authorsFind.bookId'), 'LEFT')
            ->join('Persons personsFind', array('authorsFind.authorId = personsFind.personId'), 'LEFT')
            ->groupBy('books.bookId', 'books.title', 'books.minYear', 'books.maxYear', 'books.placePublished', 'books.publisher', 'bindings.summary', 'bindings.signature', 'libraries.libraryName');
        $binds = array();
        $headline = "";
        $c = 0;
        foreach ($data as $selector)
        {
            if (isset($selector['type']) && isset($selector['value']) && (is_array($selector['value']) || trim($selector['value']) != ""))
            {
                $value = $selector['value'];
                switch ((string) $selector['type'])
                {
                    case 'year':
                        $query = $query->where('books.maxYear >= :from' . $c);
                        $binds[':from' . $c] = self::getInteger($value, 'from', -16535);
                        $query = $query->where('books.minYear <= :to' . $c);
                        $binds[':to' . $c] = self::getInteger($value, 'to', 16534);
                        break;
                    case 'title':
                        $query = $query->whereFulltext('books.title', ':title'. $c);
                        $binds[':title'. $c] = $value;
                        break;
                    case 'author':
                        $query = $query->whereFulltext('personsFind.name', ':author'. $c);
                        $binds[':author'. $c] = $value;
                        break;
                    case 'any':
                        $query = $query->whereFulltext(array('books.title', 'personsFind.name', 'books.publisher', 'books.placePublished', 'bindings.summary', 'libraries.libraryName', 'bindings.signature'), ':any' . $c); // TODO: change column to index
                        $binds[':any' . $c] = $value;
                        $headline .= " " . $value;
                        break;
                    case 'place':
                        $query = $query->whereFulltext('books.placePublished', ':place'. $c);
                        $binds[':place'. $c] = $value;
                        break;
                    case 'publisher':
                        $query = $query->whereFulltext('books.publisher', ':publisher'. $c);
                        $binds[':publisher'. $c] = $value;
                        break;
                    case 'summary':
                        $query = $query->whereFulltext('bindings.summary', ':summary'. $c);
                        $binds[':summary'. $c] = $value;
                        break;
                    case 'library':
                        $query = $query->whereFulltext('libraries.libraryName', ':library'. $c);
                        $binds[':library'. $c] = $value;
                        break;
                    case 'signature':
                        $query = $query->where('bindings.signature ILIKE :signature'. $c);
                        $binds[':signature'. $c] = '%' . trim($value) . '%';
                        break;
                    default:
                        break;
                }
                $c++;
            }
        }
        
        if ($headline != "")
        {
            $query = $query->headline(array('books.title', 'array_to_string(array_accum(DISTINCT personsList.name), \', \')', 'books.publisher', 'books.placePublished', 'bindings.summary', 'libraries.libraryName', 'bindings.signature'), ':headline', 'headline');
            $binds[':headline'] = $headline;
        }
        
        $result = $query->execute($binds);
        
        $records = array();
        foreach ($result as $book)
        {
            Log::debug('%s', print_r($book->getValues(), true));
            if ($book->getValue('minYear') == $book->getValue('maxYear'))
            {
                $year = $book->getValue('minYear');
            }
            else
            {
                $year = $book->getValue('minYear') . ' - ' . $book->getValue('maxYear');
            }
            $records[] = array(
                $book->getValue('title'),
                $book->getValue('authorNames'),
                $year,
                $book->getValue('placePublished'),
                $book->getValue('publisher'),
                $book->getValue('libraryName'),
                $book->getValue('signature'),
                $book->getValue('summary'),
                $book->getValue('headline'),
                'tiles/tile_0_0_0.jpg',
                $book->getValue('bookId')
            );
        }
                
        return $records;
    }
}
