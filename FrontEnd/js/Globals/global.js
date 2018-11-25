var transformGermanMetric = function(name){
		switch(name) {
		    case "Polarität (gewichtet)":
		        return "polaritySentiWS";
		        break;
		    case "Polarität (Wortanzahl)":
		        return "polaritySentiWSDichotom";
		        break;
		    case "Positiv (gewichtet)":
		        return "positiveSentiWS";
		        break;
		    case "Positiv (Wortanzahl)":
		        return "positiveSentiWSDichotom";
		        break;
		    case "Negativ (gewichtet)":
		        return "negativeSentiWS";
		        break;
		    case "Negativ (Wortanzahl)":
		        return "negativeSentiWSDichotom";
		        break;
		    case "Zorn":
		        return "anger";
		        break;
		    case "Erwartung":
		        return "anticipation";
		        break;
		    case "Ekel":
		        return "disgust";
		        break;
		    case "Angst":
		        return "fear";
		        break;
		    case "Freude":
		        return "joy";
		        break;
		    case "Traurigkeit":
		        return "sadness";
		        break;
		    case "Überraschung":
		        return "surprise";
		        break;
		    case "Vertrauen":
		        return "trust";
		        break;
		    case "Emotion vorhanden":
		    	return "emotionPresent";
		    	break;
		    case "Absolut":
		        return "metricsTotal";
		        break;
		    case "Normalisiert an Anzahl aller Wörter":
		        return "metricsNormalisedLengthInWords";
		        break;
		    case "Normalisiert an Sentiment-Tragenden Wörtern":
		        return "metricsNormalisedSBWs";
		        break;
		    case "Emotionen":
		    	return "emotions";
		    	break;
		    case "Verteilung von Sentiment-Tragenden Wörtern":
		    	return "normalisedSBWs";
		    	break;
		    case "Verteilung von allen Wörtern":
		    	return "normalisedAllWords";
		    	break;
		    case "Polaritäten (gewichtet)":
		    	return "polarityWeighted";
		    	break;
		    case "Polaritäten (Wortanzahl)":
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
		        return "Polarität (gewichtet)";
		        break;
		    case "polaritySentiWSDichotom":
		        return "Polarität (Wortanzahl)";
		        break;
		    case "positiveSentiWS":
		        return "Positiv (gewichtet)";
		        break;
		    case "positiveSentiWSDichotom":
		        return "Positiv (Wortanzahl)";
		        break;
		    case "negativeSentiWS":
		        return "Negativ (gewichtet)";
		        break;
		    case "negativeSentiWSDichotom":
		        return "Negativ (Wortanzahl)";
		        break;
		    case "anger":
		        return "Zorn";
		        break;
		    case "anticipation":
		        return "Erwartung";
		        break;
		    case "disgust":
		        return "Ekel";
		        break;
		    case "fear":
		        return "Angst";
		        break;
		    case "joy":
		        return "Freude";
		        break;
		    case "sadness":
		        return "Traurigkeit";
		        break;
		    case "surprise":
		        return "Überraschung";
		        break;
		    case "trust":
		        return "Vertrauen";
		        break;
		    case "emotionPresent":
		    	return "Emotion vorhanden";
		    	break;
		    case "metricsTotal":
		        return "Absolut";
		        break;
		    case "metricsNormalisedLengthInWords":
		        return "Normalisiert an Anzahl aller Wörter";
		        break;
		    case "metricsNormalisedSBWs":
		        return "Normalisiert an Sentiment-Tragenden Wörtern";
		        break;
		    case "emotions":
		    	return "Emotionen";
		    	break;
		    case "normalisedSBWs":
		    	return "Verteilung von Sentiment-Tragenden Wörtern";
		    	break;
		    case "normalisedAllWords":
		    	return "Verteilung von allen Wörtern";
		    	break;
		    case "polarityWeighted":
		    	return "Polaritäten (gewichtet)";
		    	break;
		    case "polarityCount":
		    	return "Polaritäten (Wortanzahl)";
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