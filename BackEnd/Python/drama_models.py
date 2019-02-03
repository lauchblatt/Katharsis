#coding: utf8

from statistic_functions import *
from collections import OrderedDict

# model for the whole drama
class DramaModel:

    def __init__ (self):
        self._title = None
        self._date = None
        self._type = None
        self._author = None
        self._acts = None
        self._year = None
        self._speakers = None
        self._castgroup = None
        self._speakerCountCast = 0
        self._speakerCountAll = 0

        self._configuration_matrix = None
        self._configuration_density = None

        self._speechesLength_avg = 0
        self._speechesLength_max = 0
        self._speechesLength_min = 0
        self._speechesLength_med = 0

        self._sentimentBearingWords = None
        self._sentimentMetrics = None
        self._lengthInWords = 0

    # calculates the configuration matrix
    def calc_config_matrix (self):
        configuration_matrix = []
        firstRow = ["Speaker/Configuration"]
        firstRow.extend(self.get_all_config_names())
        configuration_matrix.append(firstRow)

        for speaker in self._speakers:
            nextRow = [speaker._name]
            nextRow.extend(self.get_matrix_row(speaker))
            configuration_matrix.append(nextRow)
        self._configuration_matrix = configuration_matrix

    # extracts all names for configurations
    def get_all_config_names(self):
        configurationNames = []
        for act in self._acts:
            for configuration in act._configurations:
                configurationNames.append(configuration._name)
        return configurationNames

    # create a row for the configuration matrix
    def get_matrix_row(self, speaker):
        config_bin = []
        for act in self._acts:
            for configuration in act._configurations:
                if(speaker._name in configuration._appearing_speakers):
                    config_bin.append(1)
                else:
                    config_bin.append(0)
        return config_bin

    # calculates the configuration density
    def calc_config_density (self):
        sum_all = 0
        sum_speaking = 0
        for act in self._acts:
            for configuration in act._configurations:
                sum_speaking += len(configuration._appearing_speakers)
                sum_all += len(self._speakers)

        self._configuration_density = float(sum_speaking) / sum_all

    # calculates the speaker relations
    def calc_speaker_relations (self):
        for speaker in self._speakers:
            speaker._concomitant = self.get_concomitant_speakers(speaker)
            speaker._alternative = self.get_alternative_speakers(speaker)
        for speaker in self._speakers:
            self.check_dominating_status(speaker)
        for speaker in self._speakers:
            speaker._independent = self.get_independent_speakers(speaker)

    # returns a list of all speakers
    def get_list_of_speaker_names(self, current_speaker):
        speaker_names = []
        for speaker in self._speakers:
            if speaker is not current_speaker:
                speaker_names.append(speaker._name)
        return speaker_names

    # calculates concomitant speakers
    def get_concomitant_speakers (self, speaker):
        concomitant_speakers = self.get_list_of_speaker_names(speaker)
        for act in self._acts:
            for configuration in act._configurations:
                if speaker._name in configuration._appearing_speakers:
                    concomitant_speakers = list(set(concomitant_speakers).intersection(configuration._appearing_speakers))
        return concomitant_speakers

    # calculates alternative speakers
    def get_alternative_speakers(self, speaker):
        alternative_speakers = self.get_list_of_speaker_names(speaker)
        for act in self._acts:
            for configuration in act._configurations:
                if speaker._name in configuration._appearing_speakers:
                    alternative_speakers = list(set(alternative_speakers) - set(configuration._appearing_speakers))
        return alternative_speakers

    # calculates dominant speakers
    def check_dominating_status(self, current_speaker):
        for speaker in self._speakers:
            if speaker is current_speaker:
                continue
            if speaker._name in current_speaker._concomitant:
                if current_speaker._name not in speaker._concomitant:
                    current_speaker._gets_dominated_by.append(speaker._name)
                    speaker._dominates.append(current_speaker._name)
                    current_speaker._concomitant.remove(speaker._name)

    # calculates independent speakers
    def get_independent_speakers(self, speaker):
        independent_speakers = self.get_list_of_speaker_names(speaker)
        independent_speakers = list(set(independent_speakers) - set(speaker._concomitant))
        independent_speakers = list(set(independent_speakers) - set(speaker._alternative))
        independent_speakers = list(set(independent_speakers) - set(speaker._dominates))
        independent_speakers = list(set(independent_speakers) - set(speaker._gets_dominated_by))
        return independent_speakers

    # returns all speeches of the whole drama
    def get_speeches_drama(self):
        speeches_in_drama = []
        for act in self._acts:
            speeches_in_drama.extend(act.get_speeches_act())
        return speeches_in_drama

    # calculates the speech statistics for the whole drama
    def calc_speeches_statistics(self):
        speeches = self.get_speeches_drama()
        speeches_lengths = []

        for speech in speeches:
            speeches_lengths.append(speech._length)

        self._speechesLength_avg = average(speeches_lengths)
        self._speechesLength_max = custom_max(speeches_lengths)
        self._speechesLength_min = custom_min(speeches_lengths)
        self._speechesLength_med = median(speeches_lengths)


    # assigns speeches to speakers
    def add_speeches_to_speakers(self):
        speeches = self.get_speeches_drama()
        for speech in speeches:
            for speaker in self._speakers:
                if(speech._speaker == speaker._name):
                    speaker._speeches.append(speech)
                    break

    # calculates and sets the speaker counts
    def set_speaker_count(self):
        self._speakerCountCast = len(self._castgroup)
        self._speakerCountAll = len(self._speakers)


