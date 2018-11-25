Speakers.SpeakersBarChartView = function(){
	var that = {};
	//saving current Selection, and data attribute that is affected by the selection
	var speakersSelection = "";
	var speakersAttribute = "";

	var init = function(){
		initListener();
	};

	//Change current selection of dropdown-menu and react accordingly
	var initListener = function(){
		$("#selection-speakers").change(speakersSelectionClicked);
	};

	var speakersSelectionClicked = function(){
		$(that).trigger("SpeakersSelectionClicked");
	};

	var renderBarChart = function(speakersInfo){
		var data = new google.visualization.DataTable();
		data.addColumn("string", "Speaker");
		data.addColumn("number", speakersSelection);
		//To sort by data-attribute
		speakersInfo.sort(sort_by(speakersAttribute,true));
		var array = [];
		for(i = 0; i < speakersInfo.length; i++){
			var row = [speakersInfo[i].name, speakersInfo[i][speakersAttribute]];
			array.push(row);
		}
		data.addRows(array);

		//Estimate Height according to number of speakers
		var estimatedHeight = speakersInfo.length * 30;
		if(estimatedHeight < 800){
			estimatedHeight = 800;
		}

		var options = {title:'Speakers statistics',
        			   height: estimatedHeight,
        			   width: 1000,
        			   chartArea:{width:'55%',height:'90%'},
				        hAxis: {
        			   	title: speakersSelection
        			   },
        			   animation: {
                   	   	duration: 1000
                   	   },
        			   vAxis: {
        			   	baseline: 0
        			   }};

        // Create a dashboard.
        var dashboard = new google.visualization.Dashboard(
            document.getElementById('dashbord-speakers-barChart'));

        // Create a range slider, passing some options
        var barChartRangeSlider = new google.visualization.ControlWrapper({
          'controlType': 'NumberRangeFilter',
          'containerId': 'filter-speakers-barChart',
          'options': {
            'filterColumnLabel': speakersSelection
          }
        });

        var barChart = new google.visualization.ChartWrapper({
          'chartType': 'BarChart',
          'containerId': 'chart-speakers-barChart',
          'options': options
        });

        $("#download-png-speakers-barChart").unbind("click");
        $("#download-png-speakers-barChart").on("click", function(){
          window.open(barChart.getChart().getImageURI());
          //drawChartAct(actInfo);
        });

        dashboard.bind(barChartRangeSlider, barChart);

        // Draw the dashboard.
        dashboard.draw(data);
	};

	//Adept data-attribute to be rendered according to selection of dropdown-menu
	var setSpeakersSelection = function(){
		speakersSelection = $("#selection-speakers").val();

		if(speakersSelection == "Presence"){speakersAttribute = "number_of_appearances"};
		if(speakersSelection == "Presence in percent"){speakersAttribute = "appearances_percentage";}
		if(speakersSelection == "Speeches"){speakersAttribute = "number_of_speakers_speeches";}
		if(speakersSelection == "Average length of speeches"){speakersAttribute = "average_length_of_speakers_speeches";}
		if(speakersSelection == "Median length of speeches"){speakersAttribute = "median_length_of_speakers_speeches";}
		if(speakersSelection == "Maximum length of speeches"){speakersAttribute = "maximum_length_of_speakers_speeches";}
		if(speakersSelection == "Minimum length of speeches"){speakersAttribute = "minimum_length_of_speakers_speeches";}
	};

	//Sort method for objects from http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
	var sort_by = function(field, reverse, primer){

   		var key = primer ? 
        function(x) {return primer(x[field])} : 
       	function(x) {return x[field]};

   		reverse = !reverse ? 1 : -1;

   		return function (a, b) {
       	return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     	} 
	};

	that.setSpeakersSelection = setSpeakersSelection;
	that.init = init;
	that.renderBarChart = renderBarChart;

	return that;
};