<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'util/authentication.php';
require_once 'models/book/booklist.php';
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
class BookController extends ControllerBase
{
    /**
     * Loads books.
     */
    public function actionLoad($data)
    {
        // Handle load.
        return $this->handleLoad($data, 'Book', 'bookId');
    }
    
    /**
     * 
     * Enter description here ...
     * @param unknown_type $data
     */
    public function actionFirstLastPages($data)
    {
        // TODO: Mathijs : Permissions and authentication.
        
        // Collect the binding id and selected book pages from the request.
        $inputBindingId = self::getInteger($data, 'bindingId');
        $inputSelectedBooks = self::getArray($data, 'selectedBooks');
        
        // Iterate over all selected books and store their values in the database.
        foreach ($inputSelectedBooks as $inputSelectedBook) 
        {
            $book = new Book(self::getInteger($inputSelectedBook, 'bookId'));
            $book->setFirstPage(self::getInteger($inputSelectedBook, 'firstPage'));
            $book->setLastPage(self::getInteger($inputSelectedBook, 'lastPage'));
            $book->save();
        }
        
        // Update the binding status if required.
        $binding = new Binding($book->getBindingId());
        if ($binding->getStatus() != Binding::STATUS_SELECTED)
        {
            $binding->setStatus(Binding::STATUS_SELECTED);
            $binding->save();
        }
    }
    
    /**
     * Searches for books.
     */
    public function actionSearch($data)
    {
        Database::getInstance()->startTransaction();
        
        $query = Query::select('COUNT(books.bookId)')
            ->from('Books books')
            ->join('Bindings bindings', array('books.bindingId = bindings.bindingId'), 'LEFT')
            ->join('Libraries libraries', array('bindings.libraryId = libraries.libraryId'), 'LEFT')
            ->join('Scans invalidScans', array('bindings.bindingId = invalidScans.bindingId', 'invalidScans.status < :scanStatus'), 'LEFT')
            ->join('Scans firstScan', array('bindings.bindingId = firstScan.bindingId', 'books.firstPage = firstScan.page'), 'LEFT INNER')
            ->where('bindings.status = :bindingStatus', 'invalidScans.status IS NULL');
        
        // The bindings accumulator.
        $binds = array('bindingStatus' => Binding::STATUS_SELECTED, 'scanStatus' => Scan::STATUS_PROCESSED);
        // The headline query string.
        $headline = "";
        // The bindings counter.
        $c = 0;
        
        // Adds a fulltext search to the query.
        $addFulltext = function($name, $columns, $value, $addheadline = false, $altvector = null) use (&$query, &$binds, &$c, &$headline)
        {
            BookController::addFulltext($name, $columns, $value, $addheadline, $altvector, $query, $binds, $c, $headline);
        };
        
        // Process all search selectors and add them to the query.
        $selectors = self::getArray($data, 'selectors');
        foreach ($selectors as $selector)
        {
            // If any data is missing or invalid, do not process the selector.
            if (isset($selector['type']) && isset($selector['value']) && (is_array($selector['value']) || trim($selector['value']) != ""))
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
                        $addFulltext('any', 'books.fulltext', $value, true, 'books.fulltext_vector');
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
                        $query = $query->where('bindings.signature ILIKE :signature'. $c);
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
        $query->orderBy('books.bookId', 'ASC');
        $limit = self::getInteger($data, 'limit', 5, true);
        $offset = $limit * (self::getInteger($data, 'page', 0, true) - 1);
        $query->limit($limit, $offset);
        $query->groupBy('books.bookId', 'books.title', 'books.minYear', 'books.maxYear', 'books.placePublished', 'books.publisher', 'books.firstPage', 'bindings.bindingId', 'bindings.signature', 'libraries.libraryName', 'books.printVersion', 'books.fulltext');

        $results = $query->execute($binds);

        $query = Query::select('books.bookId', 'books.title', 'books.minYear', 'books.maxYear', 'books.placePublished', 'books.publisher', 'books.firstPage', 'bindings.bindingId', 'bindings.signature', 'libraries.libraryName', 'authorNames(books.bookId)', 'provenanceNames(bindings.bindingId)', 'scans.scanId', 'bookLanguageNames(books.bookId)', 'bindingLanguageNames(bindings.bindingId)', 'books.printVersion')
            ->from('Books books')
            ->join('Bindings bindings', array('books.bindingId = bindings.bindingId'), 'LEFT')
            ->join('Libraries libraries', array('bindings.libraryId = libraries.libraryId'), 'LEFT')
            ->join('Scans scans', array('bindings.bindingId = scans.bindingId', 'books.firstPage = scans.page'), 'LEFT INNER')
            ->groupBy('books.bookId', 'books.title', 'books.minYear', 'books.maxYear', 'books.placePublished', 'books.publisher', 'books.firstPage', 'bindings.bindingId', 'bindings.signature', 'libraries.libraryName', 'authornames', 'provenancenames', 'scans.scanId', 'bindinglanguagenames', 'booklanguagenames', 'books.printVersion', 'books.fulltext')
            ->where('books.bookId = :bookId');
        $binds = array();
        
        // Request a headline if necessary.
        if ($headline != "")
        {
            $query = $query->headline(
                'books.fulltext',
                ':headline',
                'headline');
            $binds['headline'] = $headline;
        }
        
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
                'headline'      => $book->getValue('headline'),
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
     * Splits a fulltext user-input query into distinct queries.
     *
     * This method provides with:
     * - a list of exact (quoted) query parts in Postgres format,
     * - a fulltext Postgres query string for all other parts,
     * - a headline fulltext Postgres query string for this query.
     *
     * @param string $query The user specified query, using - for NOT and double quotes for quoting.
     *
     * @return array The split fulltext query.
     */
    public static function splitFulltextQuery($query)
    {
        // Find the exact (quoted) values.
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
        
        // Determine the other values.
        $rest = 
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
        $result['rest'] = implode(' & ', $rest);
        
        // Create a headline query.
        $headline = $rest;
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
    
    /**
     * Adds a fulltext query to the given query.
     *
     * @param string  $name        The name of this fulltext query (for binding name).
     * @param mixed   $columns     The columns to search on.
     * @param string  $value       The user-supplied search string.
     * @param boolean $addheadline Whether to add this fulltext query to the headlines.
     * @param string  $altvector   A (indexed) vector for the given column, if available. Only valid for a single column.
     * @param Query   $query       The query to operate on.
     * @param array   $binds       The current array of bindings.
     * @param int     $c           The current binding counter.
     * @param string  $headline    The current headline query string.
     */
    public static function addFulltext($name, $columns, $value, $addheadline, $altvector, Query &$query, array &$binds, &$c, &$headline)
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
            if ($altvector === null)
            {
                $query = $query->whereFulltext($columns, ':' . $name . $c, $onlyNegative);
            }
            else
            {
                $query = $query->whereFulltext($altvector, ':' . $name . $c, $onlyNegative, true);
            }
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
                    $query = $query->where($columns . $e[$i]['like'] . ':' .$name . $c . 'z' . $i);
                }
                else
                {
                    $query = $query->whereOr($columns . $e[$i]['like'] . ':' . $name . $c . 'z' . $i,
                        $columns . ' IS NULL');
                }
                $binds[$name . $c . 'z' . $i] = $e[$i]['value'];
            }
        }
        
        // Process headlines.
        if ($addheadline)
        {
            $headline = ($headline != '' ? ' & ' : '') . $split['headline'];
        }
    }
}
