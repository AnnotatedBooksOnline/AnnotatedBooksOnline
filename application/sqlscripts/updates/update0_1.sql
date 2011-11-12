
-- Add two forgotten primary key constraints.
ALTER TABLE "Authors" ADD PRIMARY KEY ("authorId", "bookId");
ALTER TABLE "PendingUsers" ADD PRIMARY KEY ("userId");

-- Add title column which I also had forgotten.
ALTER TABLE "Books" ADD COLUMN title varchar(100) NOT NULL;

-- Provide more room for password hashes.
ALTER TABLE "Users" ALTER "passwordHash" TYPE varchar(255);

-- Allow books to have multiple languages.
ALTER TABLE "Books" DROP COLUMN "language";
ALTER TABLE "BindingLanguages" DROP CONSTRAINT "BindingLanguages_pkey";
ALTER TABLE "BindingLanguages" ADD COLUMN "bookID" serial NOT NULL;
ALTER TABLE "BindingLanguages" RENAME TO "BookLanguages";
ALTER TABLE "BookLanguages" ADD PRIMARY KEY ("bindingId", "bookID", "language");
