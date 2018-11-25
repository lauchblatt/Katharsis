Speeches.SpeechesModel = function(){
	var that = {};

	var currentDrama_id = 0;
	var scenesInfo = [];
	var dramaInfo = null;
	//Distribution object, consisting of the lenght of the speech as key for the number of appearances of this speech length
	var distribution = {};
	var distributionInPercent = {};

	var init = function(){
		var params = window.location.search
		currentDrama_id = (params.substring(params.indexOf("=") + 1));
		$(that).on("InitFinished", continueInit);
		initInfo("scenes_data");
		initInfo("drama_data");
	};

	var continueInit = function(){
		//check if all data of database is fetched
		if(scenesInfo.length > 0  && dramaInfo != null){
			calculateDistribution();
			calculateDistributionInPercent();
			$(that).trigger("InfoFinished");
		}
		
	};

	var calculateDistributionInPercent = function(){
		var total = 0;
		for(key in distribution){
			distributionInPercent[key] = (distribution[key]/dramaInfo.number_of_speeches_in_drama) * 100;
			total = distributionInPercent[key] + total;
		}
	};

	//Method to calculate Distribution, not calculated in Back-End
	var calculateDistribution = function(){
		for(act = 0; act < scenesInfo.length; act++){
			for(scene = 0; scene < scenesInfo[act].length; scene++){
				if(scenesInfo[act][scene].speeches !== undefined){
					for(var speech = 0; speech < scenesInfo[act][scene].speeches.length; speech++){
							var currentspeechLength = scenesInfo[act][scene].speeches[speech].length;
							//If speecheslenght doesnt exist create key in distribution-object for that length and count first entry
							if(distribution[currentspeechLength] === undefined){
								distribution[currentspeechLength] = 1;
							}else{
								//For every other speech with the length increase the value of the speech-length-key
								distribution[currentspeechLength] = distribution[currentspeechLength] + 1;
							}
					}	
				}
			}
		}
	};

	//catch alle info from database and trigger when ready
	var initInfo = function(name){
		firebaseRef = new Firebase("https://katharsis-2.firebaseio.com/" + name +"/" + currentDrama_id);
		firebaseRef.on("value", function(snapshot) {
			switch (name) {
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

	var getDramaInfo = function(){
		return dramaInfo;
	};

	var getScenesInfo = function(){
		return scenesInfo;
	};

	var getDistribution = function(){
		return distribution;
	};

	var getDistributionInPercent = function(){
		return distributionInPercent;
	};

	that.init = init;
	that.getDramaInfo = getDramaInfo;
	that.getScenesInfo = getScenesInfo;
	that.getDistribution = getDistribution;
	that.getDistributionInPercent = getDistributionInPercent;

	return that;
};