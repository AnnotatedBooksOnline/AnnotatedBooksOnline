BEGIN TRANSACTION;

-- Change constraint name.

ALTER TABLE "##PREFIX##Annotations" DROP CONSTRAINT "##PREFIX##Annotations_userId_fkey";
    
ALTER TABLE "##PREFIX##Annotations" ADD CONSTRAINT "##PREFIX##Annotations_createdUserId_fkey" FOREIGN KEY ("createdUserId")
    REFERENCES "##PREFIX##Users" ("userId") MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION;

COMMIT;
