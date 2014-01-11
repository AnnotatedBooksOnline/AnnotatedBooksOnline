BEGIN TRANSACTION;

-- Fulltext index for Books.

ALTER TABLE "##PREFIX##Books" ADD COLUMN fulltext text;

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
    UPDATE "##PREFIX##Books"
        SET "bookId" = "bookId"
        WHERE "bookId" = NEW."bookId";
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION Authors_Persons_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "##PREFIX##Authors"
        SET "personId" = "personId"
        WHERE "personId" = NEW."personId";
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION Books_BookLanguages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "##PREFIX##Books"
        SET "bookId" = "bookId"
        WHERE "bookId" = NEW."bookId";
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION BookLanguages_Languages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "##PREFIX##BookLanguages"
        SET "languageId" = "languageId"
        WHERE "languageId" = NEW."languageId";
    RETURN NEW;
END; $$;

CREATE TRIGGER "##PREFIX##Books_FulltextTrigger" BEFORE INSERT OR UPDATE ON "##PREFIX##Books" FOR EACH ROW EXECUTE PROCEDURE Books_FulltextUpdate();
CREATE TRIGGER "##PREFIX##Books_Authors_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "##PREFIX##Authors" FOR EACH ROW EXECUTE PROCEDURE Books_Authors_Update();
CREATE TRIGGER "##PREFIX##Authors_Persons_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "##PREFIX##Persons" FOR EACH ROW EXECUTE PROCEDURE Authors_Persons_Update();
CREATE TRIGGER "##PREFIX##Book_BookLanguages_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "##PREFIX##BookLanguages" FOR EACH ROW EXECUTE PROCEDURE Books_BookLanguages_Update();
CREATE TRIGGER "##PREFIX##BookLanguages_Languages_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "##PREFIX##Languages" FOR EACH ROW EXECUTE PROCEDURE BookLanguages_Languages_Update();

UPDATE "##PREFIX##Books" SET fulltext = NULL;
CREATE INDEX "##PREFIX##Books_FulltextIndex" ON "##PREFIX##Books" USING gin(to_tsvector('english', fulltext));


-- Fulltext index for Bingings.

ALTER TABLE "##PREFIX##Bindings" ADD COLUMN fulltext text;

CREATE OR REPLACE FUNCTION Bindings_FulltextUpdate() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.fulltext := COALESCE(provenanceNames(NEW."bindingId"), '')
          || ' ' || COALESCE((SELECT "libraryName" FROM "##PREFIX##Libraries" WHERE "libraryId" = NEW."libraryId"), '')
          || ' ' || COALESCE(NEW."signature", '')
          || ' ' || COALESCE(bindingLanguageNames(NEW."bindingId"), '');
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION Bindings_Provenances_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "##PREFIX##Bindings"
        SET "bindingId" = "bindingId"
        WHERE "bindingId" = NEW."bindingId";
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION Provenances_Persons_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "##PREFIX##Provenances"
        SET "personId" = "personId"
        WHERE "personId" = NEW."personId";
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION Bindings_BindingLanguages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "##PREFIX##Bindings"
        SET "bindingId" = "bindingId"
        WHERE "bindingId" = NEW."bindingId";
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION BindingLanguages_Languages_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "##PREFIX##BindingLanguages"
        SET "languageId" = "languageId"
        WHERE "languageId" = NEW."languageId";
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION Bindings_Libraries_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "##PREFIX##Bindings"
        SET "libraryId" = "libraryId"
        WHERE "libraryId" = NEW."libraryId";
    RETURN NEW;
END; $$;

CREATE TRIGGER "##PREFIX##Bindings_FulltextTrigger" BEFORE INSERT OR UPDATE ON "##PREFIX##Bindings" FOR EACH ROW EXECUTE PROCEDURE Bindings_FulltextUpdate();
CREATE TRIGGER "##PREFIX##Bindings_Provenances_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "##PREFIX##Provenances" FOR EACH ROW EXECUTE PROCEDURE Bindings_Provenances_Update();
CREATE TRIGGER "##PREFIX##Provenances_Persons_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "##PREFIX##Persons" FOR EACH ROW EXECUTE PROCEDURE Provenances_Persons_Update();
CREATE TRIGGER "##PREFIX##Bindings_BindingLanguages_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "##PREFIX##BindingLanguages" FOR EACH ROW EXECUTE PROCEDURE Bindings_BindingLanguages_Update();
CREATE TRIGGER "##PREFIX##BindingLanguages_Languages_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "##PREFIX##Languages" FOR EACH ROW EXECUTE PROCEDURE BindingLanguages_Languages_Update();
CREATE TRIGGER "##PREFIX##Bindings_Libraries_Trigger" AFTER DELETE OR INSERT OR UPDATE ON "##PREFIX##Libraries" FOR EACH ROW EXECUTE PROCEDURE Bindings_Libraries_Update();

UPDATE "##PREFIX##Bindings" SET fulltext = NULL;
CREATE INDEX "##PREFIX##Bindings_FulltextIndex" ON "##PREFIX##Bindings" USING gin(to_tsvector('english', fulltext));

COMMIT;

