SA_Relations.RelationsActsView = function(){
	var that = {};

	var metricsForActsRelations = {};
	var chosenTargets = [];
	var numberOfActs = -1;


	var init = function(actsRelationsMetrics, actsCount){
		initListener();
		metricsForActsRelations = actsRelationsMetrics;
		numberOfActs = actsCount;

		renderSpeakerDropDown();
		renderCheckboxes();

	};

	var initListener = function(){

		$("#selection-relationsActs-metric").change(renderRelationsActs);
		$("#selection-relationsActs-normalisation").change(renderRelationsActs);
		$("#selection-relationsActs-speaker").change(renderTargetsAndRelationsActs);

	};

	var renderTargetsAndRelationsActs = function(){
		renderCheckboxes();
		renderRelationsActs();
	};


	var setChosenTargets = function(){
		chosenTargets = [];
		var checkboxes = ($(".checkboxes-actsRelations"));
		for(i = 0; i < checkboxes.length; i++){
			var isChecked = ($(checkboxes[i]).is(':checked'));
			if(isChecked){
				var target = $(checkboxes[i]).val();
				chosenTargets.push(target);
			}
		}
	};

	var renderCheckboxes = function(){
		chosenSpeaker = $("#selection-relationsActs-speaker").val();
		checkboxes = $("#checkboxes-actsRelations");
		checkboxes.empty();
		for(var target in metricsForActsRelations[chosenSpeaker]){
			checkbox = $('<div class="checkbox"><label><input class="checkboxes-actsRelations" checked type="checkbox" value="' + target + 
			'">' + target + '</label></div>');

			checkbox.change(renderRelationsActs);
			checkboxes.append(checkbox);
		}

	};

	var renderSpeakerDropDown = function(){
		var $speakerSelect = $("#selection-relationsActs-speaker");
		for (var speaker in metricsForActsRelations ){
			var $select = $("<option>" + speaker + "</option>");
			$speakerSelect.append($select);
		}	
	};


	var renderRelationsActs = function(){
		var metricSelection = $("#selection-relationsActs-metric").val();
		var normalisationSelection = $("#selection-relationsActs-normalisation").val()
		var speakerSelection = $("#selection-relationsActs-speaker").val()
		setChosenTargets();

		var metric = transformGermanMetric(metricSelection);
		var normalisation = transformGermanMetric(normalisationSelection);
		var metrics = getRelationsActsMetrics(metric, normalisation, speakerSelection);
		drawRelationsActsChart(metricSelection, normalisationSelection, speakerSelection, metrics);
	};

	var getRelationsActsMetrics = function(metricName, typeName, speakerName){
		var metrics = [];
		for(i = 0; i < numberOfActs; i++){
			var row = [];
			row.push((i+1).toString() + ". Act");
			for(j = 0; j < chosenTargets.length; j++){
				var metricSelection = metricsForActsRelations[speakerName][chosenTargets[j]][i];
				if(metricSelection == null){
					row.push(0);
				} else{
					row.push(metricSelection[typeName][metricName]);
				}
			}
			metrics.push(row);
		}
		return metrics;
	};

	var drawRelationsActsChart = function(germanMetric, germanType, speakerName, metrics){
		var vAxisTitle = germanMetric + " - " + germanType;
		var data = new google.visualization.DataTable();
		data.addColumn("string", "actNumber")
		for(i = 0; i < chosenTargets.length; i++){
			data.addColumn("number", chosenTargets[i]);
		}

        data.addRows(metrics);
        var options = {title:'Relationship sentiments per Act - ' + speakerName + ' : ' + vAxisTitle,
        			   height: 600,
        			   width: 1130,
        			   chartArea:{width:'70%',height:'75%'},
				        hAxis: {
        			   	title: 'Akte',
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
		
        
        var chart = new google.visualization.ColumnChart(document.getElementById('chart-div-relationsActs'));

        chart.draw(data, options);
	};

	that.init = init;
	that.renderRelationsActs = renderRelationsActs;

	return that;
};