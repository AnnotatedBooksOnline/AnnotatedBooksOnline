START TRANSACTION;

UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
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
    For more advanced search options, please see the list of **Advanced search query notations||Search/Advanced search query notations**.
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Searching for books' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Search'));




UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    To sort the list of results, there is a set of dropdown boxes in the Advanced options sidebar on the left side of the screen. To sort the list by one attribute, simply select it in the first dropdown box, and the list should be automatically sorted. If further sorting within this already sorted list is required, select another attribute in the second dropdown box. If necessary, a third can also be added.
</p>

<p>
    If you want to invert the sorting, for instance from Z to A or 999 to 1, simply check the checkbox to the right of the sorting you want to invert. The other sorting criteria will be unaffected.
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Sorting options' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Search'));




UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    To change what attributes of the books in the list of search results are shown, go to the ''Result options'' in the Advanced options sidebar on the left side of the screen, below the ''**Sorting options||Search/Sorting options**''. To show or hide the attributes, simply check or uncheck the checkbox in front of the corresponding attribute name.
</p>

<p>
    In this menu you can also change how many results are shown per page: simply select the preferred amount in the dropdown box.
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Result options' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Search'));

UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    As is to be expected, adding material to this website requires you to understand and agree with the terms and conditions. In particular, it is not allowed to upload scans if you do not have the permission to do so. Also, it is required that the scans have a high enough quality. The rules and specifics of uploading are detailed on the page that is shown when you press the ''Upload'' button at the top of the screen.

    After you have read the rules and agree with them, press ''Continue'' to progress to the actual uploading screen.
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'About uploading' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Upload'));


UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    Uploading books is done by selecting the scans of the books, entering the **information of the binding**, and finally entering the **information of any books** that might be contained within the binding.

    Uploading scans is done by pressing the ''Select scans'' button and selecting all the scan files (.tiff and .jpg are supported). The scans will automatically start uploading, and will be processed for viewing while you fill out the rest of the form below. If you need to add more scans, simply press the ''Select scans'' button again. Any scans you select will be added to the list of scans already uploading.

    If the selected scans are wrong, press the red cross behind the wrong scans to cancel that upload, or simply press the ''Clear scans'' button to cancel the upload of all scans. You can then select new scans to upload if necessary.

    Should you for some reason need to remove even the information contained within the forms instead of only the scans, simply press the ''Reset'' button at the bottom of the page. This will clear all fields and reset it to its default state so you can start over. Please take note that you can not undo this.

    Finally, once everything is done, press ''Continue'' to finalize the uploading process.
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Uploading books' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Upload'));


UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    As the scans are uploading and being processed by the system, you can fill out the binding information. The binding is the encompassing whole around any books that might be contained within, be it one or multiple. This part of the form contains the following fields:
<ul>
    <li><b>Library:</b> the library in which the binding that is the source of the scans can be found. This is a mandatory field.</li>
    <li><b>Shelfmark:</b> the shelfmark of the binding in its current location. This is a mandatory field.</li>
    <li><b>Readers:</b> the people who have read or owned the book, and possibly made the annotations within.</li>
    <li><b>Languages of annotations:</b> the languages in which the annotations are written. Simply open the dropdown box by clicking on it, (de)select the correct languages by clicking on them, then click outside the dropdown box to close it.</li>
</ul>
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Binding information' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Upload'));

UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
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
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Book information' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Upload'));

UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    The viewer is used to view scans, read and add transcriptions and download the books for study offline.
</p>

<p>
    What do you want to do?
</p>
<ul>
    <li>**Zoom, move or rotate a page||Viewer/Basic viewer functionalities**</li>
    <li>**Go to another page||Viewer/Go to another page**</li>
    <li>**View information about a binding||Viewer/View information about a binding**</li>
    <li>**Link to a page, book or binding||Link to a page, book or binding**</li>
    <li>**Export to pdf||Viewer/Export to pdf** </li>
    <li>**Read transcriptions of annotations||Viewer/Read transcriptions of annotations**</li>
    <li>**Add and edit transcriptions||Viewer/Add and edit transcriptions**</li>
</ul>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Introduction' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));


UPDATE "##PREFIX##HelpContents" SET "content" = '<p>What do you want to do?</p>
<ul>
    <li>**Zoom in||Viewer/Basic viewer functionalities/Zoom in**</li>
    <li>**Zoom out||Viewer/Basic viewer functionalities/Zoom out**</li>
    <li>**Move the page||Viewer/Basic viewer functionalities/Move across page**</li>
    <li>**Rotate||Viewer/Basic viewer functionalities/Rotate**</li>
    <li>**Reset the view||Viewer/Basic viewer functionalities/Reset the view**</li>
</ul>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Basic viewer functionalities' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));



UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    When the page is first displayed in the viewer, it will be in a standard zoom: the whole page is visible on the screen. To get a better view of the page and details you are interested in, you can zoom in.
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
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Zoom in' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));



UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    There are three ways of zooming out:
</p>
<ul>
    <li><b>Zoom slider</b>
        <ul>
            <li>Grab the zoom slider and move it to the left.</li>
            <li>When the slider is all the way to the left, the page is at its minimum zoom.</li>
            <li>The page will move to the centre of the view, as it is zoomed out to the point where the whole page is visible.</li>  
        </ul>
    </li>
    <li><b>Mouse scroll wheel</b>
        <ul>
            <li>Scroll backward with the mouse scroll wheel.</li>
        </ul>
    </li>
    <li><b>Numpad -</b>
        <ul>
            <li>Press the numpad - to zoom out.</li>
        </ul>
    </li>
</ul>
<p>
    The center of the view, is the part of the page that is in the middle of the viewer.
</p>
<p>
    <b>Tip:</b> You can also reset the zoom and rotation with the **reset the view** function.
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Zoom out' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));




UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
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
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Move across page' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));



UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
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
        <li>Press and hold the ctrl key.</li>
        <li>Click and hold inside the viewer.</li>
        <li>Drag the mouse to a side to rotate.</li>
        <li>Release the mouse and ctrl key when you are done rotating.</li>
    </ol>
    </li>
</ul>
<p>
    When rotating, the center of the view is not changed.
</p>
<p>
    <b>Tip:</b> When you want to set the page straight again, you can use the **reset the view||Viewer/Reset the view** function to easely undo the rotation and zooming.</li>
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Rotate' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));



UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    Reset the view is used to undo zooming and rotating. It restores the page to the view it was first presented in.
</p>
<p>
    There are two ways to activate this function:
</p>
<ul>
    <li>Click the reset view button on the buttons bar, to the right of the last page button.</li>
    <li>Press the home key on your keyboard.</li>
</ul>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Reset the view' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));

UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    Where in the binding do you want to go?
</p>
<ul>
    <li>**Previous page||Viewer/Go to another page/Previous page**</li>
    <li>**Next page||Viewer/Go to another page/Next page**</li>
    <li>**First page||Viewer/Go to another page/First page**</li>
    <li>**Last page||Viewer/Go to another page/Last page**</li>
    <li>**Certain page number||Viewer/Go to another page/Certain page number**</li>
    <li>**Select a page||Viewer/Go to another page/Select a page**</li>
</ul>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Go to another page' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));


UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    To go to the previous page:
</p>
<ul>
    <li>Click the previous page button in the buttons bar.</li>
</ul>
<p>
    The button is to the left of the textfield displaying the current page number. This function is only available if there is a previous page to go to.
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Previous page' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));



UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    To go to the next page:
</p>
<ul>
    <li>Click the next page button in the buttons bar.</li>
</ul>
<p>
    The button is to the right of the textfield displaying the current page number. This function is only available if there is a next page.
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Next page' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));



UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    With an easy press of a button, you can go straight to the first page in the binding.
</p>
<ul>
    <li>Click the first page button to go to the first page.</li>
</ul>
<p>
    The first page button is on the buttons bar, to the left of the next page button. This function is unavailable if the first page is already being displayed in the viewer.
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'First page' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));

 


UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    You can skip straight to the end of the binding.
</p>
<ul>
    <li>Click the last page button to go to the last page.</li>
</ul>
<p>
    The last page button is on the buttons bar, to the right of the next page button. This function is unavaileble if the last page is already being displayed.
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Last page' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));

UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
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
    <b>Tip:</b>  You can also **select a page||Viewer/Select a page** in the book navigation box. 
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Certain page number' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));




UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    To quickly find an interesting looking page, you can use the navigation box in the information sidebar.
</p>
<ol>
    <li>Open the navigation box in the information sidebar to the right in the viewer.</li>
    <li>Find the page in the navigation box.</li>
    <li>Click the page and it is displayed in the viewer.</li>
</ol>
<p>
    <b>Tip:</b> Also note that the currently being viewed page has a red border marking the part of the page visible in the viewer.
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Select a page' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));




UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    Details about the binding and its contents can be found in the book information box in the information sidebar to the left.
</p>
<p>
    The book information displays a list of the titles the binding is composed of and the library and signature of the actual source of the scans. Each title in the list has a page number below it, indicating where that book starts in the binding. The book you are currently in has its title colored black. Clicking the title will show the recorded information on that book. In sequence:
</p>
<ul>
    <li>author(s)</li>
    <li>edition</li>
    <li>place of publication</li>
    <li>the name of the publisher</li>
    <li>date of publication</li>
</ul>
<p>
    The list can be closed by clicking the open title again.
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'View information about a binding' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));





UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    For referring to a certain page, book or binding, there is the reference box in the information sidebar, which supplies links to each of these.
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
    <li>You can now paste the link.</li>
</ol>

