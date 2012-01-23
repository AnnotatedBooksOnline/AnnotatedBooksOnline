BEGIN TRANSACTION;

CREATE OR REPLACE FUNCTION Books_Bindings_Update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN NEW := OLD; END IF;
    IF TG_OP = 'INSERT' THEN OLD := NEW; END IF;
    IF OLD."bindingId" != NEW."bindingId" THEN
        UPDATE "Books"
            SET "bindingId" = "bindingId"
            WHERE "bindingId" = NEW."bindingId";
    END IF;
    UPDATE "Books"
        SET "bindingId" = "bindingId"
        WHERE "bindingId" = OLD."bindingId";
    RETURN NULL;
END; $$;

COMMIT;

