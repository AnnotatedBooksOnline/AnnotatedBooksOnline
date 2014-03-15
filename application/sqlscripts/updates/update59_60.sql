BEGIN TRANSACTION;

-- Add helpParagraphParentId, as my other update script needed another transaction to let it work.

UPDATE "##PREFIX##HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Basic viewer functionalities') WHERE "title" = 'Zoom in';
UPDATE "##PREFIX##HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Basic viewer functionalities') WHERE "title" = 'Zoom out';
UPDATE "##PREFIX##HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Basic viewer functionalities') WHERE "title" = 'Move across page';
UPDATE "##PREFIX##HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Basic viewer functionalities') WHERE "title" = 'Rotate';
UPDATE "##PREFIX##HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Basic viewer functionalities') WHERE "title" = 'Reset the view';


UPDATE "##PREFIX##HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Go to another page') WHERE "title" = 'Previous page';
UPDATE "##PREFIX##HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Go to another page') WHERE "title" = 'Next page';
UPDATE "##PREFIX##HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Go to another page') WHERE "title" = 'First page';
UPDATE "##PREFIX##HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Go to another page') WHERE "title" = 'Start of a book';
UPDATE "##PREFIX##HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Go to another page') WHERE "title" = 'Last page';
UPDATE "##PREFIX##HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Go to another page') WHERE "title" = 'Certain page number';
UPDATE "##PREFIX##HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Go to another page') WHERE "title" = 'Select a page';

COMMIT;
