MultipleDramas.CategoryView = function(){
	var that = {};
	var categorySelection = "";
	var categoryAttribute = "";

	var init = function(){
		initListener();
	};

	var initListener = function(){
		$("#selection-category").change(categorySelectionClicked);
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

	var renderColumnChart = function(categories){
		var data = new google.visualization.DataTable();
        data.addColumn('string', 'Genre');
        data.addColumn('number', categorySelection);
        var array = [];
        for(var i = 0; i < categories.length; i++){
        	var row = [translateGenre(categories[i].type), categories[i][categoryAttribute]];
			array.push(row);
        }
        data.addRows(array);
        var options = {title:'Comparison of genres',
        			   height: 600,
        			   width: 1000,
				        hAxis: {
        			   	title: 'Genre'
        			   },
        			   vAxis: {
        			   	title: categorySelection
        			   },
                   	   animation: {
                   	   	duration: 700,
                   	   	startup: true
                   	   }};
        var chart = new google.visualization.ColumnChart(document.getElementById('chart-category'));

        $("#download-png-category").unbind("click");
        $("#download-png-category").on("click", function(){
          window.open(chart.getImageURI());
        });

        chart.draw(data, options);
	};

	var categorySelectionClicked = function(){
		$(that).trigger("CategorySelectionClicked");	
	};

	//set attribute of categories according to selection
	var setCategorySelection = function(){
		categorySelection = $("#selection-category").val();

		if(categorySelection == "Number of scenes"){categoryAttribute = "average_number_of_scenes"};
		if(categorySelection == "Number of speeches"){categoryAttribute = "average_number_of_speeches";}
		if(categorySelection == "Number of speakers"){categoryAttribute = "average_number_of_speakers";}
		if(categorySelection == "Configuration density"){categoryAttribute = "average_configuration_density";}
		if(categorySelection == "Average length of speeches"){categoryAttribute = "average_average_length_of_speeches";}
		if(categorySelection == "Median length of speeches"){categoryAttribute = "average_median_length_of_speeches";}
		if(categorySelection == "Maximum length of speeches"){categoryAttribute = "average_maximum_length_of_speeches";}
		if(categorySelection == "Minimum length of speeches"){categoryAttribute = "average_minimum_length_of_speeches";}

	};

	that.init = init;
	that.setCategorySelection = setCategorySelection;
	that.renderColumnChart = renderColumnChart;

	return that;
};