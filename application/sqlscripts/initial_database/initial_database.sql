CREATE TABLE "User"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" varchar(30),
  "UserChanged" varchar(30),
  
  "UserID" serial NOT NULL,
  "Username" varchar(30) NOT NULL,
  "PasswordHash" character(40) NOT NULL,
  "EmailAddress" varchar(256) NOT NULL,
  "FirstName" varchar(50),
  "LastName" varchar(50),
  "Affiliation" varchar(50),
  "Occupation" varchar(50),
  "Website" varchar(255),
  "HomeAddress" varchar(255),
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
  "UserCreated" varchar(30),
  "UserChanged" varchar(30),
  
  "UserPending" serial NOT NULL,
  "ConfirmationCode" character(20) NOT NULL,
  "ExpirationDate" date NOT NULL,
  
  FOREIGN KEY ("UserPending")
      REFERENCES "User",
  UNIQUE ("ConfirmationCode")
);

CREATE TABLE "BannedUser"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" varchar(30),
  "UserChanged" varchar(30),
  
  "UserBanned" serial NOT NULL,
  "Description" text,
  "EndOfBan" date,
  
  FOREIGN KEY ("UserBanned")
      REFERENCES "User"
);

CREATE TABLE "BannedIPAddress"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" varchar(30),
  "UserChanged" varchar(30),

  "IPAddress" bigint NOT NULL,
  "Description" text,
  "EndOfBan" date,
  
  PRIMARY KEY ("IPAddress")
);

CREATE TABLE "Permission"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" varchar(30),
  "UserChanged" varchar(30),
  
  "PermissionID" serial NOT NULL,
  "ActionName" varchar(50) NOT NULL,
  "MinRank" smallint NOT NULL,
  
  PRIMARY KEY ("PermissionID")
);



CREATE TABLE "Library"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" varchar(30),
  "UserChanged" varchar(30),
  
  "LibraryID" serial NOT NULL,
  "LibraryName" varchar(50) NOT NULL,
  "LibraryAddress" varchar(255),
  "Website" varchar(255),
  "FurtherInfo" text,
  
  PRIMARY KEY ("LibraryID"),
  UNIQUE ("LibraryName")
);

CREATE TABLE "Binding"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" varchar(30),
  "UserChanged" varchar(30),
  
  "BindingID" integer NOT NULL,
  "Library" serial NOT NULL,
  "Signature" character(255) NOT NULL,
  "Languages" varchar(255),
  "Summary" text,
  "PagesToFirst" integer NOT NULL,
  "PagesFromLast" integer NOT NULL,
  
  PRIMARY KEY ("BindingID"),
  FOREIGN KEY ("Library")
      REFERENCES "Library",
  UNIQUE ("Signature")
);

CREATE TABLE "Book"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" varchar(30),
  "UserChanged" varchar(30),
  
  "BookID" serial NOT NULL,
  "Binding" serial NOT NULL,
  "MinYear" smallint NOT NULL,
  "MaxYear" smallint NOT NULL,
  "PreciseDate" date,
  "PlacePublished" varchar(50),
  "Publisher" varchar(50),
  "PrintVersion" integer,
  "Language" varchar(30) NOT NULL,
  
  PRIMARY KEY ("BookID"),
  FOREIGN KEY ("Binding")
      REFERENCES "Binding"
);

CREATE TABLE "TEIFile"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" varchar(30),
  "UserChanged" varchar(30),
  
  "TEIFileID" serial NOT NULL,
  "Book" serial,
  "Binding" serial,
  "FileName" varchar(255) NOT NULL,
  "Contents" text NOT NULL,
  
  PRIMARY KEY ("TEIFileID"),
  FOREIGN KEY ("Book")
      REFERENCES "Book"
      ON DELETE SET NULL,
  FOREIGN KEY ("Binding")
      REFERENCES "Binding"
      ON DELETE SET NULL
);

CREATE TABLE "Scan"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" varchar(30),
  "UserChanged" varchar(30),
  
  "ScanID" serial NOT NULL,
  "Book" serial NOT NULL,
  "PageNo" integer NOT NULL,
  "Status" smallint NOT NULL,
  "TileSetID" integer NOT NULL,
  "FullScanID" integer NOT NULL,
  "Thumbnail" bytea,
  
  PRIMARY KEY ("ScanID"),
  FOREIGN KEY ("Book")
      REFERENCES "Book",
  UNIQUE ("TileSetID"),
  UNIQUE ("FullScanID")
);

CREATE TABLE "Person"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" varchar(30),
  "UserChanged" varchar(30),

  "PersonID" serial NOT NULL,
  "StdFirstName" varchar(50),
  "StdLastName" varchar(50),
  "StdLastNamePrefix" varchar(20),
  
  PRIMARY KEY ("PersonID")
);

CREATE TABLE "AlternativeName"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" varchar(30),
  "UserChanged" varchar(30),

  "Person" serial NOT NULL,
  "FirstName" varchar(50),
  "LastName" varchar(50),
  "LastNamePrefix" varchar(20),
  
  FOREIGN KEY ("Person")
      REFERENCES "Person" ("PersonID")
);

CREATE TABLE "Author"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" varchar(30),
  "UserChanged" varchar(30),

  "Book" serial NOT NULL,
  "Author" serial NOT NULL,
  
  FOREIGN KEY ("Author")
    REFERENCES "Person",
  FOREIGN KEY ("Book")
      REFERENCES "Book"
);

CREATE TABLE "Provenance"
(
  "CreateDate" timestamp,
  "ChangeDate" timestamp,
  "UserCreated" varchar(30),
  "UserChanged" varchar(30),
    
  "Binding" serial NOT NULL,
  "Person" serial NOT NULL,
  
  FOREIGN KEY ("Person")
    REFERENCES "Person",
  FOREIGN KEY ("Binding")
      REFERENCES "Binding"
);

