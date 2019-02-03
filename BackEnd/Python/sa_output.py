#coding: utf8

import os
import re
import collections
import locale
import sys
from drama_parser import *
from sa_models import *
from sa_calculator import *
from sa_pre_processing import *
from sa_sentiment_analysis import *

def main():
	reload(sys)
	sys.setdefaultencoding('utf8')

	parser = DramaParser()
	dramaModel = parser.parse_xml("Korpus/schi_kabale_t.xml")
	dpp = Drama_Pre_Processing("treetagger")
	dpp.preProcessAndLemmatize("Korpus/schi_kabale_t.xml")

	dramaModel = dpp._dramaModel

	# (self, DTAExtension, processor, lemmaModeOn, stopwordList, caseSensitive)

	sa = Sentiment_Analyzer(True, "treetagger", "textLemma", None, True)
	sentimentExtendedDramaModel = sa.attachAllSentimentInfoToDrama(dramaModel)

	for act in dramaModel._acts:
		for conf in act._configurations:
			for speech in conf._speeches:
				metric = speech._sentimentMetrics._metricsTotal["polaritySentiWS"]
				#"""
				if (metric == 0):
					print 2
				elif (metric > 0):
					print 3
				elif (metric < 0):
					print 1

	#sog = Sentiment_Output_Generator()
	#sog.createTxtOutputSingleDrama("textblobTesto.txt", sentimentExtendedDramaModel)
	
	
