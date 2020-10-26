MultipleDramas.YearView = function(){
	var that = {};
	var yearSelection = "";
	var yearAttribute = "";
	var compareSelection = "";

	var init = function(){
		initListener();
	};

	var initListener = function(){
		$("#selection-year").change(yearSelectionClicked);
		$("#selection-year-compare").change(yearSelectionCompareClicked);
	};

	//React if Dropdown-Menu for Parameters is clicked
	var yearSelectionClicked = function(){
		$(that).trigger("YearSelectionClicked");
	};

	//React if Dropdown-Menu for Comparison (Type, Author) is clicked
	var yearSelectionCompareClicked = function(){
		$(that).trigger("YearSelectionCompareClicked");
	};

	var renderScatterChart = function(dramas, authors){
		//Call Method according to choice
		if(compareSelection == 'No comparison'){
			renderScatterChartNormal(dramas);
		}
		if(compareSelection == 'Genre'){
			renderScatterChartType(dramas);
		}
		if(compareSelection == 'Author'){
			renderScatterChartAuthor(dramas, authors);
		}
	};

	//Render Scatter Chart with no Selection
	var renderScatterChartNormal = function(dramas){
		var data = new google.visualization.DataTable();
		data.addColumn("number", "Year");
		data.addColumn("number", yearSelection);
		//Add custom tooltip for Graph
		data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		var array = [];
		for(i = 0; i < dramas.length; i++){
			//create custom Tooltip
			var row = [dramas[i].year, dramas[i][yearAttribute],
			createTooltip(dramas[i])];
			array.push(row);
		}
		data.addRows(array);

		var options = {
          title: 'Temporal progression',
          height: 700,
          width: 1170,
          explorer: {},
          tooltip: { isHtml: true },
          hAxis: {title: 'Year', format: ' '},
          vAxis: {title: yearSelection},
          legend: 'none',
          chartArea:{width:'75%',height:'80%'},
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
				        }
        };
        var optionsSlider = {
        	filterColumnLabel: 'Year',
        	ui: {
        		chartType: 'ScatterChart',
        		chartOptions: {
        			height: 100,
        			width: 1170,
        			chartArea:{width:'75%',height:'80%'},
        			hAxis: {title: 'Year', format: ' '}
        		}
        	}
        };

        var dashboard = new google.visualization.Dashboard(
            document.getElementById('dashbord-year'));

        //Different Sliders one for parameter...
        var rangeSlider1 = new google.visualization.ControlWrapper({
          'controlType': 'ChartRangeFilter',
          'containerId': 'controls-year1',
          'options': optionsSlider
        });

        //...one for year
        var rangeSlider2 = new google.visualization.ControlWrapper({
          'controlType': 'NumberRangeFilter',
          'containerId': 'controls-year2',
          'options': {
            'filterColumnLabel': yearSelection
          }
        });

        var chart = new google.visualization.ChartWrapper({
          'chartType': 'ScatterChart',
          'containerId': 'chart-div-year',
          'options': options
        });

        $("#download-png-year").unbind("click");
        $("#download-png-year").on("click", function(){
          window.open(chart.getChart().getImageURI());
        });

        dashboard.bind(rangeSlider1, chart);
        dashboard.bind(rangeSlider2, chart);
        $("#controls-year2").fadeIn();
        dashboard.draw(data);
	};

	//render Chart if Author is selected as comparison
	var renderScatterChartAuthor = function(dramas, authors){
		var data = new google.visualization.DataTable();
		var trendlineObj = {};
		data.addColumn("number", "Year");
		for(var i = 0; i < authors.length; i++){
			//Init Colums for every author and the tooltips
			data.addColumn("number", getLastNameAndFirstInitial(authors[i].name));
			data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
			trendlineObj[i] = {
				          	tooltip: false,
				            type: 'polynomial',
				            lineWidth: 3,
				            opacity: 0.3,
				            showR2: false,
				            visibleInLegend: false
				          };
		}
		var array = [];
		//To visualize Tooltips correct we need null values on every Tooltip column an author doesnt need
		var rowLength = ((authors.length*2)+1);
		for(var i = 0; i < dramas.length; i++){
			var row = [];
			for(var j = 0; j < rowLength; j++){
				//Fill the row with nulls
				row.push(null);
			}
			//save the correct data on the fitting position
			for(var k = 0; k < authors.length; k++){
				if(dramas[i].author == authors[k].name){
					row[0] = dramas[i].year;
					row[(k*2) + 1] = dramas[i][yearAttribute];
					row[(k*2) + 2] = createTooltip(dramas[i]);
					array.push(row);
					}
				}	
			}
		data.addRows(array);

		var options = {
          title: 'Temporal progression',
          height: 700,
          width: 1170,
          explorer: {},
          tooltip: { isHtml: true },
          hAxis: {title: 'Year', format: ' '},
          vAxis: {title: yearSelection},
          chartArea:{width:'75%',height:'80%'},
          trendlines: trendlineObj
        };

        var optionsSlider = {
        	filterColumnLabel: 'Year',
        	ui: {
        		chartType: 'ScatterChart',
        		chartOptions: {
        			height: 100,
        			width: 1170,
        			chartArea:{width:'75%',height:'80%'},
        			hAxis: {title: 'Year', format: ' '}
        		}
        	}
        }

        var dashboard = new google.visualization.Dashboard(
            document.getElementById('dashbord-year'));

        var rangeSlider1 = new google.visualization.ControlWrapper({
          'controlType': 'ChartRangeFilter',
          'containerId': 'controls-year1',
          'options': optionsSlider
        });

        var chart = new google.visualization.ChartWrapper({
          'chartType': 'ScatterChart',
          'containerId': 'chart-div-year',
          'options': options
        });

        $("#download-png-year").unbind("click");
        $("#download-png-year").on("click", function(){
          window.open(chart.getChart().getImageURI());
        });

        dashboard.bind(rangeSlider1, chart);

        $("#controls-year2").fadeOut();
        dashboard.draw(data);

	};

	var renderScatterChartType = function(dramas){
		var data = new google.visualization.DataTable();
		//Add Columns for every category
		data.addColumn("number", "Year");
		data.addColumn("number", 'Comedy');
		data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data.addColumn("number", 'Schauspiel');
		data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data.addColumn("number", 'Tragedy');
		data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});

		data.addColumn("number", 'unknown');	
		data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});

		var array = [];
		var hasComedy = false;
		var hasPageant = false;
		var hasTragedy = false;
		var hasUnknown = false;

		//prepare Trendlines for every category
		var trendlinesObj = {};
		var trendlineComedy = {tooltip: false, type: 'polynomial', color: 'blue', lineWidth: 3, opacity: 0.3, showR2: false, visibleInLegend: false};
		var trendlinePageant = {tooltip: false, type: 'polynomial', color: 'red', lineWidth: 3, opacity: 0.3, showR2: false, visibleInLegend: false};
		var trendlineTragedy = {tooltip: false, type: 'polynomial', color: 'green', lineWidth: 3, opacity: 0.3, showR2: false, visibleInLegend: false};

		var trendlineUnknown = {tooltip: false, type: 'polynomial', color: 'green', lineWidth: 3, opacity: 0.3, showR2: false, visibleInLegend: false};

		//create data array with Tooltip for comedy, pageant, tragedy, other columns are null
		for(i = 0; i < dramas.length; i++){
			if(dramas[i].type == 'Komoedie'){
				var row = [dramas[i].year, dramas[i][yearAttribute], createTooltip(dramas[i]), null, null, null, null, null, null];
				array.push(row);
				if(!hasComedy){
					trendlinesObj['0'] = trendlineComedy;
					hasComedy = true;
				}
			}
			if(dramas[i].type == 'Schauspiel'){
				var row = [dramas[i].year, null, null, dramas[i][yearAttribute], createTooltip(dramas[i]), null, null, null, null];
				array.push(row);
				if(!hasPageant){
					trendlinesObj['1'] = trendlinePageant;
					hasPageant = true;
				}
			}
			if(dramas[i].type == 'Trauerspiel'){
				var row = [dramas[i].year, null, null, null, null, dramas[i][yearAttribute], createTooltip(dramas[i]), null, null];
				array.push(row);
				if(!hasTragedy){
					trendlinesObj['2'] = trendlineTragedy;
					hasTragedy = true;
				}
			}

			if(dramas[i].type == 'unknown'){	
				var row = [dramas[i].year, null, null, null, null, null, null, dramas[i][yearAttribute], createTooltip(dramas[i])];	
				array.push(row);	
				if(!hasUnknown){	
					trendlinesObj['3'] = trendlineUnknown;	
					hasUnknown = true;	
				}	
			}

		}
		data.addRows(array);

		var options = {
          title: 'Temporal progression',
          height: 700,
          width: 1170,
          explorer: {},
          tooltip: { isHtml: true },
          hAxis: {title: 'Year', format: ' '},
          vAxis: {title: yearSelection},
          chartArea:{width:'75%',height:'80%'},
          colors: ['blue','red', 'green', 'yellow'],
          trendlines: trendlinesObj
        };

        var optionsSlider = {
        	filterColumnLabel: 'Year',
        	ui: {
        		chartType: 'ScatterChart',
        		chartOptions: {
        			height: 100,
        			width: 1170,
        			colors: ['blue', 'red', 'green', 'yellow'],
        			chartArea:{width:'75%',height:'80%'},
        			hAxis: {title: 'Year', format: ' '}
        		}
        	}
        }

        var dashboard = new google.visualization.Dashboard(
            document.getElementById('dashbord-year'));

        var rangeSlider1 = new google.visualization.ControlWrapper({
          'controlType': 'ChartRangeFilter',
          'containerId': 'controls-year1',
          'options': optionsSlider
        });

        var chart = new google.visualization.ChartWrapper({
          'chartType': 'ScatterChart',
          'containerId': 'chart-div-year',
          'options': options
        });

        $("#download-png-year").unbind("click");
        $("#download-png-year").on("click", function(){
          window.open(chart.getChart().getImageURI());
        });

        dashboard.bind(rangeSlider1, chart);
        $("#controls-year2").fadeOut();
        dashboard.draw(data);
	};

	//create Tooltip for single drama
	var createTooltip = function(drama){
		var divBegin = "<div class='tooltip-test'>";
		var headline = "<div>" + "'" + drama.title + "'" + " by <em>" + getLastName(drama.author) + "</em></div>";
		var year = "<div>" + "<b>Year: </b>" + drama.year + "</div>";
		var data = "<div>" + "<b>" + yearSelection + ": </b>" + drama[yearAttribute] + "</div>";
		var divEnd = "</div>";
		return (divBegin + headline + year + data + divEnd); 
	};

	//set the selection of the attribute according to the selection
	var setYearSelection = function(){
		yearSelection = $("#selection-year").val();

		if(yearSelection == "Number of scenes"){yearAttribute = "number_of_scenes"};
		if(yearSelection == "Number of speeches"){yearAttribute = "number_of_speeches_in_drama";}
		if(yearSelection == "Number of speakers"){yearAttribute = "speaker_count"};
		if(yearSelection == "Configuration density"){yearAttribute = "configuration_density";}
		if(yearSelection == "Average length of speeches"){yearAttribute = "average_length_of_speeches_in_drama";}
		if(yearSelection == "Median length of speeches"){yearAttribute = "median_length_of_speeches_in_drama";}
		if(yearSelection == "Maximum length of speeches"){yearAttribute = "maximum_length_of_speeches_in_drama";}
		if(yearSelection == "Minimum length of speeches"){yearAttribute = "minimum_length_of_speeches_in_drama";}
		
	};

	var setYearCompareSelection = function(){
		compareSelection = $("#selection-year-compare").val();	
	};

	var getLastName = function(author){
		author = author.slice(0, author.indexOf(","));
		return author;
	};

	var getLastNameAndFirstInitial = function(author){
		var authorLastName = author.slice(0, author.indexOf(","));
		var commaIndex = author.indexOf(",");
		var initial = author.slice(commaIndex+1, commaIndex+3);
		author = authorLastName + "," + initial + ".";
		return author;
	};

	that.renderScatterChart = renderScatterChart;
	that.setYearSelection = setYearSelection;
	that.setYearCompareSelection = setYearCompareSelection;
	that.init = init;

	return that;
};