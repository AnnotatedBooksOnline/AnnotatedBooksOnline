SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

BEGIN;

delimiter $$

DROP FUNCTION ##PREFIX##headline;
DROP FUNCTION ##PREFIX##splitspaces;

DROP FUNCTION ##PREFIX##authornames;
DROP FUNCTION ##PREFIX##bindinglanguagenames;
DROP FUNCTION ##PREFIX##booklanguagenames;
DROP FUNCTION ##PREFIX##provenancenames;
DROP FUNCTION ##PREFIX##annotationtext;
DROP FUNCTION ##PREFIX##booktext;
DROP FUNCTION ##PREFIX##bookannotationtext;

CREATE FUNCTION ##PREFIX##authornames(bookidparam integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT GROUP_CONCAT("##PREFIX##Persons"."name" SEPARATOR ', ') INTO result FROM "##PREFIX##Persons"
        WHERE "##PREFIX##Persons"."personId" IN
        (
            SELECT "##PREFIX##Authors"."personId" FROM "##PREFIX##Authors" WHERE "##PREFIX##Authors"."bookId" = bookidparam
        );
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION ##PREFIX##bindinglanguagenames(bindingidparam integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT GROUP_CONCAT("##PREFIX##Languages"."languageName" SEPARATOR ', ') INTO result FROM "##PREFIX##Languages"
        WHERE "##PREFIX##Languages"."languageId" IN
        (
            SELECT "##PREFIX##BindingLanguages"."languageId" FROM "##PREFIX##BindingLanguages" WHERE "##PREFIX##BindingLanguages"."bindingId" = bindingidparam
        );
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION ##PREFIX##booklanguagenames(bookidparam integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT GROUP_CONCAT("##PREFIX##Languages"."languageName" SEPARATOR ', ') INTO result FROM "##PREFIX##Languages"
        WHERE "##PREFIX##Languages"."languageId" IN
        (
            SELECT "##PREFIX##BookLanguages"."languageId" FROM "##PREFIX##BookLanguages" WHERE "##PREFIX##BookLanguages"."bookId" = bookidparam
        );
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION ##PREFIX##provenancenames(bindingidparam integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT GROUP_CONCAT("##PREFIX##Persons"."name" SEPARATOR ', ') INTO result FROM "##PREFIX##Persons"
        WHERE "##PREFIX##Persons"."personId" IN
        (
            SELECT "##PREFIX##Provenances"."personId" FROM "##PREFIX##Provenances" WHERE "##PREFIX##Provenances"."bindingId" = bindingidparam
        );
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION ##PREFIX##annotationtext(annotationidparam integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT CONCAT("transcriptionEng", ' ', "transcriptionOrig") INTO result FROM "##PREFIX##Annotations"
        WHERE "##PREFIX##Annotations"."annotationId" = annotationidparam;
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION ##PREFIX##booktext(bookidparam integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT CONCAT_WS(' ',
            "title",
            ##PREFIX##authornames("bookId"),
            "publisher",
            "placePublished",
            ##PREFIX##booklanguagenames("bookId"),
            ##PREFIX##provenancenames("bindingId"),
            (SELECT "libraryName" FROM "##PREFIX##Libraries" WHERE "libraryId" IN (SELECT "libraryId" FROM "##PREFIX##Bindings" WHERE "##PREFIX##Books"."bindingId" = "##PREFIX##Bindings"."bindingId")),
            (SELECT "signature" FROM "##PREFIX##Bindings" WHERE "##PREFIX##Books"."bindingId" = "##PREFIX##Bindings"."bindingId"),
            ##PREFIX##bindinglanguagenames("bindingId"),
            book##PREFIX##annotationtext("bookId")
        ) INTO result FROM "##PREFIX##Books"
        WHERE "bookId" = bookidparam;
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION book##PREFIX##annotationtext(bookidparam integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT GROUP_CONCAT(annft.text SEPARATOR ' ') INTO result
        FROM "##PREFIX##Books" JOIN (SELECT * FROM "##PREFIX##Scans" ORDER BY page ASC) scans
            ON "##PREFIX##Books"."bindingId" = scans."bindingId"
            AND "page" >= "firstPage"
            AND "page" <= "lastPage"
        LEFT JOIN "##PREFIX##Annotations" annotations
            ON annotations."scanId" = scans."scanId"
        LEFT JOIN "##PREFIX##AnnotationsFT" annft
            ON annft."annotationId" = annotations."annotationId"
        WHERE "bookId" = bookidparam;
        RETURN result;
    END $$

DELIMITER ;

UPDATE "##PREFIX##Books" SET "bookId" = "bookId";

COMMIT;
