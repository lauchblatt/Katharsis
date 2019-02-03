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

def main():
	reload(sys)
	sys.setdefaultencoding('utf8')

	dca = Drama_Corpus_Analyzer()
	dca.calcMetricsForSingleDramas("../Lessing-Dramen/")

# simple Class to analyze the corpus
class Drama_Corpus_Analyzer:
	
	def __init__(self):
		self._speeches = []
		self._speechesLengths = []

	# Prints Metrics for all Single Dramas, path to Drama-Folder
	def calcMetricsForSingleDramas(self, path):
		for filename in os.listdir(path):
			dpp = Drama_Pre_Processing("treetagger")
			dramaModel = dpp.readDramaModelFromDump(path + filename)
			speeches = []
			speechesLengths = []
			lengthInWords = 0
			for act in dramaModel._acts:
				for conf in act._configurations:
					for speech in conf._speeches:
						speeches.append(speech)
						speechesLengths.append(speech._lengthInWords)
						lengthInWords = lengthInWords + speech._lengthInWords
			print(dramaModel._title)
			avg = average(speechesLengths)
			med = median(speechesLengths)
			maximum = custom_max(speechesLengths)
			minimum = custom_min(speechesLengths)
			print(len(speeches))
			print avg
			print med
			print maximum
			print minimum
			print lengthInWords

	# prints Metrics for Entire Corpus --> path to Drama-Folder
	def calcMetricsForEntireCorpus(self, path):

		for filename in os.listdir(path):
			dpp = Drama_Pre_Processing("treetagger")
			dramaModel = dpp.readDramaModelFromDump(path + filename)
			for act in dramaModel._acts:
				for conf in act._configurations:
					for speech in conf._speeches:
						self._speeches.append(speech)
						self._speechesLengths.append(speech._lengthInWords)

		avg = average(self._speechesLengths)
		med = median(self._speechesLengths)
		maximum = custom_max(self._speechesLengths)
		minimum = custom_min(self._speechesLengths)
		print(len(self._speeches))
		print avg
		print med
		print maximum
		print minimum

	# Prints Metrics for one Single Drama, path to specific Drama
	def calcMetricsForSingleDrama(self, path):
		dpp = Drama_Pre_Processing()
		dramaModel = dpp.preProcess(path)
		for act in dramaModel._acts:
			for conf in act._configurations:
				for speech in conf._speeches:
					self._speeches.append(speech)
					self._speechLengths.append(speech._lengthInWords)
		avg = average(speechLengths)
		med = median(speechLengths)
		maximum = custom_max(speechLengths)
		minimum = custom_max(speechLengths)
		print(len(self._speeches))
		print avg
		print med
		print maximum
		print minimum


if __name__ == "__main__":
    main()