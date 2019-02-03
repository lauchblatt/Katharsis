# -*- coding: utf8 -*-

import os
import re
import collections
import locale
import sys
from lexicon_handler import *
from lp_language_processor import *
from lexicon_clematide_dictionary import *
from k_alpha import *

def main():
	reload(sys)
	sys.setdefaultencoding('utf8')

# Class to perform the agreement analysis for the evaluation
class Agreement_Statistics:

	def __init__(self):
		self._sentimentDict = {}

	# prints all necessary agreement info
	# paths like this ("../Agreement-Daten/polaritaet_dichotom.txt", "../Agreement-Daten/polaritaet_dichotom_sortiert.txt", 2, 1)
	# categories of metric, start-value of chosen metric
	def printAllInfo(self, pathNormal, pathToSorted, categories, startValue):
		fleissKappas = self.calcFleissKappasForAllDramas(pathNormal, categories, startValue)
		averages = self.getAvgPercentsForAllDramas(pathNormal)
		kAlphas = self.calcKAlphaForAllDramas(pathNormal)
		majorityData = self.getMajorityDataDramas(pathNormal, categories, startValue)

		i = 0
		while(i < len(fleissKappas)):
			print "\t".join([str(fleissKappas[i]), kAlphas[i],\
			 majorityData[i][0], majorityData[i][1], majorityData[i][2], majorityData[i][3], \
			 majorityData[i][4], majorityData[i][5], majorityData[i][6], majorityData[i][7], \
			 majorityData[i][8], majorityData[i][9], majorityData[i][10], majorityData[i][11],\
			 majorityData[i][12], majorityData[i][13],\
			 averages[i][0], averages[i][1]])
			i += 1
		
		fleissKappas = self.calcFleissKappasLengths(pathToSorted, categories, startValue)
		averages = self.getAvgPercentsForLengths(pathToSorted)
		kAlphas = self.calcKAlphaForLengths(pathToSorted)
		majorityData = self.getMajorityDataLengths(pathToSorted, categories, startValue)

		i = 0
		print ("\n".rstrip())
		while(i < len(fleissKappas)):
			print "\t".join([str(fleissKappas[i]), kAlphas[i],\
			 majorityData[i][0], majorityData[i][1], majorityData[i][2], majorityData[i][3], \
			 majorityData[i][4], majorityData[i][5], majorityData[i][6], majorityData[i][7], \
			 majorityData[i][8], majorityData[i][9], majorityData[i][10], majorityData[i][11],\
			 majorityData[i][12], majorityData[i][13],\
			 averages[i][0], averages[i][1]])
			i += 1 

	# calc Length-specific Majority Data
	def getMajorityDataLengths(self, path, categories, startValue):
		data = open(path)
		lines = data.readlines()
		dramaLines = []
		dramaLines.append(lines[0:101])
		dramaLines.append(lines[101:200])
		dramaLines.append(lines[0:61])
		dramaLines.append(lines[61:200])
		dramaLines.append(lines)

		data = []
		for dramaLine in dramaLines:
			matrix = self.getAgreementMatrixFromData(dramaLine, categories, startValue)
			majorityData = self.calcMajorityData(matrix, categories, startValue)
			data.append(majorityData)
		return data

	# calc Drama-specific Majority Data
	def getMajorityDataDramas(self, path, categories, startValue):
		data = open(path)
		lines = data.readlines()
		dramaLines = []
		dramaLines.append(lines[0:6])
		dramaLines.append(lines[6:26])
		dramaLines.append(lines[26:54])
		dramaLines.append(lines[54:68])
		dramaLines.append(lines[68:80])
		dramaLines.append(lines[80:92])
		dramaLines.append(lines[92:102])
		dramaLines.append(lines[102:122])
		dramaLines.append(lines[122:146])
		dramaLines.append(lines[146:166])
		dramaLines.append(lines[166:194])
		dramaLines.append(lines[194:200])
		dramaLines.append(lines)

		data = []
		for dramaLine in dramaLines:
			matrix = self.getAgreementMatrixFromData(dramaLine, categories, startValue)
			majorityData = self.calcMajorityData(matrix, categories, startValue)
			data.append(majorityData)
		return data

	# calc Agreement Matrix from Data form Folder Aggreement-Daten
	def getAgreementMatrixFromPath(self, path, categories, startValue):
		data = open(path)
		lines = data.readlines()
		return self.getAgreementMatrixFromData(lines, categories, startValue)

	def getAgreementMatrixFromData(self, lines, categories, startValue):
		matrixRows = []
		for line in lines:
			numbers = line.split("\t")
			numbers = [int(number.strip()) for number in numbers]
			counters = []
			i = 0
			while (i < categories):
				counters.append(0)
				i = i + 1
			for number in numbers:
				columnToIncrease = number - startValue
				counters[columnToIncrease] += 1

			output = "\t".join([str(x) for x in counters])
			matrixRows.append(counters)
		
		return matrixRows

	def calcMajorityData(self, matrix, categories, startValue):
		fives = 0
		fours = 0
		threes = 0
		smallMaj = 0
		for numbers in matrix:
			realMajority = False
			for number in numbers:
				if(number == 5):
					fives += 1
					realMajority = True
				elif(number == 4):
					fours += 1
					realMajority = True
				elif(number == 3):
					threes += 1
					realMajority = True
			if (numbers.count(2) == 1 and not(realMajority)):
				#print(numbers)
				smallMaj += 1

		fivesPercent = str(float(fives)/len(matrix)).replace(".", ",")
		foursPercent = str(float(fours)/len(matrix)).replace(".", ",")
		threesPercent = str(float(threes)/len(matrix)).replace(".", ",")
		smallMajPercent = str(float(smallMaj)/len(matrix)).replace(".", ",")
		
		fiveFours = fives + fours
		majorities = fives + fours + threes
		allMajorities = fives + fours + threes + smallMaj
		
		fiveFoursPercent = str((float(fiveFours))/len(matrix)).replace(".", ",")
		majoritiesPercent = str(float(majorities)/len(matrix)).replace(".", ",")
		allMajoritiesPercent = str(float(allMajorities)/len(matrix)).replace(".", ",")

		allData = [str(fives), fivesPercent, str(fours), foursPercent,\
		str(fiveFours), fiveFoursPercent,\
		 str(threes), threesPercent, str(majorities), majoritiesPercent, str(smallMaj),\
		  smallMajPercent, str(allMajorities), allMajoritiesPercent]
		return allData

	# Method to calc Fleiss Kappa oriented on Example on Wikipedia
	# tested with easy examples
	def fleissKappa(self, matrix):
		raters = 5
		N = len(matrix)
		categories = len(matrix[0])
		allRates = N*raters
		pjs = []
		i = 0
		while(i < categories):
			colSum = 0
			for line in matrix:
				colSum = colSum + line[i]
			pjs.append(float(float(colSum)/allRates))
			i = i + 1
		Pis = []
		for line in matrix:
			squares = [item * item for item in line]
			squaresSum = sum(squares)
			result = (float(squaresSum - raters))/float(raters * (raters - 1))
			Pis.append(result)
		sumPis = sum(Pis)
		P_ = float(sumPis)/N
		squaresPjs = [item * item for item in pjs]
		P_e = sum(squaresPjs)
		if (1 - P_e == 0):
			return 1
		fleiss_kappa = (P_ - P_e)/(1 - P_e)
		return fleiss_kappa

	#Transposed Matrix for KAlpha
	def getTwoDMatrix(self, path):
		data = open(path)
		lines = data.readlines()
		twoDMatrix = []
		for line in lines:
			numbers = line.split("\t")
			numbers = [number.strip() for number in numbers]
			twoDMatrix.append(numbers)
		twoDMatrix = zip(*twoDMatrix)
		twoDMatrix = [list(unit) for unit in twoDMatrix]

		return twoDMatrix

	# returns agreements-Tuples from an agreementMatrix
	def getNumberAndPercentsOfTotalAgreements(self, agreementMatrix):
		totalAgreements = 0
		for row in agreementMatrix:
			for number in row:
				if(int(number) == 5):
					totalAgreements += 1
		#print totalAgreements
		percent = str(float(totalAgreements)/len(agreementMatrix)).replace(".", ",")
		return (totalAgreements, percent)

	# calc drama-specific K-Alpha
	def calcKAlphaForAllDramas(self, path):
		matrix = self.getTwoDMatrix(path)
		dramas = []
		dramas.append([row[0:6] for row in matrix])
		dramas.append([row[6:26] for row in matrix])
		dramas.append([row[26:54] for row in matrix])
		dramas.append([row[54:68] for row in matrix])
		dramas.append([row[68:80] for row in matrix])
		dramas.append([row[80:92] for row in matrix])
		dramas.append([row[92:102] for row in matrix])
		dramas.append([row[102:122] for row in matrix])
		dramas.append([row[122:146] for row in matrix])
		dramas.append([row[146:166] for row in matrix])
		dramas.append([row[166:194] for row in matrix])
		dramas.append([row[194:200] for row in matrix])
		dramas.append(matrix)
		
		kAlphas = []
		for dramaMatrix in dramas:
			kAlphas.append(krippendorff_alpha(dramaMatrix, nominal_metric, missing_items="*"))
		kAlphas = [str(item).replace(".", ",") for item in kAlphas]
		return kAlphas

	# calc Length-Specific K-Alpha
	def calcKAlphaForLengths(self, path):
		matrix = self.getTwoDMatrix(path)
		lengths = []
		lengths.append([row[0:101] for row in matrix])
		lengths.append([row[101:200] for row in matrix])
		lengths.append([row[0:61] for row in matrix])
		lengths.append([row[61:200] for row in matrix])
		
		kAlphas = []
		for dramaMatrix in lengths:
			kAlphas.append(krippendorff_alpha(dramaMatrix, nominal_metric, missing_items="*"))
		kAlphas = [str(item).replace(".", ",") for item in kAlphas]
		return kAlphas

	# calc drama-specific Fleiss Kappa
	def calcFleissKappasForAllDramas(self, path, categories, startValue):
		data = open(path)
		lines = data.readlines()
		matrixRows = []
		dramaLines = []
		dramaLines.append(lines[0:6])
		dramaLines.append(lines[6:26])
		dramaLines.append(lines[26:54])
		dramaLines.append(lines[54:68])
		dramaLines.append(lines[68:80])
		dramaLines.append(lines[80:92])
		dramaLines.append(lines[92:102])
		dramaLines.append(lines[102:122])
		dramaLines.append(lines[122:146])
		dramaLines.append(lines[146:166])
		dramaLines.append(lines[166:194])
		dramaLines.append(lines[194:200])
		dramaLines.append(lines)
		fleissKappas = []

		for lines in dramaLines:
			matrixRows = self.getAgreementMatrixFromData(lines, categories, startValue)
			fleissKappas.append((str(self.fleissKappa(matrixRows))).replace(".", ","))

		return fleissKappas

	# calc Length-specific Fleiss Kappa
	def calcFleissKappasLengths(self, path, categories, startValue):
		data = open(path)
		lines = data.readlines()
		matrixRows = []
		dramaLines = []
		dramaLines.append(lines[0:101])
		dramaLines.append(lines[101:200])
		dramaLines.append(lines[0:61])
		dramaLines.append(lines[61:200])
		fleissKappas = []

		for lines in dramaLines:
			matrixRows = self.getAgreementMatrixFromData(lines, categories, startValue)
			fleissKappas.append((str(self.fleissKappa(matrixRows))).replace(".", ","))
		return fleissKappas

	# calc dramaSpecific avg-Percents
	def getAvgPercentsForAllDramas(self, path):
		data = open(path)
		lines = data.readlines()
		matrixRows = []
		dramaLines = []
		#"""
		dramaLines.append(lines[0:6])
		dramaLines.append(lines[6:26])
		dramaLines.append(lines[26:54])
		dramaLines.append(lines[54:68])
		dramaLines.append(lines[68:80])
		dramaLines.append(lines[80:92])
		dramaLines.append(lines[92:102])
		dramaLines.append(lines[102:122])
		dramaLines.append(lines[122:146])
		dramaLines.append(lines[146:166])
		dramaLines.append(lines[166:194])
		dramaLines.append(lines[194:200])
		#"""
		dramaLines.append(lines)
		averageNumbersAndPercents = []
		for unit in dramaLines:
			averageNumbersAndPercents.append(self.getAveragedPercents(unit))
		return averageNumbersAndPercents

	# calc Length-specific avgPercents
	def getAvgPercentsForLengths(self, path):
		data = open(path)
		lines = data.readlines()
		dramaLines = []
		dramaLines.append(lines[0:101])
		dramaLines.append(lines[101:200])
		dramaLines.append(lines[0:61])
		dramaLines.append(lines[61:200])

		averageNumbersAndPercents = []
		for unit in dramaLines:
			averageNumbersAndPercents.append(self.getAveragedPercents(unit))
		return averageNumbersAndPercents

	# calc the averagePercents by input of data in Agreement-Daten
	def getAveragedPercents(self, lines):
		numberOfRaters = 5
		raterRatings = []
		i = 0
		while(i < numberOfRaters):
			raterRating = []
			for line in lines:
				numbers = line.split("\t")
				numbers = [int(number.strip()) for number in numbers]
				raterRating.append(numbers[i])
			i += 1
			#print raterRating
			raterRatings.append(raterRating)
		#print self.compareListsAndReturnPercent(raterRatings[0], raterRatings[1])
		comparisons = []
		comparisons.append(self.compareListsAndReturnPercent(raterRatings[0], raterRatings[1]))
		comparisons.append(self.compareListsAndReturnPercent(raterRatings[0], raterRatings[2]))
		comparisons.append(self.compareListsAndReturnPercent(raterRatings[0], raterRatings[3]))
		comparisons.append(self.compareListsAndReturnPercent(raterRatings[0], raterRatings[4]))

		comparisons.append(self.compareListsAndReturnPercent(raterRatings[1], raterRatings[2]))
		comparisons.append(self.compareListsAndReturnPercent(raterRatings[1], raterRatings[3]))
		comparisons.append(self.compareListsAndReturnPercent(raterRatings[1], raterRatings[4]))

		comparisons.append(self.compareListsAndReturnPercent(raterRatings[2], raterRatings[3]))
		comparisons.append(self.compareListsAndReturnPercent(raterRatings[2], raterRatings[4]))

		comparisons.append(self.compareListsAndReturnPercent(raterRatings[3], raterRatings[4]))
		comparisonsPercent = []
		comparisonsTotalNumber = []
		for compare in comparisons:
			comparisonsTotalNumber.append(compare[0])
			comparisonsPercent.append(compare[1])
		
		totalAvg = float(sum(comparisonsTotalNumber))/float(len(comparisonsTotalNumber))
		totalAvgPercent = float(sum(comparisonsPercent))/float(len(comparisonsPercent))
		#print str(totalAvg).replace(".", ",")
		return (str(totalAvg).replace(".", ","), str(totalAvgPercent).replace(".", ","))


	# specific Method for Variable Emotion_present
	def getEmotionPresenceByParticipant(self, path):
		data = open(path)
		emotionsPresents = []
		for line in data:
			numbersString = line.split("\t")
			numbers = [int(number.strip()) for number in numbersString]
			if(self.emotionPresent(numbers)):
				emotionsPresents.append(1)
			else:
				emotionsPresents.append(0)
		return emotionsPresents

	def emotionPresent(self, numbers):
		if(1 in numbers):
			return True
		else:
			return False

	def getMajorityEmotionPresent(self, path):
		data = open(path)
		lines = data.readlines()
		matrix = self.getAgreementMatrixFromData(lines, 2, 0)
		emoMajorities = []

		for row in matrix:
			if(row[0] > 2):
				emoMajorities.append(0)
				print row[0]
			elif(row[1] > 2):
				emoMajorities.append(1)
				print row[1]

	def printPolVsNonPol(self, path):
		data = open(path)
		lines = data.readlines()
		matrix = self.getAgreementMatrixFromData(lines, 3, 1)
		polMajorities = self.getPolVsNonPol(matrix)

		for item in polMajorities:
			print item

	# specific Majority Methods for specific Polarity-Variables from Agreement-Daten
	def getMajorityPolReduced(self, path):
		data = open(path)
		lines = data.readlines()
		matrix = self.getAgreementMatrixFromData(lines, 4, 1)
		polMajorities = []

		for row in matrix:
			if(row[0] > 2):
				polMajorities.append(1)
				print row[0]
			elif(row[1] > 2):
				polMajorities.append(2)
				print row[1]
			elif(row[2] > 2):
				polMajorities.append(3)
				print row[2]
			elif(row[3] > 2):
				polMajorities.append(4)
				print row[3]
			elif(row.count(2) == 1):
				polMajorities.append(row.index(2) + 1)
				print "2"
			else:
				polMajorities.append(-1)
				print "-1"

		return polMajorities

	def getMajorityPolStandard(self, path):
		data = open(path)
		lines = data.readlines()
		matrix = self.getAgreementMatrixFromData(lines, 6, 1)
		polMajorities = []
		
		for row in matrix:
			if(row[0] > 2):
				polMajorities.append(1)
				print row[0]
			elif(row[1] > 2):
				polMajorities.append(2)
				print row[1]
			elif(row[2] > 2):
				polMajorities.append(3)
				print row[2]
			elif(row[3] > 2):
				polMajorities.append(4)
				print row[3]
			elif(row[4] > 2):
				polMajorities.append(5)
				print row[4]
			elif(row[5] > 2):
				polMajorities.append(6)
				print row[5]
			elif(row.count(2) == 1):
				polMajorities.append(row.index(2) + 1)
				print "2"
			else:
				polMajorities.append(-1)
				print "-1"

		return polMajorities

	def getMajorityPolDichotom(self, path):
		data = open(path)
		lines = data.readlines()
		matrix = self.getAgreementMatrixFromData(lines, 2, 1)
		polMajorities = []

		for row in matrix:
			if(row[0] > 2):
				polMajorities.append(1)
				print row[0]
			elif(row[1] > 2):
				polMajorities.append(2)
				print row[1]
		return polMajorities

	def getMajorityPolDreifach(self, path):
		data = open(path)
		lines = data.readlines()
		matrix = self.getAgreementMatrixFromData(lines, 3, 1)

		polMajorities = []
		for row in matrix:
			if(row[0] > 2):
				polMajorities.append(1)
				print row[0]
			elif(row[1] > 2):
				polMajorities.append(2)
				print row[1]
			elif(row[2] > 2):
				polMajorities.append(3)
				print row[2]
			else:
				polMajorities.append(-1)
				print "-1"
		return polMajorities

	# Method to compare two List and return avgPercent
	def compareListsAndReturnPercent(self, list1, list2):
		i = 0
		length = len(list1)
		same = 0
		while(i < length):
			if(list1[i] == list2[i]):
				same += 1
			i += 1
		return (same, float(same)/float(length))


if __name__ == "__main__":
    main()