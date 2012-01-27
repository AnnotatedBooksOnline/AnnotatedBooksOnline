BEGIN TRANSACTION;

-- Change edit profile.
UPDATE "HelpParagraphs" SET "helpPageId" = (SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Welcome') WHERE "title" = 'Edit profile';
DELETE FROM "HelpPages" WHERE "pageName" = 'Edit profile';

COMMIT;
