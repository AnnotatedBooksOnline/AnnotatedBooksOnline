BEGIN TRANSACTION;

-- Redo the fulltext index to improve performance.

DROP INDEX "Books_FulltextIndex";
ALTER TABLE "Books" ADD COLUMN fulltext_vector tsvector;
CREATE TRIGGER "ZZ_FulltextVector_Trigger" BEFORE INSERT OR UPDATE ON "Books" FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger(fulltext_vector, 'pg_catalog.english', fulltext);
UPDATE "Books" SET fulltext = NULL;
CREATE INDEX "Books_FulltextIndex" ON "Books" USING gin(fulltext_vector);

DROP INDEX "Bindings_FulltextIndex";
ALTER TABLE "Bindings" DROP COLUMN fulltext;
DROP TRIGGER "Bindings_FulltextTrigger" ON "Bindings";
DROP FUNCTION Bindings_FulltextUpdate();
CREATE OR REPLACE FUNCTION Books_Bindings_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Books"
        SET "bindingId" = "bindingId"
        WHERE "bindingId" = NEW."bindingId";
    RETURN NULL;
END; $$;
CREATE TRIGGER "Books_Bindings_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "Bindings" FOR EACH ROW EXECUTE PROCEDURE Books_Bindings_Update();

-- Add fulltext column to Scans and update Books fulltext to include Annotations and Binding information.

ALTER TABLE "Scans" ADD COLUMN fulltext text;

CREATE OR REPLACE FUNCTION bookAnnotationText (IN bookid "Books"."bookId"%TYPE)
    RETURNS text
    LANGUAGE SQL
    STABLE
    STRICT
    SECURITY INVOKER
    AS $$ SELECT * FROM
    (
        SELECT array_to_string(array_accum(COALESCE("Scans".fulltext, '')), ' ') AS text
        FROM "Books" LEFT JOIN "Scans"
            ON "Books"."bindingId" = "Scans"."bindingId"
            AND "page" >= "firstPage"
            AND "page" <= "lastPage"
        WHERE "bookId" = $1
    ) AS f WHERE f.text <> '' $$;

CREATE OR REPLACE FUNCTION Scans_Annotations_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."scanId" != NEW."scanId" THEN
        UPDATE "Scans"
            SET "scanId" = "scanId"
            WHERE "scanId" = NEW."scanId";
    END IF;
    UPDATE "Scans"
        SET "scanId" = "scanId"
        WHERE "scanId" = OLD."scanId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Scans_FulltextUpdate() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    SELECT text INTO NEW.fulltext FROM
        (
            SELECT array_to_string(array_accum(COALESCE("transcriptionOrig", '') || ' ' || COALESCE("transcriptionEng", '')), ' ') AS text
            FROM "Annotations" WHERE "scanId" = NEW."scanId"
        ) AS f WHERE f.text <> '';
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION Books_Scans_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE "Books"
            SET "bookId" = "bookId"
            WHERE "Books"."bindingId" = OLD."bindingId"
                AND OLD."page" >= "firstPage"
                AND OLD."page" <= "lastPage";
    ELSIF NEW.fulltext != OLD.fulltext OR NEW."bindingId" != OLD."bindingId" OR NEW.page != OLD.page THEN
        UPDATE "Books"
            SET "bookId" = "bookId"
            WHERE "Books"."bindingId" = NEW."bindingId"
                AND NEW."page" >= "firstPage"
                AND NEW."page" <= "lastPage"
            OR "Books"."bindingId" = OLD."bindingId"
                AND OLD."page" >= "firstPage"
                AND OLD."page" <= "lastPage";
    END IF;
    RETURN NULL;
END; $$;

CREATE TRIGGER "Scans_FulltextTrigger" BEFORE INSERT OR UPDATE ON "Scans" FOR EACH ROW EXECUTE PROCEDURE Scans_FulltextUpdate();
CREATE TRIGGER "Books_Scans_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "Scans" FOR EACH ROW EXECUTE PROCEDURE Books_Scans_Update();
CREATE TRIGGER "Scans_Annotations_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "Annotations" FOR EACH ROW EXECUTE PROCEDURE Scans_Annotations_Update();

UPDATE "Scans" SET fulltext = NULL;

