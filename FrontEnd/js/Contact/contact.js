var currentDrama_id = 0;

	var init = function(){
		initId();
		initFields();
		initLinks();
	};

	var initId = function(){
		var params = window.location.search
		currentDrama_id = (params.substring(params.indexOf("=") + 1));
	};

	//Set different Links of the Page with the ID of the currently selected drama
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

	//Set UI-Links with the ID of the currently selected drama
	var initFields = function(){
		$("#to_matrix").attr("href", "matrix.html?drama_id=" + currentDrama_id);
		$("#to_dramaAnalysis").attr("href", "singledrama.html?drama_id=" + currentDrama_id);
		$("#to_speakerAnalysis").attr("href", "speakers.html?drama_id=" + currentDrama_id);
		$("#to_speechAnalysis").attr("href", "speeches.html?drama_id=" + currentDrama_id);
	};

init();