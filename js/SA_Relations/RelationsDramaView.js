SA_Relations.RelationsDramaView = function(){
	var that = {};

	var metricsForDramaRelations = {};
	var chosenTargets = [];


	var init = function(dramaRelationsMetrics){
		initListener();
		metricsForDramaRelations = dramaRelationsMetrics;

		renderSpeakerDropDown();
		renderCheckboxes();

	};

	var initListener = function(){

		$("#selection-relationsDrama-metric").change(renderRelationsDrama);
		$("#selection-relationsDrama-normalisation").change(renderRelationsDrama);
		$("#selection-relationsDrama-speaker").change(renderTargetsAndRelationsDrama);

	};

	var renderTargetsAndRelationsDrama = function(){
		renderCheckboxes();
		renderRelationsDrama();
	};


	var setChosenTargets = function(){
		chosenTargets = [];
		var checkboxes = ($(".checkboxes-dramaRelations"));
		for(i = 0; i < checkboxes.length; i++){
			var isChecked = ($(checkboxes[i]).is(':checked'));
			if(isChecked){
				var target = $(checkboxes[i]).val();
				chosenTargets.push(target);
			}
		}
	};

	var renderCheckboxes = function(){
		chosenSpeaker = $("#selection-relationsDrama-speaker").val();
		checkboxes = $("#checkboxes-dramaRelations");
		checkboxes.empty();
		for(var target in metricsForDramaRelations[chosenSpeaker]){
			checkbox = $('<div class="checkbox"><label><input class="checkboxes-dramaRelations" checked type="checkbox" value="' + target + 
			'">' + target + '</label></div>');

			checkbox.change(renderRelationsDrama);
			checkboxes.append(checkbox);
		}

	};

	var renderSpeakerDropDown = function(){
		var $speakerSelect = $("#selection-relationsDrama-speaker");
		for (var speaker in metricsForDramaRelations ){
			var $select = $("<option>" + speaker + "</option>");
			$speakerSelect.append($select);
		}	
	};


	var renderRelationsDrama = function(){
		var metricSelection = $("#selection-relationsDrama-metric").val();
		var normalisationSelection = $("#selection-relationsDrama-normalisation").val()
		var speakerSelection = $("#selection-relationsDrama-speaker").val()
		setChosenTargets();

		var metric = transformGermanMetric(metricSelection);
		var normalisation = transformGermanMetric(normalisationSelection);
		var metrics = getRelationsDramaMetrics(metric, normalisation, speakerSelection);
		drawRelationsDramaBarsChart(metricSelection, normalisationSelection, speakerSelection, metrics);
	};

	var getRelationsDramaMetrics = function(metricName, typeName, speakerName){
		var metrics = []

		for(var i = 0; i < chosenTargets.length; i++){
			var metric = metricsForDramaRelations[speakerName][chosenTargets[i]][typeName][metricName];
			metrics.push([chosenTargets[i], metric, (Math.round(metric * 10000) / 10000).toString()]);
		}
		return metrics;
	};

	var drawRelationsDramaBarsChart = function(germanMetric, germanType, speakerName, metrics){
		var vAxisTitle = germanMetric + " - " + germanType;
		var data = new google.visualization.DataTable();
		data.addColumn("string", "TargetSpeaker")
		data.addColumn("number", germanMetric)
		data.addColumn({type:'string', role:'annotation'})

        data.addRows(metrics);
        
        var options = {title:'Beziehungs-Sentiments - ' + speakerName + ' : ' + vAxisTitle,
        			   height: 600,
        			   width: 1130,
        			   chartArea:{width:'70%',height:'75%'},
				        hAxis: {
        			   	title: 'Sprecher-Beziehung'
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

        var chart = new google.visualization.ColumnChart(document.getElementById("chart-div-relationsDrama"));

        chart.draw(data, options);
	};

	that.init = init;
	that.renderRelationsDrama = renderRelationsDrama;

	return that;
};