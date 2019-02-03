#coding: utf8

import os
import re
import collections
import locale
import sys
from drama_parser import *
from sa_pre_processing import *
from statistic_functions import *
from sa_sentiment_analysis import *
from evaluation_test_corpus_creation import *

def main():
	reload(sys)
	sys.setdefaultencoding('utf8')


# Main Class to evaluate Test-Corpus
class Test_Corpus_Evaluation:
	def __init__(self):
		self._testCorpusSpeeches = []
		self._polarityBenchmark = []
		self._polarityNames = ["polaritySentiWS", "polaritySentiWSDichotom", "polarityNrc", "emotion", "polarityBawlDichotom",\
		"polarityCd", "polarityCDDichotom", "polarityGpc", "polarityCombined"]
		self._evaluationInfo = OrderedDict({})

		self._correspondingSBWMetrics = {}

		self.initCorrespondingSBWMetrics()

	def getNumberOfPolarityChangedWordsInSBWs(self):
		sbws = self.getAllSentimentBearingWords()
		words = self.getPolarityChangeWords()
		foundWords = []
		for sbw in sbws:
			if sbw._token in words:
				foundWords.append(sbw._token)
		
		noDupSbws = []
		noDupFoundWords = []
		for sbw in sbws:
			if sbw._token not in noDupSbws:
				noDupSbws.append(sbw._token)
		for word in foundWords:
			if word not in noDupFoundWords:
				noDupFoundWords.append(word)

		print len(foundWords)
		print len(sbws)
		print float(len(foundWords))/float(len(sbws))
		print len(noDupFoundWords)
		print len(noDupSbws)
		print float(len(noDupFoundWords))/float(len(noDupSbws))

	def getPolarityChangeWords(self):
		data = open("PolarityChangeWords-Tokens.txt")
		words = []
		for line in data:
			words.append(unicode(line.strip()))
		return words

	def getAllSentimentBearingWords(self):
		#self, DTAExtension, processor, lemmaMode, stopwordList, caseSensitive
		self.initTestCorpus("Dumps/TestCorpus/testCorpus_" + "treetagger" + ".p")
		self.attachSentimentInfoOnTestCorpus(False, "treetagger", False, None, False)
		allSbws = []
		for corpusSpeech in self._testCorpusSpeeches:
			sbws = corpusSpeech._speech._sentimentBearingWords
			allSbws.extend(sbws)
		return allSbws

	def initCorrespondingSBWMetrics(self):
		self._correspondingSBWMetrics["polaritySentiWS"] = ["_polaritySentiWS"]
		self._correspondingSBWMetrics["polaritySentiWSDichotom"] = ["_positiveSentiWSDichotom", "_negativeSentiWSDichotom"]
		self._correspondingSBWMetrics["polarityNrc"] = ["_positiveNrc", "_negativeNrc"]
		self._correspondingSBWMetrics["emotion"] = ["_emotion"]
		self._correspondingSBWMetrics["polarityBawlDichotom"] = ["_positiveBawlDichotom", "_negativeBawlDichotom"]
		self._correspondingSBWMetrics["polarityCd"] = ["_positiveCd", "_negativeCd"]
		self._correspondingSBWMetrics["polarityCDDichotom"] = ["_positiveCDDichotom", "_negativeCDDichotom"]
		self._correspondingSBWMetrics["polarityGpc"] = ["_positiveGpc", "_negativeGpc"]
		self._correspondingSBWMetrics["polarityCombined"] = ["_positiveCombined", "_negativeCombined"]
		self._correspondingSBWMetrics["clearlyPolarityCombined"] = ["_clearlyPositiveCombined", "_clearlyNegativeCombined"]

	def getLexiconByMetric(self, polarityMetric):
		if(polarityMetric == "polaritySentiWS" or polarityMetric == "polaritySentiWSDichotom"):
			return "sentiWS"
		elif(polarityMetric == "polarityCd" or polarityMetric == "polarityCDDichotom"):
			return "Cd"
		elif(polarityMetric == "emotion" or polarityMetric == "polarityBawlDichotom"):
			return "bawl"
		elif(polarityMetric == "polarityNrc"):
			return "nrcPolarity"
		elif(polarityMetric == "polarityGpc"):
			return "Gpc"
		elif(polarityMetric == "polarityCombined"):
			return "Combined"
		elif(polarityMetric == "clearlyPolarityCombined"):
			return "Combined-Clearly"

	def setEvaluationInfoOfAllCombinationsForSingleMetric(self, polarityMetric):
		self.initPolarityBenchmark("../Evaluation/Test-Korpus-Evaluation/Benchmark-Daten/Polaritaet_dichotom.txt")

		DTAExtensions = [False, True]
		#DTAExtensions = [False]
		processors = ["treetagger", "textblob"]
		lemmaModes = [ "noLemma", "textLemma", "bothLemma"]
		#stopwordLists = [None, "standardList"]
		stopwordLists = [None, "standardList", "enhancedList", "enhancedFilteredList"]
		caseSensitives = [False, True]
		doneCombinations = []
		nameResultTuples = []
		self._evaluationInfo[polarityMetric] = OrderedDict({})

		for DTAExtension in DTAExtensions:
			for lemmaMode in lemmaModes:
				for processor in processors:
					for stopwordList in stopwordLists:
						for caseSensitive in caseSensitives:
							#To remove automatic Duplicates
							name = self.getCombinationName(DTAExtension, processor, lemmaMode, stopwordList, caseSensitive)
							if(not(name in doneCombinations)):
								self.initTestCorpus("Dumps/TestCorpus/testCorpus_" + processor + ".p")
								self.attachSentimentInfoOnTestCorpus(DTAExtension, processor, lemmaMode, stopwordList, caseSensitive)
								result = self.comparePolarityMetricWithBenchmark(polarityMetric)
								currentSpeeches = []
								currentSpeeches.extend(self._testCorpusSpeeches)
								self._evaluationInfo[polarityMetric][name] = (result, currentSpeeches)
								print name
								doneCombinations.append(name)

	def createAllOutputsOfAllMetrics(self):
		for polarityMetric in self._polarityNames:
			self.setEvaluationInfoOfAllCombinationsForSingleMetric(polarityMetric)
			self.createOutputAllMajorMetricsForSinglePolarity(polarityMetric)
			self.createOutputDetailInfoOfAllCombinations(polarityMetric)

	def createOutputDetailInfoOfAllCombinations(self, polarityMetric):
		for combination in self._evaluationInfo[polarityMetric]:
			self.createOutputDetailInfoOfCombination(polarityMetric, combination)

	def createOutputDetailInfoOfCombination(self, polarityMetric, name):
		path = "../Evaluation/Test-Korpus-Evaluation/Evaluation-Results/" + polarityMetric + "/" + name + ".txt"
		output = self.getOutputDetailInfoOfCombination(polarityMetric, name)
		outputFile = open(path, "w")
		outputFile.write(output)
		outputFile.close()

	def getOutputDetailInfoOfCombination(self, polarityMetric, name):
		resultInfo = self._evaluationInfo[polarityMetric][name][0]
		majorMetrics = resultInfo.getMajorMetrics()
		majorMetricsNames = resultInfo._majorMetricNames
		majorMetricsInfo = "Main Metrics:\n"
		i = 0
		while(i < len(majorMetricsNames)):
			majorMetricsInfo = majorMetricsInfo + majorMetricsNames[i] + ": " + str(majorMetrics[i]) + "\n"
			i += 1

		crossTable = resultInfo.getCrossTableAsString()

		evaInfo = self._evaluationInfo[polarityMetric][name]
		corpusSpeeches = evaInfo[1]
		relevantSBWMetrics = self._correspondingSBWMetrics[polarityMetric]
		lexiconName = self.getLexiconByMetric(polarityMetric)
		sm = Sentiment_Metrics()
		sm.initMetrics()
		relevantSpeechMetrics = sm._names[lexiconName]

		output = ""
		
		headlineSBWs = "(Token, Lemma, POS): "
		relevantMetricsString = ", ".join(relevantSBWMetrics)
		headlineSBWs = headlineSBWs + relevantMetricsString

		speechInfo = []
		
		predictions = resultInfo._predictions

		i = 0
		for cSpeech in corpusSpeeches:
			speechHeadline = cSpeech._positionInfo
			totalMetrics = cSpeech._speech._sentimentMetrics._metricsTotal
			metricLines = ""
			for metric in relevantSpeechMetrics:
				line = metric + ": " + str(totalMetrics[metric])
				metricLines = metricLines + line + "\n"
			metricInfoPerSpeech = speechHeadline + "\n" + metricLines
			#print metricInfoPerSpeech
			predictionInfo = self.getPredictionInfo(predictions[i], self._polarityBenchmark[i])

			sbwInfoPerSpeech = "" + headlineSBWs + "\n"

			for sbw in cSpeech._speech._sentimentBearingWords:
				isRelevant = False
				for m in relevantSBWMetrics:
					value = getattr(sbw, m)
					if(value != 0):
						isRelevant = True
				if(isRelevant):
					sbwInfoPerSpeech = sbwInfoPerSpeech + (sbw.returnSpecificInfoAsString(relevantSBWMetrics)) + "\n"
			boundary = "-------------------------------------\n"
			infoPerSpeech = metricInfoPerSpeech + "\n" + predictionInfo + "\n\n" + sbwInfoPerSpeech
			speechInfo.append(infoPerSpeech)
			i += 1

		allSpeechesInfo = "\n".join(speechInfo)
		output = name + "\n\n" + majorMetricsInfo + "\n" + crossTable + "\n" + allSpeechesInfo
		
		return output

	def getPredictionInfo(self, prediction, benchmark):
		if(prediction == 1 and benchmark == 1):
			return "Prediction: NEGATIVE, Benchmark: NEGATIVE --> True"
		elif(prediction == 1 and benchmark == 2):
			return "Prediction: NEGATIVE, Benchmark: POSITIVE --> False"
		elif(prediction == 2 and benchmark == 2):
			return "Prediction: POSITIVE, Benchmark: POSITIVE --> True"
		elif(prediction == 2 and benchmark == 1):
			return "Prediction: POSITIVE, Benchmark: NEGATIVE --> False"

	def createOutputAllMajorMetricsForSinglePolarity(self, polarityMetric):
		names = self._evaluationInfo[polarityMetric].keys()
		results = []
		for name in names:
			results.append(self._evaluationInfo[polarityMetric][name][0])
		results = [item.getMajorMetricsAndCrossTableCells() for item in results]
		i = 0
		rows = []
		for name in names:
			info = name.split("_")
			print info
			nameAndInfo = [name]
			nameAndInfo.extend(info)
			nameAndInfo.extend(results[i])
			rows.append(nameAndInfo)
			i += 1
		resultNames = ["CombinationType", "DTAExtension", "Lemmatizer", "LemmatizationType", "Stopwords",\
		"CaseSensitivity", "accuracy", "recallPositive", "precisionPositive", "F-MeasurePositive",\
		"recallNegative", "precisionNegative", "F-MeasureNegative", "recallAverage", "precisionAverage", "F-MeasureAverage",\
		"truePositives", "falsePositives", "trueNegatives", "falseNegatives"]
		firstLine = "\t".join(resultNames)
		rowsString = ""
		for row in rows:
			rowString = "\t".join(str(item) for item in row)
			rowsString = rowsString + rowString + "\n"
		output = firstLine + "\n" + rowsString.rstrip()
		output = output.replace(".", ",")

		outputPath = "../Evaluation/Test-Korpus-Evaluation/Evaluation-Results/" + polarityMetric + "/" + \
		polarityMetric + "_majorMetrics.tsv"
		outputFile = open(outputPath, "w")
		outputFile.write(output)
		outputFile.close()

	def getMainPath(self, polarityMetric):
		path = "../Test-Korpus-Evaluation/Evaluation-Results/" + polarityMetric + "/"
		return path 

	def getCombinationName(self, DTAExtension, processor, lemmaMode, stopwordList, caseSensitive):
		name = ""
		if(DTAExtension):
			name = name + "dtaExtended_"
		else:
			name = name + "noExtension_"
		if(lemmaMode == "noLemma"):
			name = name + "tokens_noLemma_"
		else:
			if(lemmaMode == "bothLemma"):
				name = name + processor + "_bothLemma" + "_"
			elif(lemmaMode == "textLemma"):
				name = name + processor + "_textLemma" + "_"
		if(stopwordList is None):
			name = name + "noStopwordList_"
		else:
			name = name + stopwordList + "_"
		if(caseSensitive):
			name = name + "caseSensitive"
		else:
			name = name + "caseInSensitive"
		return name

	def attachSentimentInfoOnTestCorpus(self, DTAExtension, processor, lemmaMode, stopwordList, caseSensitive):
		sa = Sentiment_Analyzer(DTAExtension, processor, lemmaMode, stopwordList, caseSensitive)

		for testCorpusSpeech in self._testCorpusSpeeches:
			textAsLanguageInfo = testCorpusSpeech._speech._textAsLanguageInfo
			testCorpusSpeech._speech._sentimentBearingWords = sa.getSentimentBearingWordsSpeech(textAsLanguageInfo)
			sa.attachSentimentMetricsToUnit(testCorpusSpeech._speech)

	def comparePolarityMetricWithBenchmark(self, polarityMetric):
		result = Comparison_Result_Polarity(self._polarityBenchmark)

		i = 0
		while(i < len(self._polarityBenchmark)):
			polarity = self._testCorpusSpeeches[i]._speech._sentimentMetrics._metricsTotal[polarityMetric]
			benchmark = self._polarityBenchmark[i]
			"""
			if(polarity < 0):
				print 1
			elif(polarity > 0):
				print 2
			elif(polarity == 0):
				print 0
			"""
			#print benchmark
			if(polarity < 0 and benchmark == 1):
				result._trueNegatives += 1
				result._predictions.append(1)
			elif(polarity > 0 and benchmark == 2):
				result._truePositives += 1
				result._predictions.append(2)
			elif(polarity < 0 and benchmark == 2):
				result._falseNegatives += 1
				result._predictions.append(1)
			elif(polarity > 0 and benchmark == 1):
				result._falsePositives += 1
				result._predictions.append(2)
			elif(polarity == 0 and benchmark == 1):
				result._falsePositivesAsZeros += 1
				result._predictions.append(2)
			elif(polarity == 0 and benchmark == 2):
				result._falseNegativesAsZeros += 1
				result._predictions.append(1)
			i += 1
		
		result.updateAllTruePolarities()
		result.updateFalsePolarities()
		result.setCrossTable()
		#result.printCrossTable()
		result.calcMeasurements()
		print (result.getCrossTableAsString())
		#"""
		print(result._accuracy)
		print(result._recallPositive)
		print(result._recallNegative)
		print(result._precisionPositive)
		print(result._precisionNegative)
		print(result._fMeasurePositive)
		print(result._fMeasureNegative)
		#"""
		return result

	def initPolarityBenchmark(self, pathToBenchmark):
		polarityBenchmark = []
		data = open(pathToBenchmark)
		lines = data.readlines()
		for line in lines:
			number = int(line.strip())
			polarityBenchmark.append(number)
		self._polarityBenchmark = polarityBenchmark

	def initTestCorpus(self, path):
		tcc = Test_Corpus_Creator()
		tcc.readAndInitTestCorpusFromPickle(path)
		self._testCorpusSpeeches = tcc._testCorpusSpeeches


