BEGIN TRANSACTION;

-- Fulltext index for Books.

ALTER TABLE "Books" ADD COLUMN fulltext text;

CREATE OR REPLACE FUNCTION Books_FulltextUpdate() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.fulltext := COALESCE(NEW."title", '')
          || ' ' || COALESCE(authorNames(NEW."bookId"), '')
          || ' ' || COALESCE(NEW."publisher", '')
          || ' ' || COALESCE(NEW."placePublished", '')
          || ' ' || COALESCE(bookLanguageNames(NEW."bookId"), '');
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION Books_Authors_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Books"
        SET "bookId" = "bookId"
        WHERE "bookId" = NEW."bookId";
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION Authors_Persons_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Authors"
        SET "personId" = "personId"
        WHERE "personId" = NEW."personId";
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION Books_BookLanguages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Books"
        SET "bookId" = "bookId"
        WHERE "bookId" = NEW."bookId";
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION BookLanguages_Languages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "BookLanguages"
        SET "languageId" = "languageId"
        WHERE "languageId" = NEW."languageId";
    RETURN NEW;
END; $$;

CREATE TRIGGER "Books_FulltextTrigger" BEFORE INSERT OR UPDATE ON "Books" FOR EACH ROW EXECUTE PROCEDURE Books_FulltextUpdate();
CREATE TRIGGER "Books_Authors_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "Authors" FOR EACH ROW EXECUTE PROCEDURE Books_Authors_Update();
CREATE TRIGGER "Authors_Persons_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "Persons" FOR EACH ROW EXECUTE PROCEDURE Authors_Persons_Update();
CREATE TRIGGER "Book_BookLanguages_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "BookLanguages" FOR EACH ROW EXECUTE PROCEDURE Books_BookLanguages_Update();
CREATE TRIGGER "BookLanguages_Languages_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "Languages" FOR EACH ROW EXECUTE PROCEDURE BookLanguages_Languages_Update();

UPDATE "Books" SET fulltext = NULL;
CREATE INDEX "Books_FulltextIndex" ON "Books" USING gin(to_tsvector('english', fulltext));


-- Fulltext index for Bingings.

ALTER TABLE "Bindings" ADD COLUMN fulltext text;

CREATE OR REPLACE FUNCTION Bindings_FulltextUpdate() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.fulltext := COALESCE(provenanceNames(NEW."bindingId"), '')
          || ' ' || COALESCE((SELECT "libraryName" FROM "Libraries" WHERE "libraryId" = NEW."libraryId"), '')
          || ' ' || COALESCE(NEW."signature", '')
          || ' ' || COALESCE(bindingLanguageNames(NEW."bindingId"), '');
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION Bindings_Provenances_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Bindings"
        SET "bindingId" = "bindingId"
        WHERE "bindingId" = NEW."bindingId";
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION Provenances_Persons_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Provenances"
        SET "personId" = "personId"
        WHERE "personId" = NEW."personId";
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION Bindings_BindingLanguages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Bindings"
        SET "bindingId" = "bindingId"
        WHERE "bindingId" = NEW."bindingId";
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION BindingLanguages_Languages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "BindingLanguages"
        SET "languageId" = "languageId"
        WHERE "languageId" = NEW."languageId";
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION Bindings_Libraries_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Bindings"
        SET "libraryId" = "libraryId"
        WHERE "libraryId" = NEW."libraryId";
    RETURN NEW;
END; $$;

CREATE TRIGGER "Bindings_FulltextTrigger" BEFORE INSERT OR UPDATE ON "Bindings" FOR EACH ROW EXECUTE PROCEDURE Bindings_FulltextUpdate();
CREATE TRIGGER "Bindings_Provenances_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "Provenances" FOR EACH ROW EXECUTE PROCEDURE Bindings_Provenances_Update();
CREATE TRIGGER "Provenances_Persons_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "Persons" FOR EACH ROW EXECUTE PROCEDURE Provenances_Persons_Update();
CREATE TRIGGER "Bindings_BindingLanguages_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "BindingLanguages" FOR EACH ROW EXECUTE PROCEDURE Bindings_BindingLanguages_Update();
CREATE TRIGGER "BindingLanguages_Languages_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "Languages" FOR EACH ROW EXECUTE PROCEDURE BindingLanguages_Languages_Update();
CREATE TRIGGER "Bindings_Libraries_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "Libraries" FOR EACH ROW EXECUTE PROCEDURE Bindings_Libraries_Update();

UPDATE "Bindings" SET fulltext = NULL;
CREATE INDEX "Bindings_FulltextIndex" ON "Bindings" USING gin(to_tsvector('english', fulltext));

COMMIT;

