BEGIN TRANSACTION;

-- Redo the fulltext index to improve performance.

DROP INDEX "##PREFIX##Books_FulltextIndex";
ALTER TABLE "##PREFIX##Books" ADD COLUMN fulltext_vector tsvector;
CREATE TRIGGER "##PREFIX##ZZ_FulltextVector_Trigger" BEFORE INSERT OR UPDATE ON "##PREFIX##Books" FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger(fulltext_vector, 'pg_catalog.english', fulltext);
UPDATE "##PREFIX##Books" SET fulltext = NULL;
CREATE INDEX "##PREFIX##Books_FulltextIndex" ON "##PREFIX##Books" USING gin(fulltext_vector);

DROP INDEX "##PREFIX##Bindings_FulltextIndex";
ALTER TABLE "##PREFIX##Bindings" DROP COLUMN fulltext;
DROP TRIGGER "##PREFIX##Bindings_FulltextTrigger" ON "##PREFIX##Bindings";
DROP FUNCTION Bindings_FulltextUpdate();
CREATE OR REPLACE FUNCTION Books_Bindings_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "##PREFIX##Books"
        SET "bindingId" = "bindingId"
        WHERE "bindingId" = NEW."bindingId";
    RETURN NULL;
END; $$;
CREATE TRIGGER "##PREFIX##Books_Bindings_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "##PREFIX##Bindings" FOR EACH ROW EXECUTE PROCEDURE Books_Bindings_Update();

-- Add fulltext column to Scans and update Books fulltext to include Annotations and Binding information.

ALTER TABLE "##PREFIX##Scans" ADD COLUMN fulltext text;

CREATE OR REPLACE FUNCTION bookAnnotationText (IN bookid "##PREFIX##Books"."bookId"%TYPE)
    RETURNS text
    LANGUAGE SQL
    STABLE
    STRICT
    SECURITY INVOKER
    AS $$ SELECT * FROM
    (
        SELECT array_to_string(array_accum(COALESCE("##PREFIX##Scans".fulltext, '')), ' ') AS text
        FROM "##PREFIX##Books" LEFT JOIN "##PREFIX##Scans"
            ON "##PREFIX##Books"."bindingId" = "##PREFIX##Scans"."bindingId"
            AND "page" >= "firstPage"
            AND "page" <= "lastPage"
        WHERE "bookId" = $1
    ) AS f WHERE f.text <> '' $$;

CREATE OR REPLACE FUNCTION Scans_Annotations_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."scanId" != NEW."scanId" THEN
        UPDATE "##PREFIX##Scans"
            SET "scanId" = "scanId"
            WHERE "scanId" = NEW."scanId";
    END IF;
    UPDATE "##PREFIX##Scans"
        SET "scanId" = "scanId"
        WHERE "scanId" = OLD."scanId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Scans_FulltextUpdate() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    SELECT text INTO NEW.fulltext FROM
        (
            SELECT array_to_string(array_accum(COALESCE("transcriptionOrig", '') || ' ' || COALESCE("transcriptionEng", '')), ' ') AS text
            FROM "##PREFIX##Annotations" WHERE "scanId" = NEW."scanId"
        ) AS f WHERE f.text <> '';
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION Books_Scans_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE "##PREFIX##Books"
            SET "bookId" = "bookId"
            WHERE "##PREFIX##Books"."bindingId" = OLD."bindingId"
                AND OLD."page" >= "firstPage"
                AND OLD."page" <= "lastPage";
    ELSIF NEW.fulltext != OLD.fulltext OR NEW."bindingId" != OLD."bindingId" OR NEW.page != OLD.page THEN
        UPDATE "##PREFIX##Books"
            SET "bookId" = "bookId"
            WHERE "##PREFIX##Books"."bindingId" = NEW."bindingId"
                AND NEW."page" >= "firstPage"
                AND NEW."page" <= "lastPage"
            OR "##PREFIX##Books"."bindingId" = OLD."bindingId"
                AND OLD."page" >= "firstPage"
                AND OLD."page" <= "lastPage";
    END IF;
    RETURN NULL;
END; $$;

CREATE TRIGGER "##PREFIX##Scans_FulltextTrigger" BEFORE INSERT OR UPDATE ON "##PREFIX##Scans" FOR EACH ROW EXECUTE PROCEDURE Scans_FulltextUpdate();
CREATE TRIGGER "##PREFIX##Books_Scans_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "##PREFIX##Scans" FOR EACH ROW EXECUTE PROCEDURE Books_Scans_Update();
CREATE TRIGGER "##PREFIX##Scans_Annotations_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "##PREFIX##Annotations" FOR EACH ROW EXECUTE PROCEDURE Scans_Annotations_Update();

UPDATE "##PREFIX##Scans" SET fulltext = NULL;

