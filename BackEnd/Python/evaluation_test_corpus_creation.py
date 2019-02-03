#coding: utf8

import os
import re
import collections
import locale
import sys
import random
import pickle
from drama_parser import *
from sa_pre_processing import *
from statistic_functions import *
from sa_sentiment_analysis import *
import numpy as np

def main():
	# Eine Test-Änderung
	reload(sys)
	sys.setdefaultencoding('utf8')
	tcc = Test_Corpus_Creator()
	tcc.initSpeechesOfSingleCorpus("less-Nathan_der_Weise_s.xml")	

# Class to create a Test-Corpus for Evaluation Purposes
class Test_Corpus_Creator:

	def __init__(self):
		self._testCorpusSpeeches = []
		
		self._speechesCorpus = []
		self._speechesCorpusPerDrama = []
		self._filteredSpeechesCorpus = []
		self._filteredSpeechesCorpusPerDrama = []
		self._partsPerDrama = [200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		self._testCorpusSizeFactor = 1
		#self._partsPerDrama = [3, 10, 14, 7, 6, 6, 5, 10, 12, 10, 14, 3]
		#self._testCorpusSizeFactor = 2

	def initSpeechesOfSingleCorpus(self, dramaFileName):
		dramas = []
		path = "../Lessing-Dramen/"

		#Processor should basically not matter		
		dpp = Drama_Pre_Processing("textblob")
		dramaModel = dpp.preProcess(path + dramaFileName)
		dramaTitle = dramaModel._title
		print(path+dramaFileName)
		speechesPerDrama = []
		filteredSpeechesPerDrama = []

		for act in  dramaModel._acts:
			actNumber = act._number
			for conf in act._configurations:
				confNumber = conf._number
				confLength = len(conf._speeches)
				i = 0
				while (i < confLength):
					previousSpeech = None
					nextSpeech = None
					if((i-1) >= 0):
						previousSpeech = conf._speeches[i-1]

					currentSpeech = conf._speeches[i]
					speechLength = conf._speeches[i]._lengthInWords
					
					if((i+1) < confLength):
						nextSpeech = conf._speeches[i+1]

					tcSpeech = Test_Corpus_Speech(currentSpeech, previousSpeech, nextSpeech, dramaTitle, actNumber, confNumber, i+1)
					tcSpeech._id = i+1
					tcSpeech.setPositionInfo()
					speechesPerDrama.append(tcSpeech)
					i = i + 1

		print len(speechesPerDrama)
		orderedRandomSpeeches = self.constructOrderedRandomSpeechCorpus(speechesPerDrama, 200)
		self.createTxtOutputForCorpus("Nathan_Repliken.txt", orderedRandomSpeeches)
		self._speechesCorpus = orderedRandomSpeeches
		print(len(orderedRandomSpeeches))
		#self._speechesCorpus = speechesPerDrama
		metrics = self.printMetrics()
		"""
		upAvg = metrics["average"] + 1
		downAvg = metrics["average"] - 1
		med = metrics["median"]
		"""

	def printMetrics(self):
		lengths = []
		metrics = {}
		for corpusSpeech in self._speechesCorpus:
			lengths.append(corpusSpeech._speech._lengthInWords)
		avg = average(lengths)
		med = median(lengths)
		maximum = custom_max(lengths)
		minimun = custom_min(lengths)
		variance = np.var(lengths)
		sd = np.std(lengths)
		print "Average:"
		print avg
		metrics["average"] = avg
		print "Median:"
		print med
		metrics["median"] = med
		print "Maximum"
		print maximum
		print "Minimum"
		print minimun
		print "Variance"
		print variance
		print "Standard Deviation"
		metrics["sd"] = sd
		print sd
		return metrics

	def constructOrderedRandomSpeechCorpus(self, corpusSpeeches, numberOfSpeeches):
		usedNumbers = []
		i = 0
		orderedRandomSpeeches = []
		while(i < numberOfSpeeches):
			i = i + 1
			randomNumber = random.randint(0, len(corpusSpeeches)-1)
			while(randomNumber in usedNumbers):
				randomNumber = random.randint(0, len(corpusSpeeches)-1)
			#print randomNumber
			usedNumbers.append(randomNumber)
		usedNumbers.sort()
		for number in usedNumbers:
			print number
			orderedRandomSpeeches.append(corpusSpeeches[number])
		#print "###"
		#print len(usedNumbers)
		#print len(set(usedNumbers))
		return orderedRandomSpeeches

	def getAverageSpeechLengthOfCorpus(self):
		lengths = []
		for corpusSpeech in self._speechesCorpus:
			lengths.append(corpusSpeech._speech._lengthInWords)
		average = (float(sum(lengths)))/(float(len(lengths)))
		return average

	def getRandomSpeeches(self):
		randomNumber = random.randint(0, (len(self._filteredSpeechesCorpus)-1))
		testCorpusSpeech = self._filteredSpeechesCorpus[randomNumber]
		text = self.generateSpeechText(testCorpusSpeech)
		print text

	def createTxtOutputForCorpus(self, path, corpusSpeeches):
		outputFile = open(path, "w")
		text = ""
		i = 0
		for corpusSpeech in corpusSpeeches:
			text = text + self.generateSpeechText(corpusSpeech)
			text = text + "--------------------\n"
			if(i == 99):
				text = text + "###\n"
			i = i + 1
		outputFile.write(text)
		outputFile.close()

	def readAndInitTestCorpusFromPickle(self,path):
		self._testCorpusSpeeches = pickle.load(open(path, "rb"))

	def createNewTestCorpus(self):
		self.initSpeechesCorpus()
		self.setTestCorpus()
		print(len(self._speechesCorpus))
		#self.shuffleTestCorpus()
		self.setIdsAndPositionInfoOfTestCorpus()

	def saveTestCorpusAsPickle(self, path):
		pickle.dump(self._testCorpusSpeeches, open(path, "wb" ))
	
	def saveTestCorpusWithLanguageInfoAsPickle(self, path):
		processors = ["treetagger", "textblob"]
		for processor in processors:
			self.attachLanguageInfoToTestCorpus(processor)
			self.saveTestCorpusAsPickle(path + "_" + processor +".p")

	def attachLanguageInfoToTestCorpus(self, processor):
		lp = Language_Processor(processor)
		languageProcessor = lp._processor
		for corpusSpeech in self._testCorpusSpeeches:
			languageProcessor.processText(corpusSpeech._speech._text)
			lemmaInformation = languageProcessor._lemmasWithLanguageInfo
			corpusSpeech._speech._textAsLanguageInfo = lemmaInformation
			"""
			if(len(lemmaInformation) != corpusSpeech._speech._lengthInWords):
				print ("###")
				print str(len(lemmaInformation))
				print corpusSpeech._speech._lengthInWords
				print corpusSpeech._id
			"""

	def createTxtOutputForTestCorpus(self, path):
		outputFile = open(path, "w")
		text = ""
		i = 0
		for corpusSpeech in self._testCorpusSpeeches:
			text = text + self.generateSpeechText(corpusSpeech)
			text = text + "--------------------\n"
			if(i == 99):
				text = text + "###\n"
			i = i + 1
		outputFile.write(text)
		outputFile.close()

	def shuffleTestCorpus(self):
		random.shuffle(self._testCorpusSpeeches)
	
	def setIdsAndPositionInfoOfTestCorpus(self):
		i = 1
		for corpusSpeech in self._testCorpusSpeeches:
			corpusSpeech._id = i
			i = i + 1
			corpusSpeech.setPositionInfo()

	def generateSpeechText(self, testCorpusSpeech):
		text = testCorpusSpeech._dramaTitle + " " + testCorpusSpeech._positionInfo + "\n"
		if(testCorpusSpeech._previousSpeech is not None):
			previousSpeech = testCorpusSpeech._previousSpeech._speaker + ":\n" + testCorpusSpeech._previousSpeech._text.strip() + "\n"
		else:
			previousSpeech = "Keine direkte VorgÄnger-Replik vorhanden. - Anfang der Szene.\n".upper()
		currentSpeech = testCorpusSpeech._speech._speaker + ":\n" + testCorpusSpeech._speech._text.strip() + "\n"
		if(testCorpusSpeech._nextSpeech is not None):
			nextSpeech = testCorpusSpeech._nextSpeech._speaker + ":\n" + testCorpusSpeech._nextSpeech._text.strip() + "\n"
		else:
			nextSpeech = "Keine direkte Nachfolge-Replik vorhanden. - Ende der Szene.\n".upper()
		text = text + previousSpeech + currentSpeech + nextSpeech
		return text

	def switchSpecificSpeechesOfTestCorpusByDramaNumber(self, dramaNumber, testCorpusSpeeches):
		self.initSpeechesCorpus()
		self._testCorpusSpeeches = testCorpusSpeeches

		start = self.getStartAndEndSpeechByDramaNumber(dramaNumber)[0]
		end = self.getStartAndEndSpeechByDramaNumber(dramaNumber)[1]
		speechesPerDrama = self._filteredSpeechesCorpusPerDrama[dramaNumber]
		alreadyChosenNumbers = []
		print start
		print end

		while (start < end):
			randomNumber = random.randint(0, len(speechesPerDrama[1])-1)
			while (randomNumber in alreadyChosenNumbers):
				randomNumber = random.randint(0, len(speechesPerDrama[1])-1)
			alreadyChosenNumbers.append(randomNumber)
			testCorpusSpeech = speechesPerDrama[1][randomNumber]
			self._testCorpusSpeeches[start] = testCorpusSpeech
			print testCorpusSpeech._speech._text
			start = start + 1
		self.setIdsAndPositionInfoOfTestCorpus()

	def getStartAndEndSpeechByDramaNumber(self, dramaNumber):
		i = 0
		start = 0
		end = 0
		print ("DramaNumber")
		print dramaNumber
		while(i < dramaNumber):
			dramaSpeeches = self._partsPerDrama[i] * self._testCorpusSizeFactor
			start = start + dramaSpeeches

			i = i + 1	
		endDrama = self._partsPerDrama[dramaNumber] * self._testCorpusSizeFactor
		end = start + endDrama
		return (start, end)

	def setTestCorpus(self):
		dramaInPartsPerDrama = 0
		for speechesPerDrama in self._filteredSpeechesCorpusPerDrama:
			numberOfSpeeches = self._partsPerDrama[dramaInPartsPerDrama] * self._testCorpusSizeFactor
			dramaInPartsPerDrama = dramaInPartsPerDrama + 1
			i = 0
			alreadyChosenNumbers = []
			while (i < numberOfSpeeches):
				i = i + 1
				randomNumber = random.randint(0, len(speechesPerDrama[1])-1)
				while (randomNumber in alreadyChosenNumbers):
					randomNumber = random.randint(0, len(speechesPerDrama[1])-1)
				alreadyChosenNumbers.append(randomNumber)
				testCorpusSpeech = speechesPerDrama[1][randomNumber]
				self._testCorpusSpeeches.append(testCorpusSpeech)

	def getRandomSpeeches(self):
		randomNumber = random.randint(0, (len(self._filteredSpeechesCorpus)-1))
		testCorpusSpeech = self._filteredSpeechesCorpus[randomNumber]
		text = self.generateSpeechText(testCorpusSpeech)
		print text

	def printInfoOfTestCorpus(self):
		print(len(self._testCorpusSpeeches))
		for corpusSpeech in self._testCorpusSpeeches:
			text = self.generateSpeechText(corpusSpeech)
			print text

	def printInfoOfSingleDramas(self):	
		for speechesPerDrama in self._speechesCorpusPerDrama:
			print speechesPerDrama[0]
			print len(speechesPerDrama[1])
			print (float(float(len(speechesPerDrama[1]))/8171)*100)
			print ((float(float(len(speechesPerDrama[1]))/8171)*100))

	
	def printInfoOfFilteredSingleDramas(self):
		print(len(self._filteredSpeechesCorpus))
		for speechesPerDrama in self._filteredSpeechesCorpusPerDrama:
			print speechesPerDrama[0]
			print len(speechesPerDrama[1])
			allSpeeches = float(len(self._filteredSpeechesCorpus))
			allSpeechesPerDrama = float(len(speechesPerDrama[1]))
			print (allSpeechesPerDrama/allSpeeches)*100

	def initSpeechesCorpus(self):
		dramas = []
		path = "../Lessing-Dramen/"	

		for filename in os.listdir(path):
			#Processor should basically not matter		
			dpp = Drama_Pre_Processing("textblob")
			dramaModel = dpp.preProcess(path + filename)
			dramaTitle = dramaModel._title
			print(path+filename)
			speechesPerDrama = []
			filteredSpeechesPerDrama = []

			for act in  dramaModel._acts:
				actNumber = act._number
				for conf in act._configurations:
					confNumber = conf._number
					confLength = len(conf._speeches)
					i = 0
					while (i < confLength):
						previousSpeech = None
						nextSpeech = None
						if((i-1) >= 0):
							previousSpeech = conf._speeches[i-1]

						currentSpeech = conf._speeches[i]
						speechLength = conf._speeches[i]._lengthInWords
						
						if((i+1) < confLength):
							nextSpeech = conf._speeches[i+1]

						tcSpeech = Test_Corpus_Speech(currentSpeech, previousSpeech, nextSpeech, dramaTitle, actNumber, confNumber, i+1)
						self._speechesCorpus.append(tcSpeech)
						"""
						print("Speech")
						print(tcSpeech._previousSpeech)
						print(tcSpeech._speech)
						print(tcSpeech._nextSpeech)
						print(tcSpeech._actNumber)
						print(tcSpeech._confNumber)
						print(tcSpeech._speechNumberInConf)
						"""

						speechesPerDrama.append(tcSpeech)
						if(previousSpeech is not None and nextSpeech is not None and speechLength > 18):
							self._filteredSpeechesCorpus.append(tcSpeech)
							filteredSpeechesPerDrama.append(tcSpeech)
						i = i + 1
			titleSpeechesTuple = (dramaTitle, speechesPerDrama)
			self._speechesCorpusPerDrama.append(titleSpeechesTuple)
			titleFilteredSpeechesTuple = (dramaTitle, filteredSpeechesPerDrama)
			self._filteredSpeechesCorpusPerDrama.append(titleFilteredSpeechesTuple)

	def getSpecificCorpusSpeechByDramaAndNumber(self, drama, number, ID):
		
		dramaSpeeches = []
		for speeches in self._speechesCorpusPerDrama:
			if(speeches[0] == drama):
				dramaSpeeches = speeches[1]
		speech = [x for x in dramaSpeeches if x._speech._subsequentNumber == number]
		newSpeech = speech[0]
		newSpeech._id = ID
		newSpeech.setPositionInfo()
		return newSpeech

class Test_Corpus_Speech:

	def __init__(self, speech, previousSpeech, nextSpeech, dramaTitle, actNumber, confNumber, speechNumberInConf):
		self._speech = speech
		self._previousSpeech = previousSpeech
		self._nextSpeech = nextSpeech
		self._dramaTitle = dramaTitle

		self._actNumber = actNumber
		self._confNumber = confNumber
		self._speechNumberInConf = speechNumberInConf
		
		self._positionInfo = ""
		self._id = -1
		#self.setPositionInfo()

	def setPositionInfo(self):
		self._positionInfo = str(self._actNumber) + ".Akt, " + str(self._confNumber) + \
		".Szene, " + str(self._speechNumberInConf) + ".Replik" + ", Drama-Nummer: " + str(self._speech._subsequentNumber) + \
		", ID:" + str(self._id)

class Test_Corpus_Handler:
	def __init__(self):
		self._testCorpusSpeeches = []

		self._average = -1
		self._median = -1
		self._max = -1
		self._min = -1

	def readAndInitTestCorpusFromPickle(self,path):
		self._testCorpusSpeeches = pickle.load(open(path, "rb"))

	def writeInfoPerLine(self):
		outputFile = open("../Evaluation/Test-Korpus/test-corpus-infoLines", "w")
		for corpusSpeech in self._testCorpusSpeeches:
			info = [corpusSpeech._id, corpusSpeech._dramaTitle,\
			corpusSpeech._actNumber, corpusSpeech._confNumber,\
			corpusSpeech._speech._numberInAct, corpusSpeech._speech._numberInConf,\
			corpusSpeech._speech._subsequentNumber,corpusSpeech._speech._speaker,\
			corpusSpeech._speech._lengthInWords]
			infoString = ("\t").join(str(x) for x in info)
			outputFile.write(infoString + "\n")
		outputFile.close()

	def writeLengths(self, path):
		wordLengths = []
		for corpusSpeech in self._testCorpusSpeeches:
			wordLengths.append(corpusSpeech._speech._lengthInWords)
		outputFile = open(path, "w")
		wordLengths.sort()
		for length in wordLengths:
			outputFile.write(str(length) + "\n")
		outputFile.close()

	def saveTestCorpusAsPickle(self, path):
		pickle.dump(self._testCorpusSpeeches, open(path, "wb" ))

	def calcTestCorpusMetrics(self):
		wordLengths = []
		for corpusSpeech in self._testCorpusSpeeches:
			wordLengths.append(corpusSpeech._speech._lengthInWords)
		self._average = average(wordLengths)
		self._median = median(wordLengths)
		self._min = custom_min(wordLengths)
		self._max = custom_max(wordLengths)

		print(self._average)
		print(self._median)
		print(self._min)
		print(self._max)


if __name__ == "__main__":
    main()