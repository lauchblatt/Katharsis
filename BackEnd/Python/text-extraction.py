#coding: utf8
import os
import re
import collections
import locale
import sys
import codecs
import nltk
import xml.etree.ElementTree as ET
from drama_parser import *
from drama_output import *


def main():
	reload(sys)
	sys.setdefaultencoding('utf8')
	te = Text_Extraction()
	te.createSpeechesPerLine("../Lessing-Dramen/less-Emilia_t.xml", "Speeches_per_line/Emilia_Act5.txt")
	#parser = DramaParser()
	#print parser
	#dramaModel = parser.parse_xml("../Lessing-Dramen/less-Emilia_t.xml")


class Text_Extraction:
	
	def __init__(self):
		self._tch = None
		self._parser = None

	def createSpeechesPerLine(self, pathToDrama, pathToSaveFile):
		saveFile = open(pathToSaveFile, "w")
		parser = DramaParser()
		dramaModel = parser.parse_xml(pathToDrama)
		i = 0
		for conf in dramaModel._acts[4]._configurations:
			for speech in conf._speeches:
				i = i + 1
				text = speech._text
				text = text.strip()
				text = text.strip(' \t\n\r')
				text = text.replace('\n', '')
				#print ("NEW_SPEECH")
				print text
				saveFile.write(speech._text + "\n")
		print i

	def getRawTextDramas(self):
		for filename in os.listdir("Dramen-Textgrid"):
			try:
				text = open('Dramen-Textgrid/' + filename).read()
				textNoTags = ''.join(ET.fromstring(text).itertext())

				file = open('Dramen-Textgrid_rawInnerText/' + filename[:-3] + "txt", "w")
				file.write(textNoTags)
			except:
				print filename


if __name__ == "__main__":
    main()