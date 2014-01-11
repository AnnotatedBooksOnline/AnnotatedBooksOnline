-- Change way page number ranges are represented, now by book instead of by binding.

BEGIN TRANSACTION;

-- These columns should probably be dropped altogheter, but we'll keep them for now.
ALTER TABLE "##PREFIX##Bindings" ALTER COLUMN "pagesToFirst" DROP NOT NULL;
ALTER TABLE "##PREFIX##Bindings" ALTER COLUMN "pagesFromLast" DROP NOT NULL;

ALTER TABLE "##PREFIX##Books" ADD COLUMN "firstPage" integer;
ALTER TABLE "##PREFIX##Books" ADD COLUMN "lastPage" integer;

COMMIT;
