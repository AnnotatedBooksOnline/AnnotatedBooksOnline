<?php
/*
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * Copyright: Mathijs Baaijens, Iris Bekker, Renze Droog,
 * Maarten van Duren, Jeroen Hanselman, Bert Massop, Robin van der Ploeg,
 * Tom Tervoort, Gerben van Veenendaal, Tom Wennink.
 */

require_once('framework/util/exceptionbase.php');
require_once('framework/util/configuration.php');
require_once('framework/util/log.php');

// Exceptions.
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
        // Check for a non-SSL connection.
        if (empty($_SERVER['HTTPS']))
        {
            // Check if we want to force an SSL connection.
            try
            {
                $forceSsl = Configuration::getInstance()->getBoolean('force-ssl', false);
            }
            catch (Exception $e)
            {
                $forceSsl = false;
            }
            
            // Ensure the content is accessed securely.
            if ($forceSsl)
            {
                header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
                exit;
            }
        }
        
        // Check whether we want to use the post method.
        $postMethod = ($_SERVER['REQUEST_METHOD'] == 'POST') && empty($_FILES);
        $format = self::getString($_GET, 'format', '');
        
        // Set the appropriate content type for a JSON response.
        if ($postMethod || $format === "json")
        {
            header('Content-Type: application/json');
        }
        
        // Check for multiple requests.
        $multiRequest = $postMethod && self::getBoolean($_GET, 'multiple');
        if ($multiRequest)
        {
            // Get the request JSON data or request parameters.
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Handle requests.
            $requests = is_array($input) ? $input : array($input);
            $results  = array();
            foreach ($requests as $request)
            {
                // Get action and controller names.
                $controllerName = self::getString($request, 'controller', 'Main');
                $actionName     = self::getString($request, 'action', 'index');
                
                // Get the request data.
                $input = isset($request['data']) ? $request['data'] : null;
                
                // Handle request.
                $success = self::handleSingleRequest($controllerName, $actionName, $input, $output);
                
                // Add result.
                $results[] = array('success' => $success, 'data' => $output);
            }
            
            // Show results as JSON.
            echo json_encode($results);
        }
        else
        {
            // Get action and controller names.
            $controllerName = self::getString($_GET, 'controller', 'Main');
            $actionName     = self::getString($_GET, 'action', 'index');
            
            // Get the request JSON data or request parameters.
            $input = $postMethod ? json_decode(file_get_contents('php://input'), true) : $_GET;
            
            // Handle request.
            $success = self::handleSingleRequest($controllerName, $actionName, $input, $output);
            
            // Give back an error code if no success.
            if (!$success)
            {
                header('HTTP/1.0 500 Internal Server Error');
            }
            
            // Handle output.
            if ($postMethod || $format === 'json')
            {
                // Show output as JSON.
                echo json_encode($output);
            }
            else if ($success)
            {
                if ($format === "plain" || !is_string($output))
                {
                    header('Content-Type: text/plain');
                }
                
                // Just show output.
                if (is_string($output))
                {
                    echo $output;
                }
                else if ($output !== null)
                {
                    var_dump($output);
                }
            }
            else
            {
                // Show exception as HTML.
                echo '<h1>' . htmlspecialchars($output['message']) . '</h1>';
                echo '<b>Code:</b> ' . htmlspecialchars($output['code']) . '<br />';
                echo '<b>Timestamp:</b> ' . htmlspecialchars($output['timestamp']) . '<br />';
                
                if (isset($exception['trace']))
                {
                    echo '<b>Stack trace:</b><br />' . htmlspecialchars($exception['trace']);
                }
            }
        }
    }
    
    // Handles a single request.
    private static function handleSingleRequest($controllerName, $actionName, &$input, &$output)
    {
        try
        {
            // Determine the name of the controller and try to create an instance of the controller.
            $controllerName = preg_replace('/[^\w]+/', '', $controllerName);
            $controller = self::createInstance($controllerName);
            
            // Determine the name of action to call and the corresponding method in the controller.
            $actionName = preg_replace('/[^\w]+/', '', $actionName);
            $methodName = 'action' . ucfirst($actionName);
            
            // Determine if the action method exists in the controller.
            if (method_exists($controller, $methodName))
            {
                // Log a messsage.
                Log::trace("Handling action '%s' of controller '%s'.", $actionName, $controllerName);
                
                // Calculate start time.
                $start = microtime(true);
                
                // Call the action handler method.
                $output = $controller->{$methodName}($input);
                
                // Calculate end time.
                $end = microtime(true);
                
                // Log a messsage.
                Log::trace("Action '%s' of controller '%s' took %dms.",
                    $actionName, $controllerName, round(1000 * ($end - $start)));
            }
            else
            {
                throw new ControllerException('controller-action-not-found', $controllerName, $actionName);
            }
        }
        catch (Exception $e)
        {
            // Handle exception.
            $output = self::handleException($e);
            
            return false;
        }
        
        return true;
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
        $lowerType = strtolower($type);
        
        if (file_exists('controllers/' . $lowerType . 'controller.php'))
        {
            require_once 'controllers/' . $lowerType . 'controller.php';
            
            $className = $type . 'Controller';
            return new $className;
        }
        else
        {
            throw new ControllerException('controller-not-found', $type);
        }
    }
    
    /**
     * Gets a text string from data.
     *
     * @param  $data       Data to fetch value from.
     * @param  $key        Key of the value.
     * @param  $default    Default value.
     * @param  $trim       Whether to trim spaces of value.
     * @param  $maxLength  Maximum length of value.
     *
     * @return  The sanitized string value.
     */
    public static function getString(&$data, $key,
        $default = '', $trim = true, $maxLength = -1)
    {
        $value = isset($data[$key]) ? (string) $data[$key] : $default;
        
        if ($trim)
        {
            $value = trim($value);
        }
        
        if ($maxLength >= 0)
        {
            $value = substr($value, 0, $maxLength);
        }
        
        return $value;
    }
    
    /**
     * Gets an integer from data.
     *
     * @param  $data      Data to fetch value from.
     * @param  $key       Key of the value.
     * @param  $default   Default value.
     * @param  $positive  Whether the value must be positive.
     * @param  $minValue  Minimum value.
     * @param  $maxValue  Maximum value.
     *
     * @return  The sanitized integer value.
     */
    public static function getInteger(&$data, $key,
        $default = 0, $positive = false, $minValue = null, $maxValue = null)
    {
        return (int) self::getDouble($data, $key, $default, $positive, $minValue, $maxValue);
    }
    
    /**
     * Gets a double from data.
     *
     * @param  $data      Data to fetch value from.
     * @param  $key       Key of the value.
     * @param  $default   Default value.
     * @param  $positive  Whether the value must be positive.
     * @param  $minValue  Minimum value.
     * @param  $maxValue  Maximum value.
     *
     * @return  The sanitized double value.
     */
    public static function getDouble(&$data, $key,
        $default = 0, $positive = false, $minValue = null, $maxValue = null)
    {
        $value = isset($data[$key]) ? (double) $data[$key] : $default;
        
        if ($minValue !== null)
        {
            $value = max($value, $minValue);
        }
        
        if ($maxValue !== null)
        {
            $value = min($value, $maxValue);
        }
        
        if ($positive && ($value < 0))
        {
            $value = 0;
        }
        
        return $value;
    }
    
    /**
     * Gets a boolean from data.
     *
     * @param  $data     Data to fetch value from.
     * @param  $key      Key of the value.
     * @param  $default  Default value.
     *
     * @return  The sanitized boolean value.
     */
    public static function getBoolean(&$data, $key, $default = false)
    {
        $value = isset($data[$key]) ? $data[$key] : $default;
        
        return (bool) $value;
    }
    
    /**
     * Gets a string from data.
     *
     * @param  $data       Data to fetch value from.
     * @param  $key        Key of the value.
     * @param  $default    Default value.
     * @param  $maxLength  Maximum length of the array.
     *
     * @return  The sanitized array value.
     */
    public static function getArray(&$data, $key, $default = array(), $maxLength = -1)
    {
        $value = isset($data[$key]) ? $data[$key] : null;
        if (!is_array($value))
        {
            $value = $default;
        }
        
        if ($maxLength >= 0)
        {
            $value = array_slice($value, 0, $maxLength);
        }
        
        return $value;
    }
    
    // Shows an exception.
    private static function handleException($e)
    {
        // Since a stack trace may contain plaintext passwords (which we don't want in our logs),
        // we censor function arguments from the stack trace.
        $traceArray = $e->getTrace();
        $stackTrace = '';
        $i = 0;
        foreach($traceArray as $element)
        {
            $fileName = isset($element['file']) ? $element['file'] : '?';
            $lineNum = isset($element['line']) ? $element['line'] : '?';
            $funcName = isset($element['function']) ? $element['function'] : '?';
            $args = isset($element['args']) ? $element['args'] : array();
            
            $stackTrace .= "#$i ";
            $stackTrace .= $fileName;
            $stackTrace .= "($lineNum) ";
            
            if(isset($element['class']))
            {
                $stackTrace .= $element['class'] . '::';
            }
            
            $stackTrace .= "$funcName(";
            
            // Do not include arguments of functions with 'password' or 'login' in the title, since
            // these contain plaintext passwords.
            if(preg_match('/.*(password|login).*/i', $funcName))
            { 
                $stackTrace .= '...';
            }
            else if(count($args) > 0)
            {
                // Print arguments.
                for($j = 0; $j < count($args); ++$j)
                {                    
                    $arg = $args[$j];
                    
                    if(is_string($arg))
                    {
                        // Put quotes around string arguments and add slashes within them.
                        $printedArg = "'" . addslashes($arg) . "'";
                    }
                    else if(is_object($arg))
                    {
                        // Print object type name.
                        $printedArg = get_class($arg);
                    }
                    else if(is_bool($arg))
                    {
                        // Print boolean as 'true'  or 'false'.
                        $printedArg = $arg ? 'true' : 'false';
                    }
                    else if($arg === null)
                    {
                        // Handle null's.
                        $printedArg = 'null';
                    }
                    else
                    {
                        // Use default stringifier for other types.
                        $printedArg = (string) $arg;
                    }
                    
                    if($j > 0)
                    {
                        $stackTrace .= ', ';
                    }
                    $stackTrace .= $printedArg;
                }
            }
            
            $stackTrace .= ")\n";
             
            ++$i;
        }
        
        // Get exception info.
        $message    = $e->getMessage();
        $timestamp  = ($e instanceof ExceptionBase) ? $e->getTimestamp() : gmdate('Y/m/d H:i:s', time());
        $code       = ($e instanceof ExceptionBase) ? $e->getIdentifier() : 'system-error';
        
        // Set result.
        $result = array('message' => $message, 'code' => $code, 'timestamp' => $timestamp);
        
        // Configuration may be the cause, so catch exceptions.
        try
        {
            // Set stacktrace if in debug mode.
            if (Configuration::getInstance()->getBoolean('debug-mode', false))
            {
                $result['trace'] = $stackTrace;
            }
        } catch (Exception $e) { }
        
        // Logging may be the cause, so catch exceptions.
        try
        {
            // Log the exception.
            Log::error("An exception occured: message: '%s', code: '%s', stack trace:\n%s",
                $message, $code, $stackTrace);
        } catch (Exception $e) { }
        
        return $result;
    }
}
