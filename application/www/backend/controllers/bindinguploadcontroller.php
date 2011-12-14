<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';
require_once 'models/upload/upload.php';
require_once 'models/book/book.php';
require_once 'models/book/booklist.php';
require_once 'models/book/binding.php';

/**
 * Binding upload controller class.
 */
class BindingUploadController extends Controller
{
    /**
     * Uploads a binding.
     */
    public function actionUpload($data)
    {
        // Assert that the user is authenticated. 
        Authentication::assertLoggedOn();
        
        // Create binding.
        $binding = new Binding();
        
        // TODO: Fill binding details.
        
        // Create the books.
        for ($i = 0; $i < 10; $i++)
        {
            // Create book.
            $book = new Book();
            
            // TODO: Fill the book details.
            
            $binding->getBookList()->addEntity($book);
        }
        
        // Save everything.
        $binding->save();
    }
}
