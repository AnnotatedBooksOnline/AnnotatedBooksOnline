BEGIN TRANSACTION;

-- Notes, bookmarks and pendingusers belonging to a user that is being deleted should be deleted as well.
ALTER TABLE "Bookmarks" DROP CONSTRAINT "Bookmarks_userId_fkey";
ALTER TABLE "Bookmarks" ADD FOREIGN KEY ("userId") REFERENCES "Users" ON DELETE CASCADE;

ALTER TABLE "Notes" DROP CONSTRAINT "Notes_userId_fkey";
ALTER TABLE "Notes" ADD FOREIGN KEY ("userId") REFERENCES "Users" ON DELETE CASCADE;

ALTER TABLE "PendingUsers" DROP CONSTRAINT "PendingUsers_userId_fkey";
ALTER TABLE "PendingUsers" ADD FOREIGN KEY ("userId") REFERENCES "Users" ON DELETE CASCADE;

ALTER TABLE "Shelves" DROP CONSTRAINT "Shelves_userId_fkey";
ALTER TABLE "Shelves" ADD FOREIGN KEY ("userId") REFERENCES "Users" ON DELETE CASCADE;

COMMIT;
