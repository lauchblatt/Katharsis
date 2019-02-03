#coding: utf8

import os
import re
import collections
import locale
import sys
from drama_parser import *
from lexicon_handler import *
from sa_models import *
from sa_calculator import *
from sa_output import *
from sa_pre_processing import *
from lp_language_processor import *

def main():
	reload(sys)
	sys.setdefaultencoding('utf8')

	#processor = Drama_Pre_Processing("treetagger")
	#dramaModel = processor.readDramaModelFromDump("Dumps/ProcessedDramas/treetagger/Emilia Galotti.p")
	
	#def __init__(self, DTAExtension, processor, lemmaMode, stopwordList, caseSensitive)
	sa = Sentiment_Analyzer(False, "treetagger" , "noLemma", None, False)
	
	"""
	data = open("data/video_text.txt")
	results = []
	text = "Ich versprach mir von ihrem iphone der soviel wer weiß, wie albern sie sich dabei genommen hat, wenn der Rat eines Toren einmal gut ist, so muss in ein gescheiter Mann ausführen, das hätte ich Bedenken soll das hätte ich mich schon wenn du dafür belohnt, dass ich noch mal leben darüber schlagen wollte, das wieder ernst noch Sport den Garten bewegen. Konnten seine Liebe nach zusetzen versucht dich in den Haaren ist zu jagen, ich sag den Dinge über die sich vergaß, er steht Beleidigung gegen mich aus und ich fordere Genugtuung wartete sie gleich auf der Stelle und der Graph der steht in dem. Ruf er sich so etwas nicht zweimal sagen soll, aber wer kann es ihnen verdenken, er versetzte dass er doch noch etwas Wichtigeres zu tun habe, als ich mit mir den Hals zu brechen und so beschilderte ich auf die ersten acht Tage nach der Hochzeit."
	metrics = sa.getSentimentInfoPerText(text, "treetagger")
	print sa.toString(metrics["polaritySentiWS"])
	"""

	data = open("data/real_text.txt")
	results = []

	for line in data.readlines():
		line = line.rstrip()
		try:
			metrics = sa.getSentimentInfoPerText(line, "treetagger")
			results.append(line + "\t" + sa.toString(metrics["polaritySentiWS"]))
		except:
			results.append(line + "\t" + "0!")
		
	for result in results:
		print result
	
	
	"""
	sentimentExtendedDramaModel = sa.attachAllSentimentInfoToDrama(dramaModel)

	for act in sentimentExtendedDramaModel._acts:
		for conf in act._configurations:
			for speech in conf._speeches:
				metric = speech._sentimentMetrics._metricsTotal["polaritySentiWS"]
				
				if (metric == 0):
					print 2
				elif (metric > 0):
					print 3
				elif (metric < 0):
					print 1
				
				#print str(speech._sentimentMetrics._metricsTotal["polaritySentiWS"]).replace(".", ",")
	"""

