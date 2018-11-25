SA_Speakers.BasicDramaSpeakersView = function(){
	var that = {};
	var metricsForDrama = {};

	var init = function(dramaMetrics){
		metricsForDrama = dramaMetrics;
		initListener();
		renderSpeakers();

	};

	var initListener = function(){
		$("#selection-basicDramaSpeakers-speaker-bar").change(renderDramaSpeakerBars);
		$("#selection-basicDramaSpeakers-bar-metric").change(renderDramaSpeakerBars);
		$("#selection-basicDramaSpeakers-bar-normalisation").change(renderDramaSpeakerBars);
	};

	var renderSpeakers = function(){
		for(var speaker in metricsForDrama){
			var $select = $("<option>" + speaker +"</option>");
			$("#selection-basicDramaSpeakers-speaker-bar").append($select);
		}
	};


	var renderDramaSpeakerBars = function(){
		var speakerSelection = $("#selection-basicDramaSpeakers-speaker-bar").val();
		var metricSelection = $("#selection-basicDramaSpeakers-bar-metric").val();
		var normalisationSelection = $("#selection-basicDramaSpeakers-bar-normalisation").val()
		var metric = transformGermanMetric(metricSelection);
		var normalisation = transformGermanMetric(normalisationSelection);
		
		var metrics = getDramaMetrics(normalisation, metric, speakerSelection);
		drawBarChartDramaSpeaker(normalisationSelection, metricSelection, metrics, speakerSelection);
		
	}

	var getDramaMetrics = function(normalisation, metricName, speakerName){
		var metrics = [];
		var selectedMetrics = metricsForDrama[speakerName][normalisation][metricName];
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

	var drawBarChartDramaSpeaker = function(normalisation, metricName, metrics, speakerName){
		var vAxisTitle = metricName + " - " + normalisation
		var data = new google.visualization.DataTable();
		data.addColumn("string", "Metric-Name");
		data.addColumn("number", normalisation);
		data.addColumn({type:'string', role:'annotation'});
		data.addColumn({type:'string', role:'style'});
		
        data.addRows(metrics);
        var options = {title:'Sentiments im Drama für ' + speakerName + ":" + vAxisTitle,
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
        
        var chart = new google.visualization.ColumnChart(document.getElementById('chart-div-basicDramaSpeakers'));

        chart.draw(data, options);
	};

	that.init = init;
	that.renderDramaSpeakerBars = renderDramaSpeakerBars;

	return that;
};