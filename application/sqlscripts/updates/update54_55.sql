BEGIN TRANSACTION;

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
    ELSIF OLD.fulltext IS NULL OR NEW.fulltext != OLD.fulltext OR NEW."bindingId" != OLD."bindingId" OR NEW.page != OLD.page THEN
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

CREATE OR REPLACE FUNCTION bookAnnotationText (IN bookid "Books"."bookId"%TYPE)
    RETURNS text
    LANGUAGE SQL
    STABLE
    STRICT
    SECURITY INVOKER
    AS $$ SELECT * FROM
    (
        SELECT array_to_string(array_accum(COALESCE(scans.fulltext, '')), ' ') AS text
        FROM "Books" JOIN (SELECT * FROM "Scans" ORDER BY page ASC) scans
            ON "Books"."bindingId" = scans."bindingId"
            AND "page" >= "firstPage"
            AND "page" <= "lastPage"
        WHERE "bookId" = $1
    ) AS f WHERE f.text <> '' $$;

UPDATE "Scans" SET fulltext = NULL;
UPDATE "Books" SET fulltext = NULL;

COMMIT;

