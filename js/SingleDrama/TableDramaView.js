SingleDrama.TableDramaView = function(){
	var that = {};
	var currentDrama_id = 0;

	var init = function(dramaInfo){
		$("#dramaTitle").text(dramaInfo.title + " (" + dramaInfo.year + ")");
		$("#dramaAuthor").text(dramaInfo.author);
		initId();
		initLinks();
	};

	var renderTable = function(actInfo, scenesInfo){
		//Looping through actInfo to create table with act and sceneInfo
		for(var i = 0; i < actInfo.length; i++){
			$("#table-tbody").append(createActItem(actInfo[i]));
			renderScene(scenesInfo[i], (i+1));
		}

	};

	var renderScene = function(sceneInfo, actNumber){
		for(var j = 0; j < sceneInfo.length; j++){
			$("#table-tbody").append(createSceneItem(sceneInfo[j], actNumber));
		}
	};

	var createSceneItem = function(scene, actNumber){
		var row = $("<tr>");
		row.addClass("act-scenes-" + actNumber);
		row.css("display", "none");

		row.append(($("<td>")).text(actNumber + "-" + scene.number_of_scene));
		row.append(($("<td>")).text("-"));
		if(scene.appearing_speakers !== undefined && scene.appearing_speakers != 0){
			row.append(($("<td>")).text(scene.appearing_speakers.length));
		}else{
			row.append(($("<td>")).text(1));
		}
		
		row.append(($("<td>")).text(scene.number_of_speeches_in_scene));
		row.append(($("<td>")).text(roundToTwoDecimals(scene.average_length_of_speeches_in_scene)));
		row.append(($("<td>")).text(scene.median_length_of_speeches_in_scene));
		row.append(($("<td>")).text(scene.maximum_length_of_speeches_in_scene));
		row.append(($("<td>")).text(scene.minimum_length_of_speeches_in_scene));

		return row;
	};

	var createActItem = function(act){
		var row = $("<tr>");

		row.append(($("<td>")).text(act.number_of_act));
		row.append(($("<td>")).text(act.number_of_scenes));
		if(act.appearing_speakers !== undefined && act.appearing_speakers != 0){
			row.append(($("<td>")).text(act.appearing_speakers.length));
		}else{
			row.append(($("<td>")).text(0));
		}
		row.append(($("<td>")).text(act.number_of_speeches_in_act));
		row.append(($("<td>")).text(roundToTwoDecimals(act.average_length_of_speeches_in_act)));
		row.append(($("<td>")).text(act.median_length_of_speeches_in_act));
		row.append(($("<td>")).text(act.maximum_length_of_speeches_in_act));
		row.append(($("<td>")).text(act.minimum_length_of_speeches_in_act));
		var td = $("<td>");
		td.addClass("unfold-col");
		//Create and initialise unfold-Button
		var $unfoldTd = $("<button>");
		$unfoldTd.addClass('glyphicon');
		$unfoldTd.addClass('glyphicon-menu-down');
		$unfoldTd.addClass("unfold-down");
		$unfoldTd.attr("act-number", act.number_of_act);
		$unfoldTd.on("click", unfold);
		td.append($unfoldTd)
		row.append(td);

		return row;
	};

	//Method to call when unfold-Button is pressed, unfolds scenes
	var unfold = function(event){
		$unfoldButton = $(event.target);
		var act_number = ($unfoldButton.attr("act-number"));
		if($unfoldButton.hasClass("unfold-down")){
			unfoldScenes(act_number);
			$unfoldButton.removeClass("unfold-down");
			$unfoldButton.removeClass("glyphicon-menu-down");
			$unfoldButton.addClass("unfold-up");
			$unfoldButton.addClass("glyphicon-menu-up");
		} else{
			foldScenes(act_number);
			$unfoldButton.removeClass("unfold-up");
			$unfoldButton.removeClass("glyphicon-menu-up");
			$unfoldButton.addClass("unfold-down");
			$unfoldButton.addClass("glyphicon-menu-down");
		}
	};

	var unfoldScenes = function(actNumber){
		$(".act-scenes-" + actNumber).fadeIn("slow");
	};

	var foldScenes = function(actNumber){
		$(".act-scenes-" + actNumber).fadeOut("slow");
	};

	var roundToTwoDecimals = function(number){
		number = (Math.round(number * 100)/100).toFixed(2);
		return number
	};

	var initId = function(){
		var params = window.location.search
		console.log("hello World");
		console.log(params);
		currentDrama_id = (params.substring(params.indexOf("=") + 1));
	};

	//Init Links of Page according to currently selected drama ID
	var initLinks = function(){
		$("#link-overall").attr("href", "drama.html?drama_id=" + currentDrama_id);
		$("#link-matrix").attr("href", "matrix.html?drama_id=" + currentDrama_id);
		$("#link-drama").attr("href", "singledrama.html?drama_id=" + currentDrama_id);
		$("#link-drama-actSceneAnalysis").attr("href", "singledrama.html?drama_id=" + currentDrama_id + "#act-scene-table");
		$("#link-drama-actStatistic").attr("href", "singledrama.html?drama_id=" + currentDrama_id + "#act-statistic");
		$("#link-drama-sceneStatistic").attr("href", "singledrama.html?drama_id=" + currentDrama_id + "#scene-statistic");
		$("#link-speakers").attr("href", "speakers.html?drama_id=" + currentDrama_id);
		$("#link-speaker-table").attr("href", "speakers.html?drama_id=" + currentDrama_id + "#speaker-table");
		$("#link-speeches-dominance").attr("href", "speakers.html?drama_id=" + currentDrama_id  + "#speeches-dominance");
		$("#link-speaker-statistic").attr("href", "speakers.html?drama_id=" + currentDrama_id  + "#speaker-statistic");
		$("#link-speaker-relations").attr("href", "speakers.html?drama_id=" + currentDrama_id  + "#speaker-relations");
		$("#link-speeches").attr("href", "speeches.html?drama_id=" + currentDrama_id);
		$("#link-histogram").attr("href", "speeches.html?drama_id=" + currentDrama_id + "#histogram");
		$("#link-curve-diagram").attr("href", "speeches.html?drama_id=" + currentDrama_id + "#curve-diagram");
		$("#link-contact").attr("href", "contact.html?drama_id=" + currentDrama_id);
	};

	that.init = init;
	that.renderTable = renderTable;

	return that;
};