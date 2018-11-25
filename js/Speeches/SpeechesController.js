Speeches.SpeechesController = function(){
	var that = {};

	var speechesModel = null;
	var speechesDistributionView = null;
	var speechesLineView = null;

	var init = function(){
		speechesModel = Speeches.SpeechesModel();
		speechesDistributionView = Speeches.SpeechesDistributionView();
		speechesLineView = Speeches.SpeechesLineView();
		speechesLineView.init();
		initGoogleCharts();

		initListener();

		speechesModel.init();
	};

	var initListener = function(){
		$(speechesModel).on("InfoFinished", visu);
		$(speechesLineView).on("SelectionClicked", visuCurve);
	};

	//Render CurveView new if selection of dropdown-menu is changed
	var visuCurve = function(){
		speechesLineView.setSelection();
		var selection = speechesLineView.getSelection();
		var distribution = null;
		//Get appropriate Distribution from Model
		if(selection == "Absolute"){
			distribution = speechesModel.getDistribution();
			speechesLineView.renderAbsolute(distribution)
		}
		if(selection == "Relative"){
			distribution = speechesModel.getDistributionInPercent();
			speechesLineView.renderRelative(distribution)
		}

		
	};

	//Method to Call when first rendered
	var visu = function(){
		var scenesInfo = speechesModel.getScenesInfo();
		var dramaInfo = speechesModel.getDramaInfo();
		speechesDistributionView.render(scenesInfo);

		var distribution = speechesModel.getDistributionInPercent();
		speechesLineView.renderRelative(distribution);

		$("#dramaTitle").text(dramaInfo.title + " (" + dramaInfo.year + ")");
		$("#dramaAuthor").text(dramaInfo.author);

		$(".container").fadeIn("slow");
		$("#loading").css("display", "none");
		$("#maincontent").fadeIn();
	};

	//necessary workaround to get google charts working, as crazy as it looks
	var initGoogleCharts = function(){
		// Load the Visualization API and the package.
      	setTimeout(function(){google.load('visualization', '1', {'callback': doNothing, 
      		'packages':['corechart', 'controls'], 'language': 'en'})}, 0);
	};

	var doNothing = function(){

	};

	that.init = init;

	return that;
};