SA_Speakers.SpeakersScenesView = function(){
	var that = {};
	var metricsForSpeakerPerScenes = {};
	var chosenSpeakersScenesPerAct = [];
	var chosenSpeakersScenes = [];
	var numberOfActs = 0;
	var numberOfScenesPerAct = [];

	var init = function(speakerScenesMetrics){
		metricsForSpeakerPerScenes = speakerScenesMetrics;
		initListener();
		initNumberOfActsAndScenes();
		renderCheckboxesScenesPerAct();
		renderCheckboxesScenes();

	};

	var initNumberOfActsAndScenes = function(){
		for(var speaker in metricsForSpeakerPerScenes){
			numberOfActs = metricsForSpeakerPerScenes[speaker].length;
			for (var i = 0; i < metricsForSpeakerPerScenes[speaker].length; i++){
				numberOfScenesPerAct.push(metricsForSpeakerPerScenes[speaker][i].length);
			}
			break;
		}
	};

	var initListener = function(){
		$("#selection-speakerScenes-line-metric").change(renderSpeakersScenesLine);
		$("#selection-speakerScenes-line-type").change(renderSpeakersScenesLine);
		$("#selection-speakersScenes-speaker-line").change(renderSpeakersScenesLine);

		$("#selection-speakersScenesPerAct-bar-metric").change(renderScenesPerActBars);
		$("#selection-speakersScenesPerAct-bar-normalisation").change(renderScenesPerActBars)


	};

	var setChosenSpeakersScenesPerAct = function(){
		chosenSpeakersScenesPerAct = [];
		var checkboxes = ($(".checkboxes-scenesPerActSpeakers"));
		for(i = 0; i < checkboxes.length; i++){
			var isChecked = ($(checkboxes[i]).is(':checked'));
			if(isChecked){
				var speaker = $(checkboxes[i]).val();
				chosenSpeakersScenesPerAct.push(speaker);
			}
		}
	};

	var setChosenSpeakersScenes = function(){
		chosenSpeakersScenes = [];
		var checkboxes = ($(".checkboxes-scenesSpeakers"));
		for(i = 0; i < checkboxes.length; i++){
			var isChecked = ($(checkboxes[i]).is(':checked'));
			if(isChecked){
				var speaker = $(checkboxes[i]).val();
				chosenSpeakersScenes.push(speaker);
			}
		}
	};

	var renderCheckboxesScenesPerAct = function(){
		checkboxes = $("#checkboxes-scenesPerActSpeakers");
		checkboxes.empty();
		var i = 0;
		for(var speaker in metricsForSpeakerPerScenes){
			checkbox = $('<div class="checkbox"><label><input class="checkboxes-scenesPerActSpeakers" type="checkbox" value="' + speaker + 
			'">' + speaker + '</label></div>');
			if(i == 0){
				checkbox = $('<div class="checkbox"><label><input class="checkboxes-scenesPerActSpeakers" checked type="checkbox" value="' + speaker + 
				'">' + speaker + '</label></div>');
			}else{
				checkbox = $('<div class="checkbox"><label><input class="checkboxes-scenesPerActSpeakers" type="checkbox" value="' + speaker + 
			'">' + speaker + '</label></div>');
			}
			i = 1;
			checkbox.change(renderScenesPerActBars);
			checkboxes.append(checkbox);
		}
	};

	var renderCheckboxesScenes = function(){
		checkboxes = $("#checkboxes-scenesSpeakers");
		checkboxes.empty();
		var i = 0;
		for(var speaker in metricsForSpeakerPerScenes){
			checkbox = $('<div class="checkbox"><label><input class="checkboxes-scenesSpeakers" type="checkbox" value="' + speaker + 
			'">' + speaker + '</label></div>');
			if(i == 0){
				checkbox = $('<div class="checkbox"><label><input class="checkboxes-scenesSpeakers" checked type="checkbox" value="' + speaker + 
				'">' + speaker + '</label></div>');
			}else{
				checkbox = $('<div class="checkbox"><label><input class="checkboxes-scenesSpeakers" type="checkbox" value="' + speaker + 
			'">' + speaker + '</label></div>');
			}
			i = 1;
			checkbox.change(renderSpeakersScenesLine);
			checkboxes.append(checkbox);
		}
	};

	var renderScenesPerActBars = function(){
		var metricSelection = $("#selection-speakersScenesPerAct-bar-metric").val();
		var normalisationSelection = $("#selection-speakersScenesPerAct-bar-normalisation").val()
		
		var metric = transformGermanMetric(metricSelection);
		var normalisation = transformGermanMetric(normalisationSelection);
		setChosenSpeakersScenesPerAct();
		var metrics = getSpeakerScenesPerActMetrics(metric, normalisation);

		drawChartScenesPerAct(metricSelection, normalisationSelection, metrics);		
	};

	var getSpeakerScenesPerActMetrics = function(metricName, normalisation){

		var acts = [];
		for(var i = 0; i < numberOfActs; i++){
			var rows = [];
			for(j = 0; j < numberOfScenesPerAct[i]; j++){
				var row = []
				row.push(j+1);
				for(var k = 0; k < chosenSpeakersScenesPerAct.length; k++){
					var speaker = chosenSpeakersScenesPerAct[k];
					
					if(metricsForSpeakerPerScenes[speaker][i][j] == null){
						row.push(0);
						if(chosenSpeakersScenesPerAct.length == 1){
						row.push("kein Auftritt");
					}
					}else{
						var metric = metricsForSpeakerPerScenes[speaker][i][j][normalisation][metricName];
						row.push(metric);
						if(chosenSpeakersScenesPerAct.length == 1){
						row.push((Math.round(metric * 10000) / 10000).toString())
						}
					}
				}
				rows.push(row);
			}
			acts.push(rows);
		}
		return acts;
	};

	/*
	var getSpeakerScenesPerActMetrics = function(metricName, normalisation, speakerName){
		var speakerMetricsActs = metricsForSpeakerPerScenes[speakerName];
		var metrics = [];
		for(i = 0; i < speakerMetricsActs.length; i++){
			var metricsPerAct = [];
			for(j = 0; j <speakerMetricsActs[i].length; j++){
				if(speakerMetricsActs[i][j] == null){
					metricsPerAct.push([j+1, 0, "kein Auftritt"]);
				}else{
					var metric = speakerMetricsActs[i][j][normalisation][metricName];
					metricsPerAct.push([j+1, metric, (Math.round(metric * 10000) / 10000).toString()]);
				}
			}
			metrics.push(metricsPerAct);
		}
		return metrics;
	};
	*/

	var drawChartScenesPerAct = function(metricName, typeName, metrics){

		$charts_scenes = $("#charts-speakersScenesPerAct-bar");
		for(var act = 0; act < metrics.length; act++){
			$div_chart = $("<div></div>");
			$div_chart.addClass("scenes-chart");
			$div_chart.attr("id", "chart-div-speakersScenesPerAct-" + act);
			$charts_scenes.append($div_chart);
			var actNumber = act + 1;
			drawBarChartForScenesInAct(("chart-div-speakersScenesPerAct-" + act), 
				metricName, typeName, metrics[act], actNumber);
		}
	};

	var drawBarChartForScenesInAct = function(divId, metricName, typeName, metrics, actNumber){
        var vAxisTitle = metricName + " - " + typeName
		var data = new google.visualization.DataTable();
		data.addColumn("number", "Scene-Number");
		for(var i = 0; i < chosenSpeakersScenesPerAct.length; i++){
			data.addColumn("number", chosenSpeakersScenesPerAct[i]);
			if(chosenSpeakersScenesPerAct.length == 1){
				data.addColumn({type:'string', role:'annotation'})
			}
		}
		
		//data.addColumn({type:'string', role:'annotation', 'p': {'html': true}});

        data.addRows(metrics);
        //necessary to have consistent gaps according to the scenes on the graph 
        var ticksArray = [];
        for(var k = 0; k < metrics.length; k++){
        	ticksArray.push(k+1);
        }
        var options = {title:'Scene progression in Act ' + actNumber + " : " + vAxisTitle,
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
        for(var j = 0; j < chosenSpeakersScenesPerAct.length; j++){
        	formatter.format(data, j+1); // Apply formatter to second column
        }

        var chart = new google.visualization.ColumnChart(document.getElementById(divId));

        chart.draw(data, options);
	};


	var renderSpeakersScenesLine = function(){
		var normalisationSelection = $("#selection-speakerScenes-line-type").val()
		var metricSelection = $("#selection-speakerScenes-line-metric").val()

		var metric = transformGermanMetric(metricSelection);
		var normalisation = transformGermanMetric(normalisationSelection);
		setChosenSpeakersScenes();
		var metrics = getSpeakerScenesMetrics(metric, normalisation);
		
		drawSpeakersScenesLineChart(metricSelection, normalisationSelection, metrics);
	};

	var getSpeakerScenesMetrics = function(metricName, typeName){
		var rows = [];
		for(var i = 0; i < numberOfActs; i++){
			for(var j = 0; j < numberOfScenesPerAct[i]; j++){
				var row = [];
				var sceneName = (i+1).toString() + ". Akt, " + (j+1).toString() + " .Szene";
				row.push(sceneName);
				for(var k = 0; k < chosenSpeakersScenes.length; k++){
					var speakerMetrics = metricsForSpeakerPerScenes[chosenSpeakersScenes[k]];
					var currentMetric = speakerMetrics[i][j];
					if(currentMetric == null){
						row.push(0);
					}else{
						row.push(currentMetric[typeName][metricName]);
					}
				}
				rows.push(row);
			}
		}
		return rows;
	};

	/**
	var getSpeakerScenesMetrics = function(metricName, normalisation, speakerName){
		var speakerMetricsActs = metricsForSpeakerPerScenes[speakerName];
		var metrics = [];
		for(i = 0; i < speakerMetricsActs.length; i++){
			for(j = 0; j <speakerMetricsActs[i].length; j++){
				if(speakerMetricsActs[i][j] == null){
					var sceneName = (i+1).toString() + ". Akt, " + (j+1).toString() + " .Szene";
					metrics.push([sceneName, 0]);
				}else{
					var metric = speakerMetricsActs[i][j][normalisation][metricName];
					var sceneName = (i+1).toString() + ". Akt, " + (j+1).toString() + " .Szene";
					metrics.push([sceneName, metric]);
				}
			}
		}
		return metrics;
	};
	**/

	var drawSpeakersScenesLineChart = function(germanMetric, germanType, metrics){
		var vAxisTitle = germanMetric + " - " + germanType;
		var data = new google.visualization.DataTable();
		data.addColumn("string", "sceneName")
		for(var i = 0; i < chosenSpeakersScenes.length; i++){
			data.addColumn("number", chosenSpeakersScenes[i]);
		}
		
        data.addRows(metrics);

        var options = {title:'Scene progression: ' + vAxisTitle,
        			   height: 600,
        			   width: 1130,
        			   chartArea:{width:'70%',height:'75%'},
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

        var dashboard = new google.visualization.Dashboard(document.getElementById('dashbord-speakersScenes'));
        

        var lineChart = new google.visualization.ChartWrapper({
          'chartType': 'LineChart',
          'containerId': 'chart-speakersScenes',
          'options': options
        });

        var formatter = new google.visualization.NumberFormat(
    		{fractionDigits: 6});
       	$(".filter").remove();
        for(var j = 0; j < chosenSpeakersScenes.length; j++){
        	formatter.format(data, (j+1));
        	var g = document.createElement('div');
			g.id = 'filter-speakersScenes-' + chosenSpeakersScenes[j];
			$(g).addClass("filter");
        	
        	$("#dashbord-speakersScenes").prepend(g);
        	
        	var lineChartSpeechesSlider = new google.visualization.ControlWrapper({
          		'controlType': 'NumberRangeFilter',
          		'containerId': g.id,
          		'options': {
            	'filterColumnLabel': chosenSpeakersScenes[j]
         	 	}
         	 	
        	});
        	dashboard.bind(lineChartSpeechesSlider, lineChart);
        }
        
        dashboard.draw(data);
	};

	that.init = init;
	that.renderSpeakersScenesLine = renderSpeakersScenesLine;
	that.renderScenesPerActBars = renderScenesPerActBars;

	return that;
};