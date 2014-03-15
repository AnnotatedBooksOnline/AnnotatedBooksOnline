BEGIN TRANSACTION;

-- The combination of signature and library should be unique, not just the signature.
ALTER TABLE "##PREFIX##Bindings" DROP CONSTRAINT "##PREFIX##Bindings_signature_key";
ALTER TABLE "##PREFIX##Bindings" ADD UNIQUE (signature, "libraryId");

COMMIT;
