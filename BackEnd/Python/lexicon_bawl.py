# -*- coding: utf8 -*-

import os
import re
import collections
import locale
import sys
from lexicon_handler import *
from lp_language_processor import *
from lexicon_clematide_dictionary import *

def main():
	reload(sys)
	sys.setdefaultencoding('utf8')

# BAWL-R specific class to tranform and use BAWL-R
class Bawl:

	def __init__(self):
		self._sentimentDict = {}
		self._sentimentDictLemmas = {}

		self._counter = 0

	# init Bawl from raw data and produced Lemma-Data
	def readAndInitBawlAndLemmas(self, processor):
		dta = DTA_Handler()
		self.initBawl()
		sentDictText = open("../SentimentAnalysis/TransformedLexicons/" + processor + "-Lemmas/Bawl-Lemmas.txt")
		self._sentimentDictLemmas = self.getSentimentDictBawl(sentDictText)

	# init DTA-Extended Bawl from raw data and produced Lemma-Data
	def readAndInitBawlAndLemmasDTA(self, processor):
		self.initBawl()
		self.extendLexiconBawlDTA()
		sentDictText = open("../SentimentAnalysis/TransformedLexicons/" + processor + "-Lemmas/Bawl-Lemmas-DTAExtended.txt")
		self._sentimentDictLemmas = self.getSentimentDictBawl(sentDictText)

	# init Tokens-Bawl from Raw-Data
	def initBawl(self):
		sentDictText = open("../SentimentAnalysis/Bawl-R/bawl-r-wc.txt")
		sentimentDict = self.getSentimentDictBawl(sentDictText)
		self._sentimentDict = sentimentDict
		self.removeNeutralWords()

	# Method to remove neutral Words from Bawl
	def removeNeutralWords(self):
		wordsToDel = []
		for word in self._sentimentDict:
			if(self._sentimentDict[word]["emotion"] == 0):
				wordsToDel.append(word)

		for word in wordsToDel:
			del self._sentimentDict[word]

	# Method to read Bawl from raw Text to create sentimentDict
	def getSentimentDictBawl(self, sentimentDictText):
		lines = sentimentDictText.readlines()[1:]
		sentimentDict = {}

		for line in lines:
			info = line.split("\t")
			word = info[0]
			#For first Read
			if(len(info) > 3):
				wordClass = info[3].rstrip()
				# Uppercase Word if noun
				if(wordClass == "N"):
					upperWord = word[:1].upper() + word[1:]
					word = upperWord
			infoPerWord = {}
			infoPerWord["emotion"] = float(info[1].replace(",", "."))
			infoPerWord["arousel"] = float(info[2].replace(",", "."))

			sentimentDict[unicode(word)] = infoPerWord
		
		return sentimentDict

	# lemmatize sentimentDict
	def lemmatizeDictBawl(self, processor):
		lp = Language_Processor(processor)
		newSentimentDict = {}
		print("start Lemmatisation")
		for word,value in self._sentimentDict.iteritems():
			lemma = lp._processor.getLemma(word)		
			if lemma in newSentimentDict:
				#reduction to only emotion, because its most important
				newSentimentDict[lemma] = self.getBetterValues(value, newSentimentDict[lemma])
			else:
				newSentimentDict[lemma] = value
		
		print("Lemmatisation finished")
		self._sentimentDictLemmas = newSentimentDict

	# Method to deal with double-Words, --> chose word with higer emotion-Value
	def getBetterValues(self, newValues, oldValues):
		newEmotion = abs(newValues["emotion"])
		newArousel = newValues["arousel"]
		oldEmotion = abs(oldValues["emotion"])
		oldArousel = oldValues["arousel"]

		if(newEmotion > oldEmotion):
			return newValues
		elif(oldEmotion > newEmotion):
			return oldValues
		elif(newArousel > oldArousel):
			return newValues
		elif(oldArousel > newArousel):
			return oldValues
		return oldValues

	# write outputFile for sentimentDict
	def createOutputBawl(self, sentimentDict, dataName):
		outputFile = open(dataName + ".txt", "w")
		firstLine = "word\temotion\tarousel"
		outputFile.write(firstLine)

		for word in sentimentDict:
			info = sentimentDict[word]
			line = "\n" + word + "\t" + str(info["emotion"]) + "\t" + str(info["arousel"])
			outputFile.write(line)
		outputFile.close()

	def createExtendedOutputDTA(self):
		self.initBawl()
		self.extendLexiconBawlDTA()
		self.createOutputBawl(self._sentimentDict, "../SentimentAnalysis/TransformedLexicons/Bawl-Token-DTAExtended")
		self.lemmatizeDictBawl("treetagger")
		self.createOutputBawl(self._sentimentDictLemmas, "../SentimentAnalysis/TransformedLexicons/treetagger-Lemmas/Bawl-Lemmas-DTAExtended")
		self.lemmatizeDictBawl("textblob")
		self.createOutputBawl(self._sentimentDictLemmas, "../SentimentAnalysis/TransformedLexicons/textblob-Lemmas/Bawl-Lemmas-DTAExtended")

	def resetAllFiles(self):
		self.createSentimentDictFileBawlToken()
		self.createSentimentDictFileBawlLemmas("treetagger")
		self.createSentimentDictFileBawlLemmas("textblob")

	# Method to call if DTA-Extended Version is desired
	def extendLexiconBawlDTA(self):
		dta = DTA_Handler()
		self._sentimentDict = dta.extendSentimentDictDTA(self._sentimentDict, "Bawl")

	def createSentimentDictFileBawlToken(self):
		self.initBawl()
		self.createOutputBawl(self._sentimentDict, "../SentimentAnalysis/TransformedLexicons/Bawl-Token")


	def createSentimentDictFileBawlLemmas(self, processor):
		self.initBawl()
		self.lemmatizeDictBawl(processor)
		self.createOutputBawl(self._sentimentDictLemmas, "../SentimentAnalysis/TransformedLexicons/" + processor + "-Lemmas/Bawl-Lemmas")

if __name__ == "__main__":
    main()