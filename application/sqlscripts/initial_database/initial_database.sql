CREATE TABLE RegisteredUser
(
  createDate timestamp,
  changeDate timestamp,
  userCreated varchar(30),
  userChanged varchar(30),
  
  userID serial NOT NULL,
  username varchar(30) NOT NULL,
  passwordHash character(40) NOT NULL,
  email varchar(256) NOT NULL,
  firstName varchar(50),
  lastName varchar(50),
  affiliation varchar(50),
  occupation varchar(50),
  website varchar(255),
  homeAddress varchar(255),
  active bit(1) NOT NULL,
  banned bit(1) NOT NULL,
  rank smallint NOT NULL,
  
  PRIMARY KEY (userID),
  UNIQUE (username)
);


CREATE TABLE PendingUser
(
  createDate timestamp,
  changeDate timestamp,
  userCreated varchar(30),
  userChanged varchar(30),
  
  pendingRegisteredUserID serial NOT NULL,
  confirmationCode character(20) NOT NULL,
  expirationDate date NOT NULL,
  
  FOREIGN KEY (pendingRegisteredUserID)
      REFERENCES RegisteredUser,
  UNIQUE (confirmationCode)
);

CREATE TABLE BannedRegisteredUser
(
  createDate timestamp,
  changeDate timestamp,
  userCreated varchar(30),
  userChanged varchar(30),
  
  banID serial NOT NULL,
  userID serial NOT NULL,
  description text,
  endOfBan date,
  
  PRIMARY KEY (banID),
  FOREIGN KEY (userID)
      REFERENCES RegisteredUser
);

CREATE TABLE BannedIPAddress
(
  createDate timestamp,
  changeDate timestamp,
  userCreated varchar(30),
  userChanged varchar(30),

  ipAddress bigint NOT NULL,
  description text,
  endOfBan date,
  
  PRIMARY KEY (ipAddress)
);

CREATE TABLE Permission
(
  createDate timestamp,
  changeDate timestamp,
  userCreated varchar(30),
  userChanged varchar(30),
  
  permissionID serial NOT NULL,
  actionName varchar(50) NOT NULL,
  minRank smallint NOT NULL,
  
  PRIMARY KEY (permissionID)
);



CREATE TABLE Library
(
  createDate timestamp,
  changeDate timestamp,
  userCreated varchar(30),
  userChanged varchar(30),
  
  libraryID serial NOT NULL,
  libraryName varchar(50) NOT NULL,
  libraryAddress varchar(255),
  website varchar(255),
  furtherInfo text,
  
  PRIMARY KEY (libraryID),
  UNIQUE (libraryName)
);

CREATE TABLE Binding
(
  createDate timestamp,
  changeDate timestamp,
  userCreated varchar(30),
  userChanged varchar(30),
  
  bindingID serial NOT NULL,
  libraryID serial NOT NULL,
  signature character(255) NOT NULL,
  Summary text,
  PagesToFirst integer NOT NULL,
  PagesFromLast integer NOT NULL,
  
  PRIMARY KEY (bindingID),
  FOREIGN KEY (libraryID)
      REFERENCES Library,
  UNIQUE (signature)
);

CREATE TABLE BindingLanguage
(
  createDate timestamp,
  changeDate timestamp,
  userCreated varchar(30),
  userChanged varchar(30),
  
  bindingID serial NOT NULL,
  language varchar(30) NOT NULL,
  
  PRIMARY KEY (bindingID, language),
  FOREIGN KEY (bindingID)
      REFERENCES Binding
);

CREATE TABLE Book
(
  createDate timestamp,
  changeDate timestamp,
  userCreated varchar(30),
  userChanged varchar(30),
  
  bookID serial NOT NULL,
  bindingID serial NOT NULL,
  minYear smallint NOT NULL,
  maxYear smallint NOT NULL,
  preciseDate date,
  placePublished varchar(50),
  publisher varchar(50),
  printVersion integer,
  language varchar(30) NOT NULL,
  
  PRIMARY KEY (bookID),
  FOREIGN KEY (bindingID)
      REFERENCES Binding
);

CREATE TABLE TEIFile
(
  createDate timestamp,
  changeDate timestamp,
  userCreated varchar(30),
  userChanged varchar(30),
  
  teiFileID serial NOT NULL,
  bookID serial NOT NULL,
  bindingID serial NOT NULL,
  fileName varchar(255) NOT NULL,
  contents text NOT NULL,
  
  PRIMARY KEY (teiFileID),
  FOREIGN KEY (bookID)
      REFERENCES Book
      ON DELETE SET NULL,
  FOREIGN KEY (bindingID)
      REFERENCES Binding
      ON DELETE SET NULL
);

CREATE TABLE Scan
(
  createDate timestamp,
  changeDate timestamp,
  userCreated varchar(30),
  userChanged varchar(30),
  
  scanID serial NOT NULL,
  bookID serial NOT NULL,
  pageNo integer NOT NULL,
  status smallint NOT NULL,
  
  PRIMARY KEY (scanID),
  FOREIGN KEY (bookID)
      REFERENCES Book
);

CREATE TABLE Person
(
  createDate timestamp,
  changeDate timestamp,
  userCreated varchar(30),
  userChanged varchar(30),

  personID serial NOT NULL,
  name varchar(60) NOT NULL,
  
  PRIMARY KEY (personID)
);

CREATE TABLE Author
(
  createDate timestamp,
  changeDate timestamp,
  userCreated varchar(30),
  userChanged varchar(30),

  Book serial NOT NULL,
  Author serial NOT NULL,
  
  FOREIGN KEY (Author)
    REFERENCES Person,
  FOREIGN KEY (Book)
      REFERENCES Book
);

CREATE TABLE Provenance
(
  createDate timestamp,
  changeDate timestamp,
  userCreated varchar(30),
  userChanged varchar(30),
    
  bindingID serial NOT NULL,
  personID serial NOT NULL,
  
  PRIMARY KEY (bindingID,personID),
  FOREIGN KEY (personID)
    REFERENCES Person,
  FOREIGN KEY (bindingID)
      REFERENCES Binding
);

