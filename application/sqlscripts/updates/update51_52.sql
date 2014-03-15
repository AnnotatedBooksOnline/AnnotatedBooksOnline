BEGIN TRANSACTION;

-- Change type of polygon column for Annotations.

ALTER TABLE "##PREFIX##Annotations" ADD COLUMN polygon_b64 text;
UPDATE "##PREFIX##Annotations" SET polygon_b64 = encode(polygon, 'base64');
ALTER TABLE "##PREFIX##Annotations" DROP COLUMN polygon;
ALTER TABLE "##PREFIX##Annotations" ALTER COLUMN polygon_b64 SET NOT NULL;
ALTER TABLE "##PREFIX##Annotations" RENAME polygon_b64 TO polygon;


-- Update all triggers to function correctly on INSERT.

CREATE OR REPLACE FUNCTION Scans_Annotations_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."scanId" != NEW."scanId" THEN
        UPDATE "##PREFIX##Scans"
            SET "scanId" = "scanId"
            WHERE "scanId" = NEW."scanId";
    END IF;
    UPDATE "##PREFIX##Scans"
        SET "scanId" = "scanId"
        WHERE "scanId" = OLD."scanId";
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Books_Scans_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE "##PREFIX##Books"
            SET "bookId" = "bookId"
            WHERE "##PREFIX##Books"."bindingId" = OLD."bindingId"
                AND OLD."page" >= "firstPage"
                AND OLD."page" <= "lastPage";
    ELSIF TG_OP = 'INSERT' THEN
        UPDATE "##PREFIX##Books"
            SET "bookId" = "bookId"
            WHERE "##PREFIX##Books"."bindingId" = NEW."bindingId"
                AND NEW."page" >= "firstPage"
                AND NEW."page" <= "lastPage";
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

CREATE OR REPLACE FUNCTION Books_Authors_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."bookId" != NEW."bookId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."personId" != NEW."personId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."bookId" != NEW."bookId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."languageId" != NEW."languageId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."bindingId" != NEW."bindingId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."personId" != NEW."personId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."bindingId" != NEW."bindingId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."languageId" != NEW."languageId" THEN
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
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."libraryId" != NEW."libraryId" THEN
        UPDATE "##PREFIX##Bindings"
            SET "libraryId" = "libraryId"
            WHERE "libraryId" = NEW."libraryId";
    END IF;
    UPDATE "##PREFIX##Bindings"
        SET "libraryId" = "libraryId"
        WHERE "libraryId" = OLD."libraryId";
    RETURN NULL;
END; $$;

COMMIT;
