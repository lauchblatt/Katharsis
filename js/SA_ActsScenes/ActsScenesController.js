ActsScenes.ActsScenesController = function(){
	var that = {};

	var actsScenesModel = null;
	var actsScenesView = null;
	var dramaView = null;
	var scenesView = null;
	var speechesView = null;
	var basicDramaView = null;

	var init = function(){
		actsScenesModel = ActsScenes.ActsScenesModel();
		actsScenesView = ActsScenes.ActsScenesView();
		dramaView = ActsScenes.DramaView();
		scenesView = ActsScenes.ScenesView();
		speechesView = ActsScenes.SpeechesView();
		basicDramaView = ActsScenes.BasicDramaView();
		initGoogleCharts();
	};

	//Workaround to get Google Charts working
	var initGoogleCharts = function(){
		// Load the Visualization API and the piechart package.
      	setTimeout(function(){google.load('visualization', '1', {'callback': continueInit, 
      		'packages':['corechart', 'controls']})}, 0);
	};

	var continueInit = function(){
		actsScenesModel.init();
		var metricsActs = actsScenesModel.getMetricsActs();
		var actsProportionData = actsScenesModel.getActsProportionData();
		var metricsScenes = actsScenesModel.getMetricsScenes();
		var dramaProportionData = actsScenesModel.getDramaProportionData();
		var scenesProportionData = actsScenesModel.getScenesProportionData();
		var pureMetricsScenes = actsScenesModel.getPureMetricsScenes();
		var metricsSpeeches = actsScenesModel.getMetricsSpeeches();
		var basicDramaData = actsScenesModel.getBasicDramaData();
		
		$("#mainpage").show();
		dramaView.init(dramaProportionData);
		actsScenesView.init(metricsActs, actsProportionData, metricsScenes);
		scenesView.init(pureMetricsScenes, scenesProportionData);
		speechesView.init(metricsSpeeches);
		basicDramaView.init(basicDramaData);
		
		dramaView.renderDramaPieChart();
		actsScenesView.renderActsBars();
		actsScenesView.renderActPieChart();
		actsScenesView.renderScenesPerActBars();
		scenesView.renderScenesPieChart();
		scenesView.renderScenesLineChart();
		speechesView.renderSpeechesLineChart();
		basicDramaView.renderDramaBars();

		$("#mainpage").hide();
		$("#mainpage").fadeIn();
	};

	that.init = init;

	return that;
};