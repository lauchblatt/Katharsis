#coding: utf8

import os
import re
import collections
import locale
import sys
import math
from sa_models import *

# Class to handle Sentiment-Calculation
def main():
	reload(sys)
	sys.setdefaultencoding('utf8')

class Sentiment_Calculator:
	# init Calculator with sentimentBearingWords and length of unit in words as primary normalisation factor
	def __init__(self, sentimentBearingWords, normalisationFactorLength):

		self._sentimentBearingWords = sentimentBearingWords
		# saves all Data in Sentiment_Metrics-Object
		self._sentimentMetrics = Sentiment_Metrics()
		self._sentimentMetrics.initMetrics()

		self._normalisationFactorLength = normalisationFactorLength
		
		self._normalisationFactorLexiconSBWs = {}
	
	def calcMetrics(self):
		self.calcTotalMetrics()
		self.calcNormalisedMetrics()
		# deprecated
		self.calcSentimentRatio()

		self.setSpecificLexiconSBWsNormalisationMetrics()
		self.calcAllSpecificSBWsNormalisedMetrics()
	
	# set SBW-specific Normalisation Factor --> different for every Lexicon
	def setSpecificLexiconSBWsNormalisationMetrics(self):
		normalisationFactorSentiWS = 0
		normalisationFactorNrcPolarity = 0
		normalisationFactorNrcEmotion = 0
		normalisationFactorBawl = 0
		normalisationFactorCd = 0
		normalisationFactorGpc = 0

		for sbw in self._sentimentBearingWords:
			normalisationFactorSentiWS = normalisationFactorSentiWS + sbw._sentiWSOccurence
			normalisationFactorNrcPolarity = normalisationFactorNrcPolarity + sbw._nrcPolarityOccurence
			normalisationFactorNrcEmotion = normalisationFactorNrcEmotion + sbw._nrcEmotionOccurence
			normalisationFactorBawl = normalisationFactorBawl + sbw._bawlOccurence
			normalisationFactorCd = normalisationFactorCd + sbw._cdOccurence
			normalisationFactorGpc = normalisationFactorGpc + sbw._gpcOccurence
		
		self._normalisationFactorLexiconSBWs["sentiWS"] = normalisationFactorSentiWS
		self._normalisationFactorLexiconSBWs["nrcPolarity"] = normalisationFactorNrcPolarity
		self._normalisationFactorLexiconSBWs["nrcEmotion"] = normalisationFactorNrcEmotion
		self._normalisationFactorLexiconSBWs["bawl"] = normalisationFactorBawl
		self._normalisationFactorLexiconSBWs["Cd"] = normalisationFactorCd
		self._normalisationFactorLexiconSBWs["Gpc"] = normalisationFactorGpc

		self._normalisationFactorLexiconSBWs["Combined"] = self._sentimentMetrics._metricsTotal["positiveCombined"] + \
		+ self._sentimentMetrics._metricsTotal["negativeCombined"]

		self._normalisationFactorLexiconSBWs["Combined-Clearly"] = self._sentimentMetrics._metricsTotal["clearlyPositiveCombined"] + \
		+ self._sentimentMetrics._metricsTotal["clearlyNegativeCombined"]

	# deprecated
	def calcSentimentRatio(self):
		if self._normalisationFactorLength is 0:
			sentimentRatio = 0
		else:
			sentimentRatio = float(len(self._sentimentBearingWords))/float(self._normalisationFactorLength)
			sentimentRatioPercent = sentimentRatio*100
			self._sentimentMetrics._sentimentRatio = sentimentRatioPercent

	# methods to calc normalised Metrics 
	def calcAllSpecificSBWsNormalisedMetrics(self):
		for lexicon, names in self._sentimentMetrics._names.items():
			self.calcSpecificSBWsNormalisedMetrics(names, self._normalisationFactorLexiconSBWs[lexicon])

	def calcSpecificSBWsNormalisedMetrics(self, names, normalisationFactor):
		if normalisationFactor is 0:
			for name in names:
				self._sentimentMetrics._metricsNormalisedSBWs[name] = 0
		else:
			for name in names:
				self._sentimentMetrics._metricsNormalisedSBWs[name] = \
				float(self._sentimentMetrics._metricsTotal[name])/normalisationFactor

	def calcNormalisedMetrics(self):
		if self._normalisationFactorLength is 0:
			for metric in self._sentimentMetrics._metricsTotal:
				self._sentimentMetrics._metricsNormalisedLengthInWords[metric] = 0
		else:
			for metric in self._sentimentMetrics._metricsTotal:
				metricTotal = self._sentimentMetrics._metricsTotal[metric]
				self._sentimentMetrics._metricsNormalisedLengthInWords[metric] = float(metricTotal)/self._normalisationFactorLength

	# calc total Metrics by simple sum up Methods for every metric
	# needs set Sentiment_Metrics-Object
	def calcTotalMetrics(self):

		self._sentimentMetrics._metricsTotal["polaritySentiWS"] = math.fsum(word._polaritySentiWS for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["positiveSentiWSDichotom"] = sum(word._positiveSentiWSDichotom for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["negativeSentiWSDichotom"] = sum(word._negativeSentiWSDichotom for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["polaritySentiWSDichotom"] = self._sentimentMetrics._metricsTotal["positiveSentiWSDichotom"] \
		- self._sentimentMetrics._metricsTotal["negativeSentiWSDichotom"]

		self._sentimentMetrics._metricsTotal["positiveNrc"] = sum(word._positiveNrc for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["negativeNrc"]  = sum(word._negativeNrc for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["polarityNrc"] = self._sentimentMetrics._metricsTotal["positiveNrc"] - self._sentimentMetrics._metricsTotal["negativeNrc"]

		self._sentimentMetrics._metricsTotal["anger"] = sum(word._anger for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["anticipation"] = sum(word._anticipation for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["disgust"] = sum(word._disgust for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["fear"] = sum(word._fear for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["joy"] = sum(word._joy for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["sadness"] = sum(word._sadness for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["surprise"] = sum(word._surprise for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["trust"] = sum(word._trust for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["emotionPresent"] = sum(word._nrcEmotionOccurence for word in self._sentimentBearingWords)

		self._sentimentMetrics._metricsTotal["emotion"] = math.fsum(word._emotion for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["arousel"] = math.fsum(word._arousel for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["positiveBawlDichotom"] = sum(word._positiveBawlDichotom for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["negativeBawlDichotom"] = sum(word._negativeBawlDichotom for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["polarityBawlDichotom"] = self._sentimentMetrics._metricsTotal["positiveBawlDichotom"] \
		- self._sentimentMetrics._metricsTotal["negativeBawlDichotom"]


		self._sentimentMetrics._metricsTotal["positiveCd"] = math.fsum(word._positiveCd for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["negativeCd"] = math.fsum(word._negativeCd for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["neutralCd"] = sum(word._neutralCd for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["polarityCd"] = self._sentimentMetrics._metricsTotal["positiveCd"] - self._sentimentMetrics._metricsTotal["negativeCd"]
		self._sentimentMetrics._metricsTotal["positiveCDDichotom"] = sum(word._positiveCDDichotom for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["negativeCDDichotom"] = sum(word._negativeCDDichotom for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["polarityCDDichotom"] = self._sentimentMetrics._metricsTotal["positiveCDDichotom"] \
		- self._sentimentMetrics._metricsTotal["negativeCDDichotom"]
		

		self._sentimentMetrics._metricsTotal["positiveGpc"] = sum(word._positiveGpc for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["negativeGpc"] = sum(word._negativeGpc for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["neutralGpc"] = sum(word._neutralGpc for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["polarityGpc"] = self._sentimentMetrics._metricsTotal["positiveGpc"] - self._sentimentMetrics._metricsTotal["negativeGpc"]

		self._sentimentMetrics._metricsTotal["positiveCombined"] = sum(word._positiveCombined for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["negativeCombined"] = sum(word._negativeCombined for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["polarityCombined"] = self._sentimentMetrics._metricsTotal["positiveCombined"] - self._sentimentMetrics._metricsTotal["negativeCombined"]

		self._sentimentMetrics._metricsTotal["clearlyPositiveCombined"] = sum(word._clearlyPositiveCombined for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["clearlyNegativeCombined"] = sum(word._clearlyNegativeCombined for word in self._sentimentBearingWords)
		self._sentimentMetrics._metricsTotal["clearlyPolarityCombined"] = self._sentimentMetrics._metricsTotal["clearlyPositiveCombined"] - self._sentimentMetrics._metricsTotal["clearlyNegativeCombined"]

		self.calcMissingPosNegMetrics()

	# added Method to calc Metrics for term-counting Method for Bawl and SentiWS
	def calcMissingPosNegMetrics(self):
		self._sentimentMetrics._metricsTotal["positiveSentiWS"] = sum(word._polaritySentiWS for word\
		 in self._sentimentBearingWords if word._polaritySentiWS > 0)
		self._sentimentMetrics._metricsTotal["negativeSentiWS"] = abs(sum(word._polaritySentiWS for word\
		 in self._sentimentBearingWords if word._polaritySentiWS < 0))

		self._sentimentMetrics._metricsTotal["positiveBawl"] = sum(word._emotion for word\
		 in self._sentimentBearingWords if word._emotion > 0)
		self._sentimentMetrics._metricsTotal["negativeBawl"] = abs(sum(word._emotion for word\
		 in self._sentimentBearingWords if word._emotion < 0))

if __name__ == "__main__":
    main()