-- Widens the confirmation code somewhat so an MD-5 hash can fit in.

ALTER TABLE "PendingUsers" ALTER "confirmationCode" TYPE character(32);