CREATE OR REPLACE FUNCTION Books_FulltextUpdate() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.fulltext := COALESCE(NEW."title", '')
          || ' ' || COALESCE(authorNames(NEW."bookId"), '')
          || ' ' || COALESCE(NEW."publisher", '')
          || ' ' || COALESCE(NEW."placePublished", '')
          || ' ' || COALESCE(bookLanguageNames(NEW."bookId"), '')
          || ' ' || COALESCE(provenanceNames(NEW."bindingId"), '')
          || ' ' || COALESCE((SELECT "libraryName" FROM "##PREFIX##Libraries" WHERE "libraryId" IN (SELECT "libraryId" FROM "##PREFIX##Bindings" WHERE "bindingId" = NEW."bindingId")), '')
          || ' ' || COALESCE((SELECT "signature" FROM "##PREFIX##Bindings" WHERE "bindingId" = NEW."bindingId"), '')
          || ' ' || COALESCE(bindingLanguageNames(NEW."bindingId"), '')
          || ' ' || COALESCE(bookAnnotationText(NEW."bookId"), '');
    RETURN NEW;
END; $$;

UPDATE "##PREFIX##Books" SET fulltext = NULL;


-- Update triggers for Books and Bindings to function correctly on DELETE.

CREATE OR REPLACE FUNCTION Books_Authors_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."bookId" != NEW."bookId" THEN
        UPDATE "##PREFIX##Books"
            SET "bookId" = "bookId"
            WHERE "bookId" = NEW."bookId";
    END IF;
    UPDATE "##PREFIX##Books"
        SET "bookId" = "bookId"
        WHERE "bookId" = OLD."bookId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Authors_Persons_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."personId" != NEW."personId" THEN
        UPDATE "##PREFIX##Authors"
            SET "personId" = "personId"
            WHERE "personId" = NEW."personId";
    END IF;
    UPDATE "##PREFIX##Authors"
        SET "personId" = "personId"
        WHERE "personId" = OLD."personId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Books_BookLanguages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."bookId" != NEW."bookId" THEN
        UPDATE "##PREFIX##Books"
            SET "bookId" = "bookId"
            WHERE "bookId" = NEW."bookId";
    END IF;
    UPDATE "##PREFIX##Books"
        SET "bookId" = "bookId"
        WHERE "bookId" = OLD."bookId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION BookLanguages_Languages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."languageId" != NEW."languageId" THEN
        UPDATE "##PREFIX##BookLanguages"
            SET "languageId" = "languageId"
            WHERE "languageId" = NEW."languageId";
    END IF;
    UPDATE "##PREFIX##BookLanguages"
        SET "languageId" = "languageId"
        WHERE "languageId" = OLD."languageId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Bindings_Provenances_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."bindingId" != NEW."bindingId" THEN
        UPDATE "##PREFIX##Bindings"
            SET "bindingId" = "bindingId"
            WHERE "bindingId" = NEW."bindingId";
    END IF;
    UPDATE "##PREFIX##Bindings"
        SET "bindingId" = "bindingId"
        WHERE "bindingId" = OLD."bindingId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Provenances_Persons_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."personId" != NEW."personId" THEN
        UPDATE "##PREFIX##Provenances"
            SET "personId" = "personId"
            WHERE "personId" = NEW."personId";
    END IF;
    UPDATE "##PREFIX##Provenances"
        SET "personId" = "personId"
        WHERE "personId" = OLD."personId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Bindings_BindingLanguages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."bindingId" != NEW."bindingId" THEN
        UPDATE "##PREFIX##Bindings"
            SET "bindingId" = "bindingId"
            WHERE "bindingId" = NEW."bindingId";
    END IF;
    UPDATE "##PREFIX##Bindings"
        SET "bindingId" = "bindingId"
        WHERE "bindingId" = OLD."bindingId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION BindingLanguages_Languages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."languageId" != NEW."languageId" THEN
        UPDATE "##PREFIX##BindingLanguages"
            SET "languageId" = "languageId"
            WHERE "languageId" = NEW."languageId";
    END IF;
    UPDATE "##PREFIX##BindingLanguages"
        SET "languageId" = "languageId"
        WHERE "languageId" = OLD."languageId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Bindings_Libraries_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND OLD."languageId" != NEW."languageId" THEN
        UPDATE "##PREFIX##Bindings"
            SET "libraryId" = "libraryId"
            WHERE "libraryId" = NEW."libraryId";
    END IF;
    UPDATE "##PREFIX##Bindings"
        SET "libraryId" = "libraryId"
        WHERE "libraryId" = OLD."libraryId";
    RETURN NULL;
END; $$;


-- Add a fulltext index to the Scans table.

ALTER TABLE "##PREFIX##Scans" ADD COLUMN fulltext_vector tsvector;
CREATE TRIGGER "##PREFIX##ZZ_FulltextVector_Trigger" BEFORE INSERT OR UPDATE ON "##PREFIX##Scans" FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger(fulltext_vector, 'pg_catalog.english', fulltext);
UPDATE "##PREFIX##Scans" SET fulltext = NULL;
CREATE INDEX "##PREFIX##Scans_FulltextIndex" ON "##PREFIX##Scans" USING gin(fulltext_vector);

COMMIT;

