#coding: utf8

import os
from textblob_de import *
from textblob_de.lemmatizers import PatternParserLemmatizer
import sys
import nltk
from nltk import *
from drama_parser import *
from drama_output import *
from collections import defaultdict

def main():
	reload(sys)
	sys.setdefaultencoding('utf8')

	tt = Text_Blob()
	text = "Ich habe zu früh Tag gemacht. – Der Morgen ist so schön. Ich will ausfahren. Marchese Marinelli soll mich begleiten. Laßt ihn rufen."
	tt.processText(text)
	print(tt._lemmas)
	
# Class to implement text-blob and pattern lemmatization
# implements also stopword-lists
class Text_Blob:

	def __init__(self):
		
		# several attributes for language informations
		self._plainText = ""
		self._filteredText = ""
		self._textBlob = None
		self._tokens = []
		self._tokensAndPOS = []
		self._lemmas = []
		self._lemmasWithoutStopwords = []
		self._lemmasAndPOS = []
		self._lemmaAndPOSDict = {}

		self._lemmasWithLanguageInfo = []

		self._lemmasAndPOSAndTokensDict = {}

		self._stopwords = []
		self._stopwords_lemmatized = []

		self._currentDramaName = ""
		self._tokensWithoutStopwords = []

		self._stopwordLists = ["standardList", "enhancedList", "enhancedFilteredList"]

	# standard method to process and lemmatize text, info saved in attributes
	def processText(self, plainText):
		self._plainText = plainText
		self._filteredText = self.filterText(plainText)
		self._textBlob = TextBlobDE(self._filteredText)
		print("TextBlob ready...")
		self._tokens = self._textBlob.words
		print("Tokens ready...")
		self._tokensAndPOS = self._textBlob.tags
		print("Tags ready...")
		self.lemmatize()
		print("Lemmas ready...")
		print("Lemmas With LanguageInfo ready...")

	# simple method to only process until tokens
	def processTextTokens(self, plainText):
		self._plainText = plainText
		self._filteredText = self.filterText(plainText)
		self._textBlob = TextBlobDE(self._filteredText)
		print("TextBlob ready...")
		self._tokens = self._textBlob.words
		print("Tokens ready...")

	# processText with creation of extra attributes for vocabulary-analysis
	def processTextFully(self, plainText):
		self._plainText = plainText
		self._filteredText = self.filterText(plainText)
		self._textBlob = TextBlobDE(self._filteredText)
		print("TextBlob ready...")
		self._tokens = self._textBlob.words
		print("Tokens ready...")
		self._tokensAndPOS = self._textBlob.tags
		print("Tags ready...")
		self.lemmatize()
		print("Lemmas ready...")
		print("Lemmas With LanguageInfo ready...")
		self.createLemmaAndPOSDict()
		print("LemmasANDPOSDict ready...")
		self.combineLemmasPOSTokens()
		print("LemmasAndPOSAndTokensDict ready...")

	# simple get Lemma-Method for single words of a lexicon
	def getLemma(self, word):
		blob = TextBlobDE(unicode(word))
		lemmas = blob.words.lemmatize()
		if(len(lemmas) > 1):
			lemmasString = " ".join(lemmas)
			return lemmasString
		else: 
			return lemmas[0]

	def getLemmas(self, wordsAsString):
		blob = TextBlobDE(unicode(wordsAsString))
		lemmas = blob.words.lemmatize()
		return lemmas

	# filter method for words that disturb lemmatization process
	def filterText(self, text):
		newText = ""
		newText = unicode(text.replace("–", ""))
		newText = unicode(newText.replace("'", ""))
		newText = unicode(newText.replace("«", ""))
		newText = unicode(newText.replace("»", ""))
		newText = unicode(newText.replace("[", ""))
		newText = unicode(newText.replace("]", ""))
		newText = unicode(newText.replace("...", ""))
		newText = unicode(newText.replace("..", ""))

		return newText

	# method to process and lemmatize single drama by path
	def processSingleDrama(self, path):
		parser = DramaParser()
		dramaModel = parser.parse_xml(path)
		self._currentDramaName = dramaModel._title
		print("dramaModel ready...")
		text = ""
		#"""
		for act in dramaModel._acts:
			for conf in act._configurations:
				for speech in conf._speeches:
					text = text + speech._text

		print("Text ready...")
		self.processTextFully(text)

	# method to process until tokens single drama by path
	def processSingleDramaTokens(self, path):
		parser = DramaParser()
		dramaModel = parser.parse_xml(path)
		self._currentDramaName = dramaModel._title
		print("dramaModel ready...")
		text = ""
		#"""
		for act in dramaModel._acts:
			for conf in act._configurations:
				for speech in conf._speeches:
					text = text + speech._text

		print("Text ready...")
		self.processTextTokens(text)

	# lemmatize method creates languageInfo touples of text
	def lemmatize(self):
		self._lemmas = self._textBlob.words.lemmatize()
		self._lemmasAndPOS = []
		self._lemmasWithLanguageInfo = []
		
		for i in range(0, len(self._lemmas)):
			lemmaAndPOS = (self._lemmas[i], self._tokensAndPOS[i][1])
			self._lemmasAndPOS.append(lemmaAndPOS)

			lemmaAndTokenPOS = (self._lemmas[i], (self._tokensAndPOS[i][0], self._tokensAndPOS[i][1]))
			self._lemmasWithLanguageInfo.append(lemmaAndTokenPOS)

	# Method to save all POS by lemmas
	def createLemmaAndPOSDict(self):
		lemmasSet = set(self._lemmas)
		for lemma in lemmasSet:
			POSList = []
			for compareLemma in self._lemmasAndPOS:
				if(lemma == compareLemma[0]):
					if(compareLemma[1] not in POSList):
						POSList.append(compareLemma[1])
			self._lemmaAndPOSDict[lemma] = POSList
	
	def combineLemmasPOSTokens(self):
		for lemma, POS in self._lemmaAndPOSDict.iteritems():
			tokensOfLemma = []
			for languageInfo in self._lemmasWithLanguageInfo:
				if(lemma == languageInfo[0]):
					token = languageInfo[1][0]
					if not self.isTokenOfLemma(tokensOfLemma, token):
						tokensOfLemma.append(token)
			self._lemmasAndPOSAndTokensDict[lemma] = (POS, tokensOfLemma)

	def isTokenOfLemma(self, tokensOfLemma, token):
		for alreadyToken in tokensOfLemma:
			if(alreadyToken == token):
				return True
		return False
	
	# Methods to handle and init Stopword-List
	def initStopWords(self, listname):
		stopwords_text = open("../Stopwords/MainStopwordLists/" + listname + ".txt")
		for line in stopwords_text:
			self._stopwords.append(unicode(line.strip()))
			#print unicode(line.strip())
			stopword_lemmatized = TextBlobDE(line.strip()).words.lemmatize()[0]
			self._stopwords_lemmatized.append(stopword_lemmatized)
			self._stopwords_lemmatized.extend(self._stopwords)
			self._stopwords_lemmatized = list(set(self._stopwords_lemmatized))

	def removeStopWordsFromLemmas(self, listname):
		self.initStopWords(listname)
		lemmasCopy = list(self._lemmas)
		self._lemmasWithoutStopwords = self.removeStopwordsFromLemmasList(lemmasCopy)
	
	def removeStopwordsFromTokens(self, listname):
		self.initStopWords(listname)
		tokensCopy = list(self._tokens)
		self._tokensWithoutStopwords = self.removeStopwordsFromTokensList(tokensCopy)

	def removeStopwordsFromLemmasList(self, wordList):
		newList = [word for word in wordList if not (word in self._stopwords_lemmatized)]
		return newList

	def removeStopwordsFromTokensList(self, wordList):
		newList = [word for word in wordList if not (word in self._stopwords)]
		return newList

if __name__ == "__main__":
    main()