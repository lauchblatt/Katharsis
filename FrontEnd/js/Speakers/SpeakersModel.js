Speakers.SpeakersModel = function(){
	var that = {};
	var currentDrama_id = 5;
	var speakersInfo = [];
	var scenesInfo = [];
	var dramaInfo = null;

	var init = function(){
		var params = window.location.search
		currentDrama_id = (params.substring(params.indexOf("=") + 1));
		$(that).on("InitFinished", continueInit);
		initInfo('speakers_data');
		initInfo("scenes_data");
		initInfo("drama_data");
	};

	var continueInit = function(){
		//check if alle Data is set and then continue
		if(speakersInfo.length > 0 && scenesInfo.length > 0  && dramaInfo != null){
			calculateAppearancePerSpeakers();
			roundAverageLengths();
			calculateScenesPerSpeakers();
			$(that).trigger("InfoFinished");
		}
		
	};

	// Method to calculate the percentage of appearances of one Speaker
	var calculateScenesPerSpeakers = function(){
		for(i = 0; i < speakersInfo.length; i++){
			var ratio = roundToTwoDecimals(speakersInfo[i].number_of_appearances/dramaInfo.number_of_scenes);
			var percentage = parseInt(ratio * 100);
			speakersInfo[i].appearances_percentage = percentage;
		}
	};

	var roundAverageLengths = function(){
		for(i = 0; i < speakersInfo.length; i++){
			speakersInfo[i].average_length_of_speakers_speeches = 
			roundToTwoDecimals(speakersInfo[i].average_length_of_speakers_speeches);
		}
	};

	//Method to calculate for every speaker his absolute number of appearances in drama
	var calculateAppearancePerSpeakers = function(){
		for(var speaker = 0; speaker < speakersInfo.length; speaker++){
			calculateAppearancePerSpeaker(speakersInfo[speaker]);
		}
	};

	//calculate absolute number of appearances of one speaker
	var calculateAppearancePerSpeaker = function(speaker){
		var appearances = 0;
		for(var act = 0; act < scenesInfo.length; act++){
			for(var scene = 0; scene < scenesInfo[act].length; scene++){
				if(!(scenesInfo[act][scene].appearing_speakers === undefined)){
					for(var i = 0; i < scenesInfo[act][scene].appearing_speakers.length; i++){
						if(speaker.name == scenesInfo[act][scene].appearing_speakers[i]){
							appearances++;
						}
					}
				}
			}
		}
		//Add the number of appearances as value to the speaker-object in speakersInfo to fetch it later
		speaker.number_of_appearances = appearances;
	}

	//Get all necessary info of the database, and trigger when finished
	var initInfo = function(name){
		firebaseRef = new Firebase("https://katharsis-3.firebaseio.com/" + name +"/" + currentDrama_id);
		firebaseRef.on("value", function(snapshot) {
			switch (name) {
				case "speakers_data":
					speakersInfo = snapshot.val();
					break;
				case "scenes_data":
					scenesInfo = snapshot.val();
					break;
				case "drama_data":
					dramaInfo = snapshot.val();
					break;
				default:
					console.log("Something went wrong.");
			}
			$(that).trigger("InitFinished");
		}, function (errorObject) {
		  console.log("The read failed: " + errorObject.code);
		});
	};

	var roundToTwoDecimals = function(number){
		number = (Math.round(number * 100)/100).toFixed(2);
		return parseFloat(number)
	};

	var getSpeakersInfo = function(){
		return speakersInfo;
	};

	var getDramaInfo = function(){
		return dramaInfo;
	};

	that.init = init;
	that.getSpeakersInfo = getSpeakersInfo;
	that.getDramaInfo = getDramaInfo;

	return that;
};