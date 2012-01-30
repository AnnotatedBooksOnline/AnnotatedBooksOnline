<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'models/note/note.php';
require_once 'util/authentication.php';

/**
 * Note controller class.
 */
class NoteController extends Controller
{
    /**
     * Loads a note.
     */
    public function actionLoad($data)
    {
        //Authentication::assertLoggedOn();
        Authentication::assertPermissionTo('manage-notebook');
        
        // Retrieve the user id of the user.
        $userId = self::getInteger($data, 'id', 0);
        
        // Create note.
        $note = new Note();
        $note->setUserId($userId);
        
        // Try to load entity.
        try
        {
            $note->load();
        }
        catch (EntityException $e)
        {
            // Create note.
            $note->save();
        }
        
        return array('records' => $note->getValues(), 'total' => 1);
    }
    
    /**
     * Saves a note.
     */
    public function actionSave($data)
    {       
        // Check permissions.
        Authentication::assertPermissionTo('manage-notebook');
        
        // Retrieve user id and text.
        $record = self::getArray($data, 'record');
        
        $userId = self::getInteger($record, 'userId', 0);
        $text   = self::getString($record, 'text', '', true);
        
        $values = array( 
            'userId' => $userId,
            'text'   => $text
        );

        $note = new Note();
        $note->setValues($values);
        $note->save();
        
        return array('records' => $note->getValues(), 'total' => 1);
    }
}
