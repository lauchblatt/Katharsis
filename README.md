# Katharsis
A Tool for Quantitative Analysis of Plays

<h2>General information</h2>
Katharsis is a web-based tool for the quantitative analysis of plays and runs in every modern browser (e.g. Google Chrome).

<a href="https://lauchblatt.github.io/Katharsis">Online version of the Katharsis tool </a>

Katharsis reads TEI-formatted plays and calculates metrics for configuration information and speech statistics. Via the web-based tool users can explore visualizations per drama but also for larger drama collections concerning these metrics.

The current corpus is derived from the platform <a href=https://textgrid.de/>Textgrid</a> and consists of 102 historic German plays. 

Katharsis also contains a section for sentiment analysis on a sub-part of the corpus which is currently under developement and only available in German.

<a href="https://lauchblatt.github.io/Katharsis/sa_selection.html"> Sentiment analysis component of Katharsis</a>

<h2>Technical information</h2>

The back end functionality of Katharsis is developed in Python and generates structured JSON-files for every entered TEI-formatted play. Users can download the JSON-Files on <a href="https://lauchblatt.github.io/Katharsis">the search page of Katharsis.</a> 

The data is saved via <a href="https://firebase.google.com/">Firebase</a>.

The Front-End is implemented as web-based application via Javascript, jQuery and <a href="https://getbootstrap.com/">Bootstrap</a>.

<h2>License</h2>

<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution 4.0 International (CC BY-NC-SA 4.0).</a>

<h2>Contact and team</h2>

You can contact us if you have any questions or problems:
	<br/>
	<div>Mail (Thomas Schmidt): thomas.schmidt@ur.de</div>
	<div>Mail (Manuel Burghardt): burghardt@informatik.uni-leipzig.de</div>
	<br/>

The following persons participated in the creation of Katharsis:

<ul>
		<li><a href="http://www.uni-regensburg.de/sprache-literatur-kultur/medieninformatik/sekretariat-team/thomas-schmidt/index.html">Thomas Schmidt (M. Sc.) of the University of Regensburg</a></li>
		<li><a href="https://ch.uni-leipzig.de/burghardt/">Jun.-Prof. Dr. Manuel Burghardt of the University of Leipzig</a></li>
		<li><a href="https://www.germanistik.uni-wuerzburg.de/lehrstuehle/computerphilologie/mitarbeiter/dennerlein/">PD Dr. Katrin Dennerlein of the University of Würzburg</a></li>
		<li><a href="https://www.uni-regensburg.de/sprache-literatur-kultur/medieninformatik/sekretariat-team/christian-wolff/">Prof. Dr. Christian Wolff of the University of Regensburg</a></li>
	</ul>
