# -*- coding: utf8 -*-

import os
import re
import collections
import locale
import sys
from lexicon_handler import *

def main():
	reload(sys)
	sys.setdefaultencoding('utf8')

# Class to implement the DTA-Extensiion
class DTA_Handler:
	
	def __init__(self):
		
		self._wordSynonymsDict = {}
	# Method to extend a normal lexicon with DTA-Synonyms
	def extendSentimentDictDTA(self, sentimentDict, lexiconName):
		self.setWordSynonymsFromDTA()
		keys = sentimentDict.keys()
		copy = {}
		copy.update(sentimentDict)
		for word in sentimentDict.keys():
			if(word in self._wordSynonymsDict):
				sentiments = sentimentDict[word]
				synonyms = self._wordSynonymsDict[word]
				for synonym in synonyms:
					#already unicode
						# for doubles
						if synonym in sentimentDict:
							#checken in word is in orignal lexicon, then dont change polarity
							if(not(synonym in copy)):
								# get better values according to methods in class
								betterValues = self.getBetterValues(lexiconName, sentiments, sentimentDict[synonym], synonym)
								sentimentDict[synonym] = betterValues
						else:
							sentimentDict[synonym] = sentiments

		return sentimentDict

	def getBetterValues(self, lexicon, newValues, oldValues, word):
		if(lexicon == "SentiWS"):
			return self.getBetterValuesSentiWS(newValues, oldValues)
		elif(lexicon == "NRC"):
			return self.getBetterValuesNrc(newValues, oldValues)
		elif(lexicon == "Bawl"):
			return self.getBetterValuesBawl(newValues, oldValues)
		elif(lexicon == "CD"):
			return self.getBetterValuesCD(newValues, oldValues)
		elif(lexicon == "GPC"):
			return self.getBetterValuesGPC(newValues, oldValues)

	# which is greater?
	def getBetterValuesBawl(self, newValues, oldValues):
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

	# which has more values
	def getBetterValuesNrc(self, newSentiments, oldSentiments):

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

	# the positive...
	def getBetterValuesGPC(self, newValues, oldValues):
		if(newValues["neutral"] > oldValues["neutral"]):
			return oldValues
		else:
			if(newValues["positive"] > oldValues["positive"]):
				return newValues
			else:
				return oldValues

	def getHigherSentimentValueCD(self, newScore, oldScore):
		if(abs(newScore) > abs(oldScore)):
			return newScore
		else:
			return oldScore

	def getHigherSentimentValuesCD(self, newSentiments, oldSentiments):
		sentiments = {}
		sentiments["positive"] = self.getHigherSentimentValueCD(newSentiments["positive"], oldSentiments["positive"])
		sentiments["negative"] = self.getHigherSentimentValueCD(newSentiments["negative"], oldSentiments["negative"])
		sentiments["neutral"] = self.getHigherSentimentValueCD(newSentiments["neutral"], oldSentiments["neutral"])
		return sentiments

	# the positive
	def getBetterValuesCD(self, newSentiments, oldSentiments):
		# if somethin is neutral take the other
		highestSentimentValues = self.getHigherSentimentValuesCD(newSentiments, oldSentiments)

		polarityChange = (highestSentimentValues["positive"] != 0 and highestSentimentValues["negative"] != 0)
		neutralityChange = (highestSentimentValues["neutral"] != 0 \
			and (highestSentimentValues["positive"] != 0 or highestSentimentValues["negative"] != 0))
		if(highestSentimentValues["positive"] != 0 or highestSentimentValues["negative"] != 0):
			if(highestSentimentValues["positive"] >= highestSentimentValues["negative"]):
				highestSentimentValues["negative"] = 0
				highestSentimentValues["neutral"] = 0
				return highestSentimentValues
			else:
				highestSentimentValues["positive"] = 0
				highestSentimentValues["neutral"] = 0
				return highestSentimentValues
		else:
			return highestSentimentValues

	# which is greater
	def getBetterValuesSentiWS(self, newScore, oldScore):
		if(abs(newScore) > abs(oldScore)):
			return newScore
		else:
			return oldScore

	# Method to get DTA-Data
	# uses fetched DTA-Data, saves them as dictionary
	def setWordSynonymsFromDTA(self):
		currentWord = ""
		synonyms = []
		wordSynonymsDict = {}
		
		for filename in os.listdir("../SentimentAnalysis/DTA-Output/FetchedDTAData/"):
			outputFile = open("../SentimentAnalysis/DTA-Output/FetchedDTAData/" + filename) 
		 	for line in outputFile:
		 		if (not line.startswith("\t")):
		 			word = line.strip()
		 			if(word != ""):
		 				if(currentWord != ""):
		 					wordSynonymsDict[unicode(currentWord)] = synonyms
		 				currentWord = word
		 				synonyms = []
		 		else:
		 			if(line.startswith("\t+[eqpho]") or line.startswith("\t+[eqrw]") or line.startswith("\t+[eqlemma]")):
		 				line = line.strip("\t+[eqpho]")
		 				line = line.strip("\t+[eqrw]")
		 				line = line.strip("\t+[eqlemma]")
		 				line = line.lstrip()
		 				line = line.split(" ")[0]
		 				synonym = line.strip()
		 				synonyms.append(unicode(synonym))

		self._wordSynonymsDict = wordSynonymsDict

	# create structured DTA-Output
	def createOutputWordSynonymsDTA(self):
		self.setWordSynonymsFromDTA()
		data = open("../SentimentAnalysis/DTA-Output/AdditionalInfo/DTA-Word-Synonyms-Dict.txt", "w")
		for word in self._wordSynonymsDict:
			data.write(unicode(word) + "\n")
			for synonym in self._wordSynonymsDict[word]:
				data.write("\t" + unicode(synonym) + "\n")
		data.close()

	def createOutputWordSynonymsDTAForLexicon(self, sentimentDict, lexiconName):
		self.setWordSynonymsFromDTA()
		keys = sentimentDict.keys()
		copy = {}
		copy.update(sentimentDict)
		data = open("../SentimentAnalysis/DTA-Output/AdditionalInfo/" + lexiconName + "-DTA-Word-Synonyms-Dict.txt", "w")
		for word in sentimentDict.keys():
			if(word in self._wordSynonymsDict):
				data.write(word + "\n")
				sentiments = sentimentDict[word]
				data.write(str(sentiments) + "\n")
				synonyms = self._wordSynonymsDict[word]
				for synonym in synonyms:
						if synonym in sentimentDict:
							if(not(synonym in copy)):
								betterValues = self.getBetterValues(lexiconName, sentiments, sentimentDict[synonym], synonym)
								data.write("\t" + synonym + "\n")
								data.write("\t" + str(betterValues) + "\n")
								sentimentDict[synonym] = betterValues
						else:
							data.write("\t" + synonym + "\n")
							data.write("\t" + str(sentiments) + "\n")
							sentimentDict[synonym] = sentiments

		data.close()


if __name__ == "__main__":
    main()