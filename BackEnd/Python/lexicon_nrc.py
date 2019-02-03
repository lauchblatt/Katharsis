# -*- coding: utf8 -*-

import os
import re
import collections
import locale
import sys
from lp_language_processor import *
from lexicon_dta_enhancement import *

def main():
	reload(sys)
	sys.setdefaultencoding('utf8')

# NRC specific class to tranform and use NRC
class NRC:

	def __init__(self):
		self._sentimentDict = {}
		self._sentimentDictLemmas = {}

	# init CD from raw data and produced Lemma-Data
	def readAndInitNRCAndLemmas(self, processor):
		self.initNRC()
		sentDictText = open("../SentimentAnalysis/TransformedLexicons/" + processor + "-Lemmas/NRC-Lemmas.txt")
		self._sentimentDictLemmas = self.getSentimentDictNRC(sentDictText, True)

	# init DTA-Extended CD from raw data and produced Lemma-Data
	def readAndInitNRCAndLemmasDTA(self, processor):
		self.initNRC()
		self.extendLexiconNRCDTA()
		sentDictText = open("../SentimentAnalysis/TransformedLexicons/" + processor + "-Lemmas/NRC-Lemmas-DTAExtended.txt")
		self._sentimentDictLemmas = self.getSentimentDictNRC(sentDictText, True)

	# init Tokens from Raw-Data
	def initNRC(self):
		sentDictText = open("../SentimentAnalysis/NRCEmotionLexicon/NRC.txt")
		self._sentimentDict = self.getSentimentDictNRC(sentDictText, False)
		for word in self._sentimentDict:
			if(self._sentimentDict[word]["positive"] == 1 and self._sentimentDict[word]["negative"] == 1):
				print word

		self._sentimentDict = self.removePhrasesFromNRC(self._sentimentDict)
		self.handleSpecialCases()
		self._sentimentDict = self.removeTotalZerosFromNRC(self._sentimentDict)
		self.replaceRemainingDoublePolarities()

	# Method to remove ambigue words --> change them to just positive
	def replaceRemainingDoublePolarities(self):
		for word in self._sentimentDict:
			sentiments = self._sentimentDict[word]
			if(sentiments["positive"] == 1 and sentiments["negative"] == 1):
				self._sentimentDict[word]["negative"] = 0

	# Method to remove special words with punctuation
	def handleSpecialCases(self):
		for word in self._sentimentDict.keys():
			if(word.endswith("-")):
				del self._sentimentDict[word]
			# wegen leugnen,
			if(word.endswith(",")):
				self._sentimentDict[word.rstrip(",")] = self._sentimentDict[word]
				del self._sentimentDict[word]
				
	# Method to read CD from raw Text to create sentimentDict
	def getSentimentDictNRC(self, sentimentDictText, isLemmas):
		columnSub = 0
		if(isLemmas):
			columnSub = 1

		nrcSentimentDict = {}
		lines = sentimentDictText.readlines()[1:]
		for line in lines:
			wordsAndValues = line.split("\t")
			word = wordsAndValues[1-columnSub]
			
			# skip missing german translations
			if(not(word == "")):
				sentimentsPerWord = {}

				sentimentsPerWord["positive"] = int(wordsAndValues[2-columnSub])
				sentimentsPerWord["negative"] = int(wordsAndValues[3-columnSub])
				sentimentsPerWord["anger"] = int(wordsAndValues[4-columnSub])
				sentimentsPerWord["anticipation"] = int(wordsAndValues[5-columnSub])
				sentimentsPerWord["disgust"] = int(wordsAndValues[6-columnSub])
				sentimentsPerWord["fear"] = int(wordsAndValues[7-columnSub])
				sentimentsPerWord["joy"] = int(wordsAndValues[8-columnSub])
				sentimentsPerWord["sadness"] = int(wordsAndValues[9-columnSub])
				sentimentsPerWord["surprise"] = int(wordsAndValues[10-columnSub])
				sentimentsPerWord["trust"] = int(wordsAndValues[11-columnSub].rstrip())

				alreadyInLexicon = False
				if(unicode(word) in nrcSentimentDict):
					higherSentiments = self.getHigherSentimentsValueNrc(sentimentsPerWord, nrcSentimentDict[unicode(word)])
					alreadyInLexicon = True
					nrcSentimentDict[unicode(word)] = higherSentiments
				
				if(not alreadyInLexicon):
					nrcSentimentDict[unicode(word)] = sentimentsPerWord
		
		return nrcSentimentDict

	# lemmatize sentimentDict
	def lemmatizeDictNRC(self, processor):
		lp = Language_Processor(processor)
		newSentimentDict = {}
		print("start Lemmatisation")
		
		for word,value in self._sentimentDict.iteritems():
			lemma = lp._processor.getLemma(word)
			
			if lemma in newSentimentDict:
				newSentiments = value
				oldSentiments = newSentimentDict[lemma]
				sentiments = self.getHigherSentimentsValueNrc(newSentiments, oldSentiments)
				newSentimentDict[lemma] = sentiments
			else:
				newSentimentDict[lemma] = value
		
		print("Lemmatisation finished")
		self._sentimentDictLemmas = newSentimentDict

	# method to get better sentiment-Values for word doubles
	# choose words with more annotations
	def getHigherSentimentsValueNrc(self, newSentiments, oldSentiments):
		newSentimentsScore = 0
		oldSentimentsScore = 0
		doublePolarityNew = (newSentiments["positive"] == 1 and newSentiments["negative"] == 1)
		doublePolarityOld = (oldSentiments["positive"] == 1 and oldSentiments["negative"] == 1)
		isNeutralNew = all(value == 0 for value in newSentiments.values())
		isNeutralOld = all(value == 0 for value in oldSentiments.values())

		if(doublePolarityNew == True and doublePolarityOld == False and isNeutralOld == False):
			return oldSentiments
		if(doublePolarityOld == True and doublePolarityNew == False and isNeutralNew == False):
			return newSentiments

		for sentiment in newSentiments:
			newSentimentsScore = newSentimentsScore + newSentiments[sentiment]
		for sentiment in oldSentiments:
			oldSentimentsScore = oldSentimentsScore + oldSentiments[sentiment]

		if(newSentimentsScore > oldSentimentsScore):
			return newSentiments
		else:
			return oldSentiments

	# remove phrases from NRC
	def removePhrasesFromNRC(self, nrcSentimentDict):
		phrases = []
		for word in nrcSentimentDict:
			words = word.split()
			if(len(words) > 1):
				phrases.append(word)
		for phrase in phrases:
			del nrcSentimentDict[phrase]
		return nrcSentimentDict

	# remove neutral words from NRC
	def removeTotalZerosFromNRC(self, nrcSentimentDict):
		totalZeros = self.getTotalZerosNRC(nrcSentimentDict)

		for zeroWord in totalZeros:
			del nrcSentimentDict[zeroWord]
		return nrcSentimentDict

	# write outputFile for sentimentDict
	def createOutputNRC(self, sentimentDict, dataName):
		outputFile = open(dataName + ".txt", "w")
		sentiments = ["positive", "negative", "anger", "anticipation", "disgust", "fear", "joy", "sadness", "surprise", "trust"]
		firstLine = "word\tpositive\tnegative\tanger\tanticipation\tdisgust\tfear\tjoy\tsadness\tsurprise\ttrust\n"
		outputFile.write(firstLine)
		
		for word in sentimentDict:
			line = word + "\t"
			sentimentsPerWord = sentimentDict[word]
			for sentiment in sentiments:
				line = line + str(sentimentsPerWord[sentiment]) + "\t"
			line = line.rstrip("\t")
			line = line + "\n"
			outputFile.write(line)
		outputFile.close()

	def getTotalZerosNRC(self, nrcSentimentDict):
		totalZeros = {}
		
		for word in nrcSentimentDict:
			sentiments = nrcSentimentDict[word]
			if(all(value == 0 for value in sentiments.values())):
				totalZeros[word] = sentiments
		return totalZeros

	def getDoublesInGermanNRC(self):
		sentDictText = open("../SentimentAnalysis/NRCEmotionLexicon/NRC.txt")
		lines = sentDictText.readlines()[1:]
		words = []
		doubles = []

		for line in lines:
			wordsAndValues = line.split("\t")
			word = wordsAndValues[1]

			if(not(word == "")):
				if(word in words):
					doubles.append(word)
				else:
					words.append(word)
		for word in doubles:
			print(word)

	def createExtendedOutputDTA(self):
		self.initNRC()
		self.extendLexiconNRCDTA()
		self.createOutputNRC(self._sentimentDict, "../SentimentAnalysis/TransformedLexicons/NRC-Token-DTAExtended")
		self.lemmatizeDictNRC("treetagger")
		self.createOutputNRC(self._sentimentDictLemmas, "../SentimentAnalysis/TransformedLexicons/treetagger-Lemmas/NRC-Lemmas-DTAExtended")
		self.lemmatizeDictNRC("textblob")
		self.createOutputNRC(self._sentimentDictLemmas, "../SentimentAnalysis/TransformedLexicons/textblob-Lemmas/NRC-Lemmas-DTAExtended")

	# Method to call if DTA-Extended Version is desired
	def extendLexiconNRCDTA(self):
		dta = DTA_Handler()
		self._sentimentDict = dta.extendSentimentDictDTA(self._sentimentDict, "NRC")

	def resetAllFiles(self):
		self.createSentimentDictFileNRCToken()
		self.createSentimentDictFileNRCLemmas("treetagger")
		self.createSentimentDictFileNRCLemmas("textblob")

	def createSentimentDictFileNRCToken(self):
		self.initNRC()
		self.createOutputNRC(self._sentimentDict, "../SentimentAnalysis/TransformedLexicons/NRC-Token")

	def createSentimentDictFileNRCLemmas(self, processor):
		self.initNRC()
		self.lemmatizeDictNRC(processor)
		self.createOutputNRC(self._sentimentDictLemmas, "../SentimentAnalysis/TransformedLexicons/" + processor + "-Lemmas/NRC-Lemmas")

if __name__ == "__main__":
    main()