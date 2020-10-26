SingleDrama.DramaModel = function(){
	var that = {};
	var currentDrama_id = 0;
	var dramaInfo = null;
	var actsInfo = [];
	var scenesInfo = [];
	var firebaseRef = null;

	var init = function(){
		var params = window.location.search
		currentDrama_id = (params.substring(params.indexOf("=") + 1));
		$(that).on("InitFinished", continueInit);
		initInfo("drama_data");
		initInfo("acts_data");
		initInfo("scenes_data");
	};

	//check if all data is retrieved from database
	var continueInit = function(){
		if(scenesInfo.length > 0 && actsInfo.length > 0 && dramaInfo != null){
			//calculate necessary data for View
			calculateNumberOfScenesForAct();
			calculateNumberOfSpeakersForScene();
			$(that).trigger("InfoFinished");
		}
	};

	var calculateNumberOfScenesForAct = function(){
		for(act = 0; act < scenesInfo.length; act++){
			actsInfo[act].number_of_scenes = scenesInfo[act].length; 
		}
	};

	var calculateNumberOfSpeakersForScene = function(){
		for(act = 0; act < scenesInfo.length; act++){
			for(scene = 0; scene < scenesInfo[act].length; scene++){
				if(scenesInfo[act][scene].appearing_speakers != undefined && scenesInfo[act][scene].appearing_speakers != 0){
					scenesInfo[act][scene].number_of_speakers = scenesInfo[act][scene].appearing_speakers.length;
				}else{
					scenesInfo[act][scene].number_of_speakers = 1;
				}
				
			}
		}
	};

	var initInfo = function(name){
		firebaseRef = new Firebase("https://katharsis-3.firebaseio.com/" + name +"/" + currentDrama_id);
		firebaseRef.on("value", function(snapshot) {
			switch (name) {
				case "scenes_data":
					scenesInfo = snapshot.val();
					break;
				case "acts_data":
					actsInfo = snapshot.val();
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

	var getActInfo = function(){
		return actsInfo;
	};

	var getScenesInfo = function(){
		return scenesInfo;
	};

	var getDramaInfo = function(){
		return dramaInfo;
	};

	that.init = init;
	that.getActInfo = getActInfo;
	that.getScenesInfo = getScenesInfo;
	that.getDramaInfo = getDramaInfo;

	return that;
};