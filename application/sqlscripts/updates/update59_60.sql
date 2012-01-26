BEGIN TRANSACTION;

-- Add helpParagraphParentId, as my other update script needed another transaction to let it work.

UPDATE "HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE "title" = 'Basic viewer functionalities') WHERE "title" = 'Zoom in';
UPDATE "HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE "title" = 'Basic viewer functionalities') WHERE "title" = 'Zoom out';
UPDATE "HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE "title" = 'Basic viewer functionalities') WHERE "title" = 'Move across page';
UPDATE "HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE "title" = 'Basic viewer functionalities') WHERE "title" = 'Rotate';
UPDATE "HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE "title" = 'Basic viewer functionalities') WHERE "title" = 'Reset the view';


UPDATE "HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE "title" = 'Go to another page') WHERE "title" = 'Previous page';
UPDATE "HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE "title" = 'Go to another page') WHERE "title" = 'Next page';
UPDATE "HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE "title" = 'Go to another page') WHERE "title" = 'First page';
UPDATE "HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE "title" = 'Go to another page') WHERE "title" = 'Start of a book';
UPDATE "HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE "title" = 'Go to another page') WHERE "title" = 'Last page';
UPDATE "HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE "title" = 'Go to another page') WHERE "title" = 'Certain page number';
UPDATE "HelpParagraphs" SET "paragraphParentId" = (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE "title" = 'Go to another page') WHERE "title" = 'Select a page';

COMMIT;
