Speeches.SpeechesLineView = function(){
	var that = {};
  //Current selection of the dropdown-menu
  var disSelection = "";
  var currentDrama_id = 0;

  var init = function(){
    initListener();
    initId();
    initLinks();
  };

  //Set Selection, when changed
  var setSelection = function(){
    disSelection = $("#selection-speech-distribution").val();

  };

  var initListener = function(){
    $("#selection-speech-distribution").change(selectionClicked);
  };

  var selectionClicked = function(){
    $(that).trigger("SelectionClicked");
  };

  //Method to render the relative distribution
	var renderRelative = function(distribution){

		var data = new google.visualization.DataTable();
		data.addColumn("number", "Speech length in number of words");
		data.addColumn("number", 'Frequency of speech length in percent');
		var array = [];
		for(var key in distribution){
			var row = [parseInt(key), distribution[key]];
			array.push(row);
		}
		data.addRows(array);

		var options = {
		  height: 700,
		  width: 1170,
		  animation: {
		  	duration: 1000
		  },
		  chartArea:{width:'75%',height:'80%'},
          title: 'Distribution of speech length, Relative frequency in percent',
          curveType: 'function',
          legend: {
          	position: 'none'
          },
          hAxis : {
          	title: 'Speech length in number of words'
          },
          vAxis: {
          	title: 'Relative frequency in percent',
            baseline: 0
          }
        };

        var dashboard = new google.visualization.Dashboard(
            document.getElementById('curve-dashbord'));

        var rangeSlider1 = new google.visualization.ControlWrapper({
          'controlType': 'NumberRangeFilter',
          'containerId': 'curve-controls1',
          'options': {
            'filterColumnLabel': 'Speech length in number of words'
          }
        });

        var rangeSlider2 = new google.visualization.ControlWrapper({
          'controlType': 'NumberRangeFilter',
          'containerId': 'curve-controls2',
          'options': {
            'filterColumnLabel': 'Frequency of speech length in percent'
          }
        });

        var chart = new google.visualization.ChartWrapper({
          'chartType': 'LineChart',
          'containerId': 'curve-chart',
          'options': options
        });

        dashboard.bind(rangeSlider1, chart);
        dashboard.bind(rangeSlider2, chart);

        var chart_div = document.getElementById('curve-chart');

        $("#download-png-curve").unbind("click");
        $("#download-png-curve").on("click", function(){
          //chart_div.innerHTML = '<img src="' + chart.getChart().getImageURI() + '">';

          window.open(chart.getChart().getImageURI());
          
          //render(distribution);

        });

        dashboard.draw(data);
	};

    //Method to render absolute distribution
    var renderAbsolute = function(distribution){
    console.log("renderAbsolute");
    var data = new google.visualization.DataTable();
    data.addColumn("number", "Speech length in number of words");
    data.addColumn("number", 'Absolute frequency of speech length');
    var array = [];
    for(var key in distribution){
      var row = [parseInt(key), distribution[key]];
      array.push(row);
    }
    data.addRows(array);

    var options = {
      height: 700,
      width: 1170,
      animation: {
        duration: 1000
      },
      chartArea:{width:'75%',height:'80%'},
          title: 'Distribution of speech length, Absolute frequency',
          curveType: 'function',
          legend: {
            position: 'none'
          },
          hAxis : {
            title: 'Speech length in number of words'
          },
          vAxis: {
            title: 'Absolute frequency',
            baseline: 0
          }
        };

        var dashboard = new google.visualization.Dashboard(
            document.getElementById('curve-dashbord'));

        var rangeSlider1 = new google.visualization.ControlWrapper({
          'controlType': 'NumberRangeFilter',
          'containerId': 'curve-controls1',
          'options': {
            'filterColumnLabel': 'Speech length in number of words'
          }
        });

        var rangeSlider2 = new google.visualization.ControlWrapper({
          'controlType': 'NumberRangeFilter',
          'containerId': 'curve-controls2',
          'options': {
            'filterColumnLabel': 'Absolute frequency of speech length'
          }
        });

        var chart = new google.visualization.ChartWrapper({
          'chartType': 'LineChart',
          'containerId': 'curve-chart',
          'options': options
        });

        dashboard.bind(rangeSlider1, chart);
        dashboard.bind(rangeSlider2, chart);

        var chart_div = document.getElementById('curve-chart');

        $("#download-png-curve").unbind("click");
        $("#download-png-curve").on("click", function(){
          //chart_div.innerHTML = '<img src="' + chart.getChart().getImageURI() + '">';

          window.open(chart.getChart().getImageURI());
          
          //render(distribution);

        });

        dashboard.draw(data);
  };

  var getSelection = function(){
    return disSelection;
  };

  var initId = function(){
    var params = window.location.search
    currentDrama_id = (params.substring(params.indexOf("=") + 1));
  };

  //Init Links on page with ID of currently selected drama
  var initLinks = function(){
    $("#link-overall").attr("href", "drama.html?drama_id=" + currentDrama_id);
    $("#link-matrix").attr("href", "matrix.html?drama_id=" + currentDrama_id);
    $("#link-drama").attr("href", "singledrama.html?drama_id=" + currentDrama_id);
    $("#link-drama-actSceneAnalysis").attr("href", "singledrama.html?drama_id=" + currentDrama_id + "#act-scene-table");
    $("#link-drama-actStatistic").attr("href", "singledrama.html?drama_id=" + currentDrama_id + "#act-statistic");
    $("#link-drama-sceneStatistic").attr("href", "singledrama.html?drama_id=" + currentDrama_id + "#scene-statistic");
    $("#link-speakers").attr("href", "speakers.html?drama_id=" + currentDrama_id);
    $("#link-speaker-table").attr("href", "speakers.html?drama_id=" + currentDrama_id + "#speaker-table");
    $("#link-speeches-dominance").attr("href", "speakers.html?drama_id=" + currentDrama_id  + "#speeches-dominance");
    $("#link-speaker-statistic").attr("href", "speakers.html?drama_id=" + currentDrama_id  + "#speaker-statistic");
    $("#link-speaker-relations").attr("href", "speakers.html?drama_id=" + currentDrama_id  + "#speaker-relations");
    $("#link-speeches").attr("href", "speeches.html?drama_id=" + currentDrama_id);
    $("#link-histogram").attr("href", "speeches.html?drama_id=" + currentDrama_id + "#histogram");
    $("#link-curve-diagram").attr("href", "speeches.html?drama_id=" + currentDrama_id + "#curve-diagram");
    $("#link-contact").attr("href", "contact.html?drama_id=" + currentDrama_id);
  };

	that.renderRelative = renderRelative;
  that.setSelection = setSelection;
  that.getSelection = getSelection;
  that.init = init;
  that.renderAbsolute = renderAbsolute;

	return that;
};