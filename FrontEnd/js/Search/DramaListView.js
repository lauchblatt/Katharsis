Search.DramaListView = function(){
	var that = {};

	var init = function(){
		setAllSelector();
		$(".analyse-collection").on("click", analyseCollection);
		initSorting();
		
	};

	//Method to call when "Drammensammlung analysieren" is pressed
	var analyseCollection = function(){
		//Getting IDs of all checked Items
		var checkboxes = ($("td input"));
		var checkedDramaIds = []
		for(var i = 0; i < checkboxes.length; i++){
			if($(checkboxes[i]).is(":checked")){
				//Ids are saved in html-Element with attribute drama_id
				checkedDramaIds.push($(checkboxes[i]).attr("drama_id"));
			}
		}
		if(checkedDramaIds.length == 0){
			$('#no-drama-selected-popup').show();
			$('body').on('click', function(){
				$('.popup').hide();
				$('body').off('click');
			});
			return false;
		}else if(checkedDramaIds.length == 1){
			$('#one-drama-selected-popup').show();
			$('body').on('click', function(){
				$('.popup').hide();
				$('body').off('click');
			});
			return false;
		}else{
			$(that).trigger("AnalyseCollection", [checkedDramaIds]);
			return true;
		}

	};

	var setAllSelector = function(){
		$("#all-selector").on("click", selectAll);
	};

	var selectAll = function(event){

		if($(event.target).prop("checked")){
			$("td input[type='checkbox']").prop("checked", true);
		}else{
			$("td input[type='checkbox']").prop("checked", false);
			
		}
	};

	var showNoResults = function(){
		$("#no-results").fadeIn("slow");
	};

	var renderListItem = function(listItem){
		$("#no-results").css("display", "none");
		var row = createListItem(listItem);
		$("#table-tbody").append(row);
	};

	//Method to create one drama-item in the list
	var createListItem = function(drama){
		var row = $("<tr>");

		var firstTd = $("<td>");
		firstTd.addClass("selection-box");
		var checkbox = $("<input checked>");
		checkbox.attr("type", "checkbox");
		checkbox.attr("drama_id", drama.id);
		firstTd.append(checkbox);
		row.append(firstTd);

		row.append(($("<td>")).text(drama.title));

		row.append(($("<td>")).text(drama.author));

		if(drama.type !== undefined){
			row.append(($("<td>")).text(translateGenre(drama.type)));
		}else{
			row.append(($("<td>")).text("Unbekannt"));
		}

		row.append(($("<td>")).text(drama.year));
		row.append(($("<td>")).text(drama.number_of_acts));
		row.append(($("<td>")).text(drama.number_of_scenes));
		row.append(($("<td>")).text(getNumberOfSpeakers(drama)));

		row.append(($("<td>")).text(roundToTwoDecimals(drama.configuration_density)));
		row.append(($("<td>")).text(drama.number_of_speeches_in_drama));
		row.append(($("<td>")).text(roundToTwoDecimals(drama.average_length_of_speeches_in_drama)));
		row.append(($("<td>")).text(drama.median_length_of_speeches_in_drama));
		row.append(($("<td>")).text(drama.maximum_length_of_speeches_in_drama));
		row.append(($("<td>")).text(drama.minimum_length_of_speeches_in_drama));
		row.attr("title", "Zur Einzelanalyse...");

		//Building and Init of Download-Button
		var tdDownload = $("<td>");
		var spanDownload = $("<span>");
		spanDownload.on("click", downloadJSON);
		spanDownload.addClass("glyphicon glyphicon-download");
		tdDownload.attr("title", "Download JSON");
		tdDownload.append(spanDownload);
		row.append(tdDownload);

		row.attr("drama_id", drama.id);
		row.on("click", dramaClicked);

		return row;
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

	var downloadJSON = function(event){
		var dramaId = ($(event.target).parent().parent().attr("drama_id"));
		$(that).trigger("DownloadJSON", [dramaId]);
	};

	//trigger drama Clicked with all necessary dat, if the drama is clicked
	var dramaClicked = function(event){
		//check if really the drama ist clicked and not something else like Download or checkbox
		if($(event.target).is("input") || $(event.target).is("span")){
			return;
		}
		var $row = ($(event.target).parent());
		var drama_id = ($row.attr("drama_id"));
		var title = $($row.children()[1]).text();
		var author = $($row.children()[2]).text();
		var year = $($row.children()[4]).text();
		$(that).trigger("DramaClicked", [drama_id, title, author, year]);
	};

	var getNumberOfSpeakers = function(drama){
		var speakers = drama.speakers;
		return speakers.length;
	};

	var roundToTwoDecimals = function(number){
		number = (Math.round(number * 100)/100).toFixed(2);
		return number
	};

	var emptyTable = function(){
		$("#table-tbody").empty();
	};

	//Table sort from http://stackoverflow.com/questions/3160277/jquery-table-sort
	var initSorting = function(){
		$('th.sortable').click(function(){
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

	that.init = init;
	that.renderListItem = renderListItem;
	that.emptyTable = emptyTable;
	that.showNoResults = showNoResults;

	return that;
};