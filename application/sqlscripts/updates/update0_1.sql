BEGIN TRANSACTION;

-- Add two forgotten primary key constraints.
ALTER TABLE "##PREFIX##Authors" ADD PRIMARY KEY ("authorId", "bookId");
ALTER TABLE "##PREFIX##PendingUsers" ADD PRIMARY KEY ("userId");

-- Add title column which I also had forgotten.
ALTER TABLE "##PREFIX##Books" ADD COLUMN title varchar(100) NOT NULL;

-- Provide more room for password hashes.
ALTER TABLE "##PREFIX##Users" ALTER "passwordHash" TYPE varchar(255);

-- Allow books to have multiple languages.
ALTER TABLE "##PREFIX##Books" DROP COLUMN "language";
ALTER TABLE "##PREFIX##BindingLanguages" DROP CONSTRAINT "##PREFIX##BindingLanguages_pkey";
ALTER TABLE "##PREFIX##BindingLanguages" ADD COLUMN "bookID" serial NOT NULL;
ALTER TABLE "##PREFIX##BindingLanguages" RENAME TO "##PREFIX##BookLanguages";
ALTER TABLE "##PREFIX##BookLanguages" ADD PRIMARY KEY ("bindingId", "bookID", "language");

COMMIT;

