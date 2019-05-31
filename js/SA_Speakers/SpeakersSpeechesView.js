SA_Speakers.SpeakersSpeechesView = function(){
	var that = {};
	var metricsForSpeeches = {};
	var chosenSpeakers = [];
	var numberOfSpeeches = 0;

	var init = function(speechesData){
		metricsForSpeeches = speechesData;
		setNumberOfSpeeches();
		initListener();
		renderCheckboxes();

		console.log(metricsForSpeeches);
	};

	var setNumberOfSpeeches = function(){
		for(var speaker in metricsForSpeeches){
			numberOfSpeeches = metricsForSpeeches[speaker].length;
			return;
		}
	};

	var setChosenSpeakers = function(){
		chosenSpeakers = [];
		var checkboxes = ($(".checkboxes-speechesSpeakers"));
		for(i = 0; i < checkboxes.length; i++){
			var isChecked = ($(checkboxes[i]).is(':checked'));
			if(isChecked){
				var speaker = $(checkboxes[i]).val();
				chosenSpeakers.push(speaker);
			}
		}
	};

	var initListener = function(){

		$("#selection-speechesSpeakers-line-metric").change(renderSpeechesLineChart);
		$("#selection-speechesSpeakers-line-type").change(renderSpeechesLineChart);
	};

	var renderCheckboxes = function(){
		checkboxes = $("#checkboxes-speechesSpeakers");
		checkboxes.empty();
		var i = 0;
		for(var speaker in metricsForSpeeches){
			checkbox = $('<div class="checkbox"><label><input class="checkboxes-speechesSpeakers" type="checkbox" value="' + speaker + 
			'">' + speaker + '</label></div>');
			if(i == 0){
				checkbox = $('<div class="checkbox"><label><input class="checkboxes-speechesSpeakers" checked type="checkbox" value="' + speaker + 
				'">' + speaker + '</label></div>');
			}else{
				checkbox = $('<div class="checkbox"><label><input class="checkboxes-speechesSpeakers" type="checkbox" value="' + speaker + 
			'">' + speaker + '</label></div>');
			}
			i = 1;
			checkbox.change(renderSpeechesLineChart);
			checkboxes.append(checkbox);
		}	
	};

	var renderSpeechesLineChart = function(){
		var metricSelection = $("#selection-speechesSpeakers-line-metric").val();
		var typeSelection = $("#selection-speechesSpeakers-line-type").val();
		setChosenSpeakers();
		var metric = transformGermanMetric(metricSelection);
		var type = transformGermanMetric(typeSelection);

		var metrics = getSpeechesMetrics(type, metric);
		drawSpeechesLineChart(metricSelection, typeSelection, metrics);

	};

	var getSpeechesMetrics = function(type, metric){
		var metrics = [];
		for(var i = 0; i < numberOfSpeeches; i++){
			var row = [];
			row.push(i);
			for(var j = 0; j < chosenSpeakers.length; j++){
				var speakerMetrics = metricsForSpeeches[chosenSpeakers[j]][i];
				var sentimentMetricsBasic = speakerMetrics.sentimentMetricsBasic;
				var metricValue = 0;
				if(sentimentMetricsBasic != null){
					metricValue = sentimentMetricsBasic[type][metric];
				}
				var metricName = transformEnglishMetric(metric);
				var tooltiptext = getSpeechTooltip(speakerMetrics, metricValue, metricName, chosenSpeakers[j]);
				row.push(metricValue);
				row.push(tooltiptext);
			}
			metrics.push(row);
		}
		return metrics;

	};

	var getSpeechTooltip = function(metric, metricValue, metricName, speakerName){
		var sentimentMetricsBasic = metric.sentimentMetricsBasic;
		var additionalInfo = "";
		if(sentimentMetricsBasic == null){
			additionalInfo = speakerName + " ist nicht Sprecher";
		}
		var divBegin = "<div class='tooltip-test'>"
		var act = metric.act + ". Act, ";
		var scene = metric.conf + ". Scene, ";
		var speech = metric.numberInConf + ". Speech";
		var numberInDrama = metric.subsequentNumber + ". Speech in play";
		var structureInfo = "<b>" + act + scene + speech + "</b>";
		var speakerInfo = "Speaker: " + metric.speaker;
		var valueInfo = metricName + ": <b>" + (Math.round(metricValue * 10000) / 10000).toString() + "</b>";
		if(sentimentMetricsBasic == null){
			valueInfo = additionalInfo;
		}

		var text  = divBegin + structureInfo + "<br>" + numberInDrama + "<br>" + speakerInfo + "<br>" + valueInfo + "</div>";

		return text;
	};

	var drawSpeechesLineChart = function(germanMetric, germanType, metrics){
		var vAxisTitle = germanMetric + " - " + germanType;
		var data = new google.visualization.DataTable();
		data.addColumn("number", "numberOfSpeech");
		for(var i = 0; i < chosenSpeakers.length; i++){
			data.addColumn("number", chosenSpeakers[i]);
			data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}})
		}
		
		//data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}})
        data.addRows(metrics);

        var options = {title:'Speech progression per Speaker (entire play): ' + vAxisTitle,
        			   height: 600,
        			   width: 1130,
        			   explorer: { 
					        actions: ['dragToZoom', 'rightClickToReset'],
					        axis: 'horizontal',
					        keepInBounds: true,
					        maxZoomIn: 10.0
						},
						tooltip: {isHtml: true},
        			   chartArea:{width:'80%',height:'75%'},
				        hAxis: {
        			   	title: 'Repliken',
        			   	format: ' '
        			   },
        			   vAxis: {
        			   	title: vAxisTitle,
        			   }
        			};

        var formatter = new google.visualization.NumberFormat(
    		{fractionDigits: 6});
        
        var dashboard = new google.visualization.Dashboard(document.getElementById('dashbord-speechesSpeakers-lineChart'));
        

        var lineChart = new google.visualization.ChartWrapper({
          'chartType': 'LineChart',
          'containerId': 'chart-speechesSpeakers-lineChart',
          'options': options
        });

        $(".filterSpeeches").remove();
        for(var j = 0; j < chosenSpeakers.length; j++){
        	formatter.format(data, (j+1));
        	var g = document.createElement('div');
			g.id = 'filter-speechesSpeakers-' + chosenSpeakers[j];
			$(g).addClass("filterSpeeches");
        	
        	$("#dashbord-speechesSpeakers-lineChart").prepend(g);
        	
        	var lineChartSpeechesSlider = new google.visualization.ControlWrapper({
          		'controlType': 'NumberRangeFilter',
          		'containerId': g.id,
          		'options': {
            	'filterColumnLabel': chosenSpeakers[j]
         	 	}
         	 	
        	});
        	dashboard.bind(lineChartSpeechesSlider, lineChart);
        }
        
        dashboard.draw(data);
	};

	that.init = init;
	that.renderSpeechesLineChart = renderSpeechesLineChart;

	return that;
};