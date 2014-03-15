BEGIN TRANSACTION;

-- Insert settings used for password restoration mails.

INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('forgotpass-mail-subject', 'Restoration of your password');
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('forgotpass-mail-message', 'Dear Mr./Ms. [LASTNAME],

This e-mail has been send to you because you indicated you had forgotten your Collaboratory password. If this is not the case, please ignore this message.


Your username is: [USERNAME]

Please click the following link (which will stop working after succesfully using it) to change your password:

[LINK]

If clicking this link does not work, try to copy and paste it into the address bar of your browser.


Regards,
The Collaboratory Team');

COMMIT;
