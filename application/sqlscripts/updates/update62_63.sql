BEGIN TRANSACTION;

ALTER TABLE "Annotations" ADD COLUMN "changedUserId" integer;
ALTER TABLE "Annotations" ADD COLUMN "timeChanged" timestamp without time zone;

UPDATE "Annotations" SET "changedUserId" = "userId";
ALTER TABLE "Annotations" ALTER COLUMN "changedUserId" SET NOT NULL;
ALTER TABLE "Annotations" RENAME COLUMN "userId" TO "createdUserId";

ALTER TABLE "Annotations" ADD CONSTRAINT "Annotations_changedUserId_fkey" FOREIGN KEY ("userId")
    REFERENCES "Users" ("userId") MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION;

COMMIT;
