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
        Authentication::assertLoggedOn();
        $userId = self::getInteger($data, 'id', 0);
            
            $notes=new Note($userId);
            return array('records' => $notes->getValues(), 'total' => 1);
    }
    
    public function actionSave($data)
    {
        //Check whether logged on.
        Authentication::assertLoggedOn();
        //Authentication::assertPermissionTo('manage-notebook');
        
        //Retrieve userId and text
        $record = self::getArray($data, 'record');
        
        $userId      = self::getInteger($record, 'userId', 0);
        $text        = self::getString($record, 'text', '', true);
        
        $values = array( 
        'userId'        => $userId,
        'text'         => $text,
        );

        $note = new Note();
        $note->setValues($values);
        $note->save();
    }
}
