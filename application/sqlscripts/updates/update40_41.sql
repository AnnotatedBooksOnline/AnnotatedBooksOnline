BEGIN TRANSACTION;

-- Several convenience functions that are extremely useful for search.

CREATE OR REPLACE FUNCTION authorNames (IN bookid "##PREFIX##Books"."bookId"%TYPE)
    RETURNS text
    LANGUAGE SQL
    STABLE
    STRICT
    SECURITY INVOKER
    AS $$ SELECT * FROM
    (
        SELECT array_to_string(array_accum("##PREFIX##Persons"."name"), ', ') AS names FROM "##PREFIX##Persons"
        WHERE "##PREFIX##Persons"."personId" IN
        (
            SELECT "##PREFIX##Authors"."personId" FROM "##PREFIX##Authors" WHERE "##PREFIX##Authors"."bookId" = $1
        )
    ) AS f WHERE f.names <> '' $$;

CREATE OR REPLACE FUNCTION provenanceNames (IN bindingid "##PREFIX##Bindings"."bindingId"%TYPE)
    RETURNS text
    LANGUAGE SQL
    STABLE
    STRICT
    SECURITY INVOKER
    AS $$ SELECT * FROM
    (
        SELECT array_to_string(array_accum("##PREFIX##Persons"."name"), ', ') AS names FROM "##PREFIX##Persons"
        WHERE "##PREFIX##Persons"."personId" IN
        (
            SELECT "##PREFIX##Provenances"."personId" FROM "##PREFIX##Provenances" WHERE "##PREFIX##Provenances"."bindingId" = $1
        )
    ) AS f WHERE f.names <> '' $$;

CREATE OR REPLACE FUNCTION bookLanguageNames (IN bookid "##PREFIX##Books"."bookId"%TYPE)
    RETURNS text
    LANGUAGE SQL
    STABLE
    STRICT
    SECURITY INVOKER
    AS $$ SELECT * FROM
    (
        SELECT array_to_string(array_accum("##PREFIX##Languages"."languageName"), ', ') AS names FROM "##PREFIX##Languages"
        WHERE "##PREFIX##Languages"."languageId" IN
        (
            SELECT "##PREFIX##BookLanguages"."languageId" FROM "##PREFIX##BookLanguages" WHERE "##PREFIX##BookLanguages"."bookId" = $1
        )
    ) AS f WHERE f.names <> '' $$;

CREATE OR REPLACE FUNCTION bindingLanguageNames (IN bindingid "##PREFIX##Bindings"."bindingId"%TYPE)
    RETURNS text
    LANGUAGE SQL
    STABLE
    STRICT
    SECURITY INVOKER
    AS $$ SELECT * FROM
    (
        SELECT array_to_string(array_accum("##PREFIX##Languages"."languageName"), ', ') AS names FROM "##PREFIX##Languages"
        WHERE "##PREFIX##Languages"."languageId" IN
        (
            SELECT "##PREFIX##BindingLanguages"."languageId" FROM "##PREFIX##BindingLanguages" WHERE "##PREFIX##BindingLanguages"."bindingId" = $1
        )
    ) AS f WHERE f.names <> '' $$;

COMMIT;

