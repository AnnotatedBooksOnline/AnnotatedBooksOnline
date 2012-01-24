BEGIN TRANSACTION;

-- Add English links to logos for welcome page
UPDATE "Settings" SET "settingValue" = '<h2>Welcome</h2>

<p>This project seeks to develop a virtual research environment (or collaboratory) and publication platform for a young and growing field in cultural history: the study of early modern reading practices. Proceeding from the idea that reading constitutes a crucial form of intellectual exchange, the collaborators will collect and enhance evidence of how readers used their books to build knowledge and assimilate ideas. This is especially pertinent since the early modern period, just like the twenty-first century, saw the revolutionary rise of a new medium of communication which helped shape cultural formation and intellectual freedom.</p>

<p>Although widely recognized as a promising approach with important theoretical implications, currently the study of reading practices still largely depends on individual researchers, whose work is seriously hampered by the limited access to an inherently fragmented body of material. The proposed collaboratory will connect scholarly expertise and provide added value to digital sources through user-generated content (e.g. explanatory material or fuller scholarly syntheses) in an electronic environment specifically designed for research and teaching purposes. It will offer, in short, an academic Wikipedia for the history of reading and the circulation of ideas.</p>

<p>The project will create a transnational platform that enables scholars to (1) view, connect and study annotated books and readers&#39; notes, (2) offer training to students and young researchers in handling readers&#39; traces, and (3) make results freely accessible for teaching purposes, as well as for broader general interest by means of exhibitions, digital presentations and general publications. In order to expand this structural network, the principal partners in the collaboratory will prepare an application for a Marie Curie Initial Training Network.</p>

<a href="http://www.uu.nl/en" target="_blank" title="Go to the website of Utrecht University"><img src="frontend/resources/images/uu.png" style="height: 65px"/></a>
<a href="http://www.english.uva.nl/" target="_blank" title="Go to the website of University of Amsterdam"><img src="frontend/resources/images/uva.png" style="height: 60px"/></a>
<a href="http://www.princeton.edu/" target="_blank" title="Go to the website of Princeton University"><img src="frontend/resources/images/princeton.png" style="height: 65px"/></a>
<a href="http://www.ugent.be/en" target="_blank" title="Go to the website of Ghent University"><img src="frontend/resources/images/ugent.png" style="height: 100px"/></a>
<a href="http://www.livesandletters.ac.uk/" target="_blank" title="Go to the website of CELL"><img src="frontend/resources/images/cell.png" style="height: 100px"/></a>' WHERE "settingName" = 'welcome-page';

COMMIT;
