<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';

/**
 * Book controller class.
 */
class BookController extends Controller
{
    protected function __construct()
    {
        ;
    }
    
    public function actionSearch($data)
    {
        $query = Query::select(array('books.bookId', 'books.title', 'books.minYear', 'books.maxYear'))
            ->unsafeAggregate('array_accum', 'DISTINCT "personsList"."name"', 'authorNames')
            ->from('Books books')
            ->join('Authors authorsList', array('books.bookId = authorsList.bookId'), 'LEFT')
            ->join('Persons personsList', array('authorsList.authorId = personsList.personId'), 'LEFT')
            ->join('Authors authorsFind', array('books.bookId = authorsFind.bookId'), 'LEFT')
            ->join('Persons personsFind', array('authorsFind.authorId = personsFind.personId'), 'LEFT')
            ->groupBy('books.bookId', 'books.title', 'books.minYear', 'books.maxYear');
        $binds = array();
        $c = 0;
        foreach ($data as $selector)
        {
            if (isset($selector['type']) && isset($selector['value']))
            {
                $value = $selector['value'];
                switch ((string) $selector['type'])
                {
                    case 'year':
                        if (isset($value['from']) && isset($value['to']))
                        {
                            $query = $query->where('books.maxYear >= :from' . $c, 'books.minYear <= :to' . $c);
                            $binds[':from' . $c] = $value['from'];
                            $binds[':to' . $c] = $value['to'];
                        }
                        break;
                    case 'title':
                        $cc = 0;
                        foreach (explode(' ', $value) as $word)
                        {
                            $query = $query->where('books.title LIKE :word'. $c . '_' . $cc);
                            $binds[':word'. $c . '_' . $cc] = '%' . $word . '%';
                            $cc++;
                        }
                        break;
                    case 'author':
                        $cc = 0;
                        foreach (explode(' ', $value) as $word)
                        {
                            $query = $query->where('personsFind.name LIKE :author'. $c . '_' . $cc);
                            $binds[':author'. $c . '_' . $cc] = '%' . $word . '%';
                            $cc++;
                        }
                        break;
                    default:
                        break;
                }
                $c++;
            }
        }
        
        $result = $query->execute($binds);
        
        $records = array();
        foreach ($result as $book)
        {
            Log::debug('%s', print_r($book->getValues(), true));
            $authors = implode(', ', explode(',', trim($book->getValue('authorNames'), '{}')));
            if ($book->getValue('minYear') == $book->getValue('maxYear'))
            {
                $year = $book->getValue('minYear');
            }
            else
            {
                $year = $book->getValue('minYear') . ' - ' . $book->getValue('maxYear');
            }
            $records[] = array(
                $book->getValue('bookId'),
                $book->getValue('title'),
                $year,
                $authors
            );
        }
        
        return array(
                'columns' => array(
                array(
                    'name' => 'id',
                    'desc' => 'Identifier',
                    'show' => false
                ), array(
                    'name' => 'title',
                    'desc' => 'Title',
                    'show' => true
                ), array(
                    'name' => 'year',
                    'desc' => 'Year',
                    'show' => true
                ), array(
                    'name' => 'author',
                    'desc' => 'Author',
                    'show' => true
                )
            ),
            'records' => $records
        );
                
        
        /*
        return array(
            'columns' => array(
                array(
                    'name' => 'id',
                    'desc' => 'Identifier',
                    'show' => false
                ), array(
                    'name' => 'title',
                    'desc' => 'Title',
                    'show' => true
                ), array(
                    'name' => 'author',
                    'desc' => 'Author',
                    'show' => true
                ), array(
                    'name' => 'year',
                    'desc' => 'Year of publication',
                    'show' => true
                ), array(
                    'name' => 'thumbnail',
                    'desc' => 'Thumbnail',
                    'show' => false
                )
            ),
            'records' => array(
                array(
                    123,
                    'Gabriel Harvey: his life, marginalia, and library',
                    'Virginia F. Stern',
                    1979,
                    'http://bks4.books.google.nl/books?id=v8ghAAAAMAAJ&printsec=frontcover&img=1&zoom=1'
                ), array(
                    897,
                    'Tax for the year 1811',
                    'Commonwealth of Massachusetts',
                    1811,
                    'http://books.google.nl/googlebooks/images/no_cover_thumb.gif'
                ), array(
                    24,
                    'Ancient critical essays upon English poets and poësy',
                    'Gabriel Harvey et al.',
                    1811,
                    'http://bks4.books.google.nl/books?id=yDIJAAAAQAAJ&printsec=frontcover&img=1&zoom=1'
                )
            )
        );*/
    }
}
