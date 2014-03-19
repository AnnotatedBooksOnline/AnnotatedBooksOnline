SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

UPDATE "##PREFIX##Settings" SET "settingValue" = 'Medieval Manuscripts' WHERE "settingName" = 'project-title';
UPDATE "##PREFIX##Settings" SET "settingValue" = '' WHERE "settingName" = 'welcome-page';
UPDATE "##PREFIX##Settings" SET "settingValue" = '' WHERE "settingName" = 'info-page';
UPDATE "##PREFIX##Settings" SET "settingValue" = '' WHERE "settingName" = 'terms-of-use';
UPDATE "##PREFIX##Settings" SET "settingValue" =  'Dear Mr./Ms. [LASTNAME],

Unfortunately an error occured while trying to process the binding you uploaded. Therefore it can not yet be viewed.

Please contact the [PROJECTNAME] adminstrator at [CONTACT] for more information.

Regards,
The [PROJECTNAME] Team' WHERE "settingName" = 'upload-fail-mail';
UPDATE "##PREFIX##Settings" SET "settingValue" = 'Dear Mr./Ms. [LASTNAME],

The binding you uploaded has been succesfully processed. Once you have completed the upload process, it should become available on [PROJECTNAME].

Once available, the binding can be found through through the Search function, or through the following URL:

[LINK]

Regards,
The [PROJECTNAME] Team' WHERE "settingName" = 'upload-ok-mail';

UPDATE "##PREFIX##Settings" SET "settingValue" = 'B.Massop@uu.nl' WHERE "settingName" = 'contact-mail-address';
UPDATE "##PREFIX##Settings" SET "settingValue" = 'noreply@ant.library.uu.nl' WHERE "settingName" = 'mail-from-address';

COMMIT;

