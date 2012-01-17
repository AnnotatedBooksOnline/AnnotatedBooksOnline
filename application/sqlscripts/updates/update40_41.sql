BEGIN TRANSACTION;

-- Several convenience functions that are extremely useful for search.

CREATE OR REPLACE FUNCTION authorNames (IN bookid "Books"."bookId"%TYPE)
    RETURNS text
    LANGUAGE SQL
    STABLE
    STRICT
    SECURITY INVOKER
    AS $$ SELECT * FROM
    (
        SELECT array_to_string(array_accum("Persons"."name"), ', ') AS names FROM "Persons"
        WHERE "Persons"."personId" IN
        (
            SELECT "Authors"."personId" FROM "Authors" WHERE "Authors"."bookId" = $1
        )
    ) AS f WHERE f.names <> '' $$;

CREATE OR REPLACE FUNCTION provenanceNames (IN bindingid "Bindings"."bindingId"%TYPE)
    RETURNS text
    LANGUAGE SQL
    STABLE
    STRICT
    SECURITY INVOKER
    AS $$ SELECT * FROM
    (
        SELECT array_to_string(array_accum("Persons"."name"), ', ') AS names FROM "Persons"
        WHERE "Persons"."personId" IN
        (
            SELECT "Provenances"."personId" FROM "Provenances" WHERE "Provenances"."bindingId" = $1
        )
    ) AS f WHERE f.names <> '' $$;

CREATE OR REPLACE FUNCTION bookLanguageNames (IN bookid "Books"."bookId"%TYPE)
    RETURNS text
    LANGUAGE SQL
    STABLE
    STRICT
    SECURITY INVOKER
    AS $$ SELECT * FROM
    (
        SELECT array_to_string(array_accum("Languages"."languageName"), ', ') AS names FROM "Languages"
        WHERE "Languages"."languageId" IN
        (
            SELECT "BookLanguages"."languageId" FROM "BookLanguages" WHERE "BookLanguages"."bookId" = $1
        )
    ) AS f WHERE f.names <> '' $$;

CREATE OR REPLACE FUNCTION bindingLanguageNames (IN bindingid "Bindings"."bindingId"%TYPE)
    RETURNS text
    LANGUAGE SQL
    STABLE
    STRICT
    SECURITY INVOKER
    AS $$ SELECT * FROM
    (
        SELECT array_to_string(array_accum("Languages"."languageName"), ', ') AS names FROM "Languages"
        WHERE "Languages"."languageId" IN
        (
            SELECT "BindingLanguages"."languageId" FROM "BindingLanguages" WHERE "BindingLanguages"."bindingId" = $1
        )
    ) AS f WHERE f.names <> '' $$;

COMMIT;

