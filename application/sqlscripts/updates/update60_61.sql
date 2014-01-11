BEGIN TRANSACTION;

--Add types
ALTER TABLE "##PREFIX##HelpPages" ADD COLUMN "helpType" varChar(30);

UPDATE "##PREFIX##HelpPages" SET "helpType" = 'viewprofile' WHERE "pageName" = 'Edit profile';
UPDATE "##PREFIX##HelpPages" SET "helpType" = 'register' WHERE "pageName" = 'Register';
UPDATE "##PREFIX##HelpPages" SET "helpType" = 'search' WHERE "pageName" = 'Search';
UPDATE "##PREFIX##HelpPages" SET "helpType" = 'users' WHERE "pageName" = 'Userlist';
UPDATE "##PREFIX##HelpPages" SET "helpType" = 'binding' WHERE "pageName" = 'Viewer';
UPDATE "##PREFIX##HelpPages" SET "helpType" = 'welcome' WHERE "pageName" = 'Welcome';

--Add a few links
UPDATE "##PREFIX##HelpParagraphs" SET "content" = '<p>
    In case you ever want to change your password or the personal information you entered during 

**Register||Register**, simply press the ''Edit profile'' button while logged in. It will open a popup window 

in which you can edit your email address, first and last name, affiliation, occupation, website and password.
</p>

<p>
    In case you wish to edit your password, make sure to fill in the ''Current password'' field as well as 

''New password'' (and repeating the new password in the ''Repeat password'' field). This is an extra security 

check.
</p>' WHERE "title" = 'Edit profile' AND "helpPageId" = (SELECT "helpPageId" FROM "##PREFIX##HelpPages" WHERE "pageName" 

= 'Edit profile');

UPDATE "##PREFIX##HelpParagraphs" SET "content" = '<p>
    The viewer is used to view scans, read and add transcriptions and download the books for study offline.
</p>

<p>
    What do you want to do?
</p>
<ul>
    <li>**Zoom and rotate a page**</li>
    <li>**Go to another page||Viewer/Go to another page**</li>
    <li>**View information about a binding** TODO</li>
    <li>**Link to a page, book or binding||Viewer/Link to a page, book or binding**</li>
    <li>**Export to pdf** </li>
    <li>**Read transcriptions of annotations** TODO</li>
    <li>**Add and edit transcriptions** TODO</li>
</ul>' WHERE "title" = 'Introduction' AND "helpPageId" = (SELECT "helpPageId" FROM "##PREFIX##HelpPages" WHERE 

"pageName" = 'Viewer');

COMMIT;
