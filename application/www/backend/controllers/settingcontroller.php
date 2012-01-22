<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'models/setting/setting.php';

/**
 * Settings controller. Can be used to view the values of publicly visible settings.
 */
class SettingController extends ControllerBase
{
    /**
     * Gets the value of a setting with the specified name. Only visible settings can be viewed
     * by this.
     * 
     * @param $data Should contain a string 'setting', containing the name of the setting.
     */
    public function actionGetSetting($data)
    {
        $setting = self::getString($data, 'setting');
        
        return Setting::getSetting($setting, null, true);
    }
}