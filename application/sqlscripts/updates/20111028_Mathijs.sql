
CREATE TABLE UserT (
	tsCreated timestamp,
	tsChanged timestamp,
	userCreated VARCHAR(30),
	userChanged VARCHAR(30),
	
	userId SERIAL,
    username VARCHAR(30),
    password VARCHAR(30),
    firstName VARCHAR(30),
    lastName VARCHAR(30),
	
	primary key(userId)
); 