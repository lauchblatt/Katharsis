Speakers.SpeechesDominanceView = function(){
	var that = {};

	var renderPieChart = function(speakersInfo){
		var data = new google.visualization.DataTable();
		data.addColumn("string", "Speaker");
		data.addColumn("number", "Number of speeches");
		var array = [];
		for(i = 0; i < speakersInfo.length; i++){
			var row = [speakersInfo[i].name, speakersInfo[i].number_of_speakers_speeches];
			array.push(row);
		}
		data.addRows(array);

		var options = {
		  height: 600,
      width: 1000,
      chartArea:{width:'70%',height:'75%'},
          title: 'Dominance of speeches',
          is3D: true,
        };

        // Create a dashboard.
        var dashboard = new google.visualization.Dashboard(
            document.getElementById('dashboard-speeches-dominance'));

        // Create a range slider, passing some options
        var donutRangeSlider = new google.visualization.ControlWrapper({
          'controlType': 'NumberRangeFilter',
          'containerId': 'filter-speeches-dominance',
          'options': {
            'filterColumnLabel': 'Number of speeches'
          }
        });

        var pieChart = new google.visualization.ChartWrapper({
          'chartType': 'PieChart',
          'containerId': 'chart-speeches-dominance',
          'options': options
        });

        dashboard.bind(donutRangeSlider, pieChart);

        $("#download-png-speeches-dominance").unbind("click");
        $("#download-png-speeches-dominance").on("click", function(){
          window.open(pieChart.getChart().getImageURI());
          //drawChartAct(actInfo);
        });

        // Draw the dashboard.
        dashboard.draw(data);
	};

	that.renderPieChart = renderPieChart;

	return that;
};