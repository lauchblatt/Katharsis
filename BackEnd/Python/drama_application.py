#coding: utf8

import os
from drama_parser import *
from drama_output import *
import sys
import codecs
import nltk
from nltk.stem.porter import PorterStemmer
from nltk.tokenize import sent_tokenize
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag
from drama_parser import *
from drama_models import *
from lp_language_processor import *
from sa_sentiment_analysis import *
import pickle
from sa_pre_processing import *
from lp_treetagger import *

def main():
    
    reload(sys)
    sys.setdefaultencoding('utf8')

    debug = True

    parser = DramaParser()

    dramaModel = parser.parse_xml("Korpus/schi_kabale_t.xml")
    i = 0
    for act in dramaModel._acts:
        for conf in act._configurations:
            for speech in conf._speeches:
                    text = speech._text
                    text = speech._text.strip()
                    text = text.strip("\n")
                    text = text.rstrip(" ")
                    text = text.lstrip(" ")
                    text = text.replace("\n", "")
                    text = text.replace("   ", " ")
                    speaker = speech._speaker
                    print speaker
                    print text
                    i = i + 1
        print i

    """
    for filename in os.listdir("Korpus/"):

        dramaModel = parser.parse_xml("Korpus/" + filename)
        print(dramaModel._title)
        filename = filename.replace(".xml", "")
        file = open("Korpus_structured/" + filename + ".txt", "w")
        file.write(dramaModel._title + "\n")
        file.write("by " + dramaModel._author + "\n")
        
        speakerslist = []
        for speaker in dramaModel._speakers:
            speakerslist.append(speaker._name)
        file.write("Speakers: " + str(speakerslist) + "\n" + "\n")  
        for act in dramaModel._acts:
            file.write("Act " + str(act._number) + "\n" + "\n")
            for conf in act._configurations:
                file.write("Configuration " + str(conf._number)+ "\n"+ "\n")
                for speech in conf._speeches:
                    text = speech._text
                    text = speech._text.strip()
                    text = text.strip("\n")
                    text = text.rstrip(" ")
                    text = text.lstrip(" ")
                    text = text.replace("\n", "")
                    text = text.replace("   ", " ")
                    
                    file.write(speech._speaker+ "\n")
                    file.write(text+ "\n")
                file.write("\n")
        file.close()
    """

    """
    for filename in os.listdir("Dumps/ProcessedDramas/treetagger/"):
        dpp = Drama_Pre_Processing("treetagger")
        dramaModel = dpp.readDramaModelFromDump("Dumps/ProcessedDramas/treetagger/" + filename)
        print dramaModel._title
        newFilename = filename.replace(".p", ".txt")
        outputPath = ("../Lessing-Dramen-lemmatized-noStopwords/" + newFilename)
        file = open(outputPath, 'w')
        treetagger = Tree_Tagger()
        treetagger.initStopWords("standardList")
        
        for act in dramaModel._acts:
            for conf in act._configurations:
                for speech in conf._speeches:
                    #file.write(speech._textAsLanguageInfo.strip() + "\n")
                    lemmatizedSpeech = ""
                    for li in speech._textAsLanguageInfo:
                        if((li[0] in treetagger._stopwords) or (li[0] in treetagger._stopwords_lemmatized)):
                            pass
                        else:
                            lemmatizedSpeech = lemmatizedSpeech + li[0] + " "
                    lemmatizedSpeech = lemmatizedSpeech.strip()
                    file.write(lemmatizedSpeech + "\n")

       
        file.close()
    """

    
    """
    for filename in os.listdir("Korpus"):
        parser = DramaParser()
        dramaModel = parser.parse_xml("Korpus/" + filename)

        for act in dramaModel._acts:
            for conf in act._configurations:
                speakerCount = len(conf._appearing_speakers)
                if (speakerCount < 2):
                    lineParts = []
                    lineParts.append(dramaModel._title)
                    lineParts.append(dramaModel._type)
                    lineParts.append(dramaModel._author)
                    lineParts.append(str(act._number))
                    lineParts.append(str(conf._number))
                    lineParts.append(str(len(conf._appearing_speakers)))
                    if(speakerCount == 1):
                        lineParts.append(conf._appearing_speakers[0])
                    else:
                        lineParts.append("Not identified")
                    text = ""
                    for speech in conf._speeches:
                        text = text + " " + speech._text.strip().replace("\n", "")
                    lineParts.append(text)
                    line = "\t".join(lineParts)
                    print line


         Method to get proportion of last scene
        numberOfAllSpeaker = float(len(dramaModel._speakers))
        acts = dramaModel._acts
        lastAct = acts[len(dramaModel._acts)-1]
        confs = lastAct._configurations
        lastConf = confs[len(lastAct._configurations)-1]
        #print len(lastConf._appearing_speakers)
        numberOfFinalSpeakers = float(len(lastConf._appearing_speakers))
        proportion = numberOfFinalSpeakers/numberOfAllSpeaker
        line = [dramaModel._title, dramaModel._author, dramaModel._type]
        line.append(str(len(dramaModel._speakers)))
        line.append(str(int(numberOfFinalSpeakers)))
        line.append(str(proportion).replace(".", ","))
        printLine = "\t".join(line)
        print printLine


    """
    """
    parser = DramaParser()
    dramaModel = parser.parse_xml("../Lessing-Dramen/-Der_junge_Gelehrte.xml")
    output = DramaOutput()
    drama_data = output.generate_drama_data(dramaModel)
    output.write_JSON(drama_data)
    """

    """
    # used to generate a JSON file of all dramas
    parser = DramaParser()
    output = DramaOutput()
    dramas = []
    dramasForDenormalizing = []

    # if debug mode is true, no exception will be catched
    if debug:

        for filename in os.listdir("../Korpus"):
            
            dramaModel = parser.parse_xml("../Korpus/" + filename)
            dramasForDenormalizing.append(dramaModel)
            print("Erfolg beim Parsen eines Dramas")
            
            dramaModel = parser.parse_xml("../Korpus/" + filename)
            dramas.append(dramaModel)
            print("Erfolg beim Parsen eines Dramas")
            

    else:
        for filename in os.listdir("../Korpus"):
            try:
                dramaModel = parser.parse_xml("../Korpus/" + filename)
                dramasForDenormalizing.append(dramaModel)
                print("Erfolg beim Parsen eines Dramas")
            except:
                print("Fehler beim Parsen eines Dramas")
                print("!!! " + filename)


    output.generate_denormalized_JSON(dramasForDenormalizing)
    output.generates_normalized_JSON(dramas)
    """


if __name__ == "__main__":
    main()