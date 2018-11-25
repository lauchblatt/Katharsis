SA_Speakers.SpeakersActsView = function(){
	var that = {};
	var metricsForSpeakerPerActs = {};
	var chosenSpeakers = [];
	var numberOfActs = 0;


	var init = function(speakerActsMetrics){
		metricsForSpeakerPerActs = speakerActsMetrics;
		initListener();
		renderCheckboxes();
		setNumberOfActs();

	};

	var setNumberOfActs = function(){
		for(var speaker in metricsForSpeakerPerActs){
			numberOfActs = metricsForSpeakerPerActs[speaker].length;
			break;
		}
	};

	var initListener = function(){
		$("#selection-speakersActs-bar-metric").change(renderSpeakersActBars);
		$("#selection-speakersActs-bar-normalisation").change(renderSpeakersActBars);
	};

	var renderCheckboxes = function(){
		checkboxes = $("#checkboxes-actsSpeakers");
		checkboxes.empty();
		var i = 0;
		for(var speaker in metricsForSpeakerPerActs){
			checkbox = $('<div class="checkbox"><label><input class="checkboxes-actsSpeakers" type="checkbox" value="' + speaker + 
			'">' + speaker + '</label></div>');
			if(i == 0){
				checkbox = $('<div class="checkbox"><label><input class="checkboxes-actsSpeakers" checked type="checkbox" value="' + speaker + 
				'">' + speaker + '</label></div>');
			}else{
				checkbox = $('<div class="checkbox"><label><input class="checkboxes-actsSpeakers" type="checkbox" value="' + speaker + 
			'">' + speaker + '</label></div>');
			}
			i = 1;
			checkbox.change(renderSpeakersActBars);
			checkboxes.append(checkbox);
		}	
	};

	var setChosenSpeakers = function(){
		chosenSpeakers = [];
		var checkboxes = ($(".checkboxes-actsSpeakers"));
		for(i = 0; i < checkboxes.length; i++){
			var isChecked = ($(checkboxes[i]).is(':checked'));
			if(isChecked){
				var speaker = $(checkboxes[i]).val();
				chosenSpeakers.push(speaker);
			}
		}
	};


	var renderSpeakersActBars = function(){
		var metricSelection = $("#selection-speakersActs-bar-metric").val();
		var normalisationSelection = $("#selection-speakersActs-bar-normalisation").val()
		var metric = transformGermanMetric(metricSelection);
		var normalisation = transformGermanMetric(normalisationSelection);
		setChosenSpeakers();
		var metrics = getSpeakerActsMetrics(metric, normalisation);
		drawSpeakersActBarsChart(normalisationSelection, metricSelection, metrics);
	};

	var getSpeakerActsMetrics = function(metricName, normalisation){
		var metrics = [];
		for(var i = 0; i < numberOfActs; i++){
			var row = [];
			row.push(i+1);
			for(var j = 0; j < chosenSpeakers.length; j++){
				var speakerMetrics = metricsForSpeakerPerActs[chosenSpeakers[j]][i];
				if(speakerMetrics == null){
					row.push(0);
					if(chosenSpeakers.length == 1 || chosenSpeakers.length == 2){
						row.push("kein Auftritt");
					}
						
				}else{
					var metric = speakerMetrics[normalisation][metricName];
					row.push(metric);
					if(chosenSpeakers.length == 1 || chosenSpeakers.length == 2){
						row.push((Math.round(metric * 10000) / 10000).toString())
					}
					
				}
			}
			metrics.push(row);
		}
		return metrics;
	};

	/*
	var getSpeakerActsMetrics = function(metricName, normalisation, speaker){
		var speakerMetrics = metricsForSpeakerPerActs[speaker];
		var metrics = [];
		for(i = 0; i < speakerMetrics.length; i++){
			if(speakerMetrics[i] == null){
				metrics.push([(i+1), 0, "kein Auftritt"]);
			}else{
				var metric = speakerMetrics[i][normalisation][metricName];
				metrics.push([(i+1), metric, (Math.round(metric * 10000) / 10000).toString()]);
			}
		}
		return metrics;
	};
	*/

	var drawSpeakersActBarsChart = function(germanType, germanMetric, metrics){
		var vAxisTitle = germanMetric + " - " + germanType;
		var data = new google.visualization.DataTable();
		data.addColumn("number", "Act-Number")
		for(var i = 0; i < chosenSpeakers.length; i++){
			data.addColumn("number", chosenSpeakers[i]);
			if(chosenSpeakers.length == 1 || chosenSpeakers.length == 2){
				data.addColumn({type:'string', role:'annotation'})
			}
			
		}
		
        data.addRows(metrics);
        
        var options = {title:'Akt-Verlauf pro Sprecher: ' + vAxisTitle,
        			   height: 600,
        			   width: 1130,
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
        			   	title: 'Akte'
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
        for(var j = 0; j < chosenSpeakers.length; j++){
        	formatter.format(data, j+1);
        }
		

        var chart = new google.visualization.ColumnChart(document.getElementById("chart-div-speakersAct"));

        chart.draw(data, options);
	};

	that.init = init;
	that.renderSpeakersActBars = renderSpeakersActBars;

	return that;
};