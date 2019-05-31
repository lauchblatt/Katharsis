SA_Relations.RelationsScenesView = function(){
	var that = {};

	var metricsForScenesRelations = {};
	var chosenTargets = [];
	var scenesPerAct = [];


	var init = function(scenesRelationsMetrics, scenesActCount){
		initListener();
		metricsForScenesRelations = scenesRelationsMetrics;
		scenesPerAct = scenesActCount;
		renderSpeakerDropDown();
		renderCheckboxes();

	};

	var initListener = function(){

		$("#selection-relationsScenes-metric").change(renderRelationsScenes);
		$("#selection-relationsScenes-normalisation").change(renderRelationsScenes);
		$("#selection-relationsScenes-speaker").change(renderTargetsAndRelationsScenes);

	};

	var renderTargetsAndRelationsScenes = function(){
		renderCheckboxes();
		renderRelationsScenes();
	};


	var setChosenTargets = function(){
		chosenTargets = [];
		var checkboxes = ($(".checkboxes-scenesRelations"));
		for(i = 0; i < checkboxes.length; i++){
			var isChecked = ($(checkboxes[i]).is(':checked'));
			if(isChecked){
				var target = $(checkboxes[i]).val();
				chosenTargets.push(target);
			}
		}
	};

	var renderCheckboxes = function(){
		chosenSpeaker = $("#selection-relationsScenes-speaker").val();
		checkboxes = $("#checkboxes-scenesRelations");
		checkboxes.empty();
		for(var target in metricsForScenesRelations[chosenSpeaker]){
			checkbox = $('<div class="checkbox"><label><input class="checkboxes-scenesRelations" checked type="checkbox" value="' + target + 
			'">' + target + '</label></div>');

			checkbox.change(renderRelationsScenes);
			checkboxes.append(checkbox);
		}

	};

	var renderSpeakerDropDown = function(){
		var $speakerSelect = $("#selection-relationsScenes-speaker");
		for (var speaker in metricsForScenesRelations ){
			var $select = $("<option>" + speaker + "</option>");
			$speakerSelect.append($select);
		}	
	};


	var renderRelationsScenes = function(){
		var metricSelection = $("#selection-relationsScenes-metric").val();
		var normalisationSelection = $("#selection-relationsScenes-normalisation").val()
		var speakerSelection = $("#selection-relationsScenes-speaker").val()
		setChosenTargets();

		var metric = transformGermanMetric(metricSelection);
		var normalisation = transformGermanMetric(normalisationSelection);
		var metrics = getRelationsScenesMetrics(metric, normalisation, speakerSelection);
		drawRelationsScenesChart(metricSelection, normalisationSelection, speakerSelection, metrics);
	};

	var getRelationsScenesMetrics = function(metricName, typeName, speakerName){
		var metrics = [];
		for(var i = 0; i < scenesPerAct.length; i++){
			for(var j = 0; j < scenesPerAct[i]; j++){
				var row = [];
				var name = (i+1).toString() + ". Akt, " + (j+1).toString() + ". Scene";
				row.push(name);
				for(var k = 0; k < chosenTargets.length; k++){
					var metricSelections = metricsForScenesRelations[speakerName][chosenTargets[k]][i][j];

					if(metricSelections == undefined){
						row.push(0);
					} else{
						row.push(metricSelections[typeName][metricName]);
					}
				}
			metrics.push(row);
			}
		}
		return metrics;
	};

	var drawRelationsScenesChart = function(germanMetric, germanType, speakerName, metrics){
		var vAxisTitle = germanMetric + " - " + germanType;
		var data = new google.visualization.DataTable();
		data.addColumn("string", "actScenesNumber")
		for(i = 0; i < chosenTargets.length; i++){
			data.addColumn("number", chosenTargets[i]);
		}

        data.addRows(metrics);
        var options = {title:'Relationship sentiments per Scene - ' + speakerName + ' : ' + vAxisTitle,
        			   height: 600,
        			   width: 1130,
        			   chartArea:{width:'70%',height:'75%'},
				        hAxis: {
        			   	title: 'Scenes',
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
        for(var j = 0; j < chosenTargets.length; j++){
        	formatter.format(data, 1);
        }
        
        var chart = new google.visualization.LineChart(document.getElementById('chart-div-relationsScenes'));

        chart.draw(data, options);
	};

	that.init = init;
	that.renderRelationsScenes = renderRelationsScenes;

	return that;
};