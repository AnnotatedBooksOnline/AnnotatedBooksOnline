BEGIN TRANSACTION;

-- Change register help a little bit.

UPDATE "##PREFIX##HelpParagraphs" SET "content" = '<p>
    After pressing the ''Register'' button, you will see a list of fields to fill out. All fields with a * after the description are mandatory. Some notes:
</p>

<ul>
    <li><b>Username:</b> You should enter a username of at least 6 characters. It can only contain numbers, uppercase and lowercase letters, spaces, and any of the following characters: _ . '' @ </li>
    <li><b>Email address:</b> This should be a valid email address, because a confirmation mail will be sent here.</li>
    <li><b>Password:</b> This needs to be at least 8 characters long. Please always make sure you choose a secure password, preferably something not easily guessed by others but easy to remember.</li>
</ul>

<p>
    After reading and accepting the ''<a href="#termsofuse" title="Open terms of use">terms of use</a>'', please check the checkbox and press the ''Register'' button at the bottom of the page.
</p>' WHERE "title" = 'Introduction' AND "helpPageId" = (SELECT "helpPageId" FROM "##PREFIX##HelpPages" WHERE "pageName" = 'Register');

COMMIT;