class Comparison_Result_Polarity:
	
	def __init__(self, polarityBenchmark):
		self._predictions = []

		self._testCorpusLength = 0
		self._testCorpusPositives = 0
		self._testCorpusNegatives = 0
		self._falsePositives = 0
		self._falseNegatives = 0
		self._falseNegativesAsZeros = 0
		self._falsePositivesAsZeros = 0

		self._allFalsePositives = 0
		self._allFalseNegatives = 0
		self._allFalsePolarities = 0

		self._truePositives = 0
		self._trueNegatives = 0
		self._allTruePolarities = 0

		self._crossTable = []
		self._accuracy = 0
		self._recallPositive = 0
		self._recallNegative = 0
		self._precisionPositive = 0
		self._precisionNegative = 0
		self._fMeasurePositive = 0
		self._fMeasureNegative = 0

		self._recallAverage = 0
		self._precisionAverage = 0
		self._fMeasureAverage = 0

		self._majorMetricNames = []

		self.initMajorMetricNames()
		self.init(polarityBenchmark)

	def getMajorMetricsAndCrossTableCells(self):
		majorMetrics = self.getMajorMetrics()
		majorMetrics.extend([self._truePositives, self._allFalsePositives, self._trueNegatives, self._allFalseNegatives])
		return majorMetrics

	def initMajorMetricNames(self):
		self._majorMetricNames = ["accuracy", "Recall Positive", "Precision Positive", "F-Measure Positive",\
		"Recall Negative", "Precision Negative", "F-Measure Negative", "Recall Average", "Precision Average", "F-Measure Average"]

	def getMajorMetrics(self):
		return [self._accuracy, self._recallPositive, self._precisionPositive, self._fMeasurePositive,\
		self._recallNegative, self._precisionNegative, self._fMeasureNegative, self._recallAverage, self._precisionAverage,\
		self._fMeasureAverage]

	def calcMeasurements(self):
		self.setRecall()
		self.setPrecision()
		self.setAccuracy()
		self.setfMeasures()
		self.setAverages()

	def setAverages(self):
		self._precisionAverage = (self._precisionPositive + self._precisionNegative)/2
		self._recallAverage = (self._recallPositive + self._recallNegative)/2
		self._fMeasureAverage = (self._fMeasurePositive + self._fMeasureNegative)/2

	def setfMeasures(self):
		self._fMeasurePositive = \
		2 * ((self._precisionPositive * self._recallPositive)/(self._precisionPositive + self._recallPositive))

		self._fMeasureNegative = \
		2 * ((self._precisionNegative * self._recallNegative)/(self._precisionNegative + self._recallNegative))

	def setRecall(self):
		self._recallPositive = float(self._truePositives)/float(self._testCorpusPositives)
		self._recallNegative = float(self._trueNegatives)/float(self._testCorpusNegatives)

	def setPrecision(self):
		self._precisionPositive = float(self._truePositives)/float(self._truePositives + self._allFalsePositives)
		self._precisionNegative = float(self._trueNegatives)/float(self._trueNegatives + self._allFalseNegatives)

	def setAccuracy(self):
		accuracy = float(self._allTruePolarities)/float(self._testCorpusLength)
		self._accuracy = accuracy

	def setCrossTable(self):
		headline = ["Actual Class", "Predicted Negative", "Predicted Positive"]
		line1 = ["Negatives", self._trueNegatives, self._allFalsePositives, self._testCorpusNegatives]
		line2 = ["Positives", self._allFalseNegatives, self._truePositives, self._testCorpusPositives]
		line3 = ["Sum", self._allFalseNegatives+self._trueNegatives,\
		self._allFalsePositives+self._truePositives, self._testCorpusLength]
		self._crosstable = [headline, line1, line2, line3]

	def getCrossTableAsString(self):
		outputLines = ""
		for row in self._crosstable:
			outputLine = [str(item) for item in row]
			outputLine = "\t".join(outputLine)
			outputLines = outputLines + outputLine + "\n"
			#print outputLine
		return outputLines


	def updateAllTruePolarities(self):
		self._allTruePolarities = self._truePositives + self._trueNegatives
	
	def updateFalsePolarities(self):
		self._allFalsePositives = self._falsePositives + self._falsePositivesAsZeros
		self._allFalseNegatives = self._falseNegatives + self._falseNegativesAsZeros
		self._allFalsePolarities = self._allFalsePositives + self._allFalseNegatives

	def init(self, polarityBenchmark):
		self._testCorpusLength = len(polarityBenchmark)
		for item in polarityBenchmark:
			if(item == 1):
				self._testCorpusNegatives += 1
			if(item == 2):
				self._testCorpusPositives += 1

if __name__ == "__main__":
    main()