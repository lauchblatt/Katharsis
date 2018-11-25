SA_Relations.RelationsProportionsView = function(){
	var that = {};

	var proportionsForDramaRelations = {};
	var proportionsForActsRelations = [];
	var proportionsForScenesRelations = [];
	
	var currentProportionSelection = {};

	var init = function(dramaProportions, actsProportions, scenesProportions){
		proportionsForDramaRelations = dramaProportions;
		proportionsForActsRelations = actsProportions
		proportionsForScenesRelations = scenesProportions;
		console.log(proportionsForDramaRelations);
		console.log(proportionsForActsRelations);
		console.log(proportionsForScenesRelations);
		renderDropDowns();
		initListener();
	};

	var initListener = function(){

		$("#selection-relations-act-pie-number").change(actSelectionClicked);
		$("#selection-relations-scene-pie-number").change(sceneSelectionClicked);
		$("#selection-relations-originSpeaker-pie").change(originSpeakersSelectionClicked);
		$("#selection-relations-targetSpeaker-pie").change(targetSpeakersSelectionClicked);

		$("#selection-relations-pie-metric").change(renderRelationsPieChart);
		$("#selection-relations-pie-type").change(renderRelationsPieChart);
	};

	var actSelectionClicked = function(){
		renderDropDownScenes();
		renderRelationsPieChart();
	};

	var sceneSelectionClicked = function(){
		renderDropDownOriginSpeakers();
		renderRelationsPieChart();
	};

	var originSpeakersSelectionClicked = function(){
		renderDropDownTargetSpeakers();
		renderRelationsPieChart();
	};

	var targetSpeakersSelectionClicked = function(){
		renderRelationsPieChart();
	};

	var renderDropDowns = function(){
		var actSelection = $("#selection-relations-act-pie-number");
		actSelection.append($("<option>Gesamt</option>"));
		for(i = 0; i < proportionsForActsRelations.length; i++){
			var $option = $("<option>" + (i+1).toString() + " .Akt</option>");
			actSelection.append($option);
		}
		renderDropDownScenes();
	};

	var renderDropDownOriginSpeakers = function(){
		var $originSpeakerSelection = $("#selection-relations-originSpeaker-pie");
		$originSpeakerSelection[0].options.length = 0;
		var actVal = $("#selection-relations-act-pie-number").val();
		var sceneVal = $("#selection-relations-scene-pie-number").val();
		if(actVal == "Gesamt"){
			for(var speaker in proportionsForDramaRelations){
				var $option = $("<option>" + speaker + "</option>");
				$originSpeakerSelection.append($option);
				}
			}else{
				var actSelection = parseInt(actVal) - 1;
				if(sceneVal == "Gesamt"){
					for(var speaker in proportionsForActsRelations[actSelection]){
					var $option = $("<option>" + speaker + "</option>");
					$originSpeakerSelection.append($option);
					}
				}
				else{
					var sceneSelection = parseInt(sceneVal) - 1;
					for(var speaker in proportionsForScenesRelations[actSelection][sceneSelection]){
					var $option = $("<option>" + speaker + "</option>");
					$originSpeakerSelection.append($option);
				}
			}
		}
		renderDropDownTargetSpeakers();
	};

	var renderDropDownTargetSpeakers = function(){
		var $targetSpeakerSelection = $("#selection-relations-targetSpeaker-pie")
		$targetSpeakerSelection[0].options.length = 0;
		
		var actVal = $("#selection-relations-act-pie-number").val();
		var sceneVal = $("#selection-relations-scene-pie-number").val();
		var originSpeakerVal = $("#selection-relations-originSpeaker-pie").val();

		var originSpeaker = {};
		if(actVal == "Gesamt"){
			originSpeaker = proportionsForDramaRelations[originSpeakerVal];
		}else{
			var actSelection = parseInt(actVal) - 1;
			if(sceneVal == "Gesamt"){
				originSpeaker = proportionsForActsRelations[actSelection][originSpeakerVal];
			}else{
				var sceneSelection = parseInt(sceneVal) - 1;
				originSpeaker = proportionsForScenesRelations[actSelection][sceneSelection][originSpeakerVal];
			}
		}

		for(var targetSpeaker in originSpeaker){
			var $option = $("<option>" + targetSpeaker + "</option>");
			$targetSpeakerSelection.append($option);
		}
	};

	var renderDropDownScenes = function(){
		var $scenesSelection = $("#selection-relations-scene-pie-number");
		$scenesSelection[0].options.length = 0;
		var actVal = $("#selection-relations-act-pie-number").val();

		if(actVal == "Gesamt"){
			$scenesSelection.append($("<option>Gesamt</option>"));
		} else{
			$scenesSelection.append($("<option>Gesamt</option>"));
			var selection = parseInt(actVal) - 1;
			for(var i = 0; i < proportionsForScenesRelations[selection].length; i++){
				var $option = $("<option>" + (i+1).toString() + " .Szene</option>");
				$scenesSelection.append($option)
			}
		}
		renderDropDownOriginSpeakers();
	};

	
	var renderRelationsPieChart = function(){
		var originSpeaker = $("#selection-relations-originSpeaker-pie").val();
		var targetSpeaker = $("#selection-relations-targetSpeaker-pie").val();
		//var proportions = currentProportionSelection[speaker];
		
		var metricSelection = $("#selection-relations-pie-metric").val();
		var typeSelection = $("#selection-relations-pie-type").val();
		var metric = transformGermanMetric(metricSelection);
		var type = transformGermanMetric(typeSelection);
		
		var proportions = getRelationsProportions(metric, type);
		console.log(proportions);
		drawRelationPieChart(metricSelection, typeSelection, proportions);
	};

	var getRelationsProportions = function(metricSelection, typeSelection){
		var chosenProportions = null;
		var actVal = $("#selection-relations-act-pie-number").val();
		var sceneVal = $("#selection-relations-scene-pie-number").val();
		if(actVal == "Gesamt"){
			chosenProportions = proportionsForDramaRelations;
		}else{
			var actSelection = parseInt(actVal) - 1;
			if(sceneVal == "Gesamt"){
				chosenProportions = proportionsForActsRelations[actSelection];
			}else{
				var sceneSelection = parseInt(sceneVal) - 1;
				chosenProportions = proportionsForScenesRelations[actSelection][sceneSelection];
			}
		}
		var targetSpeaker = $("#selection-relations-targetSpeaker-pie").val()
		var originSpeaker = $("#selection-relations-originSpeaker-pie").val();
		var metrics = chosenProportions[originSpeaker][targetSpeaker][typeSelection][metricSelection];
		return metrics;

	};

	var drawRelationPieChart = function(germanMetric, germanType, proportions){
		var data = new google.visualization.DataTable();
		data.addColumn("string", "Category");
		data.addColumn("number", "Count");
        data.addRows(proportions);
        var options = {
		  height: 600,
      		width: 1000,
      		chartArea:{width:'70%',height:'75%'},
          	title: 'Sentiment-Anteile: ' + germanMetric + " - " + germanType,
          	is3D: true,
        	};
        var chart = new google.visualization.PieChart(document.getElementById('chart-div-relations-pie'))
        chart.draw(data, options)
	};

	that.init = init;
	that.renderRelationsPieChart = renderRelationsPieChart;

	return that;
};