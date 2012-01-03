<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';
require_once 'models/book/book.php';
require_once 'models/binding/binding.php';

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
    /**
     * Loads book(s).
     */
    public function actionLoad($data)
    {
        if (isset($data['filters'])
         && isset($data['filters'][0])
         && isset($data['filters'][0]['column'])
         && $data['filters'][0]['column'] == 'bindingId' 
         && isset($data['filters'][0]['value']))
        {
            // Retrieve the binding id from the request
            $bindingId = self::getInteger($data['filters'][0], 'value', 0);
            $binding = new Binding($bindingId);
            
            $books = Book::fromBinding($binding);
            $books = array_map(function($book)
            {
                return $book->getValues(true, false);
            }, $books);
            
            return array('records' => $books, 'total' => count($books));
        }
        else
        {
            // Retrieve the book id of a specific book from the request.
            $id = self::getInteger($data, 'id', 0);

            $book = new Book($id);
            $book = $book->getValues(true, false);
            
            return array('records' => $book, 'total' => 1);
        }
    }
    
        public function actionFirstLastPages($data)
    {
        $book;
        foreach ($data as $value) 
        {
            $book = new Book($value[0]);
            $book->setFirstPage($value[1]);
            $book->setLastPage($value[2]);
            $book->save();
        }
        $binding=new Binding($book->getBindingId());
        $binding->setStatus(Binding::STATUS_SELECTED);
        $binding->save();
    }
    
    
    /**
     * Searches for books.
     */
    public function actionSearch($data)
    {
        $query = Query::select(array('books.bookId', 'books.title', 'books.minYear', 'books.maxYear', 'books.placePublished', 'books.publisher', 'books.firstPage', 'bindings.bindingId', 'bindings.summary', 'bindings.signature', 'libraries.libraryName'))
            ->unsafeAggregate('array_to_string(array_accum', 'DISTINCT "pAuthorList"."name"), \', \'', 'authorNames')
            ->unsafeAggregate('array_to_string(array_accum', 'DISTINCT "pProvenanceList"."name"), \', \'', 'provenanceNames')
            ->from('Books books')
            ->join('Bindings bindings', array('books.bindingId = bindings.bindingId'), 'LEFT')
            ->join('Libraries libraries', array('bindings.libraryId = libraries.libraryId'), 'LEFT')
            ->join('Authors authorsList', array('books.bookId = authorsList.bookId'), 'LEFT')
            ->join('Persons pAuthorList', array('authorsList.personId = pAuthorList.personId'), 'LEFT')
            ->join('Authors authorsFind', array('books.bookId = authorsFind.bookId'), 'LEFT')
            ->join('Persons pAuthorFind', array('authorsFind.personId = pAuthorFind.personId'), 'LEFT')
            ->join('Provenances provenancesList', array('bindings.bindingId = provenancesList.bindingId'), 'LEFT')
            ->join('Persons pProvenanceList', array('provenancesList.personId = pProvenanceList.personId'), 'LEFT')
            ->join('Provenances provenancesFind', array('bindings.bindingId = provenancesFind.bindingId'), 'LEFT')
            ->join('Persons pProvenanceFind', array('provenancesFind.personId = pProvenanceFind.personId'), 'LEFT')
            ->where('bindings.status = :bindingStatus')
            ->groupBy('books.bookId', 'bindings.bindingId', 'books.title', 'books.minYear', 'books.maxYear', 'books.placePublished', 'books.publisher', 'books.firstPage', 'bindings.summary', 'bindings.signature', 'libraries.libraryName');
        $binds = array('bindingStatus' => Binding::STATUS_SELECTED);
        $headline = "";
        $c = 0;
        
        /*
         * Adds a fulltext search to the query.
         */
        $addFulltext = function($name, $columns, $value, $addheadline = false) use (&$query, &$binds, &$c, &$headline)
        {
            // Decompose the textual query
            $split = BookController::splitFulltextQuery($value);
            
            // Process the non-exact selectors.
            if ($split['rest'] != '')
            {
                $onlyNegative = true;
                foreach (explode(' & ', $split['rest']) as $k => $v)
                {
                    if (trim($v) != '' && $v[0] != '!')
                    {
                        $onlyNegative = false;
                        break;
                    }
                }
                $query = $query->whereFulltext($columns, $name . $c, $onlyNegative);
                $binds[$name . $c] = $split['rest'];
            }
            
            // Process the exact selectors.
            if (!is_array($columns))
            {
                $e = $split['exact'];
                for ($i = 0; $i < count($e); $i++)
                {
                    if ($e[$i]['positive'])
                    {
                        $query = $query->where($columns . $e[$i]['like'] . $name . $c . '_' . $i);
                    }
                    else
                    {
                        $query = $query->whereOr($columns . $e[$i]['like'] . $name . $c . '_' . $i,
                            $columns . ' IS NULL');
                    }
                    $binds[$name . $c . '_' . $i] = $e[$i]['value'];
                }
            }
            
            // Process headlines.
            if ($addheadline)
            {
                $headline = ($headline != '' ? ' & ' : '') . $split['headline'];
            }
            Log::debug("Parsed search query: %s\n", print_r($split, true));
        };
        
        // Process all search selectors and add them to the query.
        foreach ($data as $selector)
        {
            // If any data is missing or invalid, do not process the selector.
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
        
        // Request a headline if necessary.
        if ($headline != "")
        {
            $query = $query->headline(array('books.title', 'array_to_string(array_accum(DISTINCT pAuthorList.name), \', \')', 'books.publisher', 'books.placePublished', 'bindings.summary', 'array_to_string(array_accum(DISTINCT pProvenanceList.name), \', \')', 'libraries.libraryName', 'bindings.signature'), ':headline', 'headline');
            $binds[':headline'] = $headline;
        }
        
        $result = $query->execute($binds);
        
        // Output the results.
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
            $binding = new Binding($book->getValue('bindingId'));
            $firstScan = Scan::fromBindingPage($binding, $book->getValue('firstPage'));
            if (count($firstScan) != 1)
            {
                // This book contains no scans. Hmm... that won't make sense in the search results.
                continue;
            }
            $records[] = array( // TODO: Name these.
                $book->getValue('title'),
                $book->getValue('authorNames'),
                (string) $year,
                $book->getValue('placePublished'),
                $book->getValue('publisher'),
                $book->getValue('libraryName'),
                $book->getValue('signature'),
                $book->getValue('provenanceNames'),
                $book->getValue('summary'),
                $book->getValue('headline'),
                'tiles/' . $firstScan[0]->getScanId() . '/tile_0_0_0.jpg',
                $book->getValue('bookId'),
                $book->getValue('bindingId'),
                $book->getValue('firstPage')
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
                'value' => '(^|[^[:alpha:]])' . preg_replace('/[^\w\s]/', '.', trim($exacts[2][$i])) . '([^[:alpha:]]|$)',
                'positive' => $exacts[1][$i] != '-'
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

