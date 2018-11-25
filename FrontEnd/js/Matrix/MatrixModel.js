Matrix.MatrixModel = function(){
	var that = {};
	var currentDrama_id = 0;
	//!!! Important for future dramas with for example only one act
	//Only works, if dramaInfo is an Object, scenesInfo, actsInfo, speakersInfo is Array

	/* Globals to work with db-Info */
	var dramaInfo = null;
	var scenesInfo = [];
	var actsInfo = [];
	var speakersInfo = [];
	var firebaseRef = null; 

	/* Fields to calculate and represent matrix */

	var speakersNames = [];
	/* Two Dimensional Arrays are not supported for javascript */
	var matrix = [];

	var init = function(){
		var params = window.location.search
		currentDrama_id = (params.substring(params.indexOf("=") + 1));
		$(that).on("InitFinished", continueInit);
		initInfo("drama_data");
		initInfo("scenes_data");
		initInfo("acts_data");
		initInfo("speakers_data")
	};

	var continueInit = function(){
		if(dramaInfo && scenesInfo.length > 0 && actsInfo.length > 0 && speakersInfo.length > 0){
			console.log("everything is set");
			speakersNames = dramaInfo.speakers;
			calculateMatrix();
			$(that).trigger("ModelInitFinished");
		}
	};

	var calculateMatrix = function(){
		/* Init Two Dimensional Matrix */
		initMatrix();

		for(var i = 0; i < dramaInfo.speakers.length; i++){
			sceneCounter = 0;
			for(var j = 0; j < scenesInfo.length; j++){
				for(var k = 0; k < scenesInfo[j].length; k++){					
					var speakerAppears = checkIfSpeakerInList(dramaInfo.speakers[i],
						scenesInfo[j][k].appearing_speakers);
					if(speakerAppears){
						var speakersSpeeches = getSpeakersSpeeches(dramaInfo.speakers[i], scenesInfo[j][k].speeches);
						var speakerCell = getCellObject(dramaInfo.speakers[i], speakersSpeeches);
						matrix[i][sceneCounter] = speakerCell;
					}else{
						var speakerCell = {};
						speakerCell.matrix_number = 0;
						speakerCell.name = dramaInfo.speakers[i];
						matrix[i][sceneCounter] = speakerCell;
					}
					sceneCounter++;
				}
			}
		}
		//console.log(matrix);
	};

	//Generate an object to hold all data necessary to present infos for inner cells in the matrix
	//This Data is not calculated in Back-End
	var getCellObject = function(name, speakerSpeeches){
		var cellObj = {};
		var speechesLengths = [];
		for(var i = 0; i < speakerSpeeches.length; i++){
			speechesLengths.push(speakerSpeeches[i].length);
		}
		cellObj.matrix_number = 1;
		cellObj.speaker = name;
		cellObj.number_of_speeches = speakerSpeeches.length;
		cellObj.average = getAverage(speechesLengths);
		cellObj.median = getMedian(speechesLengths);
		cellObj.max = getMax(speechesLengths);
		cellObj.min = getMin(speechesLengths);

		return cellObj;
	};

	var getAverage = function(numbers){
		var count = 0; 
		for(var i = 0; i < numbers.length; i++){
			count = count + numbers[i];
		};

		return roundToTwoDecimals(count/numbers.length);

	};

	var getMedian = function(numbers){

		numbers.sort( function(a,b) {return a - b;} );
 
	    var half = Math.floor(numbers.length/2);
	 
	    if(numbers.length % 2)
	        return numbers[half];
	    else
	        return (numbers[half-1] + numbers[half]) / 2.0;
	};

	var getMax = function(numbers){
		return Math.max.apply(Math, numbers);
	};

	var getMin = function(numbers){
		return Math.min.apply(Math, numbers);
	};

	var getSpeakersSpeeches = function(speaker, speeches){
		var newSpeeches = [];
		for(var i = 0; i < speeches.length; i++){
			if(speaker == speeches[i].speaker){
				newSpeeches.push(speeches[i]);
			}
		}
		return newSpeeches;
	};

	var checkIfSpeakerInList = function(speaker, speakerList){
		console.log(speakerList);
		//Catch exceptions of database
		if(speakerList === undefined || speakerList == 0){
			return false;
		}
		if (speakerList.indexOf(speaker) > -1) {
    		return true;
		} else {
    		return false;
		}
	};

	// Work-Around to generate somethin like a two-dimensional Array to represent the matrix
	var initMatrix = function(){
		matrix = new Array(dramaInfo.speakers.length);
		for(var i = 0; i < dramaInfo.speakers.length; i++){
			matrix[i] = new Array(dramaInfo.number_of_scenes);
		}
	};

	var initInfo = function(name){
		firebaseRef = new Firebase("https://katharsis-2.firebaseio.com/" + name +"/" + currentDrama_id);
		firebaseRef.on("value", function(snapshot) {
			switch (name) {
				case "scenes_data":
					scenesInfo = snapshot.val();
					break;
				case "acts_data":
					actsInfo = snapshot.val();
					break;
				case "speakers_data":
					speakersInfo = snapshot.val();
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

	var getActsInfo = function(){
		return actsInfo;
	};

	var getSpeakersInfo = function(){
		return speakersInfo;
	};

	var getMatrix = function(){
		return matrix;
	};

	var roundToTwoDecimals = function(number){
		number = (Math.round(number * 100)/100).toFixed(2);
		return number
	};

	that.init = init;
	that.getDramaInfo = getDramaInfo;
	that.getScenesInfo = getScenesInfo;
	that.getActsInfo = getActsInfo;
	that.getSpeakersInfo = getSpeakersInfo;
	that.getMatrix = getMatrix;

	return that;
};