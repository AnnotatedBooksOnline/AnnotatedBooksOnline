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
        // Return example data.
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
        );
    }
}
