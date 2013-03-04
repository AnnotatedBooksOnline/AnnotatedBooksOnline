SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

DROP TRIGGER "AnnotationsFulltextInsert";
DROP TRIGGER "AnnotationsFulltextUpdate";
DROP TRIGGER "AnnotationsFulltextDelete";
DROP TRIGGER "BindingsFulltextUpdate";
DROP TRIGGER "BooksFulltextInsert";
DROP TRIGGER "BooksFulltextUpdate";
DROP TRIGGER "BooksFulltextDelete";

DROP TABLE "BooksFT";
DROP TABLE "AnnotationsFT";

ALTER TABLE "Annotations" DROP COLUMN "transcriptionEng";
ALTER TABLE "Annotations" DROP COLUMN "transcriptionOrig";

UPDATE "Settings" SET "settingValue" = 'Description,Interpretation,References,_Color' WHERE "settingName" = 'annotationInfoCategories';
INSERT INTO "Settings" ("settingName", "settingValue", "visible") VALUES ('default-binding', '1', 1);
UPDATE "Permissions" SET "minRank" = 50 WHERE "actionName" = 'upload-bindings';
UPDATE "Permissions" SET "minRank" = 50 WHERE "actionName" = 'change-book-info';
UPDATE "Permissions" SET "minRank" = 60 WHERE "actionName" = 'manage-notebook';

COMMIT;

