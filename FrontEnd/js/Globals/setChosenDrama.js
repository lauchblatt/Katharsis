var sa_chosenNumber = 0;
if(localStorage.getItem("sa_chosenDramaNumber") != null){
	sa_chosenNumber = parseInt(localStorage["sa_chosenDramaNumber"]);
}

var sa_chosenDrama = allDramasData[sa_chosenNumber];

var dramaTitle = sa_chosenDrama["title"];
var author = sa_chosenDrama["author"];
var date = sa_chosenDrama.date.when;

var headline1 = dramaTitle + " (" + date + ")";
$("#dramaTitle").text(headline1);
$("#dramaAuthor").text(author);
