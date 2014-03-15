BEGIN TRANSACTION;

--Insert Annotations into HelpPages
INSERT INTO "##PREFIX##HelpParagraphs" ("helpPageId", "title") VALUES ((SELECT "helpPageId" FROM "##PREFIX##HelpPages" WHERE "pageName" = 'Viewer'), 'Annotations');

--Insert Annotations subparagraphs into HelpParagraphs
INSERT INTO "##PREFIX##HelpParagraphs" ("helpPageId", "paragraphParentId", "title") VALUES ((SELECT "helpPageId" FROM "##PREFIX##HelpPages" WHERE "pageName" = 'Viewer'),
(SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Annotations'), 'Read transcriptions of annotations');

INSERT INTO "##PREFIX##HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "actionName") VALUES ((SELECT "helpPageId" FROM "##PREFIX##HelpPages" WHERE "pageName" = 'Viewer'),
(SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Annotations'), 'Add and Edit transcriptions', 'edit-annotations');

INSERT INTO "##PREFIX##HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "actionName") VALUES ((SELECT "helpPageId" FROM "##PREFIX##HelpPages" WHERE "pageName" = 'Viewer'),
(SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Annotations'), 'Add transcription', 'add-annotations');

INSERT INTO "##PREFIX##HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "actionName") VALUES ((SELECT "helpPageId" FROM "##PREFIX##HelpPages" WHERE "pageName" = 'Viewer'),
(SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Annotations'), 'Add and edit text', 'edit-annotations');

INSERT INTO "##PREFIX##HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "actionName") VALUES ((SELECT "helpPageId" FROM "##PREFIX##HelpPages" WHERE "pageName" = 'Viewer'),
(SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Annotations'), 'Edit polygon', 'edit-annotations');

INSERT INTO "##PREFIX##HelpParagraphs" ("helpPageId", "paragraphParentId", "title", "actionName") VALUES ((SELECT "helpPageId" FROM "##PREFIX##HelpPages" WHERE "pageName" = 'Viewer'),
(SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE "title" = 'Annotations'), 'Delete a transcription', 'edit-annotations');

--Insert Annotations into HelpContents
INSERT INTO "##PREFIX##HelpContents" ("helpParagraphId", content) VALUES  ((SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE title = 'Annotations'), '');

INSERT INTO "##PREFIX##HelpContents" ("helpParagraphId", content) VALUES  ((SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE title = 'Delete a transcription'), '<p>
    To delete transcriptions, you must be in the edit mode.
</p>
<p>
    You can delete an annotation marker and all transcriptions added to it.
</p>
<ol>
    <li>Select the erasor tool, on the right of the buttons bar</li>
    <li>Click the annotation of which you want to delete all transcriptions</li>
</ol>
<p>
    To make the delete permanent, you must save by clicking the ''save button'' in the annotations tab. You can also undo the deletion by clicking the ''reset'' button.
</p>');

INSERT INTO "##PREFIX##HelpContents" ("helpParagraphId", content) VALUES  ((SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE title = 'Edit polygon'), '<p>
    To edit polygons, you must be in the edit mode.
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
            Select the ''move a vertex'' tool from the buttons list, it is located next to the rectangle tool.
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
            Select the ''add a vertex'' tool from the buttons list, it is located next to the ''move a vertex'' tool.
        </p>
        <p>
            Click inside a polygon to add a point to it. To add a point outside the current boundery of a polygon, move the added point to the desired location.
        </p>
    </li>
    <li>
        <p>
            <b>Delete point</b>
        </p>
            Select the ''erase a vertex'' tool from the buttons list, it is located next to the ''add a vertex'' tool.
        <p>
            Click the point you want to remove.
        </p>
        <p>
        </p>
    </li>
</ul>
<p>
    To save the changes, click the ''save'' button in the annotations tab.
</p>');

INSERT INTO "##PREFIX##HelpContents" ("helpParagraphId", content) VALUES  ((SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE title = 'Add and edit text'), '<p>
    To add transcriptions, you must be in the edit mode.
</p>
<p>
    To make a transcription, you must first mark the annotation you are transcribing. This can be done in two ways:
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
    If the wireframe needs more working, you can also **edit the polygon||Viewer/Add and edit transcriptions/Edit polygon**
</p>
<p>
    After completing the wireframe, a new annotation is added to the list in the annotations tab. Now, a **transcription can be added||Viewer/Add and edit transcriptions/Add and edit text** to the annotation.
</p>
<p>
    To save your work, click the ''save'' button in the annotations tab.
</p>

Add and edit text
<p>
    To edit transcriptions, you must be in the edit mode.
</p>
<p>
    To add or edit the transcription of an annotation:
</p>
<ol>
    <li>Click the edit button next to the annotation in the annotations list, found in the annotations tab.</li>
    <li>Enter the transcription(s) in the textboxes in the popup</li>
    <li>Click on done</li>
</ol>
<p>
    To save your work, click the ''save'' button in the annotations tab.
</p>');

INSERT INTO "##PREFIX##HelpContents" ("helpParagraphId", content) VALUES  ((SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE title = 'Add transcription'), '<p>
    To add transcriptions, you must be in the edit mode.
</p>
<p>
    To make a transcription, you must first mark the annotation you are transcribing. This can be done in two ways:
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
    If the wireframe needs more working, you can also **edit the polygon||Viewer/Add and edit transcriptions/Edit polygon**
</p>
<p>
    After completing the wireframe, a new annotation is added to the list in the annotations tab. Now, a **transcription can be added||Viewer/Add and edit transcriptions/Add and edit text** to the annotation.
</p>
<p>
    To save your work, click the ''save'' button in the annotations tab.
</p>');

INSERT INTO "##PREFIX##HelpContents" ("helpParagraphId", content) VALUES  ((SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE title = 'Read transcriptions of annotations'), '<p>
    Users can mark annotations on the page and add transcriptions to them. A marked annotation has a wireframe surrounding it, which will light up when the mouse is moved over it.
</p>
<p>
    The transcription of a selected annotation can be viewed in the annotations tab, in the workspace on the right of the screen. An annotation can be selected in two ways:
</p>
<ol>
    <li>Click on the annotation on the page.</li>
    <li>Select the annotation from the list in the annotations tab.</li>
</ol>
<p>
    Transcriptions can be made in two languages, the orriginal and English. With the dropdown box in the right corner of the annotations tab, the language for the transcriptions can be selected. However, an annotation does not always have a transcription, or only have it one of the two languages.
</p>
<p>
    <b>Note:</b> Every anotation has a creation date and a last edited date. These can also be viewed in the annotations tab.
</p>');

INSERT INTO "##PREFIX##HelpContents" ("helpParagraphId", content) VALUES  ((SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE title = 'Add and Edit transcriptions'), '<p>
    To add or edit transcriptions, enter edit mode by clicking the ''edit mode'' button in the annotations tab.
</p>
<p>
    A set of new functions becomes availeble on the buttons bar at the top of the viewer. Click the ''view mode'' button in the annotations tab to return to the viewing mode.
</p>
<p>
    What do you want to do?
</p>
<ul>
    <li>**Add a transcription||Viewer/Add and edit transcriptions/Add transcription**</li>
    <li>**Edit text||Viewer/Add and edit transcriptions/Add and edit text**</li>
    <li>**Edit wireframe||Viewer/Add and edit transcriptions/Edit polygon**</li>
    <li>**Delete a transcription||Viewer/Add and edit transcriptions/Delete a transcription**</li>
</ul>');

COMMIT;