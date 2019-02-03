#coding: utf8

import os
import re
import collections
import locale
import sys
from lexicon_handler import *

def main():
	reload(sys)
	sys.setdefaultencoding('utf8')

# Class to perform Vocabulary-based Evaluation
class Evaluation_LexiconVsVocabulary:

	def __init__(self):
		self._placeholder = ""
		self._vocabulary = None

		self._lexiconName = ""
		self._lexicon = {}
		self._lexiconLemmas = {}

		self._vocabulary = None
		self._processor = ""
	
	def init(self, vocPath, lexiconName, processor):
		self._vocabulary = self.readVocabulary(vocPath)
		self.setLexicon(lexiconName, processor)

	def setLexicon(self, lexiconName, processor):
		lexiconHandler = Lexicon_Handler()
		lexiconHandler.initSingleDict(lexiconName, processor)

		self._lexiconName = unicode(lexiconName)
		self._processor = unicode(processor)
		self._lexicon = lexiconHandler._sentimentDict
		self._lexiconLemmas = lexiconHandler._sentimentDictLemmas

	def evaluateLexicon(self, lexicon):
		processors = ["treetagger", "textblob"]
		for processor in processors:
			print processor + " " + lexicon
			#First evaluation against token-vocs with stopwords
			resultsVsTokens = self.evaluateLexiconTokensAndLemmasVsMultipleVocabularies("../Word-Frequencies/WithStopwords/Tokens/" \
				+ processor + "/", lexicon, processor, True)
			# then evaluation against lemmma-vocs with stopwords
			resultsVsLemmas = self.evaluateLexiconTokensAndLemmasVsMultipleVocabularies("../Word-Frequencies/WithStopwords/Lemmas/" + processor + "/" \
				, lexicon, processor, True)

			#First evaluation against token-vocs without stopwords
			resultsVsTokens = self.evaluateLexiconTokensAndLemmasVsMultipleVocabularies("../Word-Frequencies/WithoutStopwords/Tokens/" + processor + "/" \
				, lexicon, processor, False)
			# then evaluation against lemmma-vocs without stopwords
			resultsVsLemmas = self.evaluateLexiconTokensAndLemmasVsMultipleVocabularies("../Word-Frequencies/WithoutStopwords/Lemmas/" + processor + "/" \
				, lexicon, processor, False)



	def evaluateAll(self):
		processors = ["textblob"]
		lexicons = ["Combined-DTAExtended"]
		for processor in processors:
			for lexicon in lexicons:
				print processor + " " + lexicon
				#First evaluation against token-vocs with stopwords
				resultsVsTokens = self.evaluateLexiconTokensAndLemmasVsMultipleVocabularies("../Word-Frequencies/WithStopwords/Tokens/" \
					+ processor + "/", lexicon, processor, True)
				# then evaluation against lemmma-vocs with stopwords
				resultsVsLemmas = self.evaluateLexiconTokensAndLemmasVsMultipleVocabularies("../Word-Frequencies/WithStopwords/Lemmas/" + processor + "/" \
					, lexicon, processor, True)

				#First evaluation against token-vocs without stopwords
				resultsVsTokens = self.evaluateLexiconTokensAndLemmasVsMultipleVocabularies("../Word-Frequencies/WithoutStopwords/Tokens/" + processor + "/" \
					, lexicon, processor, False)
				# then evaluation against lemmma-vocs without stopwords
				resultsVsLemmas = self.evaluateLexiconTokensAndLemmasVsMultipleVocabularies("../Word-Frequencies/WithoutStopwords/Lemmas/" + processor + "/" \
					, lexicon, processor, False)
				

	def evaluateLexiconTokensAndLemmasVsMultipleVocabularies(self, vocFolder, lexiconName, processor, withStopwords):
		print vocFolder
		for filename in os.listdir(vocFolder):
			vocPath = vocFolder + filename
			self.init(vocPath, lexiconName, processor)
			results = self.evaluateLexiconTokensAndLemmasVsVocabulary()
			stopwordPath = ""

			if(withStopwords):
				stopwordPath = "WithStopwords"
			else:
				stopwordPath = "WithoutStopwords"

			outputPath = "../Evaluation/Vocabulary-Evaluation/" + lexiconName + "/" + stopwordPath + "/" + processor + "/"
			crossFolder1 = "TokensLexiconVS" + self._vocabulary._type + "Vocabulary/"
			crossFolder2 = "LemmasLexiconVS" + self._vocabulary._type + "Vocabulary/"
			name1 = lexiconName + "-TokensVS-" + self._vocabulary._name + "-" + self._vocabulary._type
			name2 = lexiconName + "-LemmasVS-" + self._vocabulary._name + "-" + self._vocabulary._type

			outputPathTokens = outputPath + crossFolder1 + name1 + ".txt"
			outputPathLemmas = outputPath + crossFolder2 + name2 + ".txt"
			outputPathFolderTokens = outputPath + crossFolder1
			outputPathFolderLemmas = outputPath + crossFolder2

			self.writeResultOutput(outputPathTokens, results[0])
			self.writeResultOutput(outputPathLemmas, results[1])

			#return (results[0], results[1])

	def writeResultTable(self, outputFolder, results):
		print("TODO");
	
	def evaluateLexiconTokensAndLemmasVsVocabulary(self):
		results = []
		results.append(self.evaluateLexiconTokensVsVocabulary())
		results.append(self.evaluateLexiconLemmasVsVocabulary())
		return results

	def evaluateLexiconLemmasVsVocabulary(self):
		result = self.evaluateLexiconVsVocabulary(self._lexiconLemmas, "Lemmas")
		return result

	def evaluateLexiconTokensVsVocabulary(self):
		result = self.evaluateLexiconVsVocabulary(self._lexicon, "Tokens")
		return result
	
	def evaluateLexiconVsVocabulary(self, lexicon, lemmasOrTokens):
		recognized = self.getRecognizedWordsOfVocabulary(lexicon)
		recognizedPercentage = self.getRecognizedPercentage(recognized, self._vocabulary._words)
		relativeInfo = self.getRelativeRecognizedPercentage(recognized, \
			self._vocabulary._wordsWithInformationDict, self._vocabulary._absoluteLength)
		relativeRecognizedFrequency = relativeInfo[0]
		relativeRecognizedPercentage = relativeInfo[1]
		#print(relativeRecognizedPercentage)
		
		result = Evaluation_Result_Vocabulary()
		result._nameOfLexicon = self._lexiconName
		result._lexicon = lexicon
		result._lemmasOrTokens = lemmasOrTokens
		result._recognized = recognized
		result._relativeRecognizedFrequency = relativeRecognizedFrequency
		result._recognizedPercentage = recognizedPercentage
		result._relativeRecognizedPercentage = relativeRecognizedPercentage

		return result

	def getRecognizedWordsOfVocabulary(self, lexicon):
		words = self._vocabulary._words
		recognized = self.getRecognizedWords(lexicon, self._vocabulary._words)
		return recognized

	def getRecognizedWords(self, lexicon, vocabularyList):
		recognized = []
		for word in vocabularyList:
			if(word in lexicon):
				recognized.append(word)
			else:
				upperWord = word[:1].upper() + word[1:]
				lowerWord = word.lower()
				if(upperWord in lexicon or lowerWord in lexicon):
					#print word
					recognized.append(word)

		return recognized

	def getRecognizedPercentage(self, recognized, vocabularyList):

		return (float(float(len(recognized))/float(len(vocabularyList))))

	def getRelativeRecognizedPercentage(self, recognized, wordsWithInformation, absoluteLength):
		recognizedFrequency = 0
		for recWord in recognized:
			upperWord = recWord[:1].upper() + recWord[1:]
			lowerWord = recWord.lower()
			if recWord in wordsWithInformation:
				keyWord = recWord
			elif upperWord in wordsWithInformation:
				keyWord = upperWord
			elif lowerWord in wordsWithInformation:
				keyWord = lowerWord
			#print keyWord
			#print int(wordsWithInformation[keyWord][1])
			if(self._vocabulary._type == "Tokens"):
				recognizedFrequency = recognizedFrequency + int(wordsWithInformation[keyWord][0])
			elif(self._vocabulary._type == "Lemmas"):
				recognizedFrequency = recognizedFrequency + int(wordsWithInformation[keyWord][1])
			#print recognizedFrequency
		relativeInfo = (recognizedFrequency, (float(recognizedFrequency)/float(absoluteLength)))
		return relativeInfo

	def readVocabulary(self, path):
		vocabulary = Vocabulary(path)

		return vocabulary

	
	def writeResultOutput(self, path, result):
		
		outputFile = open(path, 'w')

		outputFile.write(result._nameOfLexicon + " " + result._lemmasOrTokens + " IN " \
			+ self._vocabulary._name + " " + self._vocabulary._type + " " + self._vocabulary._withStopwords)
		outputFile.write("\n\n")
		outputFile.write("Length of Lexicon: " + str(len(result._lexicon)))
		outputFile.write("\nLength of Vocabulary (Different Words): " + str(len(self._vocabulary._words)))
		outputFile.write("\nRecognized Words (Different Words): " + str(len(result._recognized)))
		outputFile.write("\nRecognized Percentage (Different Words): " + str(result._recognizedPercentage))
		outputFile.write("\nLength of Vocabulary (All Words): " + str(self._vocabulary._absoluteLength))
		outputFile.write("\nRecognized Words (All Words): " + str(result._relativeRecognizedFrequency))
		outputFile.write("\nRecognized Percentage (All Words): " + str(result._relativeRecognizedPercentage))

		outputFile.write("\n\nRecognized Words:\n\n")
		for word in result._recognized:
			outputFile.write(word + "\n")

		outputFile.close

	def test(self, sentimentDict):

		caseDoubleWords = []

		for word in sentimentDict:
			upperWord = word[:1].upper() + word[1:]
			lowerWord = word.lower()
			if(upperWord in sentimentDict and lowerWord in sentimentDict):
				caseDoubleWords.append(word)

