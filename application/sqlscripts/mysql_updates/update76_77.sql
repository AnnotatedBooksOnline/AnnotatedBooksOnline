START TRANSACTION;

-- Adds the info-button and show-welcome-page settings. Both can be either '1' or '0'.

-- If show-welcome-page is zero, no Welcome tab will be opened and the ABO application starts right with Search.
INSERT INTO `Settings` (`settingName`, `settingValue`) VALUES ('show-welcome-page', '0');

-- The setting info-button specifies whether the Info button should be shown in the application.
INSERT INTO `Settings` (`settingName`, `settingValue`) VALUES ('info-button', '0');

COMMIT;
