BEGIN TRANSACTION;

-- The combination of signature and library should be unique, not just the signature.
ALTER TABLE "Bindings" DROP CONSTRAINT "Bindings_signature_key";
ALTER TABLE "Bindings" ADD UNIQUE (signature, "libraryId");

COMMIT;
