BEGIN TRANSACTION;

-- Adds a userId and timestamp to annotations. Old annotation entries will have the dummy deleted user as their creator and a NULL timestamp.
ALTER TABLE "Annotations" ADD COLUMN "userId" integer;
ALTER TABLE "Annotations" ADD COLUMN "timeCreated" timestamp without time zone;

UPDATE "Annotations" SET "userId" = (SELECT "userId" FROM "Users" WHERE "username" = '<deleted user>') WHERE "userId" IS NULL;
ALTER TABLE "Annotations" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Annotations" ADD FOREIGN KEY ("userId") REFERENCES "Users";

COMMIT;
