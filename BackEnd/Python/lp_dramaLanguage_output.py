#coding: utf8

import os
import re
import collections
import locale
import sys
from lp_language_processor import *

def main():
	reload(sys)
	sys.setdefaultencoding('utf8')

# Main-Class to generate Vocabulary-Output for Vocabulary-Evaluation
class DramaLanguage_Output:

	def __init__(self):
		self._lp = None

		#self.setLanguageProcessor(processor)

	def setLanguageProcessor(self, processor):
		lp = Language_Processor(processor)
		self._lp = lp._processor

	def generateOutputForEverything(self, withStopwords):
		self.generateOutputForAllDramas(withStopwords)
		self.generateEntireCorpusOutput(withStopwords)

	# Generates All Evaluation Metrics
	def generateOutputForAllDramas(self, withStopwords, stopWordList):
		processors = ["treetagger", "textblob"]
		for processor in processors:
			inBetweenFolder = ""
			if(withStopwords):
				inBetweenFolder = "WithStopwords"
			else:
				inBetweenFolder = "WithoutStopwords"
			self.setLanguageProcessor(processor)
			self.processMultipleDramasAndGenerateOutputTokens("../Lessing-Dramen/", "../Word-Frequencies/" \
				+ inBetweenFolder + "/Tokens/" + processor + "/", withStopwords, stopWordList)
			self.processMultipleDramasAndGenerateOutputLemmas("../Lessing-Dramen/", "../Word-Frequencies/" \
				+ inBetweenFolder + "/Lemmas/" + processor + "/", withStopwords, stopWordList)

	def generateWordFrequenciesOutputTokens(self, inputPath, outputPath, withStopwords, stopWordList):
		self._lp.processSingleDramaTokens(inputPath)
		tokens = []
		if(withStopwords):
			wordFrequencies = self.calcWordFrequencies(self._lp._tokens)
			tokens = self._lp._tokens
		else:
			self._lp.removeStopwordsFromTokens(stopWordList)
			wordFrequencies = self.calcWordFrequencies(self._lp._tokensWithoutStopwords)
			tokens = self._lp._tokensWithoutStopwords

		outputFile = open(outputPath + ".txt", "w")
		self.writeOutputTokens(outputFile, wordFrequencies, tokens)
		
		outputFile.close()
		print("Output ready...")

	def writeOutputTokens(self, outputFile, wordFrequencies, tokens):
		outputFile.write("Title: " + self._lp._currentDramaName + "\n")
		outputFile.write("Number of all tokens: " + str(len(tokens)) + "\n")
		outputFile.write("Nummber of different tokens: " + str(len(wordFrequencies)) + "\n\n")

		outputFile.write("Token" +"\t" + "Frequency" + "\n")
		for frequ in wordFrequencies:
			token = frequ[0]
			#outputFile.write(token + "\n")
			outputFile.write(token + "\t" + str(frequ[1]) + "\n")
		return outputFile

	def generateWordFrequenciesOutputLemmas(self, inputPath, outputPath, withStopwords, stopWordList):
		self._lp.processSingleDrama(inputPath)
		lemmas = []
		if(withStopwords):
			wordFrequencies = self.calcWordFrequencies(self._lp._lemmas)
			lemmas = self._lp._lemmas
		else:
			self._lp.removeStopWordsFromLemmas(stopWordList)
			wordFrequencies = self.calcWordFrequencies(self._lp._lemmasWithoutStopwords)
			lemmas = self._lp._lemmasWithoutStopwords

		outputFile = open(outputPath + ".txt", "w")
		self.writeOutputLemmas(outputFile, wordFrequencies, lemmas)
		outputFile.close()
		print("Output ready...")

	def writeOutputLemmas(self, outputFile, wordFrequencies, lemmas):
		outputFile.write("Title: " + self._lp._currentDramaName + "\n") 
		outputFile.write("Number of all lemmas: " + str(len(lemmas)) + "\n")
		outputFile.write("Nummber of different lemmas: " + str(len(wordFrequencies)) + "\n\n")

		outputFile.write("Lemma" + "\t" + "POS" + "\t" + "Frequency" + "\t" + "Tokens" +"\n")
		for frequ in wordFrequencies:
			lemma = frequ[0]
			POS = self._lp._lemmasAndPOSAndTokensDict[lemma][0]
			tokens = self._lp._lemmasAndPOSAndTokensDict[lemma][1]
			outputFile.write(str(lemma) + "\t" + ', '.join(POS) + "\t" + str(frequ[1]) + "\t" + ', '.join(tokens) + "\n")
		return outputFile

	def processMultipleDramasAndGenerateOutputTokens(self, originpath, resultpath, withStopwords, stopWordList):
		parser = DramaParser()

		for filename in os.listdir(originpath):
			print(filename + " processing starts...")
			dramaModel = parser.parse_xml(originpath + filename)
			print("DramaModel ready...")
			title = dramaModel._title
			self.generateWordFrequenciesOutputTokens(originpath + filename, resultpath + title, withStopwords, stopWordList)

	def processMultipleDramasAndGenerateOutputLemmas(self, originpath, resultpath, withStopwords, stopWordList):
		parser = DramaParser()

		for filename in os.listdir(originpath):
			print(filename + " processing starts...")
			dramaModel = parser.parse_xml(originpath + filename)
			print("DramaModel ready...")
			title = dramaModel._title
			self.generateWordFrequenciesOutputLemmas(originpath + filename, resultpath + title, withStopwords, stopWordList)

	def generateEntireCorpusOutput(self, withStopwords, stopWordList):
		originpath = "../Lessing-Dramen/"
		inBetweenFolder = ""
		if(withStopwords):
			inBetweenFolder = "WithStopwords"
		else:
			inBetweenFolder = "WithoutStopwords"
		self.setLanguageProcessor("treetagger")
		self.processEntireCorpusAndGenerateOutputTokens(originpath, "../Word-Frequencies/" +\
		 inBetweenFolder + "/Tokens/treetagger/EntireCorpus.txt", withStopwords, stopWordList)
		self.processEntireCorpusAndGenerateOutputLemmas(originpath, "../Word-Frequencies/" + \
			inBetweenFolder + "/Lemmas/treetagger/EntireCorpus.txt", withStopwords, stopWordList)

		self.setLanguageProcessor("textblob")
		self.processEntireCorpusAndGenerateOutputTokens(originpath, "../Word-Frequencies/" \
			+ inBetweenFolder + "/Tokens/textblob/EntireCorpus.txt", withStopwords, stopWordList)
		self.processEntireCorpusAndGenerateOutputLemmas(originpath, "../Word-Frequencies/" + \
			inBetweenFolder + "/Lemmas/textblob/EntireCorpus.txt", withStopwords, stopWordList)


	def processEntireCorpusAndGenerateOutputTokens(self, originpath, outputPath, withStopwords, stopWordList):
		totalText = self.getEntireCorpus(originpath)
		self._lp.processTextTokens(totalText)
		tokens = []
		
		self._lp._currentDramaName = "EntireCorpus-Tokens"
		if(withStopwords):
			wordFrequencies = self.calcWordFrequencies(self._lp._tokens)
			tokens = self._lp._tokens
		else:
			self._lp.removeStopwordsFromTokens(stopWordList)
			wordFrequencies = self.calcWordFrequencies(self._lp._tokensWithoutStopwords)
			tokens = self._lp._tokensWithoutStopwords

		outputFile = open(outputPath, "w")
		self.writeOutputTokens(outputFile, wordFrequencies, tokens)
		
		outputFile.close()
		print("Output ready...")

	def processEntireCorpusAndGenerateOutputLemmas(self, originpath, outputPath, withStopwords, stopWordList):
		totalText = self.getEntireCorpus(originpath)
		self._lp.processTextFully(totalText)
		self._lp._currentDramaName = "EntireCorpus-Lemmas"
		lemmas = []
		if(withStopwords):
			wordFrequencies = self.calcWordFrequencies(self._lp._lemmas)
			lemmas = self._lp._lemmas
		else:
			self._lp.removeStopWordsFromLemmas(stopWordList)
			wordFrequencies = self.calcWordFrequencies(self._lp._lemmasWithoutStopwords)
			lemmas = self._lp._lemmasWithoutStopwords

		outputFile = open(outputPath, "w")
		self.writeOutputLemmas(outputFile, wordFrequencies, lemmas)
		
		outputFile.close()
		print("Output ready...")

	def getEntireCorpus(self, originpath):
		parser = DramaParser()
		totalText = "";
		for filename in os.listdir(originpath):
			print(filename + " processing starts...")
			dramaModel = parser.parse_xml(originpath + filename)
			
			for act in dramaModel._acts:
				for conf in act._configurations:
					for speech in conf._speeches:
						newText = unicode(speech._text.replace("–", ""))
						totalText = totalText + newText
		return totalText

	def calcWordFrequencies(self, wordList):
		fdist = FreqDist(wordList)
		frequencies = fdist.most_common()
		return frequencies

	def writeStopwordsLowerAndUpper(self):
		inputFile = open("new_stopwords.txt")
		for line in inputFile:
			inputFile.write(line)

if __name__ == "__main__":
    main()