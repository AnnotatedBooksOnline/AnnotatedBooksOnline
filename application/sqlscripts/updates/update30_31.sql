BEGIN TRANSACTION;

-- Notes, bookmarks and pendingusers belonging to a user that is being deleted should be deleted as well.
ALTER TABLE "##PREFIX##Bookmarks" DROP CONSTRAINT "##PREFIX##Bookmarks_userId_fkey";
ALTER TABLE "##PREFIX##Bookmarks" ADD FOREIGN KEY ("userId") REFERENCES "##PREFIX##Users" ON DELETE CASCADE;

ALTER TABLE "##PREFIX##Notes" DROP CONSTRAINT "##PREFIX##Notes_userId_fkey";
ALTER TABLE "##PREFIX##Notes" ADD FOREIGN KEY ("userId") REFERENCES "##PREFIX##Users" ON DELETE CASCADE;

ALTER TABLE "##PREFIX##PendingUsers" DROP CONSTRAINT "##PREFIX##PendingUsers_userId_fkey";
ALTER TABLE "##PREFIX##PendingUsers" ADD FOREIGN KEY ("userId") REFERENCES "##PREFIX##Users" ON DELETE CASCADE;

ALTER TABLE "##PREFIX##Shelves" DROP CONSTRAINT "##PREFIX##Shelves_userId_fkey";
ALTER TABLE "##PREFIX##Shelves" ADD FOREIGN KEY ("userId") REFERENCES "##PREFIX##Users" ON DELETE CASCADE;

COMMIT;
