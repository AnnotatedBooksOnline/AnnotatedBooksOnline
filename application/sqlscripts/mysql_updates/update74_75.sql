START TRANSACTION;

-- Drop the UNIQUE constraint on signature and libraryId.
DROP INDEX `signature` ON `Bindings`;

COMMIT;
