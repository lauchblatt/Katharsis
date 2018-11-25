SingleDrama.BarChartDramaView = function(){
	var that = {};

	//Variables to save the current selection and the corresponding data-attribute of the dropdown-selection
	var actSelection = "";
	var actAttribute = "";
	var scenesSelection = "";
	var scenesAttribute = "";

	var init = function(){
		initListener();
	};

	//Reacting on changes in the dropdown-menus
	var initListener = function(){
		$("#selection-act").change(actSelectionClicked);
		$("#selection-scenes").change(scenesSelectionClicked);

	};

	var actSelectionClicked = function(){
		$(that).trigger("ActSelectionClicked");
	};

	var scenesSelectionClicked = function(){
		$(that).trigger("ScenesSelectionClicked");
	};

	var drawChartAct = function(actInfo){
		//Not important anymore
		if(actSelection == "Speech length"){
			drawSpeechesChartAct(actInfo);
			return;
		}
        var data = new google.visualization.DataTable();
        data.addColumn('number', 'Acts');
        //Adjust legend according to chosen selection
        if(actSelection == "Scenes" || actSelection == "Speakers" || actSelection == "Speech length"){
        	data.addColumn('number', 'Number of ' + actSelection);
        }else{
        	data.addColumn('number', actSelection);
        }
        var array = [];
        //Round average length of speeches if chosen attribute
        if(actAttribute == "average_length_of_speeches_in_act"){
        	for(var i = 0; i < actInfo.length; i++){
        	var row = [(i+1), roundToTwoDecimals(actInfo[i][actAttribute])];
        	array.push(row);
        	}
        } else{
        	if(actAttribute == "speaker_length"){
        		for(var i = 0; i < actInfo.length; i++){
        			var row = [(i+1), actInfo[i].appearing_speakers.length];
        			array.push(row);
        		}
        	}else{
        		for(var i = 0; i < actInfo.length; i++){
	        	var row = [(i+1), actInfo[i][actAttribute]];
	        	array.push(row);
	        	}
        	}	
        }

        data.addRows(array);
        var options = {title:'Act statistics',
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
        			   	title: 'Acts'
        			   },
        			   vAxis: {
        			   	title: actSelection,
        			   	baseline: 0
        			   },
                   	   animation: {
                   	   	duration: 700,
                   	   	startup: true
                   	   }};

        
        var chart = new google.visualization.ColumnChart(document.getElementById('chart-div-act'));
        var chart_div = document.getElementById('chart-div-act');

        $("#download-png-act").unbind("click");
        $("#download-png-act").on("click", function(){
        	window.open(chart.getImageURI());
        });

        chart.draw(data, options);

	};

	//Set relevant attribute of act-object according to selection
	var setActSelection = function(){
		actSelection = $("#selection-act").val();

		if(actSelection == "Scenes"){actAttribute = "number_of_scenes";}
		if(actSelection == "Speakers"){actAttribute = "speaker_length";}
		if(actSelection == "Speeches"){actAttribute = "number_of_speeches_in_act";}
		if(actSelection == "Average length of speeches"){actAttribute = "average_length_of_speeches_in_act";}
		if(actSelection == "Median length of speeches"){actAttribute = "median_length_of_speeches_in_act";}
		if(actSelection == "Maximum length of speeches"){actAttribute = "maximum_length_of_speeches_in_act";}
		if(actSelection == "Minimum length of speeches"){actAttribute = "minimum_length_of_speeches_in_act";}
	};

	//Loop to render all Graphs for Scenes dynamically
	var drawChartScenes = function(scenesInfo){
		$charts_scenes = $("#charts-scenes");
		for(var act = 0; act < scenesInfo.length; act++){
			$div_chart = $("<div></div>");
			$div_chart.addClass("scenes-chart");
			$div_chart.attr("id", "chart-div-scenes-" + act);
			$charts_scenes.append($div_chart);
			var $button = $("<button class='btn btn-primary png-download'></button>");
			$button.attr("id", "download-png-" + act);
			$button.text("Download PNG");
			var $buttonDiv = $("<div>").addClass("container").append($button);
			$charts_scenes.append($buttonDiv);
			drawChartForScenesInAct(("chart-div-scenes-" + act), scenesInfo[act], (act+1));
		}
	};

	//Drawing Chart for Scenes, similar to Act
	var drawChartForScenesInAct = function(divId, scenesInfoPerAct, act){
		if(scenesSelection == "Speech length"){
			drawSpeechesChartScenes(scenesInfoPerAct, act, divId);
			return;
		}
        var data = new google.visualization.DataTable();
        data.addColumn('number', 'Scenes');
        if(scenesSelection == "Speakers" || scenesSelection == "Speech length"){
        	data.addColumn('number', scenesSelection);
        }else{
        	data.addColumn('number', scenesSelection);
        }
        var array = [];
        if(scenesAttribute == "average_length_of_speeches_in_scene"){
        	for(var i = 0; i < scenesInfoPerAct.length; i++){
        	var row = [(i+1), roundToTwoDecimals(scenesInfoPerAct[i][scenesAttribute])];
        	array.push(row);
        	}
        } else{
        	for(var i = 0; i < scenesInfoPerAct.length; i++){
        	var row = [(i+1), scenesInfoPerAct[i][scenesAttribute]];
        	array.push(row);
        	}
        }
        
        data.addRows(array);
        //necessary to have consistent gaps according to the scenes on the graph 
        var ticksArray = [];
        for(var k = 0; k < scenesInfoPerAct.length; k++){
        	ticksArray.push(k+1);
        }
        var options = {title:'Scenes statistics: Act ' + act,
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
        			   	title: 'Scenes',
        			   	ticks: ticksArray
        			   },
        			   vAxis: {
        			   	title: scenesSelection,
        			   	baseline: 0
        			   },
                   	   animation: {
                   	   	duration: 700,
                   	   	startup: true
                   	   }};
        var chart = new google.visualization.ColumnChart(document.getElementById(divId));

        var chart_div = document.getElementById(divId);

        $("#download-png-" + (act-1)).unbind("click");
        $("#download-png-" + (act-1)).on("click", function(){
        	window.open(chart.getImageURI());
        });

        chart.draw(data, options);
	};

	//More complex Method to draw selection "Replikenlänge" to visualize all Speech-Data at once
	var drawSpeechesChartScenes = function(scenesInfoPerAct, act, divId){
		var data = new google.visualization.DataTable();
		data.addColumn('number', 'Scenes');
		data.addColumn('number', 'Minimum length of speeches');
		data.addColumn('number', 'Average length of speeches');
		data.addColumn('number', 'Median length of speeches');
		data.addColumn('number', 'Maximum length of speeches');
		var array = [];
		for(var i = 0; i < scenesInfoPerAct.length; i++){
			var row = [(i+1), scenesInfoPerAct[i].minimum_length_of_speeches_in_scene, 
			roundToTwoDecimals(scenesInfoPerAct[i].average_length_of_speeches_in_scene),
			scenesInfoPerAct[i].median_length_of_speeches_in_scene,
			scenesInfoPerAct[i].maximum_length_of_speeches_in_scene];
			array.push(row);
		}
		var ticksArray = [];
        for(var k = 0; k < scenesInfoPerAct.length; k++){
        	ticksArray.push(k+1);
        }
		data.addRows(array);
		        var options = {title:'Scenes statistics: Act ' + act,
        			   height: 600,
        			   width: 1170,
				        hAxis: {
        			   	title: 'Scenes',
        			   	ticks: ticksArray
        			   },
        			   vAxis: {
        			   	baseline: 0
        			   },
                   	   animation: {
                   	   	duration: 700,
                   	   	startup: true
                   	   }};
        var chart = new google.visualization.ColumnChart(document.getElementById(divId));
        $("#download-png-" + (act-1)).unbind("click");
        $("#download-png-" + (act-1)).on("click", function(){
        	window.open(chart.getImageURI());
        });
        chart.draw(data, options);
	};

	//Set attribute of scene-object according to selection
	var setScenesSelection = function(){
		scenesSelection = $("#selection-scenes").val();

		if(scenesSelection == "Speakers"){scenesAttribute = "number_of_speakers"};
		if(scenesSelection == "Speeches"){scenesAttribute = "number_of_speeches_in_scene";}
		if(scenesSelection == "Average length of speeches"){scenesAttribute = "average_length_of_speeches_in_scene";}
		if(scenesSelection == "Median length of speeches"){scenesAttribute = "median_length_of_speeches_in_scene";}
		if(scenesSelection == "Maximum length of speeches"){scenesAttribute = "maximum_length_of_speeches_in_scene";}
		if(scenesSelection == "Minimum length of speeches"){scenesAttribute = "minimum_length_of_speeches_in_scene";}
	};

	var roundToTwoDecimals = function(number){
		number = (Math.round(number * 100)/100).toFixed(2);
		return parseFloat(number)
	};

	that.init = init;
	that.drawChartAct = drawChartAct;
	that.setActSelection = setActSelection;
	that.drawChartScenes = drawChartScenes;
	that.setScenesSelection = setScenesSelection;

	return that;
};