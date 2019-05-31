var transformGermanMetric = function(name){
		switch(name) {
		    case "Polarity (weighted)":
		        return "polaritySentiWS";
		        break;
		    case "Polarity (number of words)":
		        return "polaritySentiWSDichotom";
		        break;
		    case "Positive (weighted)":
		        return "positiveSentiWS";
		        break;
		    case "Positive (number of words)":
		        return "positiveSentiWSDichotom";
		        break;
		    case "Negative (weighted)":
		        return "negativeSentiWS";
		        break;
		    case "Negative (number of words)":
		        return "negativeSentiWSDichotom";
		        break;
		    case "Anger":
		        return "anger";
		        break;
		    case "Anticipation":
		        return "anticipation";
		        break;
		    case "Disgust":
		        return "disgust";
		        break;
		    case "Fear":
		        return "fear";
		        break;
		    case "Joy":
		        return "joy";
		        break;
		    case "Sadness":
		        return "sadness";
		        break;
		    case "Surprise":
		        return "surprise";
		        break;
		    case "Trust":
		        return "trust";
		        break;
		    case "Emotion present":
		    	return "emotionPresent";
		    	break;
		    case "Absolute":
		        return "metricsTotal";
		        break;
		    case "Normalized by number of words":
		        return "metricsNormalisedLengthInWords";
		        break;
		    case "Normalized by sentiment bearing words":
		        return "metricsNormalisedSBWs";
		        break;
		    case "Emotions":
		    	return "emotions";
		    	break;
		    case "Distribution of sentiment bearing words":
		    	return "normalisedSBWs";
		    	break;
		    case "Distribution of all words":
		    	return "normalisedAllWords";
		    	break;
		    case "Polarities (weighted)":
		    	return "polarityWeighted";
		    	break;
		    case "Polarities (number of words)":
		    	return "polarityCount";
		    	break;
		    default:
		    	console.log(name);
		        console.log("ERROR")
		    }
	};

var transformEnglishMetric = function(name){
		switch(name) {
		    case "polaritySentiWS":
		        return "Polarity (weighted)";
		        break;
		    case "polaritySentiWSDichotom":
		        return "Polarity (number of words)";
		        break;
		    case "positiveSentiWS":
		        return "Positive (weighted)";
		        break;
		    case "positiveSentiWSDichotom":
		        return "Positive (number of words)";
		        break;
		    case "negativeSentiWS":
		        return "Negative (weighted)";
		        break;
		    case "negativeSentiWSDichotom":
		        return "Negative (number of words)";
		        break;
		    case "anger":
		        return "Anger";
		        break;
		    case "anticipation":
		        return "Anticipation";
		        break;
		    case "disgust":
		        return "Disgust";
		        break;
		    case "fear":
		        return "Fear";
		        break;
		    case "joy":
		        return "Joy";
		        break;
		    case "sadness":
		        return "Sadness";
		        break;
		    case "surprise":
		        return "Surprise";
		        break;
		    case "trust":
		        return "Trust";
		        break;
		    case "emotionPresent":
		    	return "Emotion present";
		    	break;
		    case "metricsTotal":
		        return "Absolute";
		        break;
		    case "metricsNormalisedLengthInWords":
		        return "Normalized by number of words";
		        break;
		    case "metricsNormalisedSBWs":
		        return "Normalized by sentiment bearing words";
		        break;
		    case "emotions":
		    	return "Emotions";
		    	break;
		    case "normalisedSBWs":
		    	return "Distribution of sentiment bearing words";
		    	break;
		    case "normalisedAllWords":
		    	return "Distribution of all words";
		    	break;
		    case "polarityWeighted":
		    	return "Polarities (weighted)";
		    	break;
		    case "polarityCount":
		    	return "Polarities (number of words)";
		    	break;
		    default:
		    	console.log(name);
		        console.log("ERROR")
		    }
	};

