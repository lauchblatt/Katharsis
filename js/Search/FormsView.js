Search.FormsView = function(){
	var that = {};

	var init = function(){
		$("#search-button").on("click", setFormInput);
		$("#more-button").on("click", showMoreRange);
		$("#less-button").on("click", showLessRange);
		//Init Enter-Button for Search
		$("body").on("keypress", function(event){
			var key = event.which || event.keyCode;
			if(key == 13){
				setFormInput();
			}
		});
		initTooltips();
		//setFormInput();
	};

	var initTooltips = function(){
		var tooltipOverall = $("#info-overall");
		tooltipOverall.tooltipster({
					content: 'You can analyze a specific single play or you can analyze and compare a collection of multiple plays',
					position: "right",
					trigger: 'hover',
					contentAsHTML: true
				});

		var tooltipOverall = $("#info-compare");
		tooltipOverall.tooltipster({
					content: 'You can analyze and compare a collection of multiple plays. <br/> Plays that are marked with a checkmark are integrated into the collection.',
					position: "right",
					trigger: 'hover',
					contentAsHTML: true
				});

		var tooltipOverall = $("#input-author");
		tooltipOverall.tooltipster({
					content: 'e.g.: <i>Goethe</i> or <i>Lessing Schiller Schlegel</i>',
					//content: '<i>z.B.:</i> Goethe <i>oder</i> Lessing Schiller Schlegel',
					position: "right",
					trigger: 'hover',
					contentAsHTML: true
				});
	};

	var showLessRange = function(){
		$("#more-button").fadeIn();
		$("#less-button").css("display", "none");
		$(".more-range").fadeOut();
	};

	var showMoreRange = function(){
		$("#more-button").css("display", "none");
		$("#less-button").fadeIn();
		$(".more-range").fadeIn();
	};

	var startLoadingAnimation = function(){
		$("#loading-text-button").text("Suche...");
		$("#loading-circle-button").css("display", "inline-block");
		$("#loading-spinner").css("display", "block");
	};

	//Catching all input
	var setFormInput = function(){
		startLoadingAnimation();
		//building input object with all necessary input data
		var input = {}

		//Title and author are captured as strings
		var title = $("#input-title").val();
		var author = $("#input-author").val();

		//Checking if type is checked
		var isComedy = $("#check-comedy").is(":checked");
		var isTragedy = $("#check-tragedy").is(":checked");
		var isPageant = $("#check-pageant").is(":checked");
		var isUnknown = $("#check-unknown").is(":checked");

		var date_from = $("#input-date-from").val();
		var date_to = $("#input-date-to").val();
		var acts_from = $("#input-numberOfActs-from").val();
		var acts_to = $("#input-numberOfActs-to").val();
		var scenes_from = $("#input-numberOfScenes-from").val();
		var scenes_to = $("#input-numberOfScenes-to").val();
		var speakers_from = $("#input-numberOfSpeakers-from").val();
		var speakers_to = $("#input-numberOfSpeakers-to").val();
		var confDensity_from = $("#input-confDensity-from").val();
		var confDensity_to = $("#input-confDensity-to").val();
		var avg_from = $("#input-avgSpeechLength-from").val();
		var avg_to = $("#input-avgSpeechLength-to").val();
		var numberOfSpeeches_from = $("#input-numberOfSpeeches-from").val();
		var numberOfSpeeches_to = $("#input-numberOfSpeeches-to").val();

		if(title != ""){input["title"] = title;}
		if(author != ""){input["author"] = author;}

		input["isComedy"] = isComedy;
		input["isTragedy"] = isTragedy;
		input["isPageant"] = isPageant;
		input["isUnknown"] = isUnknown;

		console.log("Hello World")

		//catching all Range-data as range-object with two values from and to
		var range = {};
		if(date_from != ""){range.from = parseInt(date_from);}
		if(date_to != ""){range.to = parseInt(date_to);}
		if(date_from != "" || date_to != ""){input["year"] = range;}

		var range = {};
		if(acts_from != ""){range.from = parseInt(acts_from);}
		if(acts_to != ""){range.to = parseInt(acts_to);}
		if(acts_from != "" || acts_to != ""){input["number_of_acts"] = range;}

		var range = {};
		if(scenes_from != ""){range.from = parseInt(scenes_from);}
		if(scenes_to != ""){range.to = parseInt(scenes_to);}
		if(scenes_from != "" || acts_to != ""){input["number_of_scenes"] = range;}

		var range = {};
		if(speakers_from != ""){range.from = parseInt(speakers_from);}
		if(speakers_to != ""){range.to = parseInt(speakers_to);}
		if(speakers_from != "" || speakers_to != ""){input["speaker_count"] = range;}

		var range = {};
		if(confDensity_from != ""){range.from = parseFloat(confDensity_from);}
		if(confDensity_to != ""){range.to = parseFloat(confDensity_to);}
		if(confDensity_from != "" || confDensity_to != ""){input["configuration_density"] = range;}

		var range = {};
		if(avg_from != ""){range.from = parseFloat(avg_from);}
		if(avg_to != ""){range.to = parseFloat(avg_to);}
		if(avg_from != "" || avg_to != ""){input["average_length_of_speeches_in_drama"] = range;}

		var range = {};
		if(numberOfSpeeches_from != ""){range.from = parseInt(numberOfSpeeches_from);}
		if(numberOfSpeeches_to  != ""){range.to = parseInt(numberOfSpeeches_to);}
		if(numberOfSpeeches_from != "" || numberOfSpeeches_to  != ""){input["number_of_speeches_in_drama"] = range;}

		$(that).trigger("InputCatched", [input]);
	};

	that.init = init;

	return that;
};