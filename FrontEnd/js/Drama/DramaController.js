Drama.DramaController = function(){
	var that = {};

	var dramaModel = null;
	var dramaView = null;

	var init = function(){
		dramaView = Drama.DramaView();
		dramaModel = Drama.DramaModel();

		initListener();

		dramaModel.init();
		dramaView.init();

	};

	var initListener = function(){
		$(dramaModel).on("InitFinished", setDramaInfos);
	};

	var setDramaInfos = function(){
		dramaView.renderView(dramaModel.getDramaInfo());
	};

	that.init = init;

	return that;
};