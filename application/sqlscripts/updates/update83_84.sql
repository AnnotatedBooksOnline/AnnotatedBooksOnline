SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

-- Correct the upload confirmation mail.
UPDATE "Settings" SET "settingValue" = 
'Dear Mr./Ms. [LASTNAME],

The binding you uploaded has been succesfully processed. Once you have completed the upload process, it should become available on Annotated Books Online.

Once available, the binding can be found through through ABO''s Search function, or through the following URL:

[LINK]

Regards,
The Annotated Books Online Team' WHERE "settingName" = 'upload-ok-mail';

COMMIT;