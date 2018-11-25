SA_Relations.RelationsController = function(){
	var that = {};

	var relationsModel = null;
	var dramaView = null;
	var actsView = null;
	var scenesView = null;
	var proportionsView = null;

	var init = function(){
		relationsModel = SA_Relations.RelationsModel();
		dramaView = SA_Relations.RelationsDramaView();
		actsView = SA_Relations.RelationsActsView();
		scenesView = SA_Relations.RelationsScenesView();
		proportionsView = SA_Relations.RelationsProportionsView();

		initGoogleCharts();
	};

	//Workaround to get Google Charts working
	var initGoogleCharts = function(){
		// Load the Visualization API and the piechart package.
      	setTimeout(function(){google.load('visualization', '1', {'callback': continueInit, 
      		'packages':['corechart', 'controls']})}, 0);
	};

	var continueInit = function(){
		relationsModel.init();
		var dramaRelationsMetrics = relationsModel.getDramaRelationsMetrics();
		var actsRelationsMetrics = relationsModel.getActsRelationsMetrics();
		var scenesRelationsMetrics = relationsModel.getScenesRelationsMetrics();
		var numberOfActs = relationsModel.getNumberOfActs();
		var scenesPerAct = relationsModel.getNumberOfScenesPerAct();

		var dramaProportions = relationsModel.getDramaRelationsProportions();
		var actsProportions = relationsModel.getActsRelationsProportions();
		var scenesProportions = relationsModel.getScenesRelationsProportions();
		$("#mainpage").show();
		dramaView.init(dramaRelationsMetrics);
		dramaView.renderRelationsDrama();
		actsView.init(actsRelationsMetrics, numberOfActs);
		actsView.renderRelationsActs();
		scenesView.init(scenesRelationsMetrics, scenesPerAct);
		scenesView.renderRelationsScenes();
		proportionsView.init(dramaProportions, actsProportions, scenesProportions);
		proportionsView.renderRelationsPieChart();
		$("#mainpage").hide();
		$("#mainpage").fadeIn();
		

	};

	that.init = init;

	return that;
};