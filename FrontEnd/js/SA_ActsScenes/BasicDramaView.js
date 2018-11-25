ActsScenes.BasicDramaView = function(){
	var that = {};
	var metricsForDrama = {};

	var init = function(dramaMetrics){
		metricsForDrama = dramaMetrics;
		initListener();

	};

	var initListener = function(){
		$("#selection-basicDrama-bar-metric").change(renderDramaBars);
		$("#selection-basicDrama-bar-normalisation").change(renderDramaBars);
	};


	var renderDramaBars = function(){
		var metricSelection = $("#selection-basicDrama-bar-metric").val();
		var normalisationSelection = $("#selection-basicDrama-bar-normalisation").val()
		var metric = transformGermanMetric(metricSelection);
		var normalisation = transformGermanMetric(normalisationSelection);
		
		var metrics = getDramaMetrics(normalisation, metric);
		drawBarChartDrama(normalisationSelection, metricSelection, metrics);
		
	}

	var getDramaMetrics = function(normalisation, metricName){
		var metrics = [];
		var selectedMetrics = metricsForDrama[normalisation][metricName];
		for(var metricName in selectedMetrics){
			var singleMetric = selectedMetrics[metricName];
			var color = "color: ";
			if(metricName == "positiveSentiWS" || metricName == "positiveSentiWSDichotom"){
				color = "color: green";
			}
			if(metricName == "negativeSentiWS" || metricName == "negativeSentiWSDichotom"){
				color = "color: red";
			}
			if(metricName == "negativeSentiWS"){
				singleMetric = singleMetric * -1;
			}
			var row = [transformEnglishMetric(metricName), singleMetric, (Math.round(singleMetric * 10000) / 10000).toString(), color];
			metrics.push(row);
		}
		return metrics;
	};

	var drawBarChartDrama = function(normalisation, metricName, metrics){
		var vAxisTitle = metricName + " - " + normalisation
		var data = new google.visualization.DataTable();
		data.addColumn("string", "Metric-Name");
		data.addColumn("number", normalisation);
		data.addColumn({type:'string', role:'annotation'});
		data.addColumn({type:'string', role:'style'});
		
        data.addRows(metrics);
        var options = {title:'Sentiments im Drama: ' + vAxisTitle,
        			   height: 600,
        			   width: 1130,
        			   legend: {
        			   	position: 'none'
        			   },
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
        			   	title: metricName
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
        
        var chart = new google.visualization.ColumnChart(document.getElementById('chart-div-basicDrama'));

        chart.draw(data, options);
	};

	that.init = init;
	that.renderDramaBars = renderDramaBars;

	return that;
};