BEGIN TRANSACTION;

ALTER TABLE "##PREFIX##Annotations" ADD COLUMN "changedUserId" integer;
ALTER TABLE "##PREFIX##Annotations" ADD COLUMN "timeChanged" timestamp without time zone;

UPDATE "##PREFIX##Annotations" SET "changedUserId" = "userId";
ALTER TABLE "##PREFIX##Annotations" ALTER COLUMN "changedUserId" SET NOT NULL;
ALTER TABLE "##PREFIX##Annotations" RENAME COLUMN "userId" TO "createdUserId";

ALTER TABLE "##PREFIX##Annotations" ADD CONSTRAINT "##PREFIX##Annotations_changedUserId_fkey" FOREIGN KEY ("changedUserId")
    REFERENCES "##PREFIX##Users" ("userId") MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION;

COMMIT;
