<?php

/**
 * Controller class.
 */
abstract class Controller
{
    /**
     * Handles a request.
     */
    public static function handleRequest()
    {
        //NOTE: try: http://localhost/backend/?controller=login&action=login
        //NOTE: note that JSON data goes via POST !
        
        try
        {
            
            //TODO: handle multiple requests:
            //TODO: controller=multirequest, data=[{controller: '..', action: '..', data: [..]}, ..]
            
            //TODO: handle file uploads, with: output=json/html + custom ExtJS form action?
            
            
            //create controller instance
            $controllerName = isset($_GET['controller']) ? $_GET['controller'] : '';
            $controller = self::createInstance($controllerName);
            
            //get action method to call
            $actionName = isset($_GET['action']) ? $_GET['action'] : '';
            
            //check for method
            $methodName = 'action' . ucfirst($actionName);
            if (method_exists($controller, $methodName))
            {
                //get JSON data
                $input = isset($_POST['data']) ? json_decode($_POST['data']) : '';
                
                //call method
                $output = $controller->{$methodName}($input);
                
                //set appropriate content type
                header('Content-Type: application/json');
                
                //output JSON
                echo json_encode($output);
            }
            else
            {
                throw new Exception('Controller \'' . $controllerName .
                    '\' has no action \'' . $actionName . '\'.');
            }
        }
        catch (Exception $e)
        {
            exit(htmlspecialchars($e->getMessage()));
        }
    }
    
    /**
     * Creates a controller instance.
     *
     * @param  $type  Type name of the controller instance.
     *
     * @return  An instance of the controller of the given type.
     */
    public static function createInstance($type)
    {
        $type = strtolower($type);
        
        if (file_exists('controllers/' . $type . 'controller.php'))
        {
            require_once 'controllers/' . $type . 'controller.php';
            
            $className = ucfirst($type) . 'Controller';
            return new $className;
        }
        else
        {
            throw new Exception('Controller \'' . $type . '\' not found.');
        }
    }
}
