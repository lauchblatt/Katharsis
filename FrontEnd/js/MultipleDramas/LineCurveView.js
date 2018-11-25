MultipleDramas.LineCurveView = function(){
	var that = {};

  var compareSelection = "";
  var speechDistributionSelection = "";

  var init = function(){
    initListener();
  };

  //React to Interaction with Dropdown-Menus
  var initListener = function(){
    $("#selection-speech-compare").change(speechSelectionClicked);
    $("#selection-speech-distribution").change(speechSelectionClicked);
  };

  var speechSelectionClicked = function(){
    $(that).trigger("SpeechSelectionClicked");
  };

  //Main Method to render Curve, different methods are evoked acoording to selection
  var renderCurve = function(distribution, catDistribution, authorDistribution){
    //Render Curve according to selection
    if(compareSelection == 'No comparison'){
      if(speechDistributionSelection == "Absolute"){
        renderCurveNormal(distribution, "Absolute frequency", "absolute");
      }
      if(speechDistributionSelection == "Relative"){
        var distributionInPercent = distributionToPercent(distribution);
        renderCurveNormal(distributionInPercent, "Relative frequency in percent", "in percent");
      }
    }
    if(compareSelection == 'Genre'){
      if(speechDistributionSelection == "Absolute"){
        renderTypeCurve(catDistribution, "Absolute frequency");
      }
      if(speechDistributionSelection == "Relative"){
        var catDisInPercent = distributionToPercent(catDistribution);
        renderTypeCurve(catDisInPercent, "Relative frequency in percent");
      }    
    }
    if(compareSelection == 'Author'){
      if(speechDistributionSelection == "Absolute"){
        renderTypeCurve(authorDistribution, "Absolute frequency");
      }
      if(speechDistributionSelection == "Relative"){
        var authorDisInPercent = distributionToPercent(authorDistribution);
        renderTypeCurve(authorDisInPercent, "Relative frequency in percent");
      }  
    }
  };

  //Transform absolute distribution to relative distribution in percent
  var distributionToPercent = function(distribution){
    var disToPercent = {};

    if(distribution.length === undefined){
      for(key in distribution){
        disToPercent[key] = (distribution[key]/distribution.total)*100;
      }
    }else{
      disToPercent = []; 
      for(var i = 0; i < distribution.length; i++){
        distributionObject = {};

        for(key in distribution[i]){
          distributionObject[key] = (distribution[i][key]/distribution[i].total)*100;
        }
        distributionObject.type = distribution[i].type;
        distributionObject.name = getLastNameAndFirstInitial(distribution[i].name);
        disToPercent.push(distributionObject);
      }
    }
    return disToPercent;
  };

  //Render a normal curve for the distribution with no type or author comparison
	var renderCurveNormal = function(distribution, frequencyType, toolExtension){
		var data = new google.visualization.DataTable();
		data.addColumn("number", "Speech length in words");
		data.addColumn("number", 'Frequency of speeches ' + toolExtension);
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
          title: 'Distribution of speech lengths, ' + frequencyType,
          curveType: 'function',
          legend: {
          	position: 'none'
          },
          hAxis : {
          	title: 'Speech length in words'
          },
          vAxis: {
          	title: frequencyType,
            baseline: 0
          }
        };

        var dashboard = new google.visualization.Dashboard(
            document.getElementById('curve-dashbord'));

        var rangeSlider = new google.visualization.ControlWrapper({
          'controlType': 'NumberRangeFilter',
          'containerId': 'curve-controls',
          'options': {
            'filterColumnLabel': 'Speech length in words'
          }
        });

        var chart = new google.visualization.ChartWrapper({
          'chartType': 'LineChart',
          'containerId': 'curve-chart',
          'options': options
        });

        $("#download-png-curve").unbind("click");
        $("#download-png-curve").on("click", function(){
          window.open(chart.getChart().getImageURI());
          //drawChartAct(actInfo);
        });

        dashboard.bind(rangeSlider, chart);

        dashboard.draw(data);
	};

  var translateGenre = function(genre){
    switch(genre) {
      case 'Komoedie':
        return "Comedy";
        break;
      case 'Trauerspiel':
        return 'Tragedy';
        break;
      default:
        return genre
    }
  };

  //Render a Curve when type or author-selection is chosen
  var renderTypeCurve = function(typeDistribution, frequencyType){

    var data = new google.visualization.DataTable();

    data.addColumn("number", "Speech length in words");
    for(var i = 0; i < typeDistribution.length; i++){
      //check if type is author or category and adjust the data accordingly
      if(typeDistribution[i].type !== undefined){
        data.addColumn("number", translateGenre(typeDistribution[i].type));
      }
      if(typeDistribution[i].name !== undefined){
        data.addColumn("number", translateGenre(typeDistribution[i].name));
      }
    }

    var presentLengths = [];
    for(var i = 0; i < typeDistribution.length; i++){
      for(var key in typeDistribution[i]){
        //Only add values that are really present (not every length is present for an author or category)
          if(presentLengths.indexOf(key) == -1 && !isNaN(key)){
            presentLengths.push(key);
          }
      }
    }
    //Build Data array, length that dont exist need to be null for Google Chart to interpolate
    var array = [];
    for(var i = 0; i < presentLengths.length; i++){
      var row = [parseInt(presentLengths[i])];
      for(var j = 0; j < typeDistribution.length; j++){
        if(typeDistribution[j][presentLengths[i]] !== undefined){
          row.push(typeDistribution[j][presentLengths[i]]);
        }else{
          row.push(null);
        }
      }
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
          title: 'Speech length, ' + frequencyType,
          curveType: 'function',
          hAxis : {
            title: 'Speech length in words'
          },
          vAxis: {
            title: frequencyType,
            baseline: 0
          }
        };

        var dashboard = new google.visualization.Dashboard(
            document.getElementById('curve-dashbord'));

        var rangeSlider = new google.visualization.ControlWrapper({
          'controlType': 'NumberRangeFilter',
          'containerId': 'curve-controls',
          'options': {
            'filterColumnLabel': 'Speech length in words'
          }
        });

        var chart = new google.visualization.ChartWrapper({
          'chartType': 'LineChart',
          'containerId': 'curve-chart',
          'options': options
        });

        $("#download-png-curve").unbind("click");
        $("#download-png-curve").on("click", function(){
          window.open(chart.getChart().getImageURI());
        });

        dashboard.bind(rangeSlider, chart);

        dashboard.draw(data);
  };

  var setSpeechCompareSelection = function(){
    compareSelection = $("#selection-speech-compare").val();  
  };

  var setSpeechDistributionSelection = function(){
    speechDistributionSelection =  $("#selection-speech-distribution").val();
  };

  var getLastNameAndFirstInitial = function(author){
    if(author !== undefined){
      var authorLastName = author.slice(0, author.indexOf(","));
      var commaIndex = author.indexOf(",");
      var initial = author.slice(commaIndex+1, commaIndex+3);
      author = authorLastName + "," + initial + ".";
      return author;
    } else{
      return undefined;
    }
  };

	that.renderCurve = renderCurve;
  that.renderTypeCurve = renderTypeCurve;
  that.setSpeechDistributionSelection = setSpeechDistributionSelection;
  that.init = init;
  that.setSpeechCompareSelection = setSpeechCompareSelection;

	return that;
};