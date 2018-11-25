Speeches.SpeechesDistributionView = function(){
	var that = {};

	var render = function(scenesInfo){

		var data = new google.visualization.DataTable();
		data.addColumn("string", "Speech");
		data.addColumn("number", 'Speech length in number of words');
		var array = [];
		var iterator = 0;
		for(act = 0; act < scenesInfo.length; act++){
			for(scene = 0; scene < scenesInfo[act].length; scene++){
				if(scenesInfo[act][scene].speeches !== undefined){
					for(speech = 0; speech < scenesInfo[act][scene].speeches.length; speech++){
						//generate Tooltip-Info for every speech in the drama, with every information for a speech
						var row = [getSpeechInfo(act, scene, speech, scenesInfo[act][scene].speeches[speech]), 
						scenesInfo[act][scene].speeches[speech]['length']];
						array.push(row);
						iterator++;
					}
				}
			}
		}
		data.addRows(array);

		var options = {
		  height: 700,
		  width: 1170,
		  animation: {
		  	duration: 1000
		  },
		  legend: {
          	position: 'none'
          },
          hAxis : {
          	title: 'Speech length'
          },
          vAxis: {
          	title: 'Absolute frequency'
          },
		  chartArea:{width:'75%',height:'80%'},
          title: 'Histogram - Distribution of speech lengths'
        };

        var dashboard = new google.visualization.Dashboard(
            document.getElementById('distribution-dashbord'));

        var rangeSlider = new google.visualization.ControlWrapper({
          'controlType': 'NumberRangeFilter',
          'containerId': 'distribution-controls',
          'options': {
            'filterColumnLabel': 'Speech length in number of words'
          }
        });

        var chart = new google.visualization.ChartWrapper({
          'chartType': 'Histogram',
          'containerId': 'distribution-chart',
          'options': options
        });

        var chart_div = document.getElementById('distribution-chart');

        $("#download-png-distribution").unbind("click");
        $("#download-png-distribution").on("click", function(){
          window.open(chart.getChart().getImageURI());
        });

        dashboard.bind(rangeSlider, chart);

        dashboard.draw(data);

	};

	var getSpeechInfo = function(actNumber, sceneNumber, speechNumber, speech){
		var info = "Speaker: " + speech.speaker + ", " + (actNumber + 1) + ". Act, " + (sceneNumber + 1) + ". Scene, " 
		+ (speechNumber + 1) + ". Speech";
		return info;
	};

	that.render = render;

	return that;
};