<p>
    <b>Tip:</b> The pages and transcriptions online can change over time. If you want a secure copy of the page and transcriptions, you should **export to pdf**.
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Link to a page, book or binding' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));





UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    It is possible to make copies of the virtual books for self-use. This can be done from the export tab in the working area on the right. The pages and transcriptions that are in the export, can be controlled.
</p>
<p>
    There are three ways of selecting pages for the export:
</p>
<ol>
    <li><b>Export current scan</b> exports only the page currently in the viewer. The scan will be displayed on a single A4.</li>
    <li><b>Export binding</b> exprorts all scans in the binding. The first page(s) of the .pdf show the titles that are within the binding, the details of each book, the library and the signature</li>
    <li><b>Export range of scans</b> exports all scans within the range, which can be set with the numberfields below the radio button. The .pdf starts with a page listing the book the first scan was taken from.</li>
</ol>
<p>
    Translations can also be added:
</p>
<ol>
    <li><b>Without transcriptions</b> simply exports the scans, without any user added content.</li>
    <li><b>With transcriptions</b> will add the transcriptions, in the selected languages, after the scan they refer to.
        <ul>
            <li><b>The language box</b> is used to sellect the language(s) of the transcriptions.</li>
            <li><b>Display polygons on scan</b>, if ticked, will show the wireframes around the annotations on the scan.</li>
        </ul>
    </li>
</ol>
<p>
    The export is started by clicking the export button at the bottom of the export tab.
</p>
<p>
    <b>Note:</b> If the scan is wider than it is high, it is turned 90 degrees in the export, to make a better fit on the A4. An instance where this could happen, is when a single scan displays two pages.
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Export to pdf' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Viewer'));


UPDATE "##PREFIX##HelpContents" SET "content" = '<ul>
    <li>All main functionality on this website is accessed through the buttons at the top of the page.</li>
    <li>The buttons will open new tabs, which will show up below the buttons. Click on them to open the page, or press the small ''x'' in the corner of a tab to close that tab.</li>
    <li>As a guest, you will see only a few buttons. Registered users will have more permissions, and once logged in will be able to see and click on more buttons to access additional functions. It is therefore recommended to start out by **registering||Register**, although registration is not needed for simply viewing the books.</li>
    <li>If you ever need help, simply press the ''Help'' button. It will open with information related to the page you were on while pressing the button.</li>
    <li>Many pages have sidebars: these contain extra functionalities and information concerning the current page. Pressing the arrow button at the top right of these sidebars will fold them away, or show them again. On some screens, you can change the width of the sidebars by left-clicking on the edge and dragging it left or right.</li>
</ul>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Introduction' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Welcome'));




UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    The following is a short explanation of all the buttons. Some of these are only available and visible to logged in users. Click on the links for further details.
</p>

<ul>
    <li><b>**Search||Search**:</b> This is used to find and open books for reading.</li>
    <li><b>**Upload||Upload**:</b> Uploading new books can be done by pressing this button and following the instructions.</li>
    <li><b>Info:</b> For more information on what this website is about and its background, click here.</li>
    <li><b>Help:</b> Opens the help functionality. It will automatically open on the subject related to the type of page you are currently viewing.</li>
    <li><b>Users:</b> Shows the list of registered users.</li>
    <li><b>**Register||Register**:</b> Used for registering a new account.</li>
    <li><b>**Login / Logout||Welcome\Login / Logout**:</b> Used to enter your account and access all functionality.</li>
    <li><b>Forgot password?:</b> If you have forgotten your password, you can retrieve it here. </li>
    <li><b>**Edit profile||Edit profile**:</b> To change personal information or your password.</li>
</ul>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Buttons' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Welcome'));

UPDATE "##PREFIX##HelpContents" SET "content" = '<<ul>
    <li><b>Login:</b> To log in, first you need to **Register||register**. Once you have finished your registration, you can login using the ''Login'' button.</li>
    <li><b>Logout:</b> To log out, press the ''Logout'' button.</li>
</ul>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Login / Logout' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Welcome'));


UPDATE "##PREFIX##HelpContents" SET "content" = '<p>
    In case you ever want to change your password or the personal information you entered during **Register||registering**, simply press the ''Edit profile'' button while logged in. It will open a popup window in which you can edit your email address, first and last name, affiliation, occupation, website and password.
</p>

<p>
    In case you wish to change your password, make sure to fill in the ''Current password'' field as well as ''New password'' (and repeating the new password in the ''Repeat password'' field). This is an extra security check.
</p>' 
WHERE "helpParagraphId" = (
    SELECT "helpParagraphId" FROM "##PREFIX##HelpParagraphs" 
    WHERE "title" = 'Edit profile' 
    AND "helpPageId" =(
        SELECT "helpPageId" FROM "##PREFIX##HelpPages" 
        WHERE "pageName" = 'Welcome'));

COMMIT;