# Main-Class to perform Sentiment Analysis
class Sentiment_Analyzer:

	# gets all SA-Options on Init
	def __init__(self, DTAExtension, processor, lemmaMode, stopwordList, caseSensitive):

		self._sentimentDict = {}
		self._lemmaMode = lemmaMode
		self._caseSensitive = caseSensitive
		self._removeStopwords = False
		self._stopwords = []

		self.initLexicons(DTAExtension, processor)
		self.initStopWords(processor, stopwordList)
	
	def toString(self, number):
		string = str(number).replace(".", ",")
		return string

	def getSentimentInfoPerText (self, text, processor):
		lp = Language_Processor(processor)._processor
		lp.processTextFully(text)
		textAsLanguageInfo = lp._lemmasWithLanguageInfo
		
		sentimentBearingWords = self.getSentimentBearingWords(textAsLanguageInfo)
		sentimentMetrics = self.calcAndGetSentimentMetrics(sentimentBearingWords, len(textAsLanguageInfo))
		return sentimentMetrics._metricsTotal
		
	
	# Main Method to attach all Sentiment Metrics to dramaModel
	def attachAllSentimentInfoToDrama(self, dramaModel):
		self.attachSentimentBearingWordsToDrama(dramaModel)
		self.attachStructuralSentimentMetricsToDrama(dramaModel)
		self.attachSentimentMetricsToSpeaker(dramaModel)
		self.attachSentimentRelationsToSpeaker(dramaModel)
		return dramaModel

	def initStopWords(self, processor, stopwordList):
		if(stopwordList != None and stopwordList != ""):
			self._removeStopwords = True

		if(self._removeStopwords):
			lp = Language_Processor(processor)
			lp.setProcessor(processor)

			lp._processor.initStopWords(stopwordList)
			# lemmaMode --> 3 cases: bothLemma, textLemma, noLemma
			if(self._lemmaMode == "bothLemma" or self._lemmaMode == "textLemma"):
				self._stopwords = lp._processor._stopwords_lemmatized
			else:
				self._stopwords = lp._processor._stopwords
		else:
			self._stopwords = []

	def initLexicons(self, DTAExtension, processor):
		
		lexicon = ""
		lexiconHandler = Lexicon_Handler()
		if(DTAExtension):
			lexicon = "CombinedLexicon-DTAExtended"
		else:
			lexicon = "CombinedLexicon"

		lexiconHandler.initSingleDict(lexicon, processor)
		sentimentDictTokens = lexiconHandler._sentimentDict
		sentimentDictLemmas = lexiconHandler._sentimentDictLemmas
		# lemmaMode --> 3 cases: bothLemma, textLemma, noLemma
		if(self._lemmaMode == "bothLemma"):
			self._sentimentDict = sentimentDictLemmas
		else:
			self._sentimentDict = sentimentDictTokens

	def attachStructuralSentimentMetricsToDrama(self, dramaModel):
		for act in dramaModel._acts:
			for conf in act._configurations:
				for speech in conf._speeches:
					#print("Speech")
					self.attachSentimentMetricsToUnit(speech)
					#speech._sentimentMetrics.printAllInfo(speech._lengthInWords)
				#print("Conf")
				self.attachSentimentMetricsToUnit(conf)
				#conf._sentimentMetrics.printAllInfo(conf._lengthInWords)
			#print("Act")
			self.attachSentimentMetricsToUnit(act)
			#act._sentimentMetrics.printAllInfo(act._lengthInWords)
		#print("Drama")
		self.attachSentimentMetricsToUnit(dramaModel)
		#dramaModel._sentimentMetrics.printAllInfo(dramaModel._lengthInWords)

	def attachSentimentMetricsToSpeaker(self, dramaModel):
		for speaker in dramaModel._speakers:
			self.attachSentimentMetricsToUnit(speaker)
			#print("Speaker")
			#speaker._sentimentMetrics.printAllInfo(speaker._lengthInWords)
		for act in dramaModel._acts:
			for name in act._actSpeakers:
				self.attachSentimentMetricsToUnit(act._actSpeakers[name])
			for conf in act._configurations:
				for name in conf._confSpeakers:
					self.attachSentimentMetricsToUnit(conf._confSpeakers[name])

	def attachSentimentRelationsToSpeaker(self, dramaModel):
		for speaker in dramaModel._speakers:
			sentimentRelations = self.createSentimentRelationsForSpeaker(speaker)
			speaker._sentimentRelations = sentimentRelations
		for act in dramaModel._acts:
			for name in act._actSpeakers:
				speaker = act._actSpeakers[name]
				sentimentRelations = self.createSentimentRelationsForSpeaker(speaker)
				speaker._sentimentRelations = sentimentRelations
			for conf in act._configurations:
				for name in conf._confSpeakers:
					speaker = conf._confSpeakers[name]
					sentimentRelations = self.createSentimentRelationsForSpeaker(speaker)
					speaker._sentimentRelations = sentimentRelations


	def createSentimentRelationsForSpeaker(self, speaker):
		originSpeaker = speaker._name
		targetSpeakerSpeeches = {}

		for speech in speaker._speeches:
			if (speech._preOccuringSpeaker == ""):
				pass
			else:
				if (speech._preOccuringSpeaker in targetSpeakerSpeeches):
					targetSpeakerSpeeches[speech._preOccuringSpeaker].append(speech)
				else:
					targetSpeeches = []
					targetSpeeches.append(speech)
					targetSpeakerSpeeches[speech._preOccuringSpeaker] = targetSpeeches

		sentimentRelations = []
		for targetSpeaker in targetSpeakerSpeeches:
			speeches = targetSpeakerSpeeches[targetSpeaker]
			sentimentRelation = Sentiment_Relation(originSpeaker, targetSpeaker, speeches)
			self.attachSentimentMetricsToUnit(sentimentRelation)
			sentimentRelations.append(sentimentRelation)

		return sentimentRelations

	def attachSentimentMetricsToUnit(self, unit):
		sentimentMetrics = self.calcAndGetSentimentMetrics(unit._sentimentBearingWords, unit._lengthInWords)
		unit._sentimentMetrics = sentimentMetrics

	def calcAndGetSentimentMetrics(self, sentimentBearingWords, lengthInWords):
		sCalculator = Sentiment_Calculator(sentimentBearingWords, lengthInWords)
		sCalculator.calcMetrics()

		return sCalculator._sentimentMetrics

	def attachSentimentBearingWordsToDrama(self, dramaModel):
		sentimentBearingWordsDrama = []

		for act in dramaModel._acts:
			sentimentBearingWordsAct = []

			for configuration in act._configurations:
				sentimentBearingWordsConf = []

				for speech in configuration._speeches:
					textAsLanguageInfo = speech._textAsLanguageInfo
					speech._sentimentBearingWords = self.getSentimentBearingWordsSpeech(textAsLanguageInfo)
						
					sentimentBearingWordsConf.extend(speech._sentimentBearingWords)
					sentimentBearingWordsAct.extend(speech._sentimentBearingWords)
					sentimentBearingWordsDrama.extend(speech._sentimentBearingWords)

				configuration._sentimentBearingWords = sentimentBearingWordsConf

			act._sentimentBearingWords = sentimentBearingWordsAct

		dramaModel._sentimentBearingWords = sentimentBearingWordsDrama

		self.attachSentimentBearingWordsToSpeakers(dramaModel)

	def attachSentimentBearingWordsToSpeakers(self, dramaModel):
		for speaker in dramaModel._speakers:
			sentimentBearingWordsSpeaker = []
			for speech in speaker._speeches:
				sentimentBearingWordsSpeaker.extend(speech._sentimentBearingWords)
			speaker._sentimentBearingWords = sentimentBearingWordsSpeaker

		for act in dramaModel._acts:
			for name in act._actSpeakers:
				speaker = act._actSpeakers[name]
				sentimentBearingWordsSpeaker = []
				for speech in speaker._speeches:
					sentimentBearingWordsSpeaker.extend(speech._sentimentBearingWords)
				speaker._sentimentBearingWords = sentimentBearingWordsSpeaker

			for conf in act._configurations:
				for name in conf._confSpeakers:
					speaker = conf._confSpeakers[name]
					sentimentBearingWordsSpeaker = []
					for speech in speaker._speeches:
						sentimentBearingWordsSpeaker.extend(speech._sentimentBearingWords)
					speaker._sentimentBearingWords = sentimentBearingWordsSpeaker

	def getSentimentBearingWordsSpeech(self, textAsLanguageInfo):				
		sentimentBearingWords = self.getSentimentBearingWords(textAsLanguageInfo)
		return sentimentBearingWords
	
	def getSentimentBearingWord(self, languageInfo, word):
		sentimentBearingWord = Sentiment_Bearing_Word()

		sentimentBearingWord._lemma = languageInfo[0]
		sentimentBearingWord._token = languageInfo[1][0]
		sentimentBearingWord._POS = languageInfo[1][1]
		#print word
		if(word in self._sentimentDict):
			allSentiments = self._sentimentDict[word]

		else:
			upperWord = word[:1].upper() + word[1:]
			lowerWord = word.lower()
			if(lowerWord in self._sentimentDict):
				#sentimentBearingWord._token = lowerWord
				allSentiments = self._sentimentDict[lowerWord]
			if(upperWord in self._sentimentDict):
				#sentimentBearingWord._token = upperWord
				allSentiments = self._sentimentDict[upperWord]

		sentimentBearingWord.setAllSentiments(allSentiments)

		return sentimentBearingWord
				
	def getSentimentBearingWords(self, lemmasWithLanguageInfo):
		sentimentBearingWords = []

		for languageInfo in lemmasWithLanguageInfo:
			# lemmaMode --> 3 cases: bothLemma, textLemma, noLemma
			if(self._lemmaMode == "bothLemma" or self._lemmaMode == "textLemma"):
				word = languageInfo[0]
			else:
				word = languageInfo[1][0]
			
			if (self.isSentimentBearingWordAndNotStopword(word)):
				sentimentBearingWord = self.getSentimentBearingWord(languageInfo, word)
				sentimentBearingWords.append(sentimentBearingWord)

		return sentimentBearingWords

	def isSentimentBearingWordAndNotStopword(self, word):

		if(word in self._stopwords):
			return False
		
		if(self._caseSensitive):
			if(word in self._sentimentDict):
				return True
			else:
				return False
		else:	
			upperWord = word[:1].upper() + word[1:]
			lowerWord = word.lower()

			if(upperWord in self._sentimentDict or lowerWord in self._sentimentDict):
				return True
			else:
				return False


if __name__ == "__main__":
	main()