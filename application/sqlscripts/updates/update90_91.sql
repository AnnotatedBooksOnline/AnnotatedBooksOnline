SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

DELETE FROM ##PREFIX##HelpContents WHERE helpParagraphId IN (1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 15, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 31, 37);
DELETE FROM ##PREFIX##HelpParagraphs WHERE paragraphParentId IN (1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 15, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 31, 37);
DELETE FROM ##PREFIX##HelpParagraphs WHERE helpParagraphId IN (1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 15, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 31, 37);
DELETE FROM ##PREFIX##HelpPages WHERE helpPageId IN (4, 5);

UPDATE ##PREFIX##HelpContents SET content = 
'<p>
    After pressing the \'Register\' button, you will see a list of fields to fill out. All fields with a * after the description are mandatory. Some notes:
</p>

<ul>
    <li><b>Username:</b> You should enter a username of at least 6 characters. It can only contain numbers, uppercase and lowercase letters, spaces, and any of the following characters: _ . \' @ </li>
    <li><b>Email address:</b> This should be a valid email address, because a confirmation mail will be sent here.</li>
    <li><b>Password:</b> This needs to be at least 8 characters long.</li>
</ul>' WHERE helpContentId = 19;

UPDATE ##PREFIX##HelpContents SET content = 
'<p>
    You will receive an email at the address you entered, containing a confirmation link. Please follow the link to finalize your registration. You should then be able to log in, and have access to all the features of the website.
</p>' WHERE helpContentId = 4;
UPDATE ##PREFIX##HelpContents SET content = '' WHERE helpContentId = 10;

UPDATE ##PREFIX##HelpParagraphs SET title = 'Zooming' WHERE helpParagraphId = 14;
UPDATE ##PREFIX##HelpContents SET content = 
'<p>
    When the page is first displayed in the viewer, it will be in a standard zoom: the whole page is visible on the screen.
</p>
<p>
    Zooming can be accomplished in several ways
    <ul>
        <li><b>Moving the zoom slider above the page</b></li>
        <li><b>Mouse scroll wheel</b></li>
        <li><b>Double clicking (to zoom in)</b></li>
        <li><b>Numpad + and -</b></li>
    </ul>
</p>' WHERE helpContentId = 20;

UPDATE ##PREFIX##HelpParagraphs SET title = 'Navigating around the page' WHERE helpParagraphId = 16;
UPDATE ##PREFIX##HelpContents SET content = 
'<p>
    There are two ways to move the view of a page:
</p>
<ul>
    <li><b>Drag with the mouse</b>
    <ol>
        <li>Click and hold inside the viewer.</li>
        <li>Drag the mouse to move the page.</li>
    </ol>
    </li>
    <li><b>Using the keyboard</b>
    <ul>
        <li><b>Numpad 8:</b> moves the view up.</li>
        <li><b>Numpad 2:</b> moves the view down.</li>
        <li><b>Numpad 4:</b> moves the view to the left.</li>
        <li><b>Numpad 6:</b> moves the view to the right.</li>
    </ul>
    </li>
</ul>
<p>
    <b>Tip:</b> A red square is displayed on the thumbnail of the current page in the navigation toolbar, indicating the current view.
</p>' WHERE helpContentId = 22;

UPDATE ##PREFIX##HelpParagraphs SET title = 'Rotating the view' WHERE helpParagraphId = 17;
UPDATE ##PREFIX##HelpContents SET content = 
'<p>
    The view can be rotated in steps of 45 degrees. Use the left or right rotation buttons at the top of the page to rotate the view in either direction.
</p>
<p>
    <b>Tip:</b> To set the page straight again, you can use the viewer reset button next to the rotation buttons to undo any rotation or zooming.</li>
</p>' WHERE helpContentId = 23;

UPDATE ##PREFIX##HelpParagraphs SET title = 'Linking to a page' WHERE helpParagraphId = 27;
UPDATE ##PREFIX##HelpContents SET content = 
'<p>
    A direct link to the currently visible page can be retrieved from the relevant area in the bottom left of the window.
</p>
<p>
    <b>Tip:</b> The pages and user-contributed information online can change over time. If you want a secure copy of the page and user-contributed information, you are advised to **download the page as a PDF file||Viewer/Export to PDF**.
</p>' WHERE helpContentId = 14;

UPDATE ##PREFIX##HelpContents SET content =
'<p>
    The details of annotations, visualized on the page, can be inspected through the annotations tab in the workspace on the right of the screen. Clicking an annotation on the page shows the details of the annotation, as well as information with regards to who contributed to the annotation.
</p>
<p>
    By default, the annotation description is shown. To show the interpretation or references for each annotation, select this in the bottom right dropdown menu.
</p>' WHERE helpContentId = 36;

UPDATE ##PREFIX##HelpParagraphs SET title = 'Working with annotations' WHERE helpParagraphId = 38;
UPDATE ##PREFIX##HelpContents SET content =
'<p>
    When logged in, you can also add or modify annotations. First enter the edit mode by clicking the \'Edit mode\' button in the annotations tab on the right of the page. A set of new functions becomes availeble on the buttons bar above the page. Click the \'View mode\' button in the annotations tab to return to the viewing mode.
