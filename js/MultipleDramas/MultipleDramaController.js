MultipleDramas.MultipleDramasController = function(){
	var that = {};

	var multipleDramasModel = null;
	var yearView = null;
	var authorView = null;
	var categoryView = null;
	var lineCurveView = null;


	var init = function(){

		multipleDramasModel = MultipleDramas.MultipleDramasModel();
		yearView = MultipleDramas.YearView();
		authorView = MultipleDramas.AuthorView();
		categoryView = MultipleDramas.CategoryView();
		lineCurveView = MultipleDramas.LineCurveView();

		multipleDramasModel.init();
		yearView.init();
		authorView.init();
		categoryView.init();
		lineCurveView.init();

		initGoogleCharts();

		initListener();

	};

	var initListener = function(){
		$(multipleDramasModel).on("InfoFinished", visu);
		$(yearView).on("YearSelectionClicked", visuYearChart);
		$(yearView).on("YearSelectionCompareClicked", visuYearChart);
		$(authorView).on("AuthorSelectionClicked", visuAuthorChart);
		$(categoryView).on("CategorySelectionClicked", visuCategoryChart);
		$(lineCurveView).on("SpeechSelectionClicked", visuSpeechChart);

		//For the Dramalist
		$('#selected-dramas-wrapper').on('click', function(){
			$(this).toggleClass('open');
		});
	};

	//Method to be called for first rendering
	var visu = function(){
		var dramas = multipleDramasModel.getChosenDramas();
		var authorList = multipleDramasModel.getAuthorList();
		var categoryList = multipleDramasModel.getCategoryList();
		var distribution = multipleDramasModel.getDistribution();
		var catDistribution = multipleDramasModel.getCategoryDistribution();
		var authorDistribution = multipleDramasModel.getAuthorDistribution();

		renderSelectedDramas(dramas);

		filteredDramas = filterUnknownYears(dramas)

		yearView.setYearSelection();
		yearView.setYearCompareSelection();
		console.log(dramas)
		yearView.renderScatterChart(filteredDramas, authorList);
		
		authorView.setAuthorSelection();
		authorView.renderBarChart(authorList);
		
		categoryView.setCategorySelection();
		categoryView.renderColumnChart(categoryList);

		lineCurveView.setSpeechCompareSelection();
		lineCurveView.setSpeechDistributionSelection();
		
		lineCurveView.renderCurve(distribution, catDistribution, authorDistribution);

		$("#loading").css("display", "none");
		$("#maincontent").fadeIn();;

	};

	var filterUnknownYears = function(dramas) {
		filteredList = [];
		for(var i = 0; i < dramas.length; i++){
			if(dramas[i]["year"] != "unknown"){
				filteredList.push(dramas[i]);
			}
		}
		return filteredList;
	}

	//Methods to create Tables for the List of Dramas
	var renderSelectedDramas = function(dramas){
		for(var i = 0; i < dramas.length; i++){
			var row = createTableItem(dramas[i]);
			$("#selected-dramas").append(row);
		}
	};

	var createTableItem = function(drama){
		var row = $("<tr>");
		row.append(($("<td>")).text(drama.title));

		row.append(($("<td>")).text(drama.author));

		if(drama.type !== undefined){
			row.append(($("<td>")).text(drama.type));
		}else{
			row.append(($("<td>")).text("Unbekannt"));
		}

		row.append(($("<td>")).text(drama.year));

		row.append(($("<td>")).text(drama.number_of_speeches_in_drama));

		return row;
	}

	/*Different Methods to call when user interacts with dropdown-menus, selection changes and
	graphs have to adjust
	*/

	var visuSpeechChart = function(){
		var distribution = multipleDramasModel.getDistribution();
		var catDistribution = multipleDramasModel.getCategoryDistribution();
		var authorDistribution = multipleDramasModel.getAuthorDistribution();

		lineCurveView.setSpeechCompareSelection();
		lineCurveView.setSpeechDistributionSelection();

		lineCurveView.renderCurve(distribution, catDistribution, authorDistribution);
	};

	var visuCategoryChart = function(){
		var categoryList = multipleDramasModel.getCategoryList();
		categoryView.setCategorySelection();
		categoryView.renderColumnChart(categoryList);
	};

	var visuYearChart = function(){
		var dramas = multipleDramasModel.getChosenDramas();
		var authorList = multipleDramasModel.getAuthorList();
		
		filteredDramas = filterUnknownYears(dramas)

		yearView.setYearSelection();
		yearView.setYearCompareSelection();

		yearView.renderScatterChart(filteredDramas, authorList);
	};

	var visuAuthorChart = function(){
		var authorList = multipleDramasModel.getAuthorList();
		authorView.setAuthorSelection();
		authorView.renderBarChart(authorList);
	};

	//Work-Around to get Google Charts working
	var initGoogleCharts = function(){
		// Load the Visualization API and the piechart package.
      	setTimeout(function(){google.load('visualization', '1', {'callback': doNothing, 
      		'packages':['corechart', 'controls']})}, 0);
	};

	var doNothing = function(){
	};

	that.init = init;

	return that;
};