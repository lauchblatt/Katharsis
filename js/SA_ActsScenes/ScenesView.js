ActsScenes.ScenesView = function(){
	var that = {};
	var metricsForScenes = [];
	var proportionsForScenes = [];

	var init = function(scenesMetrics, scenesProportionData){
		proportionsForScenes = scenesProportionData;
		metricsForScenes = scenesMetrics;
		initNumberOfActs(proportionsForScenes.length);
		initNumberOfScenes(proportionsForScenes[0].length);
		initListener();
	};

	var initListener = function(){

		$("#selection-scenes-act-pie-number").change(adjustSceneSelectorAndRenderScenesPieChart);
		$("#selection-scenes-pie-number").change(renderScenesPieChart);
		$("#selection-scenes-pie-metric").change(renderScenesPieChart);
		$("#selection-scenes-pie-type").change(renderScenesPieChart);

		$("#selection-dramaScenes-line-metric").change(renderScenesLineChart);
		$("#selection-dramaScenes-line-type").change(renderScenesLineChart);
	};

	var initNumberOfActs = function(numberOfActs){
		$select = $("#selection-scenes-act-pie-number");
		for(i = 0; i < numberOfActs; i++){
			option = $("<option></option>")
			actNumber = i + 1;
			option.text(actNumber.toString() + " .Akt");
			$select.append(option);
		}
	};

	var initNumberOfScenes = function(numberOfScenes){
		$select = $("#selection-scenes-pie-number");
		for(i = 0; i < numberOfScenes; i++){
			option = $("<option></option>")
			sceneNumber = i + 1;
			option.text(sceneNumber.toString() + " .Szene");
			$select.append(option);
		}
	};

	var adjustSceneSelectorAndRenderScenesPieChart = function(){
		$("#selection-scenes-pie-number option").eq(0).prop('selected', true);
		renderScenesPieChart();
	};

	var renderScenesLineChart = function(){
		var metricSelection = $("#selection-dramaScenes-line-metric").val();
		var typeSelection = $("#selection-dramaScenes-line-type").val();
		var metric = transformGermanMetric(metricSelection);
		var type = transformGermanMetric(typeSelection);

		var dramaSceneMetricPairs = getDramaSceneMetricPairs(metric, type);
		drawScenesLineChart(dramaSceneMetricPairs, metricSelection, typeSelection);
	};

	var getDramaSceneMetricPairs = function(metric, type){
		var dataScenesPairs = []
		for(i = 0; i < metricsForScenes.length; i++){
			annotation = metricsForScenes[i].numberOfAct.toString() + ". Akt, " + 
			metricsForScenes[i].numberOfScene.toString() + ". Szene";

			var dataSceneMetric = metricsForScenes[i][type][metric];
			var pair = [annotation, dataSceneMetric]; 
			dataScenesPairs.push(pair);
		}
		return dataScenesPairs;
	};

	var drawScenesLineChart = function(metricPairs, germanMetric, germanType){
		var vAxisTitle = germanMetric + " - " + germanType;
		var data = new google.visualization.DataTable();
		data.addColumn("string", "dramaScene-Number")
		data.addColumn("number", germanMetric)

        data.addRows(metricPairs);
        var options = {title:'Szenen-Verlauf (ganzes Drama): ' + vAxisTitle,
        			   height: 600,
        			   width: 1130,
        			   chartArea:{width:'70%',height:'75%'},
        			    trendlines: {
				          0: {
				          	tooltip: false,
				            type: 'polynomial',
				            color: 'green',
				            lineWidth: 3,
				            opacity: 0.3,
				            showR2: false,
				            visibleInLegend: false
				          }
				        },
				        hAxis: {
        			   	title: 'Szenen',
        			   	slantedText: false
        			   },
        			   vAxis: {
        			   	title: vAxisTitle,
        			   	baseline: 0,
        			   },
                   	   animation: {
                   	   	duration: 700,
                   	   	startup: true
                   	   }};

        var formatter = new google.visualization.NumberFormat(
    		{fractionDigits: 6});
		formatter.format(data, 1); // Apply formatter to second column
        
        var chart = new google.visualization.LineChart(document.getElementById('chart-div-dramaScenes-line'));

        chart.draw(data, options);
	};

	var renderScenesPieChart = function(){
		var actNumber = parseInt($("#selection-scenes-act-pie-number").val()) - 1;
		var sceneNumber = parseInt($("#selection-scenes-pie-number").val()) - 1;
		var metricSelection = $("#selection-scenes-pie-metric").val();
		var typeSelection = $("#selection-scenes-pie-type").val();

		var metric = transformGermanMetric(metricSelection);
		var type = transformGermanMetric(typeSelection);
		drawScenesPieChart(type, metric, actNumber, sceneNumber, metricSelection, typeSelection);
	};

	var drawScenesPieChart = function(proportionType, metricName, actNumber, sceneNumber, germanMetric, germanType){

		var data = new google.visualization.DataTable();
		data.addColumn("string", "Category");
		data.addColumn("number", "Count");

        data.addRows(proportionsForScenes[actNumber][sceneNumber][proportionType][metricName]);
        var options = {
		  height: 600,
      		width: 1000,
      		chartArea:{width:'70%',height:'75%'},
          	title: 'Sentiment-Anteile: ' + germanMetric + " - " + germanType,
          	is3D: true,
        	};
        var chart = new google.visualization.PieChart(document.getElementById('chart-div-scenes-pie'))
        chart.draw(data, options)

	};

	that.init = init;
	that.renderScenesPieChart = renderScenesPieChart;
	that.renderScenesLineChart = renderScenesLineChart;

	return that;
};