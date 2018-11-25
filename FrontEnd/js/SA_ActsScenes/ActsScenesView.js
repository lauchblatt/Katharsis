ActsScenes.ActsScenesView = function(){
	var that = {};
	var metricsForActs = [];
	var actsProportionData = {};
	var metricsForScenes = [];

	var init = function(metricsActs, proportionDataForActs, metricsScenes){
		metricsForActs = metricsActs;
		actsProportionData = proportionDataForActs;
		metricsForScenes = metricsScenes;

		initNumberOfActs(actsProportionData.length);
		initListener();

	};

	var initNumberOfActs = function(numberOfActs){
		$select = $("#selection-acts-pie-number");
		for(i = 0; i < numberOfActs; i++){
			option = $("<option></option>")
			actNumber = i + 1;
			option.text(actNumber.toString() + " .Akt");
			$select.append(option);
		}
	};

	var initListener = function(){
		$("#selection-act-bar-metric").change(renderActsBars);
		$("#selection-act-bar-normalisation").change(renderActsBars);

		$("#selection-acts-pie-number").change(renderActPieChart);
		$("#selection-acts-pie-metric").change(renderActPieChart);
		$("#selection-acts-pie-type").change(renderActPieChart);

		$("#selection-scenesPerAct-bar-metric").change(renderScenesPerActBars);
		$("#selection-scenesPerAct-bar-normalisation").change(renderScenesPerActBars);
	};

	var renderActPieChart = function(){
		var actNumber = $("#selection-acts-pie-number").val();
		var metric = $("#selection-acts-pie-metric").val();
		var type = $("#selection-acts-pie-type").val();
		actNumber = parseInt(actNumber) - 1;
		metric = transformGermanMetric(metric);
		type = transformGermanMetric(type);
		drawActPieChart(actNumber, type, metric);
	};

	var drawActPieChart = function(actNumber, proportionType, metricName){
		var data = new google.visualization.DataTable();
		data.addColumn("string", "Category");
		data.addColumn("number", "Count");

        data.addRows(actsProportionData[actNumber][proportionType][metricName]);
        var options = {
		  height: 600,
      		width: 1000,
      		chartArea:{width:'70%',height:'75%'},
          	title: 'Sentiment-Anteile pro Akt',
          	is3D: true,
        	};
        var chart = new google.visualization.PieChart(document.getElementById('chart-div-act-pie'))
        chart.draw(data, options)
	};

	var renderActsBars = function(){
		var metricSelection = $("#selection-act-bar-metric").val();
		var normalisationSelection = $("#selection-act-bar-normalisation").val()
		var metric = transformGermanMetric(metricSelection);
		var normalisation = transformGermanMetric(normalisationSelection);
		var metrics = getActsMetricsByName(normalisation, metric);

		drawBarChartAct(normalisationSelection, metricSelection, metrics);
	};

	var renderScenesPerActBars = function(){
		var metricSelection = $("#selection-scenesPerAct-bar-metric").val();
		var normalisationSelection = $("#selection-scenesPerAct-bar-normalisation").val()
		var metric = transformGermanMetric(metricSelection);
		var normalisation = transformGermanMetric(normalisationSelection);
		var metrics = getScenesPerActMetrics(normalisation, metric);
		drawChartScenesPerAct(normalisationSelection, metricSelection, metrics);
		
	}

	var getScenesPerActMetrics = function(normalisation, metricName){
		var specificMetricsForScenes = []
		for(var i = 0; i < metricsForScenes.length; i++){
			var specificMetricsForScenesPerAct = [];
			for(var j = 0; j < metricsForScenes[i].length; j++){
				var metric = metricsForScenes[i][j][normalisation][metricName];
				var sceneNumber = j+1
				var annotation = (Math.round(metric*10000)/10000).toString();
				var tuple = [sceneNumber, metric, annotation];
				specificMetricsForScenesPerAct.push(tuple);
			}
			specificMetricsForScenes.push(specificMetricsForScenesPerAct);
		}
		return specificMetricsForScenes;
	};

	var getActsMetricsByName = function(normalisation, metricName){
		var specificMetricsForActs = []
		for(var i = 0; i < metricsForActs.length; i++){
			metric = metricsForActs[i][normalisation][metricName];
			actName = (i+1).toString() + " .Akt";
			tuple = [actName, metric, (Math.round(metric * 10000) / 10000).toString()];
			specificMetricsForActs.push(tuple);
		}
		return specificMetricsForActs;
	};

	//Loop to render all Graphs for Scenes dynamically
	var drawChartScenesPerAct = function(normalisation, metricName, scenesMetricsPerAct){

		$charts_scenes = $("#charts-scenes");
		for(var act = 0; act < scenesMetricsPerAct.length; act++){
			$div_chart = $("<div></div>");
			$div_chart.addClass("scenes-chart");
			$div_chart.attr("id", "chart-div-scenes-" + act);
			$charts_scenes.append($div_chart);
			var actNumber = act + 1;
			drawBarChartForScenesInAct(("chart-div-scenes-" + act), normalisation, 
				metricName, scenesMetricsPerAct[act], actNumber);
		}
	};

	var drawBarChartForScenesInAct = function(divId, normalisation, metricName, metrics, actNumber){
        var vAxisTitle = metricName + " - " + normalisation
		var data = new google.visualization.DataTable();
		data.addColumn("number", "Scene-Number")
		data.addColumn("number", metricName)
		data.addColumn({type:'string', role:'annotation'})

        data.addRows(metrics);
        //necessary to have consistent gaps according to the scenes on the graph 
        var ticksArray = [];
        for(var k = 0; k < metrics.length; k++){
        	ticksArray.push(k+1);
        }
        var options = {title:'Szenen-Verlauf: ' + actNumber + " Akt",
        			   height: 600,
        			   width: 1170,
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
        			   	ticks: ticksArray
        			   },
        			   vAxis: {
        			   	title: vAxisTitle,
        			   	baseline: 0
        			   },
                   	   animation: {
                   	   	duration: 700,
                   	   	startup: true
                   	   }};
        
        var formatter = new google.visualization.NumberFormat(
    		{fractionDigits: 6});
		formatter.format(data, 1); // Apply formatter to second column

        var chart = new google.visualization.ColumnChart(document.getElementById(divId));

        var chart_div = document.getElementById(divId);

        chart.draw(data, options);
	};

	var drawBarChartAct = function(normalisation, metricName, numberMetricPairs){
		var vAxisTitle = metricName + " - " + normalisation
		var data = new google.visualization.DataTable();
		data.addColumn("string", "Act-Number")
		data.addColumn("number", metricName)
		data.addColumn({type:'string', role:'annotation'})
        data.addRows(numberMetricPairs);
        var options = {title:'Akt-Verlauf: ' + vAxisTitle,
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
        			   	title: 'Akte'
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
        
        var chart = new google.visualization.ColumnChart(document.getElementById('chart-div-act'));
        var chart_div = document.getElementById('chart-div-act');

        chart.draw(data, options);

	};

	that.init = init;
	that.renderActsBars = renderActsBars;
	that.renderActPieChart = renderActPieChart;
	that.renderScenesPerActBars = renderScenesPerActBars;

	return that;
};