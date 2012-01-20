BEGIN TRANSACTION;

-- Add the project title (Annotated Books Online) to the settings table.
INSERT INTO "Settings" ("settingName", "settingValue") VALUES ('project-title', 'Annotated Books Online');

-- Add the mail-from-address setting.
INSERT INTO "Settings" ("settingName", "settingValue") VALUES ('mail-from-address', 'no-reply@sp.urandom.nl');

-- Change the project title used in e-mails.
INSERT INTO "Settings" ("settingName", "settingValue") VALUES ('activation-mail-message','Dear Mr./Ms. [LASTNAME],

Your registration for [PROJECTNAME] has been accepted. Your username is [USERNAME].

Please click on the link below to activate your account:

[LINK]

If clicking this link does not work, try to copy and paste it into the address bar of your browser.


Regards,
The [PROJECTNAME] Team');

INSERT INTO "Settings" ("settingName", "settingValue") VALUES ('forgotpass-mail-message','Dear Mr./Ms. [LASTNAME],

This e-mail has been send to you because you indicated you had forgotten your password for [PROJECTNAME]. If this is not the case, please ignore this message.


Your username is: [USERNAME]

Please click the following link (which will stop working after succesfully using it) to change your password:

[LINK]

If clicking this link does not work, try to copy and paste it into the address bar of your browser.


Regards,
The [PROJECTNAME] Team');

INSERT INTO "Settings" ("settingName", "settingValue") VALUES ('user-declined-mail-message', 'Dear Mr./Ms. [LASTNAME],

Unfortunately your registration for [PROJECTNAME] has been declined. For more information, please contact the webmaster.

Regards,
The [PROJECTNAME] Team');

-- The mail-from-name setting is now redundant because the project name can be used here.
DELETE FROM "Settings" WHERE "settingName" = 'mail-from-name';

COMMIT;