# Class with Methods to generate Outputs --> txt and json - Outputs for metrics are possible
class Sentiment_Output_Generator:

	def __init__(self):

		self._lpProcessors = ["treetagger", "textblob"]

	def generateJSONFileForAllDramas(self, dramaDumpsFolder, outputFile, DTAExtension, processor, lemmaModeOn, stopwordList, caseSensitive):
		dramasData = self.generateSentimentInfoForAllDrama(dramaDumpsFolder + processor + "/",\
		 outputFile, DTAExtension, processor, lemmaModeOn, stopwordList, caseSensitive)
		self.generateJSON(outputFile, dramasData)

	def generateJSONFileForSingleDrama(self, dramaDumpPath, outputFolder, processor, lemmaModeOn):
		dpp = Drama_Pre_Processing(processor)
		dramaModel = dpp.readDramaModelFromDump(dramaDumpPath)
		sa = Sentiment_Analyzer(lemmaModeOn, "CombinedLexicon", processor)
		sentimentExtendedDramaModel = sa.attachAllSentimentInfoToDrama(dramaModel)
		dramaData = self.getSentimentInfoFromDrama(sentimentExtendedDramaModel)
		self.generateJSON(outputFolder + "Tokens/" + dramaModel._title + ".json", dramaData)

	def generateJSON(self, outputPath, data):
		#jsonData = json.dumps(data, indent=2)
		#output = open(outputPath, "w")
		with open(outputPath, 'w') as f:
			json.dump(data, f, indent=2)

	def generateSentimentInfoForAllDrama(self, dramaDumpsFolder, outputFile, DTAExtension, processor, lemmaModeOn, stopwordList, caseSensitive):
		dramasData = []
		for filename in os.listdir(dramaDumpsFolder):
			dramaPath = dramaDumpsFolder + filename
			dpp = Drama_Pre_Processing(processor)
			dramaModel = dpp.readDramaModelFromDump(dramaPath)

			# (self, DTAExtension, processor, lemmaModeOn, stopwordList, caseSensitive)
			sa = Sentiment_Analyzer(DTAExtension, processor, lemmaModeOn, stopwordList, caseSensitive)
			
			sentimentExtendedDramaModel = sa.attachAllSentimentInfoToDrama(dramaModel)

			dramaInfo = self.getSentimentInfoFromDrama(sentimentExtendedDramaModel)
			dramasData.append(dramaInfo)
		return dramasData

	def getSentimentInfoFromDrama (self, dramaModel):
		dramaData = OrderedDict([])
		dramaData['title'] = dramaModel._title
		dramaData['author'] = dramaModel._author
		dramaData['date'] = dramaModel._date
		dramaData['type'] = dramaModel._type
		dramaData['lengthInWords'] = dramaModel._lengthInWords
		dramaData['lengthSentimentBearingWords'] = len(dramaModel._sentimentBearingWords)
		dramaData['sentimentMetricsBasic'] = dramaModel._sentimentMetrics.returnBestMetricsDict()
		
		dramaData['speakers'] = self.getSentimentInfoFromSpeakers(dramaModel._speakers)

		dramaData['acts'] = self.getSentimentInfoFromActs(dramaModel)
		
		return dramaData
		

	def getSentimentInfoFromActs(self, dramaModel):
		actsData = []
		for act in dramaModel._acts:
			actData = OrderedDict({})
			actData['number'] = act._number
			actData['numberOfSpeeches'] = len(act.get_speeches_act())
			actData['lengthInWords'] = act._lengthInWords
			actData['appearingSpeakers'] = act._appearing_speakers
			actData['lengthSentimentBearingWords'] = len(act._sentimentBearingWords)
			actData['sentimentMetricsBasic'] = act._sentimentMetrics.returnBestMetricsDict()

			actData['speakers'] = self.getSentimentInfoFromSpeakers(act._actSpeakers.values())
			configurationsData = []
			configurationsData.extend(self.getSentimentInfoFromConf(act._configurations))
			actData['configurations'] = configurationsData
			actsData.append(actData)
		return actsData

	def getSentimentInfoFromSpeakers(self, speakers):
		speakersData = []
		for speaker in speakers:
			speakerData = OrderedDict({})
			speakerData['name'] = speaker._name
			speakerData['numberOfSpeeches'] = len(speaker._speeches)
			speakerData['lengthInWords'] = speaker._lengthInWords
			speakerData['lengthSentimentBearingWords'] = len(speaker._sentimentBearingWords)
			speakerData['sentimentMetricsBasic'] = speaker._sentimentMetrics.returnBestMetricsDict()
			speakerData['sentimentRelations'] = self.getSentimentRelationsInfo(speaker)
			speakersData.append(speakerData)

		return speakersData

	def getSentimentRelationsInfo(self, speaker):
		srsData = []
		for sr in speaker._sentimentRelations:
			srData = OrderedDict({})
			srData["originSpeaker"] = sr._originSpeaker
			srData['targetSpeaker'] = sr._targetSpeaker
			srData['numberOfSpeeches'] = len(sr._speeches)
			srData['lengthInWords'] = sr._lengthInWords
			srData['lengthSentimentBearingWords'] = len(sr._sentimentBearingWords)
			srData['sentimentMetricsBasic'] = sr._sentimentMetrics.returnBestMetricsDict()
			srsData.append(srData)
		return srsData

	def getSentimentInfoFromConf(self, confs):
		confsData = []
		for conf in confs:
			confData = OrderedDict({})
			confData['number'] = conf._number
			confData['subsequentNumber'] = conf._subsequentNumber
			confData['numberOfSpeeches'] = len(conf._speeches)
			confData['lengthInWords'] = conf._lengthInWords
			confData['appearingSpeakers'] = conf._appearing_speakers
			confData['lengthSentimentBearingWords'] = len(conf._sentimentBearingWords)
			confData['sentimentMetricsBasic'] = conf._sentimentMetrics.returnBestMetricsDict()
			confData['speakers'] = self.getSentimentInfoFromSpeakers(conf._confSpeakers.values())
			confData['speeches'] = self.getSentimentInfoFromSpeeches(conf._speeches)
			confsData.append(confData)
		
		return confsData

	def getSentimentInfoFromSpeeches(self, speeches):
		speechesData = []
		for speech in speeches:
			speechData = OrderedDict({})
			speechData['numberInAct'] = speech._numberInAct
			speechData['numberInConf'] = speech._numberInConf
			speechData['subsequentNumber'] = speech._subsequentNumber
			speechData['lengthInWords'] = speech._lengthInWords
			speechData['speaker'] = speech._speaker
			speechData['lengthSentimentBearingWords'] = len(speech._sentimentBearingWords)
			speechData['sentimentMetricsBasic'] = speech._sentimentMetrics.returnBestMetricsDict()
			speechesData.append(speechData)
		return speechesData

	def processAndCreateTxtOutputMutlipleDramas(self):
		for processor in self._lpProcessors:
			folder = "Dumps/ProcessedDramas/" + processor
			for filename in os.listdir(folder):
				dpp = Drama_Pre_Processing(processor)
				dramaModel = dpp.readDramaModelFromDump(folder + "/" + filename)
				sa = Sentiment_Analyzer(False, "CombinedLexicon-DTAExtended", processor)
				sentimentExtendedDramaModel = sa.attachAllSentimentInfoToDrama(dramaModel)
				self.createTxtOutputSingleDrama("DTAExtended/tokens" + "/" + filename, sentimentExtendedDramaModel)

	def createTxtOutputSingleDrama(self, name, dramaModel):
		outputFile = open("../SentimentAnalysis/SA-Output/" + name +".txt", "w")

		outputFile.write(dramaModel._title +"\n\n")
		outputFile.write("Sentiments for entire #DRAMA: " + "\n\n")
		dramaInformation = self.getMetrics(dramaModel)
		outputFile.write(dramaInformation)
		#"""
		for act in dramaModel._acts:
			outputFile.write("\n\nSentiments for entire #ACT " + str(act._number) + ":\n\n")
			actInformation = self.getMetrics(act)
			outputFile.write(actInformation)
			
			outputFile.write("\n\nSentiments for #SPEAKERSPERACT: " + str(act._number) + ":")
			for name in act._actSpeakers:
				speaker = act._actSpeakers[name]
				outputFile.write("\n\nSentiments for #SPEAKERPERACT " + speaker._name +"\n\n")
				speakerInformation = self.getMetrics(speaker)
				outputFile.write(speakerInformation)

			for conf in act._configurations:
				outputFile.write("\n\nSentiments for entire #CONFIGURATION " + str(conf._subsequentNumber) + ":\n\n")
				confInformation = self.getMetrics(conf)
				outputFile.write(confInformation)
				
				outputFile.write("\n\nSentiments for #SPEAKERSPERCONFIGURATION " + str(conf._number) + ":")
				for name in conf._confSpeakers:
					speaker = conf._confSpeakers[name]
					outputFile.write("\n\nSentiments for #SPEAKERPERCONFIGURATION " + speaker._name +"\n\n")
					speakerInformation = self.getMetrics(speaker)
					outputFile.write(speakerInformation)
					sentimentBearingWordsInformation = self.getSentimentBearingWordsInformation(speaker)
					outputFile.write(sentimentBearingWordsInformation)

				for speech in conf._speeches:
					outputFile.write("\n\nSentiments for #SPEECH " + str(speech._subsequentNumber) + ":\n\n")
					speechInformation = self.getMetrics(speech)
					outputFile.write(speechInformation)
					
					sentimentBearingWordsInformation = self.getSentimentBearingWordsInformation(speech)
					outputFile.write(sentimentBearingWordsInformation)

		for speaker in dramaModel._speakers:
			outputFile.write("\n\nSentiments for entire #SPEAKER " + speaker._name +"\n\n")
			speakerInformation = self.getMetrics(speaker)
			outputFile.write(speakerInformation)

			#sentimentBearingWordsInformation = self.getSentimentBearingWordsInformation(speaker)
			#outputFile.write(sentimentBearingWordsInformation)
		outputFile.write("\n\n#SENTIMENT-RELATION DRAMA: ")
		for speaker in dramaModel._speakers:
			for sentimentRelation in speaker._sentimentRelations:
				outputFile.write("\n\n#SENTIMENT-RELATION " + speaker._name + " --> " + sentimentRelation._targetSpeaker + ":\n\n")
				sentimentInformation = self.getMetrics(sentimentRelation)
				outputFile.write(sentimentInformation)

				#sentimentBearingWordsInformation = self.getSentimentBearingWordsInformation(sentimentRelation)
				#outputFile.write(sentimentBearingWordsInformation)
		#"""
		for act in dramaModel._acts:
			outputFile.write("\n\n#SENTIMENT-RELATION PER ACT " + str(act._number) + ":")
			for name in act._actSpeakers:
				speaker = act._actSpeakers[name]
				for sentimentRelation in speaker._sentimentRelations:
					#print ("BOING")
					outputFile.write("\n\n#SENTIMENT-RELATION " + speaker._name + " --> " + sentimentRelation._targetSpeaker + ":\n\n")
					sentimentInformation = self.getMetrics(sentimentRelation)
					outputFile.write(sentimentInformation)

			for conf in act._configurations:
				outputFile.write("\n\n#SENTIMENT-RELATION PER CONFIGURATION " + str(conf._number) + ":")
				for name in conf._confSpeakers:
					speaker = conf._confSpeakers[name]
					for sentimentRelation in speaker._sentimentRelations:
						outputFile.write("\n\n#SENTIMENT-RELATION " + speaker._name + " --> " + sentimentRelation._targetSpeaker + ":\n\n")
						sentimentInformation = self.getMetrics(sentimentRelation)
						outputFile.write(sentimentInformation)
						sentimentBearingWordsInformation = self.getSentimentBearingWordsInformation(sentimentRelation)
						outputFile.write(sentimentBearingWordsInformation)


		outputFile.close()

	def getMetrics(self, unit):
		info = "Length in Words: " + str(unit._lengthInWords) + "\n"

		if hasattr(unit, "_speeches"):
			info = info + "Number of Speeches: " + str(len(unit._speeches)) + "\n"
		else:
			pass

		info = info + "\nTotal Values:" + "\n"
		for metric in unit._sentimentMetrics._metricsTotal:
			metricValuePair = metric + ": " + str(unit._sentimentMetrics._metricsTotal[metric])
			info = info + metricValuePair +"\n"
		
		info = info + "\n" + "Normalised Values: " + "\n"
		for metric in unit._sentimentMetrics._metricsNormalisedLengthInWords:
			metricValuePair = metric + ": " + str(unit._sentimentMetrics._metricsNormalisedLengthInWords[metric])
			info = info + metricValuePair + "\n"

		info = info + "\n" + "Normalised by Length of Sentiment Bearing Words Values: " + "\n"
		for metric in unit._sentimentMetrics._metricsNormalisedSBWs:
			metricValuePair = metric + ": " + str(unit._sentimentMetrics._metricsNormalisedSBWs[metric])
			info = info + metricValuePair + "\n"

		info = info + "\n" + "Sentiment Ratio: " + "\n"
		info = info + str(unit._sentimentMetrics._sentimentRatio)
		return info
	
	def getSentimentBearingWordsInformation(self, unit):
		info = ("\n\nSentiment Bearing Words: \n")
		info = info + "(Token, Lemma, POS), polaritySentiWS | nrcPositive, nrcNegative,"\
		 + "anger, anticipation, disgust, fear, joy, sadness, surprise, trust | emotion, arousel"\
		 + "positiveCd, negativeCd, neutralCd | positiveGpc, negativeGpc,"\
		 + "neutralGpc | clearlyPositiveCombined, clearlyNegativeCombined | " \
		 + "positiveCombined | negativeCombined\n"
		
		for sentimentBearingWord in unit._sentimentBearingWords:
			wordInfo = sentimentBearingWord.returnInfoAsString()
			info = info + wordInfo + "\n"

		return info

	def createShortTxtOutputSingleDrama(self, name, dramaModel):
		outputFile = open("../SentimentAnalysis/SA-Output/" + name +".txt", "w")

		outputFile.write(dramaModel._title +"\n\n")
		outputFile.write("Sentiments for entire #DRAMA: " + "\n\n")
		dramaInformation = self.getMetrics(dramaModel)
		outputFile.write(dramaInformation)

		for act in dramaModel._acts:
			outputFile.write("\n\nSentiments for entire #ACT " + str(act._number) + ":\n\n")
			actInformation = self.getMetrics(act)
			outputFile.write(actInformation)
			for conf in act._configurations:
				outputFile.write("\n\nSentiments for entire #CONFIGURATION " + str(conf._subsequentNumber) + ":\n\n")
				confInformation = self.getMetrics(conf)
				outputFile.write(confInformation)

		for speaker in dramaModel._speakers:
			outputFile.write("\n\nSentiments for entire #SPEAKER " + speaker._name +"\n\n")
			speakerInformation = self.getMetrics(speaker)
			outputFile.write(speakerInformation)

		for speaker in dramaModel._speakers:
			for sentimentRelation in speaker._sentimentRelations:
				outputFile.write("\n\n#SENTIMENT-RELATION " + speaker._name + " --> " + sentimentRelation._targetSpeaker + ":\n\n")
				sentimentInformation = self.getMetrics(sentimentRelation)
				outputFile.write(sentimentInformation)

		outputFile.close()

if __name__ == "__main__":
	main()