var getProportionDataOfUnit = function(unit){
		var metricsUnit = unit.sentimentMetricsBasic.metricsTotal;
		var polarityWeighted = [["Positiv", metricsUnit.positiveSentiWS], ["Negativ", metricsUnit.negativeSentiWS]];
		var polarityCount = [["Positiv", metricsUnit.positiveSentiWSDichotom],
		["Negativ", metricsUnit.negativeSentiWSDichotom]];
		var emotion = [["Zorn", metricsUnit.anger], ["Erwartung", metricsUnit.anticipation], 
		["Ekel", metricsUnit.disgust], ["Angst", metricsUnit.fear], ["Freude", metricsUnit.joy],
		["Traurigkeit", metricsUnit.sadness], ["Überraschung", metricsUnit.surprise],
		["Vertrauen", metricsUnit.trust]];
		var emotionPresent = [["Emotion vorhanden", metricsUnit.emotionPresent]];

		var proportionData = {}
		proportionData["normalisedSBWs"] = {};
		proportionData["normalisedSBWs"]["polaritySentiWS"] = polarityWeighted;
		proportionData["normalisedSBWs"]["polaritySentiWSDichotom"] = polarityCount;
		proportionData["normalisedSBWs"]["emotions"] = emotion;
		proportionData["normalisedSBWs"]["emotionPresent"] = emotionPresent

		
		var noPolarityWords = unit.lengthInWords - 
		(metricsUnit.positiveSentiWSDichotom + metricsUnit.negativeSentiWSDichotom);
		var noEmotionWords = unit.lengthInWords - metricsUnit.emotionPresent;

		var polarityCountCopy = polarityCount.slice();
		var emotionCopy = emotion.slice();
		var emotionPresentCopy = emotionPresent.slice();

		polarityCountCopy.push(["Keine Polarität", noPolarityWords]);
		emotionCopy.push(["Keine Emotion", noEmotionWords]);
		emotionPresentCopy.push(["Keine Emotion", noEmotionWords]);

		proportionData["normalisedAllWords"] = {};
		proportionData["normalisedAllWords"]["polaritySentiWSDichotom"] = polarityCountCopy;
		proportionData["normalisedAllWords"]["emotions"] = emotionCopy;
		proportionData["normalisedAllWords"]["emotionPresent"] = emotionPresentCopy;

		return proportionData;

	};

var getStructuredBasicData = function(unit){
	var metricsTotal = unit.sentimentMetricsBasic.metricsTotal;
	var metricsNormalisedSBWs = unit.sentimentMetricsBasic.metricsNormalisedSBWs;
	var metricsNormalisedLengthInWords = unit.sentimentMetricsBasic.metricsNormalisedLengthInWords;

	var basicData = {};
	basicData["metricsTotal"] = {};
	basicData["metricsNormalisedSBWs"] = {};
	basicData["metricsNormalisedLengthInWords"] = {};

	basicData["metricsTotal"]["polarityWeighted"] = {};
	basicData["metricsTotal"]["polarityCount"] = {};
	basicData["metricsTotal"]["emotions"] = {};

	basicData["metricsNormalisedSBWs"]["polarityWeighted"] = {};
	basicData["metricsNormalisedSBWs"]["polarityCount"] = {};
	basicData["metricsNormalisedSBWs"]["emotions"] = {};

	basicData["metricsNormalisedLengthInWords"]["polarityWeighted"] = {};
	basicData["metricsNormalisedLengthInWords"]["polarityCount"] = {};
	basicData["metricsNormalisedLengthInWords"]["emotions"] = {};

	var emotionNames = ["anger", "anticipation", "disgust", "fear", "joy", "sadness", "surprise", "trust"];
	var polarityWeightedNames = ["positiveSentiWS", "polaritySentiWS", "negativeSentiWS"];
	var polarityCountNames = ["positiveSentiWSDichotom", "polaritySentiWSDichotom", "negativeSentiWSDichotom"];

	for (var i = 0; i < emotionNames.length; i++){
		basicData["metricsTotal"]["emotions"][emotionNames[i]] = metricsTotal[emotionNames[i]];
		basicData["metricsNormalisedSBWs"]["emotions"][emotionNames[i]] = metricsNormalisedSBWs [emotionNames[i]];
		basicData["metricsNormalisedLengthInWords"]["emotions"][emotionNames[i]] = metricsNormalisedLengthInWords[emotionNames[i]];
	}
	for (var i = 0; i < polarityWeightedNames.length; i++){
		basicData["metricsTotal"]["polarityWeighted"][polarityWeightedNames[i]] = metricsTotal[polarityWeightedNames[i]];
		basicData["metricsNormalisedSBWs"]["polarityWeighted"][polarityWeightedNames[i]] = metricsNormalisedSBWs [polarityWeightedNames[i]];
		basicData["metricsNormalisedLengthInWords"]["polarityWeighted"][polarityWeightedNames[i]] = metricsNormalisedLengthInWords[polarityWeightedNames[i]];
	}
	for (var i = 0; i < polarityCountNames.length; i++){
		basicData["metricsTotal"]["polarityCount"][polarityCountNames[i]] = metricsTotal[polarityCountNames[i]];
		basicData["metricsNormalisedSBWs"]["polarityCount"][polarityCountNames[i]] = metricsNormalisedSBWs [polarityCountNames[i]];
		basicData["metricsNormalisedLengthInWords"]["polarityCount"][polarityCountNames[i]] = metricsNormalisedLengthInWords[polarityCountNames[i]];
	}

	return basicData;
};	