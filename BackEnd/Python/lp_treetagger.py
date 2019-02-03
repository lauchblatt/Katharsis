#coding: utf8

import os
import re
import collections
import locale
import sys
from sa_models import *
import pprint
import treetaggerwrapper
from drama_parser import *

def main():
	reload(sys)
	sys.setdefaultencoding('utf8')
	tt = Tree_Tagger()
	text = "Ich ging gestern Blumen pflücken."
	tt.processText(text)
	print tt._tokens

# Class to implement treetagger lemmatization
# implements also stopword-lists
class Tree_Tagger:

	def __init__(self):

		# several attributes for language informations
		self._plainText = ""
		self._filteredText = ""

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

		self._tagger = treetaggerwrapper.TreeTagger(TAGLANG='de')

	# standard method to process and lemmatize text, info saved in attributes
	def processText(self, plainText):
		self._plainText = plainText
		self._filteredText = self.filterText(plainText)	
		print("Tagger ready...")
		self.tagText()
		print("Tokens ready...")
		print("Tags ready...")
		print("Lemmas ready...")
		print("Lemmas With LanguageInfo ready...")

	# simple method to only process until tokens, redundant in treetagger
	def processTextTokens(self, plainText):
		self.processText(plainText)

	# processText with creation of extra attributes for vocabulary-analysis
	def processTextFully(self, plainText):
		self._plainText = plainText
		self._filteredText = self.filterText(plainText)
		print("Tagger ready...")
		self.tagText()
		print("Tokens ready...")
		print("Tags ready...")
		print("Lemmas ready...")
		print("Lemmas With LanguageInfo ready...")
		self.createLemmaAndPOSDict()
		print("LemmasANDPOSDict ready...")
		self.combineLemmasPOSTokens()
		print("LemmasAndPOSAndTokensDict ready...")	
	
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
			#lemmaAndPOSAndTokens = (lemma, POS, (tokensOfLemma))
			#self._lemmasAndPOSAndTokens.append(lemmaAndPOSAndTokens)
			self._lemmasAndPOSAndTokensDict[lemma] = (POS, tokensOfLemma)

	def isTokenOfLemma(self, tokensOfLemma, token):
		for alreadyToken in tokensOfLemma:
			if(alreadyToken == token):
				return True
		return False

	# simple get Lemma-Method for single words of a lexicon
	def getLemma(self, word):
		lemmas = self.getLemmas(word)
		if(len(lemmas) > 1):
			lemmasString = " ".join(lemmas)
			return lemmasString
		else: 
			return lemmas[0]

	def getLemmas(self, wordsAsString):
		tagsTabSeperated = self._tagger.tag_text(unicode(wordsAsString))
		lemmas = []
		for tagTabSeperated in tagsTabSeperated:
			tags = tagTabSeperated.split("\t")
			# For word the treetagger doesnt work with
			if(len(tags) == 1):
				lemma = tags[0]
			else:
				lemma = tags[2]
			if(lemma == "<UNKNOWN>"):
				lemma = tags[0]
			lemmas.append(lemma)
		return lemmas

	# Method to collect and set tags specific for treetagger
	def tagText(self):
		tagsTabSeperated = self._tagger.tag_text(self._filteredText)
		tags = self.removeTabSeperation(tagsTabSeperated)
		tags = self.filterPunctuationMarks(tags)
		self._tokens = []
		self._lemmas = []
		self._tokensAndPOS = []
		self._lemmasAndPOS = []
		self._lemmasWithLanguageInfo = []

		for tag in tags:
			token = tag[0]
			pos = tag[1]
			lemma = tag[2]
			if(lemma == "<UNKNOWN>"):
				lemma = tag[0]
			lemmaWithLanguageInfo = (lemma, (token, pos))
			self._tokens.append(token)
			self._lemmas.append(lemma)
			self._tokensAndPOS.append((token, pos))
			self._lemmasAndPOS.append((lemma, pos))
			self._lemmasWithLanguageInfo.append(lemmaWithLanguageInfo)

	# specific Method for treetagger
	def removeTabSeperation(self, tagsTabSeperated):
		newTags = []
		for tag in tagsTabSeperated:
			tags = tag.split("\t")
			newTags.append(tags)
		return newTags

	# method to remove all Sentence-Marks
	def filterPunctuationMarks(self, tags):
		newTags = []
		for tag in tags:
			if(not tag[1].startswith("$") or tag[1] == "SEN"):
				newTags.append(tag)
				
		return tags
	
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

	# Methods to handle and init Stopword-List
	def initStopWords(self, listname):
		stopwords_text = open("../Stopwords/MainStopwordLists/" + listname + ".txt")
		for line in stopwords_text:
			stopword = unicode(line.strip())
			self._stopwords.append(stopword)
			tagsTabSeperated = self._tagger.tag_text(stopword)
			tags = tagsTabSeperated[0].split("\t")
			stopword_lemmatized = tags[2]
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

if __name__ == "__main__":
    main()