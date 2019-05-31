ActsScenes.DramaView = function(){
	var that = {};
	var metricsForDrama = []
	var proportionsForDrama = {}

	var init = function(dramaProportionData){
		proportionsForDrama = dramaProportionData;

		initListener();
	};

	var initListener = function(){

		$("#selection-drama-pie-metric").change(renderDramaPieChart);
		$("#selection-drama-pie-type").change(renderDramaPieChart);
	};

	var renderDramaPieChart = function(){
		var metricSelection = $("#selection-drama-pie-metric").val();
		var typeSelection = $("#selection-drama-pie-type").val();

		var metric = transformGermanMetric(metricSelection);
		var type = transformGermanMetric(typeSelection);
		drawDramaPieChart(type, metric, metricSelection, typeSelection);
	};

	var drawDramaPieChart = function(proportionType, metricName, germanMetric, germanType){
		var data = new google.visualization.DataTable();
		data.addColumn("string", "Category");
		data.addColumn("number", "Count");

		console.log(proportionType)
		console.log(metricName)
		console.log(proportionsForDrama)
        data.addRows(proportionsForDrama[proportionType][metricName]);
        var options = {
		  height: 600,
      		width: 1000,
      		chartArea:{width:'70%',height:'75%'},
          	title: 'Sentiment distribution: ' + germanMetric + " - " + germanType,
          	is3D: true,
        	};
        var chart = new google.visualization.PieChart(document.getElementById('chart-div-drama-pie'))
        chart.draw(data, options)
	};

	that.init = init;
	that.renderDramaPieChart = renderDramaPieChart;

	return that;
};