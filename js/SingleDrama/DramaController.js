SingleDrama.DramaController = function(){
	var that = {};

	var dramaModel = null;
	var tableDramaView = null;
	var barChartDramaView = null;

	var init = function(){

		dramaModel = SingleDrama.DramaModel();
		tableDramaView = SingleDrama.TableDramaView();
		barChartDramaView = SingleDrama.BarChartDramaView();

		dramaModel.init();
		barChartDramaView.init();
		initGoogleCharts();

		initListener();

	};

	//Workaround to get Google Charts working
	var initGoogleCharts = function(){
		// Load the Visualization API and the piechart package.
      	setTimeout(function(){google.load('visualization', '1', {'callback': doNothing, 
      		'packages':['corechart'], 'language': 'en'})}, 0);
	};

	var doNothing = function(){

	};

	var initListener = function(){
		$(dramaModel).on("InfoFinished", visu);
		$(barChartDramaView).on("ActSelectionClicked", visuActBarChart);
		$(barChartDramaView).on("ScenesSelectionClicked", visuScenesBarCharts);
	};

	//First Method to call when rendering for the first time
	var visu = function(event){
		var actInfo = dramaModel.getActInfo();
		var scenesInfo = dramaModel.getScenesInfo();
		var dramaInfo = dramaModel.getDramaInfo();

		tableDramaView.init(dramaInfo);
		tableDramaView.renderTable(actInfo, scenesInfo);

		barChartDramaView.setActSelection();
		barChartDramaView.drawChartAct(actInfo);

		barChartDramaView.setScenesSelection();
		barChartDramaView.drawChartScenes(scenesInfo);

		$(".container").fadeIn("slow");
		$("#loading").css("display", "none");
		$("#maincontent").fadeIn();
	};

	//Method to call when ActChart gets changed by Dropdown-Menu
	var visuActBarChart = function(event){
		var actInfo = dramaModel.getActInfo();
		barChartDramaView.setActSelection();
		barChartDramaView.drawChartAct(actInfo);
	};

	//Method to call when SceneChart gets changed by Dropdown-Menu
	var visuScenesBarCharts = function(event){
		var scenesInfo = dramaModel.getScenesInfo();
		barChartDramaView.setScenesSelection();
		barChartDramaView.drawChartScenes(scenesInfo);
	};

	that.init = init;

	return that;
};