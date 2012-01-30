BEGIN TRANSACTION;

-- Add links to logos for welcome page
UPDATE "Settings" SET "settingValue" = '<h2>Welcome</h2>

<p>Historical readers left many traces in the books they owned. Names, notes, marks, and underlining provide unique evidence of how generations of readers used their books. Annotated Books Online gives full access to these unique copies. Focusing on the first three centuries of print, it enables scholars and students interested in the history of reading to collect, view and study reading practices. User tools include extensive search, viewing and annotating options.</p>

<a href="http://www.uu.nl/en" target="_blank" title="Go to the website of Utrecht University"><img src="frontend/resources/images/uu.png" style="height: 65px"/></a>
<a href="http://www.english.uva.nl/" target="_blank" title="Go to the website of University of Amsterdam"><img src="frontend/resources/images/uva.png" style="height: 60px"/></a>
<a href="http://www.princeton.edu/" target="_blank" title="Go to the website of Princeton University"><img src="frontend/resources/images/princeton.png" style="height: 65px"/></a>
<a href="http://www.ugent.be/en" target="_blank" title="Go to the website of Ghent University"><img src="frontend/resources/images/ugent.png" style="height: 100px"/></a>
<a href="http://www.livesandletters.ac.uk/" target="_blank" title="Go to the website of CELL"><img src="frontend/resources/images/cell.png" style="height: 100px"/></a>' WHERE "settingName" = 'welcome-page';

UPDATE "Settings" SET "settingValue" = '<h2>About the project</h2>

<p>Annotated Books Online is a virtual research environment for scholars and students interested in historical reading practices. It is part of the research project "A Collaboratory for the Study of Reading and the Circulation of Ideas in Early Modern Europe" funded by the Dutch National Research Council (NWO). Generous additional funding was provided by Professor Anthony Grafton for the edition of Gabriel Harvey''s annotations to Livy (Mellon Foundation).</p>

<p>
<h3>Partners</h3> 
<ul>
<li>Paul Dijstelberge (University of Amsterdam)</li>
<li>Anthony Grafton (Princeton University)</li>
<li>Lisa Jardine (Centre for Editing Lives and Letters, Queen Mary, London)</li>
<li>Jürgen Pieters (Ghent University)</li>
<li>Els Stronks (Utrecht University)</li>
<li>Matthew Symonds (Centre for Editing Lives and Letters, Queen Mary, London)</li>
<li>Garrelt Verhoeven (University of Amsterdam)</li>
<li>Arnoud Visser (Utrecht University)</li>
</ul> 
</p>

<p>
<h3>Board of Advisors</h3> 
<ul>
<li>Professor Roger Chartier (Collège de France, Paris and Department of History & University of Pennsylvania)</li>
<li>Dr Cristina Dondi (Oxford & Consortium of European Research Libraries)</li>
<li>Professor Paul Hoftijzer (University of Leiden, Department of Book and Digital Media Studies)</li>
<li>Professor Howard Hotson (St Anne’s College, Oxford & Cultures of Knowledge Project)</li>
<li>Professor Lisa Kuitert (University of Amsterdam, Department of Book History)</li>
<li>Professor Jerome McGann (University of Virginia, Department of English)</li>
<li>Dr David Pearson (Director of Libraries, Archives and Guildhall Art Gallery London)</li>
<li>Professor Andrew Pettegree (University of St Andrews, Director Universal Short Title Catalogue)</li>
<li>Professor William Sherman (University of York, Department of English)</li>
<li>Professor Jacob Soll (Rutgers University, Department of History)</li>
<li>Professor Bob Owens (Open University, Director of Reading Experience Database)</li>
<li>Dr Henk Wals (The Hague, Huygens Institute for the History of the Netherlands, KNAW)</li>
</ul> 
</p>

<h3>Background</h3> 

<p>Proceeding from the idea that reading constitutes a crucial form of intellectual exchange, the collaborators will collect and enhance evidence of how readers used their books to build knowledge and assimilate ideas. This is especially pertinent since the early modern period, just like the twenty-first century, saw the revolutionary rise of a new medium of communication, which helped shape cultural formation and intellectual freedom.</p>

<p>Although widely recognized as a promising approach with important theoretical implications, currently the study of reading practices still largely depends on individual researchers, whose work is seriously hampered by the limited access to an inherently fragmented body of material. The proposed collaboratory will connect scholarly expertise and provide added value to digital sources through user-generated content (e.g. explanatory material or fuller scholarly syntheses) in an electronic environment specifically designed for research and teaching purposes. It will offer, in short, an academic Wikipedia for the history of reading and the circulation of ideas.</p>

<p>The project will create a transnational platform that enables scholars to (1) view, connect and study annotated books and readers'' notes, (2) offer training to students and young researchers in handling readers'' traces, and (3) make results freely accessible for teaching purposes, as well as for broader general interest by means of exhibitions, digital presentations and general publications. In order to expand this structural network, the principal partners in the collaboratory will prepare an application for a Marie Curie Initial Training Network.</p>

<p>For more information, contact Arnoud Visser, <a href="mailto:a.s.q.visser@uu.nl">a.s.q.visser@uu.nl</a> </p>' WHERE "settingName" = 'info-page';

COMMIT;
