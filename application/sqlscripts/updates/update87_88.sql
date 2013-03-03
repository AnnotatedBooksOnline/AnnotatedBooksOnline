SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

UPDATE "Settings" SET "settingValue" = 'Iconography' WHERE "settingName" = 'project-title';
UPDATE "Settings" SET "settingValue" = '' WHERE "settingName" = 'welcome-page';
UPDATE "Settings" SET "settingValue" = '' WHERE "settingName" = 'info-page';
UPDATE "Settings" SET "settingValue" = '' WHERE "settingName" = 'terms-of-use';
UPDATE "Settings" SET "settingValue" =  'Dear Mr./Ms. [LASTNAME],

Unfortunately an error occured while trying to process the binding you uploaded. Therefore it can not yet be viewed.

Please contact the [PROJECTNAME] adminstrator at [CONTACT] for more information.

Regards,
The [PROJECTNAME] Team' WHERE "settingName" = 'upload-fail-mail';
UPDATE "Settings" SET "settingValue" = 'Dear Mr./Ms. [LASTNAME],

The binding you uploaded has been succesfully processed. Once you have completed the upload process, it should become available on [PROJECTNAME].

Once available, the binding can be found through through the Search function, or through the following URL:

[LINK]

Regards,
The [PROJECTNAME] Team' WHERE "settingName" = 'upload-ok-mail';



COMMIT;

