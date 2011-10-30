
CREATE TABLE "User"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" character varying(30),
  "UserChanged" character varying(30),
  
  "UserID" serial NOT NULL,
  "Username" character varying(30) NOT NULL,
  "PasswordHash" character(40) NOT NULL,
  "EmailAddress" character varying(256) NOT NULL,
  "FirstName" character varying(50),
  "LastName" character varying(50),
  "Affiliation" character varying(50),
  "Occupation" character varying(50),
  "Website" character varying(255),
  "HomeAddress" character varying(255),
  "Active" bit(1) NOT NULL,
  "Banned" bit(1) NOT NULL,
  "Rank" smallint NOT NULL,
  
  PRIMARY KEY ("UserID"),
  UNIQUE ("Username")
);


CREATE TABLE "PendingUser"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" character varying(30),
  "UserChanged" character varying(30),
  
  "UserPending" serial NOT NULL,
  "ConfirmationCode" character(20) NOT NULL,
  "ExpirationDate" date NOT NULL,
  
  FOREIGN KEY ("UserPending")
      REFERENCES "User" ("UserID")
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  UNIQUE ("ConfirmationCode")
);

CREATE TABLE "BannedUser"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" character varying(30),
  "UserChanged" character varying(30),
  
  "UserBanned" serial NOT NULL,
  "Description" text,
  "EndOfBan" date,
  
  FOREIGN KEY ("UserBanned")
      REFERENCES "User" ("UserID")
      ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE "BannedIPAddress"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" character varying(30),
  "UserChanged" character varying(30),

  "IPAddress" bigint NOT NULL,
  "Description" text,
  "EndOfBan" date,
  
  PRIMARY KEY ("IPAddress")
);

CREATE TABLE "Permission"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" character varying(30),
  "UserChanged" character varying(30),
  
  "PermissionID" serial NOT NULL,
  "ActionName" character varying(50) NOT NULL,
  "MinRank" smallint NOT NULL,
  
  PRIMARY KEY ("PermissionID")
);
