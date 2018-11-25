Speakers.SpeakersTableView = function(){
	var that = {};
	var currentDrama_id = 0;

	var init = function(dramaInfo){
		$("#dramaTitle").text(dramaInfo.title + " (" + dramaInfo.year + ")");
		$("#dramaAuthor").text(dramaInfo.author);
		initSorting();
		initId();
		initLinks();
	};

	var renderTable = function(speakersInfo){
		$table = $("#table-tbody");
		for(i = 0; i < speakersInfo.length; i++){
			var $item = createSpeakerItem(speakersInfo[i]);
			$table.append($item);
		}

	};

	//create each row Item of the table with the adapted speakerobject of the model
	var createSpeakerItem = function(speaker){
		var row = $("<tr>");


		row.append(($("<td>")).text(speaker.name));
		row.append(($("<td>")).text(speaker.number_of_appearances));
		row.append(($("<td>")).text(speaker.appearances_percentage));
		if(speaker.number_of_speakers_speeches != 0){
			row.append(($("<td>")).text(speaker.number_of_speakers_speeches));
			row.append(($("<td>")).text(speaker.average_length_of_speakers_speeches));
			row.append(($("<td>")).text(speaker.median_length_of_speakers_speeches));
			row.append(($("<td>")).text(speaker.maximum_length_of_speakers_speeches));
			row.append(($("<td>")).text(speaker.minimum_length_of_speakers_speeches));
		}else{
			//Exception Handling for speakers without speeches
			row.append(($("<td>")).text(0));
			row.append(($("<td>")).text(0));
			row.append(($("<td>")).text(0));
			row.append(($("<td>")).text(0));
			row.append(($("<td>")).text(0));
		}
		return row;
	};

	//Table sort from http://stackoverflow.com/questions/3160277/jquery-table-sort
	var initSorting = function(){
		$('th').click(function(){
    		var table = $(this).parents('table').eq(0)
    		var rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()))
    		this.asc = !this.asc
    		if (!this.asc){rows = rows.reverse()}
    		for (var i = 0; i < rows.length; i++){table.append(rows[i])}
		});
	};

	var comparer = function(index){
		return function(a, b) {
        var valA = getCellValue(a, index), valB = getCellValue(b, index)
        return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
    	}
	};

	var getCellValue = function(row, index){
		return $(row).children('td').eq(index).html()
	};

	var initId = function(){
		var params = window.location.search
		console.log("hello World");
		console.log(params);
		currentDrama_id = (params.substring(params.indexOf("=") + 1));
	};

	//Init links with current Id of drama
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

	that.renderTable = renderTable;
	that.init = init;

	return that;
};