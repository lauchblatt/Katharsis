Matrix.MatrixView = function(){
	var that = {};
	var currentDrama_id = 0;
	var lastScrollLeft = 0;
	var lastScrollTop = 0;

	var init = function(dramaInfo, actsInfo, scenesInfo, speakersInfo, matrix){
		$("#dramaTitle").text(dramaInfo.title + " (" + dramaInfo.year + ")");
		$("#dramaAuthor").text(dramaInfo.author);

		//Step-By-Step dynamic building of the matrix
		renderheadline(scenesInfo);
		renderSpeakerColumn(dramaInfo);
		fillTable(dramaInfo, scenesInfo);
		fillCellsWithConfMatrix(matrix);

		//Initialisation of Tooltips
		initTooltipsForSpeakers(speakersInfo);
		initTooltipsForActs(actsInfo);
		initTooltipsForScenes(scenesInfo);
		initTooltipsForTitleHeader(dramaInfo);

		initId();
		initLinks();
		initHorizontalScrollListener();
		$(".container").fadeIn("slow");
		$("#loading").css("display", "none");
		$("#maincontent").fadeIn();;

	};

	//Method to enable scrolling of speaker-column
	var initHorizontalScrollListener = function(){
		$(document).scroll(function() {
		    var documentScrollLeft = $(document).scrollLeft();
		    var documentScrollTop = $(document).scrollTop();

		    console.log('lastScrollLeft', lastScrollLeft);
		    console.log('documentScrollLeft', documentScrollLeft);

		    if(lastScrollLeft == 0 && lastScrollLeft < documentScrollLeft){
		    	console.log('make sticky');

		    	var headWidth = $('#confMatrix thead tr th:first-child').outerWidth();
				$('#confMatrix thead tr th:first-child').css('min-width', headWidth);

		    	$("#confMatrix tbody tr th:first-child").each(function(){
		    		var defaultTopValue = $(this).offset().top;

		    		$(this).attr('default-top', defaultTopValue);
		    		var topValue = $(this).offset().top - documentScrollTop;
		    		var height = $(this).height();
		    		var width = $(this).width() + 8;

		    		$(this).next().height(height);
		    		$(this).css('top', topValue);
		    		$(this).height(height);
		    		$(this).width(width);
		    	});
		    	$("#confMatrix").addClass('sticky');
		    }else if(documentScrollLeft == 0){
		    	$("#confMatrix").removeClass('sticky');
		    }

		    if (lastScrollLeft != documentScrollLeft) {
		        lastScrollLeft = documentScrollLeft;
		    }

		    console.log('lastScrollTop', lastScrollTop);
		    console.log('documentScrollTop', documentScrollTop);

		    if(lastScrollTop != documentScrollTop){
		    	lastScrollTop = documentScrollTop;

		    	$("#confMatrix.sticky tbody tr th:first-child").each(function(){
		    		var topValue = $(this).attr('default-top') - documentScrollTop;
		    		$(this).css('top', topValue);
		    	});
		    }

		});
	};

	/* All Tooltips need to be initialised and created, 
	the content of the tooltip is a jQuery-Object (mostly a div), 
	which is catched by get-Methods*/

	var initTooltipsForTitleHeader = function(dramaInfo){
		var $titleHeader = $("#title-header");
		$titleHeader.text(dramaInfo.title);
		var $content = getDramaTooltip(dramaInfo);
		$titleHeader.tooltipster({
					content: $content,
					position: "right",
					trigger: 'hover'
				});
	};

	var getCellTooltip = function(cellObject){
		var $content = $("<div>");
		var strings = ["Speaker:", "Number of speeches:", "Average length of speeches:",
		 "Median length of speeches:",
		"Maximum length of speeches:", "Minimum length of speeches:"];
		var data = [cellObject.speaker, cellObject.number_of_speeches, cellObject.average,
		cellObject.median, cellObject.max, cellObject.min];

		var $leftColumn = getColumn(strings, "insideLeft");
		var $rightColumn = getColumn(data, "insideRight");
		$content.append($leftColumn);
		$content.append($rightColumn);

		return $content;
	};

	var getDramaTooltip = function(drama){
		var $content = $("<div></div>");
		var strings = ["Title:","Author:", "Year:", "Genre:", "Speaker:", "Configuration density:",
		"Number of speeches:","Average length of speeches:", "Median lenth of speeches:",
		"Maximum length of speeches:", "Minimum length of speeches:"];
		var data = [drama.title, drama.author, drama.year, translateGenre(drama.type), drama.speakers.length,
		roundToTwoDecimals(drama.configuration_density),
		drama.number_of_speeches_in_drama, 
		roundToTwoDecimals(drama.average_length_of_speeches_in_drama),
		drama.median_length_of_speeches_in_drama, drama.maximum_length_of_speeches_in_drama, 
		drama.minimum_length_of_speeches_in_drama];

		var $leftColumn = getColumn(strings, "insideLeft");
		var $rightColumn = getColumn(data, "insideRight");
		$content.append($leftColumn);
		$content.append($rightColumn);

		return $content;
	};

	var initTooltipsForScenes = function(scenesInfo){
		for(var act = 0; act < scenesInfo.length; act++){
			for(var scene = 0; scene < scenesInfo[act].length; scene++){
				var $content = getSceneTooltip(scenesInfo[act][scene]);
				var sceneId = "scene_" + act + "_" + scene;
				$("#"+sceneId).tooltipster({
					content: $content,
					position: "bottom",
					trigger: 'hover'
				});
			}
		}
	};

	var getSceneTooltip = function(scene){
		var $content = $("<div></div>");
		var strings = ["Scene:", "Number of speeches:", "Average length of speeches:",
			"Median length of speeches:", "Maximum length of speeches:", "Minimum length of speeches:"];
		var data = [scene.number_of_scene, scene.number_of_speeches_in_scene, 
		roundToTwoDecimals(scene.average_length_of_speeches_in_scene), 
		scene.median_length_of_speeches_in_scene, scene.maximum_length_of_speeches_in_scene, 
		scene.minimum_length_of_speeches_in_scene]
		var $leftColumn = getColumn(strings, "insideLeft");
		var $rightColumn = getColumn(data, "insideRight");
		$content.append($leftColumn);
		$content.append($rightColumn);
		return $content;
	};

	var initTooltipsForActs = function(actsInfo){
		for(var i = 0;  i < actsInfo.length; i++){
			var $content = getActTooltip(actsInfo[i]);
			var actId = "act_" + i + "_id";
			$("#"+actId).tooltipster({
			content: $content,
			position: "bottom",
			trigger: 'hover'
			});
		}
	};

	var getActTooltip = function(act){
		var $content = $("<div></div>");

		var leftColumn = getColumn(["Act:", "Number of speeches:", "Average length of speeches:",
			"Median length of speeches:", "Maximum length of speeches:", "Minimum length of speeches:"], "insideLeft");
		var data = [act.number_of_act, act.number_of_speeches_in_act, 
		roundToTwoDecimals(act.average_length_of_speeches_in_act), 
		act.median_length_of_speeches_in_act, act.maximum_length_of_speeches_in_act, 
		act.minimum_length_of_speeches_in_act];
		var rightColumn = getColumn(data, "insideRight");

		$content.append(leftColumn);
		$content.append(rightColumn);
		return $content;

	};

	var getColumn = function(strings, sideClass){
		var $column = $("<div>");
		$column.addClass(sideClass);
		for(var i = 0; i < strings.length; i++){
			var br = $("<br>");
			var span = $("<span>");
			span.text(strings[i]);
			$column.append(span);
			$column.append(br);
		}
		return $column;
	};

	var initTooltipsForSpeakers = function(speakersInfo){
		for(var i = 0; i < speakersInfo.length; i++){
			var $content = getSpeakerTooltip(speakersInfo[i]);
			var speakerId = "speaker_" + i;
			$("#"+speakerId).tooltipster({
			content: $content,
			position: "right",
			trigger: 'hover'
			});
		}
	};

	var getSpeakerTooltip = function(speaker){
		var $content = $("<div></div>");
		var strings = ["Name:", "Number of speeches:", "Average length of speeches:",
		"Median length of speeches:","Maximum length of speeches:", "Minimum length of speeches:"];
		var data = [];
		if(speaker.number_of_speakers_speeches != 0){
			data = [speaker.name, speaker.number_of_speakers_speeches,
			roundToTwoDecimals(speaker.average_length_of_speakers_speeches), 
			speaker.median_length_of_speakers_speeches,
			speaker.maximum_length_of_speakers_speeches,
			speaker.minimum_length_of_speakers_speeches];
		}else{
			data = [speaker.name, speaker.number_of_speakers_speeches,0, 0, 0, 0];
		}
		

		var $leftColumn = getColumn(strings, "insideLeft");
		var $rightColumn = getColumn(data, "insideRight");
		$content.append($leftColumn);
		$content.append($rightColumn);

		return $content;
	};

	//Method to fill inner Cells of matrix, after it is build
	var fillCellsWithConfMatrix = function(matrix){
		for(var i = 0; i < matrix.length; i++){
			for(var j = 0; j < matrix[i].length; j++){
				var matrix_id = "matrix_" + i + "_" + j;
				if(matrix[i][j].matrix_number == 1){
					$("#" + matrix_id).addClass("filled");
					$content = getCellTooltip(matrix[i][j]);
					$("#" + matrix_id).tooltipster({
						content: $content,
						position: "top",
						trigger: 'hover'
						});
				}else{
					$("#" + matrix_id).text("");
					$("#" + matrix_id).attr("title", matrix[i][j].name);
				}
				
			}
		}
	};

	//Method to fill Table with infos, after it is build
	var fillTable = function(dramaInfo, scenesInfo){
		for(var speaker = 0; speaker < dramaInfo.speakers.length; speaker++){
			var $row = $("#speaker_" + speaker + "_row");
			var numberOfSceneAbsolute = 0;
			for(var act = 0; act < scenesInfo.length; act++){
				var actClass = "act_" + act;
				for(var scene = 0; scene < scenesInfo[act].length; scene++){
					var matrix_id = "matrix_" + speaker + "_" + numberOfSceneAbsolute;
					$td = $("<td></td>");
					$td.addClass(actClass);
					$td.attr("id", matrix_id);
					$row.append($td);
					numberOfSceneAbsolute++;
				}
			}
		}
	};

	var renderSpeakerColumn = function(dramaInfo){
		$tableBody = $("#table-body");
		for(i = 0; i < dramaInfo.speakers.length; i++){
			var $row = $("<tr></tr>");
			$row.attr("id", "speaker_" + i + "_row");
			var $th = $("<th></th>");
			$th.attr("id","speaker_" + i);
			var name = dramaInfo.speakers[i];
			$th.text(name);
			$row.append($th);
			$tableBody.append($row);
		}
	};

	var renderheadline = function(scenesInfo){
		$headlineAct  = $("#acts_headline");
		$headlineScene = $("#scenes_headline");
		
		for(var i = 0; i < scenesInfo.length; i++){
			var lengthOfAct = scenesInfo[i].length;
			
			var $th = ($("<th class='act_" + i + "' colspan='" + lengthOfAct +"'></th>"));
			var id = "act_" + i + "_id";
			$th.attr("id", id);
			$th.text("Act " + (i+1));
			$headlineAct.append($th);
		}

		for(var i = 0; i < scenesInfo.length; i++){
			for(var j = 0; j < scenesInfo[i].length; j++){
				var act = "act_" + i;
				var scene = "scene_" + i + "_" + j;
				var $th = $("<th></th>");
				$th.addClass(act);
				$th.attr("id", scene);
				$th.text("Scene " + (j+1));
				$headlineScene.append($th);
			}
		}

	};

	var translateGenre = function(genre){
		switch(genre) {
			case 'Komoedie':
				return "Comedy";
				break;
			case 'Trauerspiel':
				return 'Tragedy';
				break;
			default:
				return genre
		}
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

	//Init Links with the ID of the currently selected drama
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

	return that;
};