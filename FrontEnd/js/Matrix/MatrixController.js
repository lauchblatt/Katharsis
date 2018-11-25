Matrix.MatrixController = function(){
	var that = {};

	var matrixView = null;
	var matrixModel = null;

	var init = function(){
		matrixView = Matrix.MatrixView();
		matrixModel = Matrix.MatrixModel();
		initListener();

		matrixModel.init();
	};

	initListener = function(){
		$(matrixModel).on("ModelInitFinished", buildTable);
	};

	buildTable = function(){
		//init all Infos necessary to build the matrix
		var dramaInfo = matrixModel.getDramaInfo();
		var actsInfo = matrixModel.getActsInfo();
		var scenesInfo = matrixModel.getScenesInfo();
		var speakersInfo = matrixModel.getSpeakersInfo();
		var matrix = matrixModel.getMatrix();
		matrixView.init(dramaInfo, actsInfo, scenesInfo, speakersInfo, matrix);
	};

	that.init = init;

	return that;
};