-- Adds annotation table (currently only with transcriptions and polygons)

CREATE TABLE "Annotations"
(
    "annotationID" serial NOT NULL,
    "bookID" integer NOT NULL,
    "page" integer NOT NULL,
    "polygon" bytea NOT NULL, -- See model for format description
    "transcriptionEng" varchar,
    "transcriptionOrig" varchar,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),
    
    PRIMARY KEY ("annotationID"),
    FOREIGN KEY ("bookID")
        REFERENCES "Books"
);
