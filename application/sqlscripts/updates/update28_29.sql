BEGIN TRANSACTION;

-- Add a "delete user" action to Permissions.
INSERT INTO "##PREFIX##Permissions" ("actionName", "minRank") VALUES ('delete-users', 50);

-- Insert some temporary values for all the settings currently specified on the wiki.
TRUNCATE TABLE "##PREFIX##Settings";

INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('activation-mail-subject', 'Activation of your account');
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('activation-mail-message', 'Dear Mr./Ms. [LASTNAME],

Your registration for the Collaboratory for the History of Reading has been accepted. Your username is [USERNAME].

Please click on the link below to activate your account:

[LINK]

If clicking this link does not work, try to copy and paste it into the address bar of your browser.


Regards,
The Collaboratory Team');

INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('welcome-page', 'TODO');
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('info-page', 'TODO');
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('terms-of-use', 'TODO');
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('auto-user-acceptance', '1');
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('user-declined-mail-subject', 'Account activation has been declined');
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('user-declined-mail-message', 'Dear Mr./Ms. [LASTNAME],

Unfortunately your registration for the Collaboratory for the History of Reading has been declined. For more information, please contact the webmaster.

Regards,
The Collaboratory Team');


COMMIT;
