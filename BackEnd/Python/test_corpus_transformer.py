#coding: utf8

import os
import re
import collections
import locale
import sys
from evaluation_test_corpus_creation import *

def main():
	reload(sys)
	sys.setdefaultencoding('utf8')
	tct = Test_Corpus_Transformer()
	tct.readAndInitTestCorpusHandler("test")
	tct.printTable()

# Class to create a Test-Corpus for Evaluation Purposes
class Test_Corpus_Transformer:

	def __init__(self):
		self._tch = None

	def readAndInitTestCorpusHandler(self,path):
		self._tch = Test_Corpus_Handler()
		self._tch.readAndInitTestCorpusFromPickle("Dumps/testCorpus_treetagger.p")

	def createHeader(self):
		columns = []
		columns.append("ID")
		columns.append("Dramen_Titel")
		columns.append("Position_im_Drama")
		columns.append("Vorherige_Replik")
		columns.append("Bewertete_Replik")
		columns.append("Nachfolgende_Replik")
		columns.append("Mehrheitsbewertung_Polarität_dichotom")
		columns.append("Annotation1_Polarität_dichotom")
		columns.append("Annotation2_Polarität_dichotom")
		columns.append("Annotation3_Polarität_dichotom")
		columns.append("Annotation4_Polarität_dichotom")
		columns.append("Annotation5_Polarität_dichotom")
		columns.append("Mehrheitsbewertung_Polarität_sechsstufig")
		columns.append("Annotation1_Polarität_sechsstufig")
		columns.append("Annotation2_Polarität_sechsstufig")
		columns.append("Annotation3_Polarität_sechsstufig")
		columns.append("Annotation4_Polarität_sechsstufig")
		columns.append("Annotation5_Polarität_sechsstufig")
		emotions = ["Zorn", "Erwartung", "Ekel", "Angst", "Freude", "Traurigkeit", "Überraschung", "Vertrauen"]
		i = 1;

		for emotion in emotions:
			i = 1;
			while(i < 6):
				annotator = "Annotation" + str(i) + "_" + emotion
				columns.append(annotator)
				i = i + 1

		return columns

	def printTable(self):
		headerColumns = self.createHeader()
		header = "\t".join(headerColumns)
		print header

		contentColumns = []
		contentRows = []

		dichotomPolarities = self.getDichotomPolarity("../Evaluation/Test-Korpus-Evaluation/Benchmark-Daten/Polaritaet_dichotom.txt")
		annotatorPolarities = self.getAnnotatorPolarities("../Agreement-Daten/polaritaet_dichotom.txt")
		fullPolarities = self.getFullPolarities("../Agreement-Daten/Majorities/polaritaet_standard_mehrheiten.txt")
		fullPolaritiesPerAnnotator = self.getFullPolaritiesPerAnnotator("../Agreement-Daten/polaritaet_standard.txt")
		emotionAnnotations = self.getAllEmotionPolaritiesPerAnnotator()

		i = 0
		for tc_speech in self._tch._testCorpusSpeeches:
			contentRow = []
			contentRow.append(str(tc_speech._id))
			contentRow.append(tc_speech._dramaTitle)
			contentRow.append(tc_speech._positionInfo)
			
			previousSpeech = '"' + tc_speech._previousSpeech._speaker + ":\n" + tc_speech._previousSpeech._text + '"'
			speechToRate = '"' + tc_speech._speech._speaker + ":\n" + tc_speech._speech._text + '"'
			nextSpeech = '"' + tc_speech._nextSpeech._speaker + ":\n" + tc_speech._nextSpeech._text + '"'
			contentRow.append(previousSpeech)
			contentRow.append(speechToRate)
			contentRow.append(nextSpeech)
			
			contentRow.append(dichotomPolarities[i])
			contentRow.append(annotatorPolarities[i])
			contentRow.append(fullPolarities[i])
			contentRow.append(fullPolaritiesPerAnnotator[i])
			contentRow.append(emotionAnnotations[i])

		
			tabSeperatedContentRow = "\t".join(contentRow)
			contentRows.append(tabSeperatedContentRow)
			print tabSeperatedContentRow
			i = i + 1

	def getAllEmotionPolaritiesPerAnnotator(self):
		emotions = ["zorn", "erwartung", "ekel", "angst", "freude", "traurigkeit", "ueberraschung", "vertrauen"]
		emotionAnns = []

		currentLineNumber = 0
		emotionLines = []
		
		while(currentLineNumber < 200):
			currentLineEmotions = []
			for emotion in emotions:
				
				data = open("../Agreement-Daten/" + emotion + ".txt")
				lines = data.readlines()

				currentLine = lines[currentLineNumber]
				emoNumber = currentLine.split("\t")
				for number in emoNumber:
					if ("0" in number):
						currentLineEmotions.append("nicht_vorhanden")
					elif("1" in number):
						currentLineEmotions.append("vorhanden")

			currentLineEmotions = "\t".join(currentLineEmotions)
			emotionLines.append(currentLineEmotions)
			currentLineNumber = currentLineNumber + 1
		return emotionLines

	def getAnnotatorPolarities(self, path):
		data = open(path)
		lines = data.readlines()
		anns = []
		for line in lines:
			numberAnns = line.split("\t")
			wordsAnns = []
			for number in numberAnns:
				if("1" in number):
					wordsAnns.append("negativ")
				elif("2" in number):
					wordsAnns.append("positiv")
			tabWordsAnns = "\t".join(wordsAnns)
			anns.append(tabWordsAnns)
		return anns

	def getFullPolaritiesPerAnnotator(self, path):
		data = open(path)
		lines = data.readlines()
		anns = []
		
		for line in lines:
			numberAnns = line.split("\t")
			wordsAnns = []
			for number in numberAnns:
				if("1" in number):
					wordsAnns.append("sehr_negativ")
				elif("2" in number):
					wordsAnns.append("negativ")
				elif("3" in number):
					wordsAnns.append("neutral")
				elif("4" in number):
					wordsAnns.append("gemischt")
				elif("5" in number):
					wordsAnns.append("positiv")
				elif("6" in number):
					wordsAnns.append("sehr_positiv")
			
			tabWordsAnns = "\t".join(wordsAnns)
			anns.append(tabWordsAnns)
		return anns


	def getDichotomPolarity(self, path):
		data = open(path)
		lines = data.readlines()
		dichotomPolarities = []

		for line in lines:
			if("1" in line):
				dichotomPolarities.append("negativ")
			elif("2" in line):
				dichotomPolarities.append("positiv")
		return dichotomPolarities

	def getFullPolarities(self, path):
		data = open(path)
		lines = data.readlines()
		fullPolarities = []

		for line in lines:
			if ("-" in line):
				fullPolarities.append("keine_Mehrheit")
			elif("1" in line):
				fullPolarities.append("sehr_negativ")
			elif("2" in line):
				fullPolarities.append("negativ")
			elif("3" in line):
				fullPolarities.append("neutral")
			elif("4" in line):
				fullPolarities.append("gemischt")
			elif("5" in line):
				fullPolarities.append("positiv")
			elif("6" in line):
				fullPolarities.append("sehr_positiv")
		return fullPolarities

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

if __name__ == "__main__":
    main()