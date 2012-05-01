SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

-- DROP DATABASE test;
-- CREATE DATABASE test CHARACTER SET utf8 COLLATE utf8_unicode_ci;
-- USE test;
USE abo;

delimiter $$

CREATE FUNCTION splitspaces(document text, pos integer)
    RETURNS text
    DETERMINISTIC
    BEGIN
        IF pos > LENGTH(document) - LENGTH(REPLACE(document, ' ', '')) + 1
            THEN RETURN NULL;
            ELSE RETURN REPLACE(SUBSTRING(SUBSTRING_INDEX(document, ' ', pos), LENGTH(SUBSTRING_INDEX(document, ' ', pos - 1)) + 1), ' ', '');
        END IF;
    END $$

CREATE FUNCTION headline(document text, query text, num integer)
    RETURNS text
    DETERMINISTIC
    BEGIN
        DECLARE x integer;
        DECLARE word text;
        DECLARE y integer;
        DECLARE simplequery text;
        DECLARE maxpos integer;
        DECLARE maxval float;
        DECLARE val float;
        DECLARE tmp float;
        DECLARE result text;
        
        SET simplequery = REPLACE(query, '+', '');
        CREATE TEMPORARY TABLE fts_tmp_table (
            pos integer,
            txt text,
            score float DEFAULT 0,
            PRIMARY KEY (pos)
        ) ENGINE=MyISAM;
        SET x = 0;
        REPEAT
            SET x = x + 1;
            SET word = splitspaces(document, x);
            IF word IS NOT NULL
                THEN INSERT INTO fts_tmp_table SET pos = x, txt = word;
            END IF;
        UNTIL word IS NULL
        END REPEAT;
        UPDATE fts_tmp_table SET score = MATCH(txt) AGAINST (simplequery IN BOOLEAN MODE);
        SET y = 1;
        SET val = 0;
        SET maxval = 0;
        SET maxpos = 0;
        REPEAT
            SELECT score FROM fts_tmp_table WHERE pos = y INTO tmp;
            SET val = val + tmp * num;
            IF val > maxval
                THEN SET maxval = val, maxpos = y;
            ELSEIF val >= 1
                THEN SET val = val - 1;
            END IF;
            SET y = y + 1;
        UNTIL y >= x
        END REPEAT;
        IF maxpos <= num
            THEN SET maxpos = 1;
            ELSE SET maxpos = maxpos - num + 1;
        END IF;
        UPDATE fts_tmp_table SET txt = CONCAT('<b>', txt, '</b>') WHERE score > 0;
        SELECT GROUP_CONCAT(txt SEPARATOR ' ') FROM fts_tmp_table WHERE pos >= maxpos AND pos < maxpos + num INTO result;
        DROP TEMPORARY TABLE fts_tmp_table;
        RETURN result;
    END $$

CREATE FUNCTION fulltextsearch(document text, query text)
    RETURNS float
    DETERMINISTIC
    BEGIN
        DECLARE result float;
        CREATE TEMPORARY TABLE fulltext_tmp_table ENGINE=MyISAM AS (SELECT document AS doc);
        SELECT MATCH (doc) AGAINST (query IN BOOLEAN MODE) FROM fulltext_tmp_table INTO result;
        DROP TEMPORARY TABLE fulltext_tmp_table;
        RETURN result;
    END $$

delimiter ;
