<?php
//[[GPL]]

require 'framework/helpers/exceptionbase.php';
require 'framework/helpers/configuration.php';
//require 'framework/helpers/translator.php';
require 'framework/helpers/log.php';

// Exceptions
class ControllerException extends ExceptionBase { }

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
        //NOTE: try: http://localhost/backend/?controller=Authentication&action=login
        //NOTE: note that JSON data goes via POST !
        
        try
        {
            //TODO: (GVV) handle multiple requests:
            //TODO: (GVV) controller=multirequest, data=[{controller: '..', action: '..', data: [..]}, ..]
            //TODO: (GVV) handle file uploads, with: output=json/html + custom ExtJS form action?
            
            // Determine the name of the controller and try to create an instance of the controller class.
            $controllerName = isset($_GET['controller']) ? $_GET['controller'] : '';
            $controller = self::createInstance($controllerName);
            
            // Determine the name of action to call and the corresponding method in the controller.
            $actionName = isset($_GET['action']) ? $_GET['action'] : '';
            $methodName = 'action' . ucfirst($actionName);
            
            // Determine if the action method exists in the controller.
            if (method_exists($controller, $methodName))
            {
                // Get the request JSON data.
                $input = json_decode(file_get_contents('php://input'), true);
                
                // Log a messsage.
                Log::info("Handling action action '%s' of controller '%s'.", $actionName, $controllerName);
                
                // Call the action handler method.
                $output = $controller->{$methodName}($input);
        
                // Set the appropriate content type for a JSON response.
                header('Content-Type: application/json');
                
                // Return the result as a JSON object.
                echo json_encode($output);
            }
            else
            {
                throw new ControllerException('controller-action-not-found', $controllerName, $actionName);
            }
        }
        catch (Exception $e)
        {
            // Set the appropriate content type for a JSON response.
            header('Content-Type: application/json');
            
            // Handle exception and output result array as JSON.
            echo json_encode(self::handleException($e));
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
            
            $className = $type . 'Controller';
            return new $className;
        }
        else
        {
            throw new ControllerException('controller-not-found', $type);
        }
    }
    
    // Shows an exception.
    private static function handleException($e)
    {
        // Get exception info.
        $stackTrace = $e->getTraceAsString();
        $message    = $e->getMessage();
        $code       = ($e instanceof ExceptionBase) ? $e->getIdentifier() : 'error';
        
        // Set result.
        $result = array('message' => $message, 'code' => $code);
        
        // Set stacktrace if in debug mode.
        if (Configuration::getInstance()->getBoolean('debug-mode', false))
        {
            $result['trace'] = $stackTrace;
        }
        
        // Log the exception.
        Log::error("An exception occured: message: '%s', code: '%s', stack trace:\n%s",
            $message, $code, $stackTrace);
        
        // Set error code.
        header('HTTP/1.0 500 Internal Server Error');
        
        return $result;
    }
}
