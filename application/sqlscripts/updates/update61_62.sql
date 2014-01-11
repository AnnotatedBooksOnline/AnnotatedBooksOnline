BEGIN TRANSACTION;

-- Change edit profile.
UPDATE "##PREFIX##HelpParagraphs" SET "helpPageId" = (SELECT "helpPageId" FROM "##PREFIX##HelpPages" WHERE "pageName" = 'Welcome') WHERE "title" = 'Edit profile';
DELETE FROM "##PREFIX##HelpPages" WHERE "pageName" = 'Edit profile';

COMMIT;
