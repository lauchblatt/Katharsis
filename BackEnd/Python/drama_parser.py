#coding: utf8

import xml.etree.ElementTree as ET
import re
import os
from drama_models import *

class DramaParser:

    namespaces = {'tei':'http://www.tei-c.org/ns/1.0'} # used to read the tags in the xml correctly

    # starting point for the parsing
    def parse_xml(self, filepath):
        drama_model = DramaModel()
        xml_root = self.get_xml_root(filepath) # get xml treeroot

        # general information
        drama_model._title = self.get_title(xml_root)
        drama_model._author = self.get_author(xml_root)
        drama_model._date = self.get_date(xml_root)
        
        if 'when' in drama_model._date:
            drama_model._year = drama_model._date['when']
        else:
            drama_model._year = 'unknown'

        drama_model._type = self.get_type(filepath)

        drama_model._subact_type = self.get_subact_type(xml_root)
        drama_model._acts = self.extract_act_data(xml_root)
        drama_model._speakers = self.get_all_speakers(xml_root)
        drama_model._castgroup = self.get_speakers_from_castgroup(xml_root)

        self.calc_statistics(drama_model)

        return drama_model

    # calculates statistics for the whole drama
    def calc_statistics(self, drama_model):
        drama_model.calc_config_density()
        drama_model.calc_config_matrix()
        drama_model.calc_speaker_relations()

        # speech statistics
        drama_model.calc_speeches_statistics()

        for act in drama_model._acts:
            act.calc_speeches_statistics()

            for configuration in act._configurations:
                configuration.calc_speeches_statistics()
                normal = 0
                for speech in configuration._speeches:
                    normal = normal + speech._length
                 

        drama_model.add_speeches_to_speakers()
        for speaker in drama_model._speakers:
            speaker.calc_speeches_statistics()

        drama_model.set_speaker_count()

    # returns the xml root for the file
    def get_xml_root(self, filepath):
        tree = ET.parse(filepath)
        return tree.getroot()

    # returns the drama title
    def get_title(self, xml_root):
        title = xml_root.find(".//tei:fileDesc/tei:titleStmt/tei:title", self.namespaces).text
        return title

    # returns the drama author
    def get_author(self, xml_root):
        author = xml_root.find(".//tei:sourceDesc/tei:biblFull/tei:titleStmt/tei:author", self.namespaces).text
        return author

    # returns the drama date
    def get_date(self, xml_root):
        date = xml_root.find(".//tei:profileDesc/tei:creation/tei:date", self.namespaces).attrib
        if "when" in date:
            date['when'] = (int) (date['when'])
            return date

        if "notBefore" in date:
            date['when'] = ((int) (date['notBefore']) + (int) (date['notAfter'])) / 2
            return date

        date['when'] = 'unknown'

        return date

    # returns the drama type from the filename
    def get_type(self, filepath):
        filepath = filepath.lower()
        if filepath.find("_s.xml") != -1 or filepath.find("_.s.xml") != -1:
            return "Schauspiel"
        elif filepath.find("_t.xml") != -1 or filepath.find("_.t.xml") != -1 or filepath.find("_t4.xml") != -1:
            return "Trauerspiel"
        elif filepath.find("_k.xml") != -1 or filepath.find("_.k.xml") != -1:
            return "Komoedie"
        elif filepath.find("_tk.xml") != -1:
            return "not sure"
        return "unknown"

    # returns if the drama contains Szene or Auftritt
    def get_subact_type(self, xml_root):
        subact_type = xml_root.find(".//tei:div[@type='act']/tei:div[@subtype='work:no']//tei:desc/tei:title", self.namespaces).text
        if subact_type.find("Auftritt") != -1:
            return "Auftritt"
        elif subact_type.find("Szene") != -1:
            return "Szene"

    # every speaker, even if they are double with different names
    def get_all_speakers(self, xml_root, as_objects = True):
        speaker_list = []
        for speaker in xml_root.findall(".//tei:div[@type='act']//tei:speaker", self.namespaces):
            name = speaker.text

            if name:
                name = name.strip(' \t\n\r')

            if not name:
                continue

            if name and name[-1] == ".":
                name = name[:-1]
            if name and name[-1] == ",":
                name = name[:-1]
            if name and name not in speaker_list:
                speaker_list.append(name)

        if not as_objects:
            return speaker_list

        speaker_model_list = []

        for speaker in speaker_list:
            speaker_model = SpeakerModel()
            speaker_model._name = speaker
            speaker_model_list.append(speaker_model)
        return speaker_model_list

    # persons which are listed in the beginning
    def get_speakers_from_castgroup(self, xml_root):
        castgroup = []
        for actor in xml_root.findall(".//tei:castGroup/tei:castItem", self.namespaces):
            real_name = actor.text


            if real_name:
                real_name = real_name.strip(' \t\n\r')

            if not real_name:
                continue

            if "," in real_name:
                comma = real_name.index(",")
                real_name = real_name[:comma]
            elif real_name and real_name[-1] == ".":
                real_name = real_name[:-1]
            elif real_name and real_name[-1] == ",":
                real_name = real_name[:-1]

            if real_name: 
                castgroup.append(real_name)

        return castgroup

    # returns informations about all acts of the drama
    def extract_act_data(self, xml_root):
        act_data = []
        position = 1
        # gets number of acts and corresponding count of scenes
        for act in xml_root.findall(".//tei:div[@type='act']", self.namespaces):

            # number_of_scenes = len(act.findall("./tei:div[@subtype='work:no']", self.namespaces))
            act_model = ActModel()
            act_model._number = position
            act_model._configurations = self.extract_subact_data(act, position)
            act_model.set_appearing_speakers()
            act_data.append(act_model)
            position += 1

        return act_data

    # returns informations about all subacts of the drama
    def extract_subact_data(self, act, position):
        config_data = []
        subact_position = 1
        for subact in act.findall("./tei:div[@subtype='work:no']", self.namespaces):
            config_model = ConfigurationModel()
            config_model._number = subact_position
            config_model._name = str(position) + " - " + str(subact_position)
            config_model._speeches = self.get_speeches_for_subact(subact)
            config_model._appearing_speakers = self.get_speakers_for_subact(subact)
            config_data.append(config_model)
            subact_position += 1
        return config_data

    # returns speech for subact
    def get_speeches_for_subact(self, subact):
        speech_data = []

        for subact_speaker_wrapper in subact.findall(".//tei:sp", self.namespaces):
            speech_model = SpeechModel()
            subact_speaker = subact_speaker_wrapper.find("./tei:speaker", self.namespaces)
            name = subact_speaker.text

            if name:
                name = name.strip(' \t\n\r')

            if not name:
                continue

            if name and name[-1] == ".":
                name = name[:-1]
            if name and name[-1] == ",":
                name = name[:-1]

            speech_model._speaker = name
            speech_model._text = self.get_speech_text(subact_speaker_wrapper)
            speech_model._length = self.get_speech_length(subact_speaker_wrapper)

            # speech with a length of zero or less are not added
            if(speech_model._length > 0):
                speech_data.append(speech_model)

        return speech_data

    def get_stage_text(self, sub_sp_wrapper):
        print ("no Idea")

    # calculates length of speech
    def get_speech_text(self, sub_sp_wrapper):
        speechText = ""
        
        speechText = ""
        children = sub_sp_wrapper.getchildren()
        

        for element in children:
            if (element.tag == "{http://www.tei-c.org/ns/1.0}l"):
                for text in element.itertext():
                    if (text[0] == " " or speechText.endswith(" ")):
                        speechText = speechText + text
                    else:
                        speechText = speechText + " " + text
            if (element.tag == "{http://www.tei-c.org/ns/1.0}lg"):
                for l_element in element.findall("./tei:l", self.namespaces):
                    for text in l_element.itertext():
                        if (text[0] == " " or speechText.endswith(" ")):
                            speechText = speechText + text
                        else:
                            speechText = speechText + " " + text
            if (element.tag == "{http://www.tei-c.org/ns/1.0}p"):
                for text in element.itertext():
                    if(text.startswith("Ende de")):
                        speechText = speechText
                    else:
                        if (text[0] == " " or speechText.endswith(" ")):
                            speechText = speechText + text
                        else:
                            speechText = speechText + " " + text
            
        ### Ohne Szenenanweisungen
        """
        for element in children:
            if (element.tag == "{http://www.tei-c.org/ns/1.0}l"):
                text = element.text
                if (text[0] == " " or speechText.endswith(" ")):
                    speechText = speechText + text
                else:
                    speechText = speechText + " " + text
            if (element.tag == "{http://www.tei-c.org/ns/1.0}lg"):
                for l_element in element.findall("./tei:l", self.namespaces):
                    text = element.text
                    if (text[0] == " " or speechText.endswith(" ")):
                        speechText = speechText + text
                    else:
                        speechText = speechText + " " + text
            if (element.tag == "{http://www.tei-c.org/ns/1.0}p"):
                text = element.text
                if(text.startswith("Ende de")):
                    speechText = speechText
                else:
                    if (text[0] == " " or speechText.endswith(" ")):
                        speechText = speechText + text
                    else:
                        speechText = speechText + " " + text
            """

        return speechText

    # calculates length of speech
    def get_speech_length(self, sub_sp_wrapper):
        length = 0
        stage_dir_length = 0
        p_tag = sub_sp_wrapper.find("./tei:p", self.namespaces)
        l_tag = sub_sp_wrapper.find("./tei:l", self.namespaces)

        if p_tag is not None:
            for element in p_tag.findall("./tei:hi[@rend='italic']", self.namespaces):
                stage_dir_length += self.get_wordcount_from_string(element.text)
            for text in p_tag.itertext():
                length += self.get_wordcount_from_string(text)
            length = length - stage_dir_length

        elif l_tag is not None:
            for element in l_tag.findall("./tei:hi[@rend='italic']", self.namespaces):
                stage_dir_length += self.get_wordcount_from_string(element.text)
            for text in l_tag.itertext():
                length += self.get_wordcount_from_string(text)
            length = length - stage_dir_length

        # for classic dramas with noted line breaks
        if l_tag is None:
            lg_tag = sub_sp_wrapper.findall("./tei:lg", self.namespaces)
            for lg_element in sub_sp_wrapper.findall("./tei:lg", self.namespaces):
                for l_element in lg_element.findall("./tei:l", self.namespaces):
                    length += self.get_wordcount_from_string(l_element.text)

        return length

    # calculates the wordcount of a string
    def get_wordcount_from_string(self, text):
        word_list = re.sub("[^\w]", " ", text).split()
        # analise the word list
        return len(word_list)

    # returns all speakers for the subact
    def get_speakers_for_subact(self, subact):
        speaker_data = []

        for subact_speaker in subact.findall(".//tei:speaker", self.namespaces):
            name = subact_speaker.text

            if name:
                name = name.strip(' \t\n\r')

            if not name:
                continue

            if name and name[-1] == ".":
                name = name[:-1]
            if name and name[-1] == ",":
                name = name[:-1]
            if name and name not in speaker_data:
                speaker_data.append(name)

        return speaker_data

    