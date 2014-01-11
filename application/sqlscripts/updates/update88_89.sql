SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

DROP TRIGGER "##PREFIX##AnnotationsFulltextInsert";
DROP TRIGGER "##PREFIX##AnnotationsFulltextUpdate";
DROP TRIGGER "##PREFIX##AnnotationsFulltextDelete";
DROP TRIGGER "##PREFIX##BindingsFulltextUpdate";
DROP TRIGGER "##PREFIX##BooksFulltextInsert";
DROP TRIGGER "##PREFIX##BooksFulltextUpdate";
DROP TRIGGER "##PREFIX##BooksFulltextDelete";

DROP TABLE "##PREFIX##BooksFT";
DROP TABLE "##PREFIX##AnnotationsFT";

ALTER TABLE "##PREFIX##Annotations" DROP COLUMN "transcriptionEng";
ALTER TABLE "##PREFIX##Annotations" DROP COLUMN "transcriptionOrig";

UPDATE "##PREFIX##Settings" SET "settingValue" = 'Description,Interpretation,References,_Color' WHERE "settingName" = 'annotationInfoCategories';
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue", "visible") VALUES ('default-binding', '1', 1);
UPDATE "##PREFIX##Permissions" SET "minRank" = 50 WHERE "actionName" = 'upload-bindings';
UPDATE "##PREFIX##Permissions" SET "minRank" = 50 WHERE "actionName" = 'change-book-info';
UPDATE "##PREFIX##Permissions" SET "minRank" = 60 WHERE "actionName" = 'manage-notebook';

COMMIT;

