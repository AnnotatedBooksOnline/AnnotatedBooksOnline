BEGIN TRANSACTION;

-- Widens the confirmation code somewhat so an MD5 hash can fit in.

ALTER TABLE "##PREFIX##PendingUsers" ALTER "confirmationCode" TYPE character(32);


-- Add an identifier for PendingUsers, make userId unique instead of primary key.
ALTER TABLE "##PREFIX##PendingUsers" DROP CONSTRAINT "##PREFIX##PendingUsers_pkey";
ALTER TABLE "##PREFIX##PendingUsers" ADD COLUMN "pendingUserId" serial NOT NULL;
ALTER TABLE "##PREFIX##PendingUsers" ADD PRIMARY KEY ("pendingUserId");
ALTER TABLE "##PREFIX##PendingUsers" ADD UNIQUE ("userId");

COMMIT;

