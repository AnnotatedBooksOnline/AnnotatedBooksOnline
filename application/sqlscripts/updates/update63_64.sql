BEGIN TRANSACTION;

-- Change constraint name.

ALTER TABLE "Annotations" DROP CONSTRAINT "Annotations_userId_fkey";
    
ALTER TABLE "Annotations" ADD CONSTRAINT "Annotations_createdUserId_fkey" FOREIGN KEY ("createdUserId")
    REFERENCES "Users" ("userId") MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION;

COMMIT;
