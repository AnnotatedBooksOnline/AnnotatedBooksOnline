BEGIN TRANSACTION;

-- Adds a userId and timestamp to annotations. Old annotation entries will have the dummy deleted user as their creator and a NULL timestamp.
ALTER TABLE "##PREFIX##Annotations" ADD COLUMN "userId" integer;
ALTER TABLE "##PREFIX##Annotations" ADD COLUMN "timeCreated" timestamp without time zone;

UPDATE "##PREFIX##Annotations" SET "userId" = (SELECT "userId" FROM "##PREFIX##Users" WHERE "username" = '<deleted user>') WHERE "userId" IS NULL;
ALTER TABLE "##PREFIX##Annotations" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "##PREFIX##Annotations" ADD FOREIGN KEY ("userId") REFERENCES "##PREFIX##Users";

COMMIT;
