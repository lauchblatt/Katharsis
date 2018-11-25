MultipleDramas.MultipleDramasModel = function(){
	var that = {};
	var dramaInfo = [];
	var scenesInfo = [];
	var firebaseRef = null;
	var chosenDramasIds = [];
	var chosenDramas = [];
	var chosenScenes = [];
	var authorList = [];
	var categoryList = [];

	//Lists and objects to calculate Distribution on server-side
	//Better for performance to calculate everything at once than during usage
	var distribution = {};
	var authorDistribution = [];
	var categoryDistribution = [];

	var init = function(){
		/*Testing purposes
		for(var i = 96; i < 110; i++){
			chosenDramasIds.push(i);
		}
		$(that).on("InitFinished", continueInit);
		initInfo("drama_data");
		initInfo("scenes_data");
		*/

		//Get the chosen dramas
		var chosenDramasIdsStrings = JSON.parse(localStorage["collection"]);
		for(var i = 0; i < chosenDramasIdsStrings.length; i++){
			chosenDramasIds.push(parseInt(chosenDramasIdsStrings[i]));
		}
		$(that).on("InitFinished", continueInit);
		initInfo("drama_data");
		initInfo("scenes_data");

	};

	var continueInit = function(){
		//check if data is catches and start all calculations
		if(dramaInfo != null && scenesInfo.length > 0){
			setChosenDramas();
			setChosenScenes();
			roundValues();
			calculateSpeechDistribution();
			setAuthorList();
			setCategoryList();
			categoryDistribution = calculateFilteredDistribution(categoryList);
			authorDistribution = calculateFilteredDistribution(authorList);
			$(that).trigger("InfoFinished");
		}
	};

	var getCategoryDistribution = function(){
		return categoryDistribution;
	};

	var getAuthorDistribution = function(){
		return authorDistribution;
	};

	// Method to calculate Speech Distribution
	var calculateSpeechDistribution = function(){
		var total = 0;
		
		for(drama = 0; drama < chosenScenes.length; drama++){
			for(act = 0; act < chosenScenes[drama].length; act++){
				for(scene = 0; scene < chosenScenes[drama][act].length; scene++){
					if(chosenScenes[drama][act][scene].speeches !== undefined){
						for(speech = 0; speech < chosenScenes[drama][act][scene].speeches.length; speech++){
								var currentspeechLength = chosenScenes[drama][act][scene].speeches[speech].length;
								//If speechlength doesnt exist yet, create new key with the value 1
								if(distribution[currentspeechLength] === undefined){
									distribution[currentspeechLength] = 1;
									total++;
								}else{
								//if speechlength does exist, increase length by one because another instance with the length was discovered
									distribution[currentspeechLength] = distribution[currentspeechLength] + 1;
									total++;
								}
						}	
					}
				}
			}
		}
		//Save number of all Speechlenghts that are present --> easier to calculate relative distribution
		distribution.total = total;
		
	};

	//Method to calculate a Distribution for different Types like Categories or authors
	var calculateFilteredDistribution = function(filteredList){

		//Array of distributions with one distribution-object for every category or author
		var distributionsList = [];
		for(var type = 0; type < filteredList.length; type++){
			var distributionObject = {};
			var total = 0;

			//First check if we deal with categories or authors and init the object accordingly
			if(filteredList[type].type !== undefined){
				distributionObject.type = filteredList[type].type;
			}
			if(filteredList[type].name !== undefined){
				distributionObject.name = filteredList[type].name;
			}
			
			//Get to the speech-level of the dramas to calculate the distribution, do it for every category or author
			for(var drama = 0; drama < filteredList[type].scenes.length; drama++){
				for(var act = 0; act < filteredList[type].scenes[drama].length; act++){
					for(var scene = 0; scene < filteredList[type].scenes[drama][act].length; scene++){
						if(filteredList[type].scenes[drama][act][scene].speeches !== undefined){
							for(var speech = 0; speech < filteredList[type].scenes[drama][act][scene].speeches.length; speech++){
								var currentspeechLength = filteredList[type].scenes[drama][act][scene].speeches[speech].length;
								if(distributionObject[currentspeechLength] === undefined){
									distributionObject[currentspeechLength] = 1;
									total++;
								}else{
									distributionObject[currentspeechLength] = distributionObject[currentspeechLength] + 1;
									total++;
								}
							}
						}
					}
				}
			}
			distributionObject.total = total;
			//Result are objects of distributions for every type which are saved in gloabal list
			distributionsList.push(distributionObject);
		}
		return distributionsList;
	};

	var roundValues = function(){
		for(var i = 0; i < chosenDramas.length; i++){
			chosenDramas[i].configuration_density = roundToTwoDecimals(chosenDramas[i].configuration_density);
			chosenDramas[i].average_length_of_speeches_in_drama = roundToTwoDecimals(chosenDramas[i].average_length_of_speeches_in_drama);
		}
	};

	//generate List of categories and custom category-objects
	var setCategoryList = function(){
		var categories = [];
		for(var i = 0; i < chosenDramas.length; i++){
			if($.inArray(chosenDramas[i].type, categories) === -1){
				if(chosenDramas[i].type !== undefined){
					categories.push(chosenDramas[i].type);
				}
			}
		}

		for(var i = 0; i < categories.length; i++){
			var dramaObjects = $.grep(chosenDramas, function(e){ return e.type == categories[i]; });
			var scenes = [];
			for(var j = 0; j < dramaObjects.length; j++){
				scenes.push(scenesInfo[dramaObjects[j].id]);
			}
			var categoryObject = generateCategoryObject(dramaObjects, scenes);
			categoryList.push(categoryObject);
		}
	};

	var getCategoryList = function(){
		return categoryList;
	};

	//generate custom Author Object to hold all necessary infos, --> easier to use in view
	var generateCategoryObject = function(dramaObjects, scenes){
		var categoryObj = {};

		categoryObj.type = dramaObjects[0].type;
		var average_number_of_scenes = 0;
		var average_number_of_speeches = 0;
		var average_number_of_speakers = 0;
		var average_configuration_density = 0;
		var average_average_length_of_speeches = 0;
		var average_median_length_of_speeches = 0;
		var average_maximum_length_of_speeches = 0;
		var average_minimum_length_of_speeches = 0;
		var titles = [];

		for(var i = 0; i < dramaObjects.length; i++){
			average_number_of_scenes += dramaObjects[i].number_of_scenes;
			average_number_of_speeches += dramaObjects[i].number_of_speeches_in_drama;
			average_number_of_speakers += dramaObjects[i].speakers.length;
			average_configuration_density += dramaObjects[i].configuration_density;
			average_average_length_of_speeches += dramaObjects[i].average_length_of_speeches_in_drama;
			average_median_length_of_speeches += dramaObjects[i].median_length_of_speeches_in_drama;
			average_maximum_length_of_speeches += dramaObjects[i].maximum_length_of_speeches_in_drama;
			average_minimum_length_of_speeches += dramaObjects[i].minimum_length_of_speeches_in_drama;
			titles.push(dramaObjects[i].title);
		}

		categoryObj.average_number_of_scenes = roundToTwoDecimals(average_number_of_scenes/dramaObjects.length);
		categoryObj.average_number_of_speeches = roundToTwoDecimals(average_number_of_speeches/dramaObjects.length);
		categoryObj.average_number_of_speakers = roundToTwoDecimals(average_number_of_speakers/dramaObjects.length);
		categoryObj.average_configuration_density = roundToTwoDecimals(average_configuration_density/dramaObjects.length);
		categoryObj.average_average_length_of_speeches = roundToTwoDecimals(average_average_length_of_speeches/dramaObjects.length);
		categoryObj.average_median_length_of_speeches = roundToTwoDecimals(average_median_length_of_speeches/dramaObjects.length);
		categoryObj.average_maximum_length_of_speeches = roundToTwoDecimals(average_maximum_length_of_speeches/dramaObjects.length);
		categoryObj.average_minimum_length_of_speeches = roundToTwoDecimals(average_minimum_length_of_speeches/dramaObjects.length);
		categoryObj.titles = titles;
		categoryObj.scenes = scenes;

		return categoryObj;

	};

	//generate out of dramalist a list of different authors
	var setAuthorList = function(){
		var authors = [];
		for(var i = 0; i < chosenDramas.length; i++){
			if($.inArray(chosenDramas[i].author, authors) === -1){
				authors.push(chosenDramas[i].author);
			}
		}
		var l = 0;
		for(var i = 0; i < authors.length; i++){
			var dramaObjects = $.grep(chosenDramas, function(e){ return e.author == authors[i]; });
			var scenes = [];
			for(var j = 0; j < dramaObjects.length; j++){
				scenes.push(scenesInfo[dramaObjects[j].id]);
			}
			l+=(dramaObjects.length);
			var authorObject = generateAuthorObject(dramaObjects, scenes);
			authorList.push(authorObject);
		}
	};

	var getAuthorList = function(){
		return authorList;
	};

	//generate custom Author Object to hold all necessary infos, --> easier to use in view
	var generateAuthorObject = function(dramaObjects, scenes){
		var authorObj = {};

		authorObj.name = dramaObjects[0].author;
		var average_number_of_scenes = 0;
		var average_number_of_speeches = 0;
		var average_number_of_speakers = 0;
		var average_configuration_density = 0;
		var average_average_length_of_speeches = 0;
		var average_median_length_of_speeches = 0;
		var average_maximum_length_of_speeches = 0;
		var average_minimum_length_of_speeches = 0;
		var titles = [];

		for(var i = 0; i < dramaObjects.length; i++){
			average_number_of_scenes += dramaObjects[i].number_of_scenes;
			average_number_of_speeches += dramaObjects[i].number_of_speeches_in_drama;
			average_number_of_speakers += dramaObjects[i].speakers.length;
			average_configuration_density += dramaObjects[i].configuration_density;
			average_average_length_of_speeches += dramaObjects[i].average_length_of_speeches_in_drama;
			average_median_length_of_speeches += dramaObjects[i].median_length_of_speeches_in_drama;
			average_maximum_length_of_speeches += dramaObjects[i].maximum_length_of_speeches_in_drama;
			average_minimum_length_of_speeches += dramaObjects[i].minimum_length_of_speeches_in_drama;
			titles.push(dramaObjects[i].title);
		}

		authorObj.average_number_of_scenes = roundToTwoDecimals(average_number_of_scenes/dramaObjects.length);
		authorObj.average_number_of_speeches = roundToTwoDecimals(average_number_of_speeches/dramaObjects.length);
		authorObj.average_number_of_speakers = roundToTwoDecimals(average_number_of_speakers/dramaObjects.length);
		authorObj.average_configuration_density = roundToTwoDecimals(average_configuration_density/dramaObjects.length);
		authorObj.average_average_length_of_speeches = roundToTwoDecimals(average_average_length_of_speeches/dramaObjects.length);
		authorObj.average_median_length_of_speeches = roundToTwoDecimals(average_median_length_of_speeches/dramaObjects.length);
		authorObj.average_maximum_length_of_speeches = roundToTwoDecimals(average_maximum_length_of_speeches/dramaObjects.length);
		authorObj.average_minimum_length_of_speeches = roundToTwoDecimals(average_minimum_length_of_speeches/dramaObjects.length);
		authorObj.titles = titles;
		authorObj.scenes = scenes;

		return authorObj;

	};

	var setChosenDramas = function(){
		for(var i = 0; i < dramaInfo.length; i++){
			if(chosenDramasIds.indexOf(dramaInfo[i].id) > -1){
				chosenDramas.push(dramaInfo[i]);
			}
		}
	};

	var setChosenScenes = function(){
		for(var i = 0; i < chosenDramasIds.length; i++){
			chosenScenes.push(scenesInfo[chosenDramasIds[i]]);
		}
	};

	var getChosenDramas = function(){
		return chosenDramas;
	}

	var initInfo = function(name){
		firebaseRef = new Firebase("https://katharsis-2.firebaseio.com/" + name);
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

	var roundToTwoDecimals = function(number){
		number = (Math.round(number * 100)/100).toFixed(2);
		return parseFloat(number)
	};

	var getDistribution = function(){
		return distribution;
	};

	that.init = init;
	that.getChosenDramas = getChosenDramas;
	that.getAuthorList = getAuthorList;
	that.getCategoryList = getCategoryList;
	that.getDistribution = getDistribution;
	that.getAuthorDistribution = getAuthorDistribution;
	that.getCategoryDistribution = getCategoryDistribution;

	return that;
};