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