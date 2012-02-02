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