</p>' WHERE helpContentId = 42;

UPDATE ##PREFIX##HelpParagraphs SET title = 'Add an annotation' WHERE helpParagraphId = 39;
UPDATE ##PREFIX##HelpContents SET content =
'<p>
    Before you proceed, you must be **in edit mode||Viewer/Annotations/Working with annotations**.
</p>
<p>
    To add an annotation, you must first mark it on the page. This can be done in two ways:
</p>
<ol>
    <li>
        <p>
            <b>Polygon tool</b>
        </p>
        <p>
            The polygon tool is next to the drag tool on the buttons bar. Click to place a point on the page. Every next point you place, will be connected to the last point, forming a wireframe. To close the shape, either double click, or rightclick with the mouse.
        </p>
    </li>
    <li><p>
            <b>Rectangle tool</b>
        </p>
        <p>
            The rectangle tool is next to the polygon tool on the buttons bar. Click and drag to make a rectangle polygon.
        </p>
    </li>
</ol>
<p>
    If the wireframe needs more working, you can also **edit the polygon||Viewer/Annotations/Edit polygon**
</p>
<p>
    After completing the wireframe, a new annotation is added to the list in the annotations tab. Now, **information can be added||Viewer/Annotations/Add information** to the annotation.
</p>
<p>
    To save your work, click the \'Save\' button in the annotations tab.
</p>' WHERE helpContentId = 40;

UPDATE ##PREFIX##HelpParagraphs SET title = 'Add information' WHERE helpParagraphId = 40;
UPDATE ##PREFIX##HelpContents SET content =
'<p>
    Before you proceed, you must be **in edit mode||Viewer/Annotations/Working with annotations**.
</p>
<p>
    To add or edit the information associated with an annotation:
</p>
<ol>
    <li>Click the \'Edit\' button next to the annotation in the annotations list, found in the annotations tab.</li>
    <li>Enter the relevant information the popup window.</li>
    <li>Click \'Done\' when you are ready editing.</li>
</ol>
<p>
    To save your work, click the \'Save\' button in the annotations tab.
</p>' WHERE helpContentId = 39;

UPDATE ##PREFIX##HelpParagraphs SET title = 'Remove an annotation' WHERE helpParagraphId = 42;
UPDATE ##PREFIX##HelpContents SET content =
'<p>
    Before you proceed, you must be **in edit mode||Viewer/Annotations/Working with annotations**.
</p>
<p>
    You can remove an annotation marker and all information associated with it.
</p>
<ol>
    <li>Select the eraser tool, on the right of the buttons bar.</li>
    <li>Click the annotation of which you want to delete all transcriptions.</li>
</ol>
<p>
    To make the deletion permanent, you must save by clicking the \'Save\' button in the annotations tab. You can also undo the deletion by clicking the \'Revert\' button.
</p>' WHERE helpContentId = 37;

UPDATE ##PREFIX##HelpContents SET content =
'<p>
    Before you proceed, you must be **in edit mode||Viewer/Annotations/Working with annotations**.
</p>
<p>
    The wireframe surrounding an annotation is a polygon. You can move, add and delete points of a polygon. 
</p>
<ul>
    <li>
        <p>
            <b>Move point</b>
        </p>
        <p>
            Select the \'move a vertex\' tool from the buttons list, it is located next to the rectangle tool.
        </p>
        <p>
            You can now grab and drag points of polygons.
        </p>
    </li>
    <li>
        <p>
            <b>Add point</b>
        </p>
        <p>
            Select the \'add a vertex\' tool from the buttons list, it is located next to the \'move a vertex\' tool.
        </p>
        <p>
            Click inside a polygon to add a point to it. To add a point outside the current boundery of a polygon, move the added point to the desired location.
        </p>
    </li>
    <li>
        <p>
            <b>Delete point</b>
        </p>
        <p>
            Select the \'erase a vertex\' tool from the buttons list, it is located next to the \'add a vertex\' tool.
        </p>
        <p>
            Click the point you want to remove.
        </p>
        <p>
        </p>
    </li>
</ul>
<p>
    To save the changes, click the \'Save\' button in the annotations tab.
</p>' WHERE helpContentId = 38;

INSERT INTO ##PREFIX##HelpParagraphs (helpParagraphId, paragraphParentId, helpPageId, title) VALUES (43, NULL, 6, 'Export to PDF');
INSERT INTO ##PREFIX##HelpContents (helpParagraphId, content) VALUES (43, 
'<p>
    To download one or more pages for offline use or archiving purposes, you can export them to the PDF format.
</p>
<p>
    In the workspace panel on the right of the page, select the Export tab. There you can select which pages you want to export, and what kind of information you want to have added to the download.
</p>
<p>
    <b>Tip:</b> exporting many pages may result in large files.
</p>');

UPDATE ##PREFIX##HelpPages SET helpType = 'view' WHERE helpPageId = 6;

COMMIT;

