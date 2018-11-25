SA_Speakers.SingleSpeakerView = function(){
	var that = {};

	var proportionsForDramaSpeakers = {};
	var proportionsForActsSpeakers = [];
	var proportionsForScenesSpeakers = [];
	var currentProportionSelection = {};

	var init = function(){

		initListener();
	};

	var initListener = function(){
		$("#selection-speakerInDrama-act-pie-number").change(actSelectionClicked);
		$("#selection-speakerInDrama-scene-pie-number").change(sceneSelectionClicked);
		$("#selection-speakerInDrama-speaker-pie").change(speakersSelectionClicked);

		$("#selection-speakerInDrama-pie-metric").change(renderSpeakerPieChart);
		$("#selection-speakerInDrama-pie-type").change(renderSpeakerPieChart);
	};

	var actSelectionClicked = function(){

		renderDropDownScenes();
		renderDropDownSpeakers();
		renderSpeakerPieChart();
	};

	var sceneSelectionClicked = function(){
		renderDropDownSpeakers();
		renderSpeakerPieChart();
	};

	var speakersSelectionClicked = function(){
		renderSpeakerPieChart();
	};

	var initSingleProportions = function(dramaSpeakersProportions, actsSpeakersProportions, scenesSpeakersProportions){
		proportionsForDramaSpeakers = dramaSpeakersProportions;
		proportionsForActsSpeakers = actsSpeakersProportions;
		proportionsForScenesSpeakers = scenesSpeakersProportions;
		renderDropDowns();
	};

	var renderDropDowns = function(){
		var actSelection = $("#selection-speakerInDrama-act-pie-number");
		actSelection.append($("<option>Gesamt</option>"));
		for(i = 0; i < proportionsForActsSpeakers.length; i++){
			var $option = $("<option>" + (i+1).toString() + " .Akt</option>");
			actSelection.append($option);
		}
		renderDropDownScenes();
		renderDropDownSpeakers();
	};

	var renderDropDownScenes = function(){
		var $scenesSelection = $("#selection-speakerInDrama-scene-pie-number");
		$scenesSelection[0].options.length = 0;
		var actVal = $("#selection-speakerInDrama-act-pie-number").val();
		
		if(actVal == "Gesamt"){
			$scenesSelection.append($("<option>Gesamt</option>"));
		} else{
			$scenesSelection.append($("<option>Gesamt</option>"));
			var selection = parseInt(actVal) - 1;
			for(var i = 0; i < proportionsForScenesSpeakers[selection].length; i++){
				var $option = $("<option>" + (i+1).toString() + " .Szene</option>");
				$scenesSelection.append($option)
			}
		}
	};

	var renderDropDownSpeakers = function(){
		var $speakersSelection = $("#selection-speakerInDrama-speaker-pie");
		$speakersSelection[0].options.length = 0;
		var actVal = $("#selection-speakerInDrama-act-pie-number").val();
		var sceneVal = $("#selection-speakerInDrama-scene-pie-number").val();

		if(actVal == "Gesamt"){
			currentProportionSelection = proportionsForDramaSpeakers;
			for (var speaker in proportionsForDramaSpeakers){
				var $select = $("<option>" + speaker +"</option>");
				$speakersSelection.append($select);
				}
		}else{
			if(sceneVal == "Gesamt"){
				var actNumber = parseInt(actVal) - 1;
				currentProportionSelection = proportionsForActsSpeakers[actNumber];
				for (var speaker in proportionsForActsSpeakers[actNumber]){
					var $select = $("<option>" + speaker +"</option>");
					$speakersSelection.append($select);
				}
			} else{
				var actNumber = parseInt(actVal) - 1;
				var sceneNumber = parseInt(sceneVal) - 1;
				currentProportionSelection = proportionsForScenesSpeakers[actNumber][sceneNumber];
				for(var speaker in proportionsForScenesSpeakers[actNumber][sceneNumber]){
					var $select = $("<option>" + speaker +"</option>");
					$speakersSelection.append($select);
				}
			}
		}
	};

	var renderSpeakerPieChart = function(){
		var speaker = $("#selection-speakerInDrama-speaker-pie").val();
		var proportions = currentProportionSelection[speaker];
		
		var metricSelection = $("#selection-speakerInDrama-pie-metric").val();
		var typeSelection = $("#selection-speakerInDrama-pie-type").val();
		var metric = transformGermanMetric(metricSelection);
		var type = transformGermanMetric(typeSelection);
		
		drawSpeakerPieChart(metric, type, metricSelection, typeSelection, proportions);
	};

	var drawSpeakerPieChart = function(metricName, proportionType, germanMetric, germanType, proportions){
		var data = new google.visualization.DataTable();
		data.addColumn("string", "Category");
		data.addColumn("number", "Count");
        data.addRows(proportions[proportionType][metricName]);
        var options = {
		  height: 600,
      		width: 1000,
      		chartArea:{width:'70%',height:'75%'},
          	title: 'Sentiment-Anteile: ' + germanMetric + " - " + germanType,
          	is3D: true,
        	};
        var chart = new google.visualization.PieChart(document.getElementById('chart-div-speakerInDrama-pie'))
        chart.draw(data, options)
	};

	that.init = init;
	that.initSingleProportions = initSingleProportions;
	that.renderSpeakerPieChart = renderSpeakerPieChart;

	return that;
};