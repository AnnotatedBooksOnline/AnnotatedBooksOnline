BEGIN TRANSACTION;

--Insert upload into HelpPages
INSERT INTO "##PREFIX##HelpPages" ("pageName", "helpType") VALUES ('Upload', 'upload');

--Insert upload into HelpParagraphs
INSERT INTO "##PREFIX##HelpParagraphs" ("helpPageId", "title", "actionName") VALUES ((SELECT "helpPageId" FROM "##PREFIX##HelpPages" WHERE "pageName" = 'Upload'), 'About uploading', 'upload-bindings');
INSERT INTO "##PREFIX##HelpParagraphs" ("helpPageId", "title", "actionName") VALUES ((SELECT "helpPageId" FROM "##PREFIX##HelpPages" WHERE "pageName" = 'Upload'), 'Uploading books', 'upload-bindings');
INSERT INTO "##PREFIX##HelpParagraphs" ("helpPageId", "title", "actionName") VALUES ((SELECT "helpPageId" FROM "##PREFIX##HelpPages" WHERE "pageName" = 'Upload'), 'Binding information', 'upload-bindings');
INSERT INTO "##PREFIX##HelpParagraphs" ("helpPageId", "title", "actionName") VALUES ((SELECT "helpPageId" FROM "##PREFIX##HelpPages" WHERE "pageName" = 'Upload'), 'Book information', 'upload-bindings');

--Insert upload into HelpContents
INSERT INTO "##PREFIX##HelpContents" ("helpParagraphId", content) VALUES  ((SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE title = 'About uploading'), '<p>
As is to be expected, adding material to this website requires you to understand and agree with the terms and conditions. In particular, it is not allowed to upload scans if you do not have the permission to do so. Also, it is required that the scans have a high enough quality. The rules and specifics of uploading are detailed on the page that is shown when you press the ''Upload'' button at the top of the screen.

After you have read the rules and agree with them, press ''Continue'' to progress to the actual uploading screen.
</p>');

INSERT INTO "##PREFIX##HelpContents" ("helpParagraphId", content) VALUES  ((SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE title = 'Uploading books'), '<p>
Uploading books is done by selecting the scans of the books, entering the **information of the binding**, and finally entering the **information of any books** that might be contained within the binding.

Uploading scans is done by pressing the ''Select scans'' button and selecting all the scan files (.tiff and .jpg are supported). The scans will automatically start uploading, and will be processed for viewing while you fill out the rest of the form below. If you need to add more scans, simply press the ''Select scans'' button again. Any scans you select will be added to the list of scans already uploading.

If the selected scans are wrong, press the red cross behind the wrong scans to cancel that upload, or simply press the ''Clear scans'' button to cancel the upload of all scans. You can then select new scans to upload if necessary.

Should you for some reason need to remove even the information contained within the forms instead of only the scans, simply press the ''Reset'' button at the bottom of the page. This will clear all fields and reset it to its default state so you can start over. Please take note that you can not undo this.

Finally, once everything is done, press ''Continue'' to finalize the uploading process.
</p>');

INSERT INTO "##PREFIX##HelpContents" ("helpParagraphId", content) VALUES  ((SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE title = 'Binding information'), '<p>
As the scans are uploading and being processed by the system, you can fill out the binding information. The binding is the encompassing whole around any books that might be contained within, be it one or multiple. This part of the form contains the following fields:
<ul>
<li><b>Library:</b> the library in which the binding that is the source of the scans can be found. This is a mandatory field.</li>
<li><b>Shelfmark:</b> the shelfmark of the binding in its current location. This is a mandatory field.</li>
<li><b>Readers:</b> the people who have read or owned the book, and possibly made the annotations within.</li>
<li><b>Languages of annotations:</b> the languages in which the annotations are written. Simply open the dropdown box by clicking on it, (de)select the correct languages by clicking on them, then click outside the dropdown box to close it.</li>
</p>');

INSERT INTO "##PREFIX##HelpContents" ("helpParagraphId", content) VALUES  ((SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" WHERE title = 'Book information'), '<p>
If a binding contains one book, simply fill out the form as described below. If it contains multiple works bound together in a single binding, press the ''Add book'' button at the bottom until there are enough forms for every book. Press ''Delete book'' below the form you want to remove if you added too many. Make sure you do not remove the valid ones, or you will have to fill out the form again. If you are not sure, looking at the lines around the forms may help as a guideline to find out what button belongs with what form.

The following fields are shown for every book:
<ul>
<li><b>Title:</b> the title of the book. This is a mandatory field.</li>
<li><b>Author:</b> the author of the book, if known.</li>
<li><b>Time period of publication:</b> the time period of publication, approximated if necessary. This is a mandatory field.</li>
<li><b>Place published:</b> the location where the book was published.</li>
<li><b>Languages:</b> the language(s) in which this book was written. This is a mandatory field.</li>
<li><b>Version:</b> if the book has a version indication, please add it here.</li>
<li><b>Publisher/printer:</b> the publisher or printer that manufactured this copy of the book.</li>
</ul>
</p>');

COMMIT;