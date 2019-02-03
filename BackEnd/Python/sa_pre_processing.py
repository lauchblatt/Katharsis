import os
import re
import collections
import locale
import sys
from drama_parser import *
from drama_models import *
from lp_language_processor import *
from sa_sentiment_analysis import *
import pickle

def main():
	reload(sys)
	sys.setdefaultencoding('utf8')

# Class to pre process a drama, necessary for Sentiment Analysis
class Drama_Pre_Processing:

	def __init__(self, processor):
		self._dramaModel = None
		self._languageProcessor = None
		self._processor = processor
		self.initLanguageProcessor(processor)
	
	# Main Method to prePorcess all dramas and dump them for letter use in folder Dumps/ProcessedDramas
	def preProcessAndDumpAllDramas(self):
		for filename in os.listdir("../Lessing-Dramen/"):
			self.preProcessAndLemmatize("../Lessing-Dramen/" + filename)
			targetPath = "Dumps/ProcessedDramas/" + self._processor + "/" + self._dramaModel._title + ".p"
			self.dumpDramaModel(targetPath)
	
	def initDramaModel(self, dramaPath):
		parser = DramaParser()
		self._dramaModel = parser.parse_xml(dramaPath)
	
	def readDramaModelFromDump(self, dramaPath):
		self._dramaModel = pickle.load(open(dramaPath, "rb"))
		return self._dramaModel

	# Method for pre process
	def preProcessLemmatizeAndDump(self, dramaPath):
		self.preProcessAndLemmatize(dramaPath)

		self.dumpDramaModel("Dumps/ProcessedDramas/" + self._processor + "/" + self._dramaModel._title + ".p")

	def dumpDramaModel(self, dramaPath):
		pickle.dump(self._dramaModel, open(dramaPath, "wb" ))

	def initLanguageProcessor(self, processor):
		lp = Language_Processor(processor)
		self._languageProcessor = lp._processor

	# normal pre processing without lemmatization
	def preProcess(self, path):
		self.initDramaModel(path)
		self.attachPositionsToSpeechesAndConfs()
		self.attachPreOccuringSpeakersToSpeeches()
		self.createSpeakersPerConfAndAct()
		self.attachLengthInWordsToStructuralElements()

		return self._dramaModel

	# set speakers per conf and act for later SA
	def createSpeakersPerConfAndAct(self):
		for act in self._dramaModel._acts:
			actSpeeches = act.get_speeches_act()
			act._actSpeakers = {}
			for appearingSpeaker in act._appearing_speakers:
				actSpeakerSpeeches = [speech for speech in actSpeeches if speech._speaker == appearingSpeaker] 
				actSpeaker = SpeakerModel()
				actSpeaker._name = appearingSpeaker
				actSpeaker._speeches = actSpeakerSpeeches
				act._actSpeakers[appearingSpeaker] = actSpeaker

			for conf in act._configurations:
				conf._confSpeakers = {}
				for confAppearingSpeaker in conf._appearing_speakers:
					confSpeakerSpeeches = [speech for speech in conf._speeches if speech._speaker == confAppearingSpeaker]
					confSpeaker = SpeakerModel()
					confSpeaker._name = confAppearingSpeaker
					confSpeaker._speeches = confSpeakerSpeeches
					conf._confSpeakers[confAppearingSpeaker] = confSpeaker

	def preProcessAndLemmatize(self, path):
		self.preProcess(path)
		self.attachLanguageInfoToSpeeches()

	# method to attach languageInfo to all structural units
	def attachLanguageInfoToSpeeches(self):
		for act in self._dramaModel._acts:
			for conf in act._configurations:
				for speech in conf._speeches:
					self._languageProcessor.processText(speech._text)
					lemmaInformation = self._languageProcessor._lemmasWithLanguageInfo
					speech._textAsLanguageInfo = lemmaInformation

	# calc and set length in words to all units
	def attachLengthInWordsToStructuralElements(self):
		dramaLength = 0
		for act in self._dramaModel._acts:
			actLength = 0
			for conf in act._configurations:
				confLength = 0
				for speech in conf._speeches:
					self._languageProcessor.processTextTokens(speech._text)
					speech._lengthInWords = len(self._languageProcessor._tokens)
					confLength = confLength + speech._lengthInWords
					actLength = actLength + speech._lengthInWords
					dramaLength = dramaLength + speech._lengthInWords
				conf._lengthInWords = confLength
			act._lengthInWords = actLength
		self._dramaModel._lengthInWords = dramaLength

		for speaker in self._dramaModel._speakers:
			speakerLength = 0
			for speech in speaker._speeches:
				speakerLength = speakerLength + speech._lengthInWords
			speaker._lengthInWords = speakerLength
		
		for act in self._dramaModel._acts:
			for name in act._actSpeakers:
				currentSpeakerActLength = 0
				speaker = act._actSpeakers[name]
				for speech in speaker._speeches:
					currentSpeakerActLength = currentSpeakerActLength + speech._lengthInWords
				speaker._lengthInWords = currentSpeakerActLength
			for conf in act._configurations:
				for name in conf._confSpeakers:
					speaker = conf._confSpeakers[name] 
					currentSpeakerConfLength = 0
					for speech in speaker._speeches:
						currentSpeakerConfLength = currentSpeakerConfLength + speech._lengthInWords
					speaker._lengthInWords = currentSpeakerConfLength

	# set all pre occuring speakers for Sentiment-Relations
	def attachPreOccuringSpeakersToSpeeches(self):
		preOccuringSpeaker = ""

		for act in self._dramaModel._acts:
			# Reset every speaker when new act starts
			preOccuringSpeaker = ""
			for conf in act._configurations:
				for speech in conf._speeches:
					speech._preOccuringSpeaker = preOccuringSpeaker
					preOccuringSpeaker = speech._speaker

	# set structural positioins for later calculations
	def attachPositionsToSpeechesAndConfs(self):
		subsequentNumberSpeech = 1
		subsequentNumberConf = 1

		for act in self._dramaModel._acts:
			numberInAct = 1
			for conf in act._configurations:
				numberInConf = 1
				conf._subsequentNumber = subsequentNumberConf
				subsequentNumberConf = subsequentNumberConf + 1
				for speech in conf._speeches:
					speech._subsequentNumber = subsequentNumberSpeech
					speech._numberInAct = numberInAct
					speech._numberInConf = numberInConf

					subsequentNumberSpeech = subsequentNumberSpeech + 1
					numberInAct = numberInAct + 1
					numberInConf = numberInConf +1

if __name__ == "__main__":
	main()