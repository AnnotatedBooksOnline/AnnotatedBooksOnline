BEGIN TRANSACTION;

-- Change type of polygon column for Annotations.

ALTER TABLE "Annotations" ADD COLUMN polygon_b64 text;
UPDATE "Annotations" SET polygon_b64 = encode(polygon, 'base64');
ALTER TABLE "Annotations" DROP COLUMN polygon;
ALTER TABLE "Annotations" ALTER COLUMN polygon_b64 SET NOT NULL;
ALTER TABLE "Annotations" RENAME polygon_b64 TO polygon;


-- Update all triggers to function correctly on INSERT.

CREATE OR REPLACE FUNCTION Scans_Annotations_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."scanId" != NEW."scanId" THEN
        UPDATE "Scans"
            SET "scanId" = "scanId"
            WHERE "scanId" = NEW."scanId";
    END IF;
    UPDATE "Scans"
        SET "scanId" = "scanId"
        WHERE "scanId" = OLD."scanId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Books_Scans_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE "Books"
            SET "bookId" = "bookId"
            WHERE "Books"."bindingId" = OLD."bindingId"
                AND OLD."page" >= "firstPage"
                AND OLD."page" <= "lastPage";
    ELSIF TG_OP = 'INSERT' THEN
        UPDATE "Books"
            SET "bookId" = "bookId"
            WHERE "Books"."bindingId" = NEW."bindingId"
                AND NEW."page" >= "firstPage"
                AND NEW."page" <= "lastPage";
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

CREATE OR REPLACE FUNCTION Books_Authors_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."bookId" != NEW."bookId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."personId" != NEW."personId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."bookId" != NEW."bookId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."languageId" != NEW."languageId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."bindingId" != NEW."bindingId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."personId" != NEW."personId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."bindingId" != NEW."bindingId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."languageId" != NEW."languageId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."libraryId" != NEW."libraryId" THEN
        UPDATE "Bindings"
            SET "libraryId" = "libraryId"
            WHERE "libraryId" = NEW."libraryId";
    END IF;
    UPDATE "Bindings"
        SET "libraryId" = "libraryId"
        WHERE "libraryId" = OLD."libraryId";
    RETURN NULL;
END; $$;

COMMIT;
