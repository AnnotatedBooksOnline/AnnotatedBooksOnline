
-- Add two forgotten primary key constraints.
ALTER TABLE "Authors" ADD PRIMARY KEY ("authorId", "bookId");
ALTER TABLE "PendingUsers" ADD PRIMARY KEY ("userId");

-- Allow books to have multiple languages.
ALTER TABLE "Books" DROP COLUMN "language";
ALTER TABLE "BindingLanguages" DROP CONSTRAINT "BindingLanguages_pkey";
ALTER TABLE "BindingLanguages" ADD COLUMN "bookID" serial NOT NULL;
ALTER TABLE "BindingLanguages" RENAME TO "BookLanguages";
ALTER TABLE "BookLanguages" ADD PRIMARY KEY ("bindingId", "bookID", "language");