# model for acts
class ActModel:

    def __init__ (self):
        self._number = None
        self._configurations = None
        self._appearing_speakers = []

        self._speechesLength_avg = 0
        self._speechesLength_max = 0
        self._speechesLength_min = 0
        self._speechesLength_med = 0

        self._sentimentBearingWords = None
        self._sentimentMetrics = None
        self._lengthInWords = 0

        self._actSpeakers = {}

    # returns all speeches for the act
    def get_speeches_act(self):
        speeches_in_act = []
        for configuration in self._configurations:
            for speeches in configuration._speeches:
                speeches_in_act.append(speeches)

        return speeches_in_act

    # calculates speech statistics for the act
    def calc_speeches_statistics(self):
        speeches = self.get_speeches_act()
        speeches_lengths = []
        for speech in speeches:
            speeches_lengths.append(speech._length)

        self._speechesLength_avg = average(speeches_lengths)
        self._speechesLength_max = custom_max(speeches_lengths)
        self._speechesLength_min = custom_min(speeches_lengths)
        self._speechesLength_med = median(speeches_lengths)

    # generates the appearing speakers list
    def set_appearing_speakers(self):
        for configuration in self._configurations:
            for speaker in configuration._appearing_speakers:
                if speaker not in self._appearing_speakers:
                    self._appearing_speakers.append(speaker)


# model for configurations
class ConfigurationModel:

    def __init__ (self):
        self._name = None
        self._number = None
        self._speeches = None
        self._appearing_speakers = None

        self._speechesLength_avg = 0
        self._speechesLength_max = 0
        self._speechesLength_min = 0
        self._speechesLength_med = 0

        self._sentimentBearingWords = None
        self._sentimentMetrics = None
        self._lengthInWords = 0

        self._subsequentNumber = -1
        self._confSpeakers = {}

        self._stageDirections = []


    # calculates speech statistics for configuration
    def calc_speeches_statistics(self):
        speeches = self._speeches
        speeches_lengths = []

        for speech in speeches:
            speeches_lengths.append(speech._length)

        if(speeches):
            self._speechesLength_avg = average(speeches_lengths)
            self._speechesLength_max = custom_max(speeches_lengths)
            self._speechesLength_min = custom_min(speeches_lengths)
            self._speechesLength_med = median(speeches_lengths)

# model for stageDirections
class StageDirection:

    def __init__ (self):
        self._length = None
        self._lengthInWords = 0
        self._text = None
        self._textAsLanguageInfo = []

        self._numberInAct = -1
        self._numberInConf = -1
        sefl._subsequentNumber = 0


# model for speech
class SpeechModel:

    def __init__ (self):
        self._length = None
        self._lengthInWords = 0
        self._speaker = None

        self._text = None
        self._textAsLanguageInfo = []

        self._sentimentBearingWords = []
        self._sentimentMetrics = None
        self._subsequentNumber = -1
        self._numberInAct = -1
        self._numberInConf = -1

        self._preOccuringSpeaker = ""

# model for speakers
class SpeakerModel:

    def __init__ (self):
        self._name = None   
        self._alternative_names = None
        self._speeches = []
        self._concomitant = []
        self._alternative = []
        self._dominates = []
        self._gets_dominated_by = []
        self._independent = []
        # self._repetitive_config = None

        self._speechesLength_avg = 0
        self._speechesLength_med = 0
        self._speechesLength_min = 0
        self._speechesLength_max = 0

        self._lengthInWords = 0
        self._sentimentBearingWords = []
        self._sentimentMetrics = None
        self._sentimentRelations = None


    # calculates speech statistics for speaker
    def calc_speeches_statistics(self):
        speeches_lengths = []

        for speeches in self._speeches:
            speeches_lengths.append(speeches._length)

        if(speeches_lengths):
            self._speechesLength_avg = average(speeches_lengths)
            self._speechesLength_max = custom_max(speeches_lengths)
            self._speechesLength_min = custom_min(speeches_lengths)
            self._speechesLength_med = median(speeches_lengths)

            