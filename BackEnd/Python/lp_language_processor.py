#coding: utf8

import os
import re
import collections
import locale
import sys
from lp_textblob import *
from lp_treetagger import *

def main():
	reload(sys)
	sys.setdefaultencoding('utf8')

# Higer Class to choose a language-processor
class Language_Processor:

	def __init__(self, processor):
		self._processor = None
		self.setProcessor(processor)

	def setProcessor(self, processor):
		if(processor == "textblob"):
			self._processor = Text_Blob()
		if(processor == "treetagger"):
			self._processor = Tree_Tagger()

if __name__ == "__main__":
    main()