CREATE OR REPLACE FUNCTION Books_FulltextUpdate() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.fulltext := COALESCE(NEW."title", '')
          || ' ' || COALESCE(authorNames(NEW."bookId"), '')
          || ' ' || COALESCE(NEW."publisher", '')
          || ' ' || COALESCE(NEW."placePublished", '')
          || ' ' || COALESCE(bookLanguageNames(NEW."bookId"), '')
          || ' ' || COALESCE(provenanceNames(NEW."bindingId"), '')
          || ' ' || COALESCE((SELECT "libraryName" FROM "Libraries" WHERE "libraryId" IN (SELECT "libraryId" FROM "Bindings" WHERE "bindingId" = NEW."bindingId")), '')
          || ' ' || COALESCE((SELECT "signature" FROM "Bindings" WHERE "bindingId" = NEW."bindingId"), '')
          || ' ' || COALESCE(bindingLanguageNames(NEW."bindingId"), '')
          || ' ' || COALESCE(bookAnnotationText(NEW."bookId"), '');
    RETURN NEW;
END; $$;

UPDATE "Books" SET fulltext = NULL;


-- Update triggers for Books and Bindings to function correctly on DELETE.

CREATE OR REPLACE FUNCTION Books_Authors_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."bookId" != NEW."bookId" THEN
        UPDATE "Books"
            SET "bookId" = "bookId"
            WHERE "bookId" = NEW."bookId";
    END IF;
    UPDATE "Books"
        SET "bookId" = "bookId"
        WHERE "bookId" = OLD."bookId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Authors_Persons_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."personId" != NEW."personId" THEN
        UPDATE "Authors"
            SET "personId" = "personId"
            WHERE "personId" = NEW."personId";
    END IF;
    UPDATE "Authors"
        SET "personId" = "personId"
        WHERE "personId" = OLD."personId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Books_BookLanguages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."bookId" != NEW."bookId" THEN
        UPDATE "Books"
            SET "bookId" = "bookId"
            WHERE "bookId" = NEW."bookId";
    END IF;
    UPDATE "Books"
        SET "bookId" = "bookId"
        WHERE "bookId" = OLD."bookId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION BookLanguages_Languages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."languageId" != NEW."languageId" THEN
        UPDATE "BookLanguages"
            SET "languageId" = "languageId"
            WHERE "languageId" = NEW."languageId";
    END IF;
    UPDATE "BookLanguages"
        SET "languageId" = "languageId"
        WHERE "languageId" = OLD."languageId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Bindings_Provenances_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."bindingId" != NEW."bindingId" THEN
        UPDATE "Bindings"
            SET "bindingId" = "bindingId"
            WHERE "bindingId" = NEW."bindingId";
    END IF;
    UPDATE "Bindings"
        SET "bindingId" = "bindingId"
        WHERE "bindingId" = OLD."bindingId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Provenances_Persons_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."personId" != NEW."personId" THEN
        UPDATE "Provenances"
            SET "personId" = "personId"
            WHERE "personId" = NEW."personId";
    END IF;
    UPDATE "Provenances"
        SET "personId" = "personId"
        WHERE "personId" = OLD."personId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Bindings_BindingLanguages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."bindingId" != NEW."bindingId" THEN
        UPDATE "Bindings"
            SET "bindingId" = "bindingId"
            WHERE "bindingId" = NEW."bindingId";
    END IF;
    UPDATE "Bindings"
        SET "bindingId" = "bindingId"
        WHERE "bindingId" = OLD."bindingId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION BindingLanguages_Languages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."languageId" != NEW."languageId" THEN
        UPDATE "BindingLanguages"
            SET "languageId" = "languageId"
            WHERE "languageId" = NEW."languageId";
    END IF;
    UPDATE "BindingLanguages"
        SET "languageId" = "languageId"
        WHERE "languageId" = OLD."languageId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Bindings_Libraries_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."languageId" != NEW."languageId" THEN
        UPDATE "Bindings"
            SET "libraryId" = "libraryId"
            WHERE "libraryId" = NEW."libraryId";
    END IF;
    UPDATE "Bindings"
        SET "libraryId" = "libraryId"
        WHERE "libraryId" = OLD."libraryId";
    RETURN NULL;
END; $$;


-- Add a fulltext index to the Scans table.

ALTER TABLE "Scans" ADD COLUMN fulltext_vector tsvector;
CREATE TRIGGER "ZZ_FulltextVector_Trigger" BEFORE INSERT OR UPDATE ON "Scans" FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger(fulltext_vector, 'pg_catalog.english', fulltext);
UPDATE "Scans" SET fulltext = NULL;
CREATE INDEX "Scans_FulltextIndex" ON "Scans" USING gin(fulltext_vector);

COMMIT;

