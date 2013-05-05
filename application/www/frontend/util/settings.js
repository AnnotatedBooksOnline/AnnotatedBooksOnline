/*
 * Convenience functions for accessing 'public' settings. 
 */

"use strict";

/**
 * Obtains the value of a public setting that was cached earlier, without doing a request.
 * The result could be not up-to-date, but in many cases that is not a neccessity.
 * 
 * @param string The name of the setting.
 * 
 * @return string The value of the setting; or <code>null</code> when there is either no setting with this 
 *                 name, or it may not be read by the client. 
 */  
function getCachedSetting(settingName)
{
    if(settingName in _cachedSettings)
    {
        return _cachedSettings[settingName]; 
    }
    else
    {
        return null;
    }
}

/**
 * Parses a comma-separated list and converts the result to an array.
 * 
 * See also the back-end function Annotation::fromCommaList.
 * 
 * @return array The information in the comma-separated list, as an array. 
 */
function fromCommaList(commaList)
{
    var result = [];
    var last = '';
    for(var i = 0; i < commaList.length; ++i)
    {
        var c = commaList.charAt(i);
        if(c == ',')
        {
            // Add last element to resulting array.
            result.push(last);
            last = '';
        }
        else if(c == "\\")
        {
            // Escaped character.
            ++i;
            last += commaList.charAt(i);
        }
        else
        {
            // Other characters.
            last += c;
        }
    }
    
    // Add final element.
    result.push(last);
    
    return result;
}

/**
 * Fetches the cached setting 'annotationInfoCategories' and converts the result to an array.
 * 
 * @return array The category names of annotation info, as an array. 
 */
function getAnnotationInfoCategories()
{    
    // Get the setting as a 'comma-list'.
    var commaList = getCachedSetting('annotationInfoCategories');
    
    var result = fromCommaList(commaList);
    
    // Return resulting array.
    return result;
}

/**
 * Fetches the cached setting 'annotationInfoOrder' and converts the result to an array.
 * If no such setting exists, it returns a simple sequence [0, ...] matching the
 * length of annotationInfoCategories.
 * 
 * @return array The category ordering of annotation info, as an array. 
 */
function getAnnotationInfoOrder()
{    
    // Get the setting as a 'comma-list'.
    var commaList = getCachedSetting('annotationInfoOrder');
    
    if (!commaList)
    {
        return getDefaultAnnotationInfoOrder();
    }
    
    var result = fromCommaList(commaList);
    
    // Return resulting array.
    return result;
}

/**
 * Gets a default annotation info ordering, the simple sequence [0, ...] matching the
 * length of annotationInfoCategories.
 */
function getDefaultAnnotationInfoOrder()
{
    var categories = getAnnotationInfoCategories();
    var result = [];
    for (var i = 0; i < categories.length; i++)
    {
        result.push(i);
    }
    
    return result;
}

/**
 * Reorders an array based on the indices given by annotationInfoOrder.
 */
function reorderByAnnotationInfoOrder(arr)
{
    var result = [];
    var order = getAnnotationInfoOrder();
    for (var i = 0; i < order.length; i++)
    {
        var ix = parseInt(order[i]);
        if (!isNaN(ix))
        {
            result[ix] = arr[i];
        }
    }
    return result;
}

