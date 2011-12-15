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
            ->unsafeAggregate('array_to_string(array_accum', 'DISTINCT "pAuthorList"."name"), \', \'', 'authorNames')
            ->unsafeAggregate('array_to_string(array_accum', 'DISTINCT "pProvenanceList"."name"), \', \'', 'provenanceNames')
            ->from('Books books')
            ->join('Bindings bindings', array('books.bindingId = bindings.bindingId'), 'LEFT')
            ->join('Libraries libraries', array('bindings.libraryId = libraries.libraryId'), 'LEFT')
            ->join('Authors authorsList', array('books.bookId = authorsList.bookId'), 'LEFT')
            ->join('Persons pAuthorList', array('authorsList.authorId = pAuthorList.personId'), 'LEFT')
            ->join('Authors authorsFind', array('books.bookId = authorsFind.bookId'), 'LEFT')
            ->join('Persons pAuthorFind', array('authorsFind.authorId = pAuthorFind.personId'), 'LEFT')
            ->join('Provenances provenancesList', array('bindings.bindingId = provenancesList.bindingId'), 'LEFT')
            ->join('Persons pProvenanceList', array('provenancesList.personId = pProvenanceList.personId'), 'LEFT')
            ->join('Provenances provenancesFind', array('bindings.bindingId = provenancesFind.bindingId'), 'LEFT')
            ->join('Persons pProvenanceFind', array('provenancesFind.personId = pProvenanceFind.personId'), 'LEFT')
            ->groupBy('books.bookId', 'books.title', 'books.minYear', 'books.maxYear', 'books.placePublished', 'books.publisher', 'bindings.summary', 'bindings.signature', 'libraries.libraryName');
        $binds = array();
        $headline = "";
        $c = 0;
        
        $addFulltext = function($name, $columns, $value, $addheadline = false) use (&$query, &$binds, &$c, &$headline)
        {
            $split = BookController::splitFulltextQuery($value);

            if ($split['rest'] != '')
            {
                $query = $query->whereFulltext($columns, $name . $c);
                $binds[$name . $c] = $split['rest'];
            }
            
            if (!is_array($columns))
            {
                $e = $split['exact'];
                for ($i = 0; $i < count($e); $i++)
                {
                    $query = $query->where($columns . $e[$i]['like'] . $name . $c . '_' . $i);
                    $binds[$name . $c . '_' . $i] = $e[$i]['value'];
                }
            }
            
            if ($addheadline)
            {
                $headline = ($headline != '' ? ' & ' : '') . $split['headline'];
            }
            Log::debug("Parsed search query: %s\n", print_r(BookController::splitFulltextQuery($value), true));
        };
        
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
                        $addFulltext(':title', 'books.title', $value);
                        break;
                    case 'author':
                        $addFulltext(':author', 'pAuthorFind.name', $value);
                        break;
                    case 'provenance':
                        $addFulltext(':provenance', 'pProvenanceFind.name', $value);
                        break;
                    case 'any':
                        $addFulltext(':any', array('books.title', 'pAuthorFind.name', 'books.publisher', 'books.placePublished', 'bindings.summary', 'pProvenanceFind.name', 'libraries.libraryName', 'bindings.signature'), $value, true); // TODO: change column to index
                        break;
                    case 'place':
                        $addFulltext(':place', 'books.placePublished', $value);
                        break;
                    case 'publisher':
                        $addFulltext(':publisher', 'books.publisher', $value);
                        break;
                    case 'summary':
                        $addFulltext(':summary', 'bindings.summary', $value);
                        break;
                    case 'library':
                        $addFulltext(':library', 'libraries.libraryName', $value);
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
            $query = $query->headline(array('books.title', 'array_to_string(array_accum(DISTINCT pAuthorList.name), \', \')', 'books.publisher', 'books.placePublished', 'bindings.summary', 'array_to_string(array_accum(DISTINCT pProvenanceList.name), \', \')', 'libraries.libraryName', 'bindings.signature'), ':headline', 'headline');
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
                (string)$book->getValue('title'),
                (string)$book->getValue('authorNames'),
                (string)$year,
                (string)$book->getValue('placePublished'),
                (string)$book->getValue('publisher'),
                (string)$book->getValue('libraryName'),
                (string)$book->getValue('signature'),
                (string)$book->getValue('provenanceNames'),
                (string)$book->getValue('summary'),
                (string)$book->getValue('headline'),
                'tiles/tile_0_0_0.jpg',
                (string)$book->getValue('bookId')
            );
        }
        
        return $records;
    }
    
    /**
     * Splits a fulltext user-input query into distinct queries.
     */
    public static function splitFulltextQuery($query)
    {
        $exacts = array();
        $num = preg_match_all('/([+-]?)"([^"]+)"/', $query, $exacts, PREG_PATTERN_ORDER);
        $result = array();
        $result['exact'] = array();
        for ($i = 0; $i < $num; $i++)
        {
            $result['exact'][] = array(
                'like' => $exacts[1][$i] == '-' ? ' !~* ' : ' ~* ',
                'value' => '(^|[^[:alpha:]])' . preg_replace('/[^\w\s]/', '.', trim($exacts[2][$i])) . '([^[:alpha:]]|$)'
            );
        }
        $headline = 
            explode(' ',
            trim(
            preg_replace('/\s+/', ' ',
            preg_replace('/[^\w\s!-]/', ' ', 
            preg_replace('/[-](?!\w)/', '',
            preg_replace('/(?<!\w)[-](?=\w)/', '!',
            preg_replace('/[!|&+]/', '',
            preg_replace('/([+-]?)"([^"]+)"/', '',
            $query
        ))))))));
        $result['rest'] = implode(' & ', $headline);
        
        if ($headline[0] == "")
        {
            $headline = array();
        }
        
        for ($i = 0; $i < $num; $i++)
        {
            if ($exacts[1][$i] != '-')
            {
                $headline[] = 
                    implode(' & ',
                    explode(' ',
                    trim(
                    preg_replace('/\s+/', ' ',
                    preg_replace('/[^\w\s-]/', ' ', 
                    $exacts[2][$i]
                )))));
            }
        }
        $result['headline'] = implode(' & ', $headline);
        return $result;
    }
}
