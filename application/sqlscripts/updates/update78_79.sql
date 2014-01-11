SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

-- The e-mail address that can be used to reach the ABO webmaster.
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('contact-mail-address', 'webmaster@abo.dummy-address');

-- Subject and body of the e-mail informing a user his or her upload has been successfully processed.
-- The same tags can be used as in activation-mail-message, although [LINK] will now be replaced with a link to the binding.
-- May also contain [CONTACT], which will be replaced with contact-mail-address (see above).
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('upload-ok-mail-subject', 'Your uploaded binding has been processed');
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('upload-ok-mail',
'Dear Mr./Ms. [LASTNAME],

The binding you uploaded has been succesfully processed and should now be searchable on Annotated Books Online.

It can also be found through the following link:

[LINK]

Regards,
The Annotated Books Online Team');


-- E-mail contents for when the upload has failed.
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('upload-fail-mail-subject', 'An error occured while processing your upload.');
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('upload-fail-mail',
'Dear Mr./Ms. [LASTNAME],

Unfortunately an error occured while trying to process the binding you uploaded. Therefore it can not yet be viewed.

Please contact the ABO adminstrator at [CONTACT] for more information.

Regards,
The Annotated Books Online Team');


COMMIT;
