<?php
 
//[[GPL]]
 
//The code with the headers temporary solution will be 
//replaced when having multiple notes is supported. 
 
require_once 'framework/controller/controller.php';
require_once 'models/notes/note.php';
require_once 'util/authentication.php';
/**
 * Profile controller class.
 */
class NoteController extends Controller
{
    protected function __construct()
    {
        ;
    }
 
    public function actionLoad($data)
    {
        // Retrieve the user id of the user.
        $userId = Authentication::getInstance()->getUserId();
        // Retrieve the notes from the database
        $text = Query::select('notes.text')
            ->from('Notes notes')
            ->where('notes.userId = :userId')
            ->execute(array(':userId' => $userId));  
            
        //Check if the notes exist. If they don't do nothing,
        //otherwise return them. (Temporary solution)
        if ($text->getAmount() != 1)
        {
            return '';
        }
        else
        {
            $text = $text->getFirstRow()->getValue('text');
            return $text; 
        }
    }
    
    public function actionSave($data)
    {
        //Check whether logged on.
        Authentication::assertLoggedOn();
        
        //Retrieve userId and text
        $userId  = Authentication::getInstance()->getUserId();
        $text   = self::getString($data, 'token', '', false, -1);
        
        
        $values = array( 
        'userId'        => $userId,
        'text'         => $text,
        );
        
        //Retrieve current notes in order to see whether these 
        //should be overwritten or not. (Temporary solution)
        $notes = Query::select('notes.text')
            ->from('Notes notes')
            ->where('userId = :userId')
            ->execute(array(':userId' => $userId));
        
        $note = new Note();
        $note->setValues($values);
        
        //Check if there already exists a note with that userId. 
        //If there is overwrite it, otherwise create a new one. (Temporary solution)
        if ($notes->getAmount() != 1)
        {
             $q=Query::insert('Notes', array('userId'    => ':userId', 
                                            'text'   => ':text'))->execute(array(':userId' => $userId, ':text' => $text));
        }
        else
        {
            $note->save();
        }
    }
}
