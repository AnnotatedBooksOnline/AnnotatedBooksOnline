BEGIN TRANSACTION;

-- Update all triggers to function correctly on INSERT.

CREATE OR REPLACE FUNCTION Scans_Annotations_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND (TG_OP = 'INSERT' OR OLD."scanId" != NEW."scanId") THEN
        UPDATE "Scans"
            SET "scanId" = "scanId"
            WHERE "scanId" = NEW."scanId";
    END IF;
    IF TG_OP != 'INSERT' THEN
        UPDATE "Scans"
            SET "scanId" = "scanId"
            WHERE "scanId" = OLD."scanId";
    END IF;
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
    IF TG_OP != 'DELETE' AND (TG_OP = 'INSERT' OR OLD."bookId" != NEW."bookId") THEN
        UPDATE "Books"
            SET "bookId" = "bookId"
            WHERE "bookId" = NEW."bookId";
    END IF;
    IF TG_OP != 'INSERT' THEN
        UPDATE "Books"
            SET "bookId" = "bookId"
            WHERE "bookId" = OLD."bookId";
    END IF;
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Authors_Persons_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND (TG_OP = 'INSERT' OR OLD."personId" != NEW."personId") THEN
        UPDATE "Authors"
            SET "personId" = "personId"
            WHERE "personId" = NEW."personId";
    END IF;
    IF TG_OP != 'INSERT' THEN
        UPDATE "Authors"
            SET "personId" = "personId"
            WHERE "personId" = OLD."personId";
    END IF;
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Books_BookLanguages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND (TG_OP = 'INSERT' OR OLD."bookId" != NEW."bookId") THEN
        UPDATE "Books"
            SET "bookId" = "bookId"
            WHERE "bookId" = NEW."bookId";
    END IF;
    IF TG_OP != 'INSERT' THEN
        UPDATE "Books"
            SET "bookId" = "bookId"
            WHERE "bookId" = OLD."bookId";
    END IF;
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION BookLanguages_Languages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND (TG_OP = 'INSERT' OR OLD."languageId" != NEW."languageId") THEN
        UPDATE "BookLanguages"
            SET "languageId" = "languageId"
            WHERE "languageId" = NEW."languageId";
    END IF;
    IF TG_OP != 'INSERT' THEN
        UPDATE "BookLanguages"
            SET "languageId" = "languageId"
            WHERE "languageId" = OLD."languageId";
    END IF;
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Bindings_Provenances_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND (TG_OP = 'INSERT' OR OLD."bindingId" != NEW."bindingId") THEN
        UPDATE "Bindings"
            SET "bindingId" = "bindingId"
            WHERE "bindingId" = NEW."bindingId";
    END IF;
    IF TG_OP != 'INSERT' THEN
        UPDATE "Bindings"
            SET "bindingId" = "bindingId"
            WHERE "bindingId" = OLD."bindingId";
    END IF;
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Provenances_Persons_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND (TG_OP = 'INSERT' OR OLD."personId" != NEW."personId") THEN
        UPDATE "Provenances"
            SET "personId" = "personId"
            WHERE "personId" = NEW."personId";
    END IF;
    IF TG_OP != 'INSERT' THEN
        UPDATE "Provenances"
            SET "personId" = "personId"
            WHERE "personId" = OLD."personId";
    END IF;
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Bindings_BindingLanguages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND (TG_OP = 'INSERT' OR OLD."bindingId" != NEW."bindingId") THEN
        UPDATE "Bindings"
            SET "bindingId" = "bindingId"
            WHERE "bindingId" = NEW."bindingId";
    END IF;
    IF TG_OP != 'INSERT' THEN
        UPDATE "Bindings"
            SET "bindingId" = "bindingId"
            WHERE "bindingId" = OLD."bindingId";
    END IF;
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION BindingLanguages_Languages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND (TG_OP = 'INSERT' OR OLD."languageId" != NEW."languageId") THEN
        UPDATE "BindingLanguages"
            SET "languageId" = "languageId"
            WHERE "languageId" = NEW."languageId";
    END IF;
    IF TG_OP != 'INSERT' THEN
        UPDATE "BindingLanguages"
            SET "languageId" = "languageId"
            WHERE "languageId" = OLD."languageId";
    END IF;
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION Bindings_Libraries_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP != 'DELETE' AND (TG_OP = 'INSERT' OR OLD."libraryId" != NEW."libraryId") THEN
        UPDATE "Bindings"
            SET "libraryId" = "libraryId"
            WHERE "libraryId" = NEW."libraryId";
    END IF;
    IF TG_OP != 'INSERT' THEN
        UPDATE "Bindings"
            SET "libraryId" = "libraryId"
            WHERE "libraryId" = OLD."libraryId";
    END IF;
    RETURN NULL;
END; $$;

COMMIT;

