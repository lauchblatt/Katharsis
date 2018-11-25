Search.SearchController = function(){
	var that = {};

	var dramaListModel = null;
	var dramaListView =null;
	var formsView = null;

	var init = function(){
		dramaListModel = Search.DramaListModel();
		dramaListModel.init();

		dramaListView = Search.DramaListView();
		dramaListView.init();

		formsView = Search.FormsView();

		initListener();
		formsView.init();

	};

	var initListener = function(){
		$(dramaListModel).on("DataRetrieved", updateList);
		$(dramaListModel).on("EmptyTable", emptyTable);
		$(dramaListModel).on("NoResultsFound", noResultsFound);
		$(dramaListModel).on("JSONDramaRetrieved", downloadDramaJSON);
		$(formsView).on("InputCatched", retrieveDramas);
		$(dramaListView).on("DramaClicked", analyzeDrama);
		$(dramaListView).on("AnalyseCollection", analyseCollection);
		$(dramaListView).on("DownloadJSON", startDownloadJSON);
	};

	var startDownloadJSON = function(event, dramaId){
		dramaListModel.getJSONDrama(dramaId);
	};

	var downloadDramaJSON = function(event, dramaJson){

		var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dramaJson));

		$('<a href="data:' + data + '" download="' + dramaJson.title + '.json"></a>')[0].click();

	};

	//save collection in local storage to analyse it later
	var analyseCollection = function(event, checkedDramas){
		localStorage["collection"] = JSON.stringify(checkedDramas);
	};

	var noResultsFound = function(){
		dramaListView.showNoResults();
	};

	//last three attributes can be used another time to improve performance/user experience
	var analyzeDrama = function(event, drama_id, title, author, year){

		//Probably not working in every browser
		window.open("drama.html?drama_id=" + drama_id, "_blank");
	};

	//called to render List
	var updateList = function(event, listItem){
		dramaListView.renderListItem(listItem);
	};

	//called to get dramas
	var retrieveDramas = function(event, input){
		dramaListModel.retrieveDramas(input);
	};

	var emptyTable = function(){
		dramaListView.emptyTable();
	}

	that.init = init;

	return that;
};