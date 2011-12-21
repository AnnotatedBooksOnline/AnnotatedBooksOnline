-- Change way page number ranges are represented, now by book instead of by binding.

BEGIN TRANSACTION;

-- These columns should probably be dropped altogheter, but we'll keep them for now.
ALTER TABLE "Bindings" ALTER COLUMN "pagesToFirst" DROP NOT NULL;
ALTER TABLE "Bindings" ALTER COLUMN "pagesFromLast" DROP NOT NULL;

ALTER TABLE "Books" ADD COLUMN "firstPage";
ALTER TABLE "Books" ADD COLUMN "lastPage";

COMMIT;
