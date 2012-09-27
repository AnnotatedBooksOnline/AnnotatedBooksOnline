SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

BEGIN;

delimiter $$

DROP FUNCTION headline;
DROP FUNCTION splitspaces;

DROP FUNCTION authornames;
DROP FUNCTION bindinglanguagenames;
DROP FUNCTION booklanguagenames;
DROP FUNCTION provenancenames;
DROP FUNCTION annotationtext;
DROP FUNCTION booktext;
DROP FUNCTION bookannotationtext;

CREATE FUNCTION authornames(bookidparam integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT GROUP_CONCAT("Persons"."name" SEPARATOR ', ') INTO result FROM "Persons"
        WHERE "Persons"."personId" IN
        (
            SELECT "Authors"."personId" FROM "Authors" WHERE "Authors"."bookId" = bookidparam
        );
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION bindinglanguagenames(bindingidparam integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT GROUP_CONCAT("Languages"."languageName" SEPARATOR ', ') INTO result FROM "Languages"
        WHERE "Languages"."languageId" IN
        (
            SELECT "BindingLanguages"."languageId" FROM "BindingLanguages" WHERE "BindingLanguages"."bindingId" = bindingidparam
        );
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION booklanguagenames(bookidparam integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT GROUP_CONCAT("Languages"."languageName" SEPARATOR ', ') INTO result FROM "Languages"
        WHERE "Languages"."languageId" IN
        (
            SELECT "BookLanguages"."languageId" FROM "BookLanguages" WHERE "BookLanguages"."bookId" = bookidparam
        );
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION provenancenames(bindingidparam integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT GROUP_CONCAT("Persons"."name" SEPARATOR ', ') INTO result FROM "Persons"
        WHERE "Persons"."personId" IN
        (
            SELECT "Provenances"."personId" FROM "Provenances" WHERE "Provenances"."bindingId" = bindingidparam
        );
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION annotationtext(annotationidparam integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT CONCAT("transcriptionEng", ' ', "transcriptionOrig") INTO result FROM "Annotations"
        WHERE "Annotations"."annotationId" = annotationidparam;
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION booktext(bookidparam integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT CONCAT_WS(' ',
            "title",
            authorNames("bookId"),
            "publisher",
            "placePublished",
            bookLanguageNames("bookId"),
            provenanceNames("bindingId"),
            (SELECT "libraryName" FROM "Libraries" WHERE "libraryId" IN (SELECT "libraryId" FROM "Bindings" WHERE "Books"."bindingId" = "Bindings"."bindingId")),
            (SELECT "signature" FROM "Bindings" WHERE "Books"."bindingId" = "Bindings"."bindingId"),
            bindingLanguageNames("bindingId"),
            bookAnnotationText("bookId")
        ) INTO result FROM "Books"
        WHERE "bookId" = bookidparam;
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION bookannotationtext(bookidparam integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT GROUP_CONCAT(annft.text SEPARATOR ' ') INTO result
        FROM "Books" JOIN (SELECT * FROM "Scans" ORDER BY page ASC) scans
            ON "Books"."bindingId" = scans."bindingId"
            AND "page" >= "firstPage"
            AND "page" <= "lastPage"
        LEFT JOIN "Annotations" annotations
            ON annotations."scanId" = scans."scanId"
        LEFT JOIN "AnnotationsFT" annft
            ON annft."annotationId" = annotations."annotationId"
        WHERE "bookId" = bookidparam;
        RETURN result;
    END $$

DELIMITER ;

UPDATE "Books" SET "bookId" = "bookId";

COMMIT;
