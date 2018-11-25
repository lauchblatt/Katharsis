var setLocalStorageSelection = function(event){
	var clickedElement = event.target;
	var chosenDramaNumber = parseInt(clickedElement.id);
	localStorage["sa_chosenDramaNumber"] = chosenDramaNumber.toString();
};

var buildSelection = function(){
	var $selectionDiv = $("#drama-selection");
	for(var i = 0; i < allDramasData.length; i++){
		var title = allDramasData[i]["title"];
		var author = allDramasData[i]["author"];
		var date = allDramasData[i].date.when;

		var $div = $("<div></div>");
		$div.addClass("dramaSelection");
		
		
		var $a = $("<a></a>");
		$a.attr("href", "sa_dramaActScenes.html");
		$a.attr("id", i.toString() + "dramaSelection")
		$a.click(setLocalStorageSelection);
		var text = title + " (" + author + " , " + date + ")";
		$a.text(text);
		$div.append($a);
		$selectionDiv.append($div);
 	}
};

buildSelection();