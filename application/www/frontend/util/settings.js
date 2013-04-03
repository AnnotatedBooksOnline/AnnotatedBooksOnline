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
 * Fetches the cached setting 'annotationInfoCategories' and converts the result to an array.
 * 
 * See also the back-end function Annotation::fromCommaList.
 * 
 * @return array The category names of annotation info, as an array. 
 */
function getAnnotationInfoCategories()
{    
    // Get the setting as a 'comma-list'.
    var commaList = getCachedSetting('annotationInfoCategories');
    
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
    
    // Return resulting array.
    return result;
}

