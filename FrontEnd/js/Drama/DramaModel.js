Drama.DramaModel = function(){
	var that = {};
	var currentDrama_id = 0;
	var dramaInfo = null;

	var init = function(){
		//Get ID of chosen drama
		var params = window.location.search
		currentDrama_id = (params.substring(params.indexOf("=") + 1));
		initInfo("drama_data");
	};

	var initInfo = function(name){
		firebaseRef = new Firebase("https://katharsis-3.firebaseio.com/" + name +"/" + currentDrama_id);
		firebaseRef.on("value", function(snapshot) {
		dramaInfo = snapshot.val();
		$(that).trigger("InitFinished");
		}, function (errorObject) {
		  console.log("The read failed: " + errorObject.code);
		});
	};

	var getDramaInfo = function(){
		return dramaInfo;
	};

	that.init = init;
	that.getDramaInfo = getDramaInfo;

	return that;
};