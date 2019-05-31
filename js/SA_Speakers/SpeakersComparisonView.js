SA_Speakers.SpeakersComparisonView = function(){
	var that = {};
	var metricsForDrama = {};
	var metricsForActs = [];
	var metricsForScenes = [];
	var currentMetrics = {};

	var init = function(){

		initListener();
	};

	var initMetrics = function(dramaMetrics, actsMetrics, scenesMetrics){
		metricsForDrama = dramaMetrics;
		metricsForActs = actsMetrics;
		metricsForScenes = scenesMetrics;
		
		renderDropDowns();
		setCurrentMetrics();
	};

	var initListener = function(){
		$("#selection-speakersComparison-act-bar-number").change(actSelectionClicked);
		$("#selection-speakersComparison-scene-bar-number").change(sceneSelectionClicked);

		$("#selection-speakersComparison-bar-metric").change(renderSpeakersComparisonBarChart);
		$("#selection-speakersComparison-normalisation").change(renderSpeakersComparisonBarChart);
	};

	var actSelectionClicked = function(){
		renderDropDownScenes();
		setCurrentMetrics();
		renderSpeakersComparisonBarChart();
	};

	var sceneSelectionClicked = function(){
		setCurrentMetrics();
		renderSpeakersComparisonBarChart();
	};

	var renderDropDowns = function(){
		var actSelection = $("#selection-speakersComparison-act-bar-number");
		actSelection.append($("<option>Overall</option>"));
		for(i = 0; i < metricsForActs.length; i++){
			var $option = $("<option>" + (i+1).toString() + " .Act</option>");
			actSelection.append($option);
		}
		renderDropDownScenes();
	};

	var renderDropDownScenes = function(){
		var $scenesSelection = $("#selection-speakersComparison-scene-bar-number");
		$scenesSelection[0].options.length = 0;
		var actVal = $("#selection-speakersComparison-act-bar-number").val();
		
		if(actVal == "Overall"){
			$scenesSelection.append($("<option>Overall</option>"));
		} else{
			$scenesSelection.append($("<option>Overall</option>"));
			var selection = parseInt(actVal) - 1;
			for(var i = 0; i < metricsForScenes[selection].length; i++){
				var $option = $("<option>" + (i+1).toString() + " .Scene</option>");
				$scenesSelection.append($option)
			}
		}
	};

	var setCurrentMetrics = function(){
		var actVal = $("#selection-speakersComparison-act-bar-number").val();
		var sceneVal = $("#selection-speakersComparison-scene-bar-number").val();
		if(actVal == "Overall"){
			currentMetrics = metricsForDrama;
		}else{
			if(sceneVal == "Overall"){
				var actNumber = parseInt(actVal) - 1;
				currentMetrics = metricsForActs[actNumber];
			}else{
				var actNumber = parseInt(actVal) - 1;
				var sceneNumber = parseInt(sceneVal) - 1;
				currentMetrics = metricsForScenes[actNumber][sceneNumber];
			}
		}
	};

	var renderSpeakersComparisonBarChart = function(){
		var metricSelection = $("#selection-speakersComparison-bar-metric").val();
		var normalisationSelection = $("#selection-speakersComparison-normalisation").val()
		
		var metric = transformGermanMetric(metricSelection);
		var normalisation = transformGermanMetric(normalisationSelection);
		
		var metrics = getCurrentMetrics(normalisation, metric);
		drawSpeakersComparisonBarChart(metrics, metricSelection, normalisationSelection);

	};

	var compare = function(a, b){
		if(a[1] < b[1]){
			return 1;
		}
		if(a[1] > b[1]){
			return -1;
		}
		return 0;
	};

	var getCurrentMetrics = function(normalisation, metric){
		metricsArray = [];
		for(var speaker in currentMetrics){
			var speakerName = speaker;
			var speakerMetric = currentMetrics[speaker][normalisation][metric];
			metricsArray.push([speaker, speakerMetric]);
		}
		metricsArray.sort(compare);
		return metricsArray;
	};

	var drawSpeakersComparisonBarChart = function(metricsArray, germanMetric, germanType){
		var data = new google.visualization.DataTable();
		data.addColumn("string", "Speaker");
		data.addColumn("number", germanMetric);

		data.addRows(metricsArray);

		//Estimate Height according to number of speakers
		var estimatedHeight = metricsArray.length * 30;
		if(estimatedHeight < 800){
			estimatedHeight = 800;
		}

		var options = {title:'Speaker-Comparison',
        			   height: estimatedHeight,
        			   width: 1000,
        			   chartArea:{width:'55%',height:'90%'},
				        hAxis: {
        			   	title: germanMetric + " - " + germanType
        			   },
        			   animation: {
                   	   	duration: 1000
                   	   },
        			   vAxis: {
        			   	title: "Speaker",
        			   	baseline: 0
        			   }};

        // Create a dashboard.
        var dashboard = new google.visualization.Dashboard(
            document.getElementById('dashbord-speakersComparison'));

        // Create a range slider, passing some options
        var barChartRangeSlider = new google.visualization.ControlWrapper({
          'controlType': 'NumberRangeFilter',
          'containerId': 'filter-speakersComparison',
          'options': {
            'filterColumnLabel':germanMetric
          }
        });

        var barChart = new google.visualization.ChartWrapper({
          'chartType': 'BarChart',
          'containerId': 'chart-speakersComparison',
          'options': options
        });

        dashboard.bind(barChartRangeSlider, barChart);

        // Draw the dashboard.
        dashboard.draw(data);

	};

	that.init = init;
	that.initMetrics = initMetrics;
	that.renderSpeakersComparisonBarChart = renderSpeakersComparisonBarChart;

	return that;
};