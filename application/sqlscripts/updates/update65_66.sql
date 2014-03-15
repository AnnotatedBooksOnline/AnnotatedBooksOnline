BEGIN TRANSACTION;

-- Enfore uniqueness of the combination of title and parent in helpparagraph.
ALTER TABLE "##PREFIX##HelpParagraphs" ADD UNIQUE ("helpPageId", "paragraphParentId", "title");

COMMIT;