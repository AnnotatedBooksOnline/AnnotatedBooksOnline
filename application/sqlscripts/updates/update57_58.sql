BEGIN TRANSACTION;

-- Make title longer.

ALTER TABLE "HelpParagraphs" ALTER COLUMN "title" TYPE character varying(50);

-- Insert help pages.

INSERT INTO "HelpPages" ("pageName") VALUES ('Edit profile');
INSERT INTO "HelpPages" ("pageName") VALUES ('Notes');
INSERT INTO "HelpPages" ("pageName") VALUES ('Register');
INSERT INTO "HelpPages" ("pageName") VALUES ('Search');
INSERT INTO "HelpPages" ("pageName") VALUES ('Userlist');
INSERT INTO "HelpPages" ("pageName") VALUES ('Viewer');
INSERT INTO "HelpPages" ("pageName") VALUES ('Welcome');

COMMIT;

BEGIN TRANSAcTION;

-- Insert help paragraphs, per page.

-- Edit profile.

INSERT INTO "HelpParagraphs" ("helpPageId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Edit profile'), 'Edit profile', '<p>
    In case you ever want to change your password or the personal information you entered during **Register**, simply press the ''Edit profile'' button while logged in. It will open a popup window in which you can edit your email address, first and last name, affiliation, occupation, website and password.
</p>

<p>
    In case you wish to edit your password, make sure to fill in the ''Current password'' field as well as ''New password'' (and repeating the new password in the ''Repeat password'' field). This is an extra security check.
</p>');

-- Notes.

INSERT INTO "HelpParagraphs" ("helpPageId", "actionName", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Notes'), 'manage-notebook', 'Introduction', '<p>
    The notes functionality in this website allows users to keep personal notes on things like important details, references, ideas or quotes, without having to select a text editor. Not having to change programs means that the text in the browser will not be obscured, as often happens on small screens or at lower resolutions.
</p>

<p>
    The notes are available on various pages on the website and can be found in the Workspace sidebar, on the right side of the screen. The notes are personal, which means that nobody but you can read them, and you can''t read other users'' notes. The text is synchronized between all pages: any changes in the notes section on one page will also be made in the notes on all other pages. It is the real life equivalent of a single notebook on a desk next to a pile of books: no matter what book you open on one side, it will still have the single notebook next to it, unchanged.
</p>');

INSERT INTO "HelpParagraphs" ("helpPageId", "actionName", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Notes'), 'manage-notebook', 'Adding / removing notes', '<p>
Adding notes is easy: simply click in the notes section and start typing. It works just like any other text field and supports features such as:
</p>

<ul>
    <li><b>Selecting</b></li>
    <li><b>Cut / Copy / Paste:</b> (Ctrl+X / Ctrl+C / Ctrl+V) [(Cmd+... on Mac?)]</li>
    <li><b>Moving text:</b> (select text, then left-click on the selected text and drag it to the desired position)</li>
    <li><b>Undo / Redo:</b> (Ctrl+Z / Ctrl+Y) [CHECK IF WORKS ON ALL BROWSERS / EVERY OS (Cmd+Z on Mac?)]</li>
    <li><b>Linebreaks / empty lines</b></li>
</ul>

<p>
    Some browsers have built-in spellchecking support, which (if enabled) should also work on the notes. If you wish to use this functionality, please refer to the help function of your browser to find out more.
</p>

<p>
    Keep in mind that if you add or remove anything, the changes are applied to all the pages, not just the one you are currently viewing!
</p>');

INSERT INTO "HelpParagraphs" ("helpPageId", "actionName", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Notes'), 'manage-notebook', 'Saving notes', '<p>
    The latest version of your notes are saved in the system, and will still be there next time you log in. However, it is not designed to be the safest place for all your notes. It is only meant to keep your notes visible and in reach for easy access. It is always a good idea to back up any important notes you might write frequently to a local (or online) document. Then, if something goes wrong unexpectedly and the notes are lost, you will still have access to them.
</p>');



-- Register.

INSERT INTO "HelpParagraphs" ("helpPageId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Register'), 'Introduction', '<p>
    After pressing the ''Register'' button, you will see a list of fields to fill out. All fields with a * after the description are mandatory. Some notes:
</p>

<ul>
    <li><b>Username:</b></li> You should enter a username of at least 6 characters. It can only contain numbers, uppercase and lowercase letters, spaces, and any of the following characters: _ . '' @ 
    <li><b>Email address:</b></li> This should be a valid email address, because a confirmation mail will be sent here.
    <li><b>Password:</b></li> This needs to be at least 8 characters long. Please always make sure you choose a secure password, preferably something not easily guessed by others but easy to remember.
</ul>

<p>
    After reading and accepting the ''<a href="#termsofuse" title="Open terms of use">terms of use</a>'', please check the checkbox and press the ''Register'' button at the bottom of the page.
</p>');

INSERT INTO "HelpParagraphs" ("helpPageId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Register'), 'Finalizing your registration', '<p>
    You will receive an email at the address you entered, containing a confirmation link. Please follow the link to finalize your registration. You should now be able to log in, and have access to all the features of the website.
</p>');



-- Search.

INSERT INTO "HelpParagraphs" ("helpPageId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Search'), 'Introduction', '<p>
    You can search for books by selecting what you want to limit your search to (''Author'', ''Title'', etc. or simply ''Any'') and then simply entering the search query in the textfield.
</p>

<p>
    You can add more criteria to the search by changing the ''- Select -'' dropdown box to anything else. Another line will automatically be added below.
</p>

<p>
    Removing lines is just as easy: simply either change the a dropdown box back to ''- Select -'', or press the button with the red cross on the right side of a line to remove that line.
</p>

<p>
    After setting the search criteria, simply press ''Search'' (below the search criteria) to get a list of results. If the search results are not what the user was looking for, the query can be changed and a new list of results will be generated after pressing ''Search'' again.
</p>

<p>
    For more advanced search options, please see the list of **Advanced search query notations**.
</p>');

INSERT INTO "HelpParagraphs" ("helpPageId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Search'), 'Sorting options', '<p>
    To sort the list of results, there is a set of dropdown boxes in the Advanced options sidebar on the left side of the screen. To sort the list by one attribute, simply select it in the first dropdown box, and the list should be automatically sorted. If further sorting within this already sorted list is required, select another attribute in the second dropdown box. If necessary, a third can also be added.
</p>

<p>
    If you want to invert the sorting, for instance from Z to A or 999 to 1, simply check the checkbox to the right of the sorting you want to invert. The other sorting criteria will be unaffected.
</p>');

INSERT INTO "HelpParagraphs" ("helpPageId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Search'), 'Result options', '<p>
    To change what attributes of the books in the list of search results are shown, go to the ''Result options'' in the Advanced options sidebar on the left side of the screen, below the ''**Sorting options**''. To show or hide the attributes, simply check or uncheck the checkbox in front of the corresponding attribute name.
</p>

<p>
    In this menu you can also change how many results are shown per page: simply select the preferred amount in the dropdown box.
</p>');

INSERT INTO "HelpParagraphs" ("helpPageId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Search'), 'Advanced search query notations', '<p>
    TODO
</p>');



-- Userlist

INSERT INTO "HelpParagraphs" ("helpPageId", "actionName", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Userlist'), 'view-users-part', 'Userlist', '<p>
    Logged in users can see the list of registered users by pressing the ''Users'' button. Here, you can see the public information of all the users, for example in case you want to check the correct spelling of a user''s name, or need to contact them.
</p>');



-- Viewer

INSERT INTO "HelpParagraphs" ("helpPageId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), 'Introduction', '<p>
    The viewer is used to view scans, read and add transcriptions and download the books for study offline.
</p>

<p>
    What do you want to do?
</p>
<ul>
    <li>**Zoom and rotate a page**</li>
    <li>**Go to another page**</li>
    <li>**View information about a binding** TODO</li>
    <li>**Link to a page, book or binding**</li>
    <li>**Export to pdf** </li>
    <li>**Read transcriptions of annotations** TODO</li>
    <li>**Add and edit transcriptions** TODO</li>
</ul>');

INSERT INTO "HelpParagraphs" ("helpPageId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), 'Basic viewer functionalities', '<p>
    What do you want to do?
</p>

<ul>
    <li>**Zoom in**</li>
    <li>**Zoom out**</li>
    <li>**Move the page**</li>
    <li>**Rotate**</li>
    <li>**Reset the view**</li>
</ul>');

INSERT INTO "HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE 'title' = 'Basic viewer functionalities'), 'Zoom in', '<p>
    When the page is first displayed in the viewer, it sits in a standard zoom, the whole page is visible on the screen. To get a better view of the page and details you are interested in, you can zoom in.
</p>
<p>
    There are several ways of zooming in:
</p>
<ul>
    <li><b>Zoom slider</b>
        <ul>
            <li>Grab the zoom slider and move it to the right.</li>
            <li>When the slider is all the way to the right, the page is at its maximum zoom.</li>
            <li>The center of the view will not change.</li>  
        </ul>
    </li>
    <li><b>Mouse scroll wheel</b>
        <ul>
            <li>Scroll forward with the mouse scroll wheel.</li>
            <li>The center of the view will be moved in the direction of the mouse.</li>
        </ul>
    </li>
    <li><b>Double clicking</b>
        <ul>
            <li>Double click in the page on the part you want to zoom in on.</li>
            <li>The place that was double clicked will become the new center of the view.</li>
        </ul>
    </li>
    <li><b>Numpad +</b>
        <ul>
            <li>Press the numpad + to zoom in.</li>
        </ul>
    </li>
</ul>
<p>
    The center of the view, is the part of the page that is in the middle of the viewer.
</p>
<p>
    <b>Tip:</b> You can also change the zoom by clicking on the bar of the zoom slider. The slider will be moved to that point and the zoom adjusted accordingly.</p>
</p>');

INSERT INTO "HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE 'title' = 'Basic viewer functionalities'), 'Zoom out', '<p>
    To undo zooming in, there is zooming out.
</p>
<p>
    There are three ways of zooming out:
</p>
<ul>
    <li><b>Zoom slider</b>
        <ul>
            <li>Grab the zoom slider and move it to the right.</li>
            <li>When the slider is all the way to the right, the page is at its maximum zoom.</li>
            <li>The center of the view will not change.</li>  
        </ul>
    </li>
    <li><b>Mouse scroll wheel</b>
        <ul>
            <li>Scroll backward with the mouse scroll wheel.</li>
        </ul>
    </li>
    <li><b>Numpad -</b>
        <ul>
            <li>Press the numpad - to zoom in.</li>
        </ul>
    </li>
</ul>
<p>
    The center of the view, is the part of the page that is in the middle of the viewer.
</p>
<p>
    <b>Tip:</b> You can also reset the zoom and rotation with the **reset the view** function.
</p>');

INSERT INTO "HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE 'title' = 'Basic viewer functionalities'), 'Move across page', '<p>
    There are two ways to move the view of a page:
</p>
<ul>
    <li><b>Drag with the mouse</b>
    <ol>
        <li>Click and hold inside the viewer.</li>
        <li>Drag the mouse to move the page.</li>
    </ol>
    </li>
    <li><b>Move with the keyboard</b>
    <ul>
        <li><b>Numpad 8:</b> moves the view up.</li>
        <li><b>Numpad 2:</b> moves the view down.</li>
        <li><b>Numpad 4:</b> moves the view to the left.</li>
        <li><b>Numpad 6:</b> moves the view to the right.</li>
    </ul>
    </li>
</ul>
<p>
    <b>Tip:</b> The navigation box displays a red square on the page thumbnail of the current page, showing where you are.
</p>');

INSERT INTO "HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE 'title' = 'Basic viewer functionalities'), 'Rotate', '<p>
    There are two types of rotation. The crude rotation with buttons, from the buttons bar, and the more refined mouse rotation, which allows for very precise rotating.
</p>
<ul>
    <li><b>Buttons rotation</b>
    <ul>
        <li><b>Left rotate button:</b> rotates the page 45 degrees to the left.</li>
        <li><b>Right rotate button:</b> rotates the page 45 degrees to the right.</li>
    </ul>
    </li>
    <li><b>Mouse rotation</b>
    <ol>
        <li>Press and hold the spacebar.</li>
        <li>Click and hold inside the viewer.</li>
        <li>Drag the mouse to a side to rotate.</li>
        <li>Release the mouse and spacebar when you are done rotating.</li>
    </ol>
    </li>
</ul>
<p>
    When rotating, the center of the view is not changed.
</p>
<p>
    <b>Tips:</b>
</p>
<ul>
    <li>The navigation box displays a red square on the page thumbnail of the current page, showing where you are.</li>
    <li>When you want to set the page straight again, you can use the **reset the view** function to easely undo the rotation and zooming.</li>
</ul>');

INSERT INTO "HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE 'title' = 'Basic viewer functionalities'), 'Reset the view', '<p>
    Reset the view is used to undo zooming and rotating. It restores the page to the view it was first presented in.
</p>
<p>
    There are two ways to activate this function:
</p>
<ul>
    <li>Click the reset view button on the buttons bar, to the right of the last page button.</li>
    <li>Press the home key on your keyboard.</li>
</ul>');

INSERT INTO "HelpParagraphs" ("helpPageId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), 'Go to another page', '<p>
    Where in the binding do you want to go?
</p>
<ul>
    <li>**Previous page**</li>
    <li>**Next page**</li>
    <li>**First page**</li>
    <li>**Start of a book**</li>
    <li>**Last page**</li>
    <li>**Certain page number**</li>
    <li>**Select a page**</li>
</ul>');

INSERT INTO "HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE 'title' = 'Go to another page'), 'Previous page', '<p>
    To go to the previous page:
</p>
<ul>
    <li>Click the previous page button in the buttons bar.</li>
</ul>
<p>
    The previous page is not the page viewed before the current page, but the page that comes before the current page.
</p>
<p>
    The button is to the left of the textfield displaying the current page number. This function is only available if there is a previous page to go to.
</p>');

INSERT INTO "HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE 'title' = 'Go to another page'), 'Next page', '<p>
    To go to the next page:
</p>
<ul>
    <li>Click the next page button in the buttons bar.</li>
</ul>
<p>
    The button is to the right of the textfield displaying the current page number. This function is only availeble if there is a next page.
</p>');

INSERT INTO "HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE 'title' = 'Go to another page'), 'First page', '<p>
    With an easy press of a button, you can go straight to the first page in the binding.
</p>
<ul>
    <li>Click the first page button to go to the first page.</li>
</ul>
<p>
    The first page button is on the buttons bar, to the left of the next page button. This function is unavailable if the first page is already being displayed in the viewer.
</p>');

INSERT INTO "HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE 'title' = 'Go to another page'), 'Start of a book', '<p>
    You can go to the first page of a book through the book informatiion box.
</p>
<ul>
    <li>Open the book information box in the information sidebar to the left.</li>
    <li>Click on the page number displayed beneath the title of the book you want to go to.</li>
</ul>');

INSERT INTO "HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE 'title' = 'Go to another page'), 'Last page', '<p>
    You can skip straight to the end of the binding.
</p>
<ul>
    <li>Click the last page button to go to the last page.</li>
</ul>
<p>
    The last page button is on the buttons bar, to the right of the next page button. This function is unavaileble if the last page is already being displayed.
</p>');

INSERT INTO "HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE 'title' = 'Go to another page'), 'Certain page number', '<p>
    To directly go to a certain page:
</p>
<ol>
    <li>Enter the page number in the page number textfield.</li>
    <li>Press the enter key to load the requested page in the viewer.</li>
</ol>
<p>
    The page number textfield is found on the buttons bar in the viewer. It displays the page number of the currently being displayed page.
</p>
<p>    
    Do note that the page number used in the system may not be equivalent to the page number in the real book. The number represents the numeration of the scans. Extra scans, like the cover, or scans displaying two pages, effect the numbering.
</p>
<p>
    <b>Tip:</b>  You can also **select a page** in the book navigation box. This way, you can see wether the page is the one you are looking for.
</p>');

INSERT INTO "HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), (SELECT "helpParagraphId" FROM "HelpParagraphs" WHERE 'title' = 'Go to another page'), 'Select a page', '<p>
    To quickly flip to a page that looks interesting, you can use the navigation box in the information sidebar.
</p>
<ol>
    <li>Open the navigation box in the information sidebar to the right in the viewer.</li>
    <li>Find the page in the navigation box.</li>
    <li>Click the page and it is displayed in the viewer.</li>
</ol>
<p>
    <b>Tip:</b> Also note that the currently being viewed page has a red border marking the part of the page visible in the viewer.
</p>');

INSERT INTO "HelpParagraphs" ("helpPageId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Viewer'), 'Link to a page, book or binding', '<p>
    For referencing to a certain page, book or binding, there is the reference box in the information sidebar, which supplies links to each of these.
</p>

<ul>
    <li><b>Link to this binding:</b> supplies a link to the first page of the binding.</li>
    <li><b>Link to this book:</b> supplies a link to the first page of the book you are currently in.</li>
    <li><b>Link to this page:</b> supplies a link to the page currently being displayed in the viewer.</li>
</ul>

<p>
    To take the link out of the system, you need to copy and paste it:
</p>

<ol>
    <li>Open the reference box in the information sidebar.</li>
    <li>Click on the field of the link.</li>
    <li>Press ctrl + c to copy the link or rightclick on the field (with the link selected) and click on copy in the menu.</li>
    <li>You can now past the link. This can be anywhere you want, including outside the system.</li>
</ol>

<p>
    <b>Tip:</b> When linking to a resource on the internet, don''t forget the resource can change or be deleted. If you want a secure copy of the page and transcriptions, you should **export to pdf**.
</p>');




-- Welcome

INSERT INTO "HelpParagraphs" ("helpPageId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Welcome'), 'Introduction', '<ul>
    <li>All main functionality on this website is accessed through the **buttons** at the top of the page.</li>
    <li>The buttons will open new tabs, which will show up below the buttons. Click on them to open the page, or press the small ''x'' in the corner of a tab to close that tab.</li>
    <li>As a guest, you will see only a few buttons. Registered users will have more permission, and once logged in will be able to see and click on more buttons to access additional functions. It is therefore recommended to start out by **Register**, although registration is not needed for simply viewing the books.</li>
    <li>If you ever need help, simply press the ''Help'' button. It should open with information related to the page you were on while pressing the button.</li>
    <li>Many pages have sidebars: these contain extra functionality and information for content on the current page. Pressing the arrow button at the top right of these sidebars will fold them away, or show them again. On some screens, you can change the width of shown sidebars by left-clicking on the edge and dragging it left or right.</li>
</ul>');

INSERT INTO "HelpParagraphs" ("helpPageId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Welcome'), 'Buttons', '<p>
    The following is a short explanation on all the buttons. Some of these are only available and visible to logged in users. Click on the links for further details.
</p>

<ul>
    <li><b>**Search**:</b> This is used to find and open books for reading.</li>
    <li><b>**Upload**:</b> Uploading new books can be done by pressing this button and following the instructions.</li>
    <li><b>**Info**:</b> For more information on what this website is about and its background, click here.</li>
    <li><b>**Help**:</b> Opens the help functionality. It will automatically open on the subject related to the type of page you are currently viewing.</li>
    <li><b>**Users**:</b> [under **User Profile**] Shows the list of registered users.</li>
    <li><b>**Register**:</b> Used for registering a new account.</li>
    <li><b>**Login / Logout**:</b> Logged in users will see ''Logout'', otherwise you will see ''Login''. Used to enter your account and access all functionality.</li>
    <li><b>Forgot password?:</b> TODO</li>
    <li><b>**Edit profile**:</b> [under **User Profile**] To change your personal information or password.</li>
</ul>');

INSERT INTO "HelpParagraphs" ("helpPageId", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Welcome'), 'Login / logout', '<ul>
    <li><b>Login:</b> To log in, first you need to **Register**. Once you have finished registration, simply press the button saying ''Login'', enter your username and password, and press ''Login''.</li>
    <li><b>Logout:</b> To log out, simply press the ''Logout'' button, which replaces the ''Log in'' button while you are logged in.</li>
</ul>');

INSERT INTO "HelpParagraphs" ("helpPageId", "actionName", "title", "content") VALUES ((SELECT "helpPageId" FROM "HelpPages" WHERE "pageName" = 'Welcome'), 'change-global-settings', 'Admin help page', '<p>
    There is also an explanation for admins, available on **Admin**.
</p>');



COMMIT;