class Vocabulary:

	def __init__(self, path):
		self._name = ""
		self._type = ""
		self._withStopwords = ""

		self._wordsWithInformationDict = {}
		self._words = []
		self._absoluteLength = 0

		self.init(path)

	def init(self, path):
		vocabularyFile = open(path, 'r')
		pathParts = path.split("/")
		lines = vocabularyFile.readlines()[5:]

		self._name = unicode(path.split("/")[-1].replace(".txt", "").decode("cp1252"))
		self._type = path.split("/")[-3]
		self._withStopwords = path.split("/")[-4]

		for line in lines:
			wordsWithInformation = line.split("\t")
			word = unicode(wordsWithInformation[0])
			wordsWithInformation.pop(0)
			if(self._type == "Tokens"):
				wordFrequency = int(wordsWithInformation[0])
				self._absoluteLength = self._absoluteLength + wordFrequency
			elif(self._type == "Lemmas"):
				wordFrequency = int(wordsWithInformation[1])
				self._absoluteLength = self._absoluteLength + wordFrequency

			self._wordsWithInformationDict[word] = wordsWithInformation
			self._words.append(word)

class Evaluation_Result_Vocabulary:

	def __init__(self):
		self._nameOfLexicon = ""
		self._lemmasOrTokens = ""
		self._lexicon = {}

		self._recognizedWords = None
		self._recognizedPercentage = 0.0
		self._relativeRecognizedFrequency = 0
		self._relativeRecognizedPercentage = 0.0

if __name__ == "__main__":
    main()