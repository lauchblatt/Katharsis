#coding: utf8

import json
import csv
from collections import OrderedDict

# class for generating output about dramas
class DramaOutput:

    # generates the basic CSV
    def generate_basic_CSV(self, dramas):
        basicCsv = []
        firstRow = ["Title", "Author", "Date", "Type", "Conf.Density",
        "Number of Speeches", "Avg. Length of Speeches","Max. Length of Speeches",
        "Min. Length of Speeches", "Med. Length of Speeches"]
        basicCsv.append(firstRow);
        for drama in dramas:
            # for attributes which can contain commas
            title = drama._title.replace(",", "")
            author = drama._author.replace(",", "")
            date = str(drama._date).replace(",", "")

            dramaData = [title, author, date, drama._type,
                drama._configuration_density, len(drama.get_speeches_drama()),
                drama._speechesLength_avg, drama._speechesLength_max, drama._speechesLength_min,
                drama._speechesLength_med]
            basicCsv.append(dramaData)        

        doc = open('basicData.csv', 'w', newline="")
        writer = csv.writer(doc, delimiter=",")
        writer.writerows(basicCsv)
        doc.close

    # generates an ordered dictionary of drama data
    def generate_drama_data(self, drama):
        drama_data = OrderedDict({})
        drama_data['title'] = drama._title
        drama_data['author'] = drama._author
        drama_data['date'] = drama._date
        drama_data['type'] = drama._type
        drama_data['castgroup'] = drama._castgroup

        drama_data['configuration_density'] = drama._configuration_density
        drama_data['number_of_speeches_in_drama'] = len(drama.get_speeches_drama())
        drama_data['average_length_of_speeches_in_drama'] = drama._speechesLength_avg
        drama_data['maximum_length_of_speeches_in_drama'] = drama._speechesLength_max
        drama_data['minimum_length_of_speeches_in drama'] = drama._speechesLength_min
        drama_data['median_length_of_speeches_in_drama'] = drama._speechesLength_med

        speakers_json = self.generates_data_struct_for_speakers(drama._speakers)
        drama_data['speakers'] = speakers_json

        acts_json = self.generates_data_struct_for_acts(drama._acts)
        drama_data['content'] = acts_json

        return drama_data;

    # writes JSON data into a file
    def write_JSON(self, dramaData):
        drama_json = json.dumps(dramaData, indent=4, ensure_ascii=True)
        doc = open(dramaData["author"]+ "_"+dramaData["title"]+'_data.json', 'w')
        doc.write(drama_json)
        doc.close

    # generates an array of ordered dictionaries containing speaker data
    def generates_data_struct_for_speakers(self, speakers):
        speakers_data = []
        for speaker in speakers:
            speaker_data = OrderedDict({})
            speaker_data['name'] = speaker._name
            speaker_data['number_of_speakers_speeches'] = len(speaker._speeches)
            speaker_data['average_length_of_speakers_speeches'] = speaker._speechesLength_avg
            speaker_data['maximum_length_of_speakers_speeches'] = speaker._speechesLength_max
            speaker_data['minimum_length_of_speakers_speeches'] = speaker._speechesLength_min
            speaker_data['median_length_of_speakers_speeches'] = speaker._speechesLength_med

            speaker_relations = OrderedDict({})
            speaker_relations['concomitant'] = speaker._concomitant
            speaker_relations['alternative'] = speaker._alternative
            speaker_relations['dominates'] = speaker._dominates
            speaker_relations['gets_dominated_by'] = speaker._gets_dominated_by
            speaker_relations['independent'] = speaker._independent

            speaker_data["relations"] = speaker_relations
            speakers_data.append(speaker_data)

        return speakers_data

    # generates an array of ordered dictionaries containing act data
    def generates_data_struct_for_acts(self, acts):
        acts_data = []
        iterator = 1
        for act in acts:
            act_data = OrderedDict({})
            act_data['number_of_act'] = act._number
            act_data['number_of_speeches_in_act'] = len(act.get_speeches_act())
            act_data['appearing_speakers'] = act._appearing_speakers

            act_data['average_length_of_speeches_in_act'] = act._speechesLength_avg
            act_data['maximum_length_of_speeches_in_act'] = act._speechesLength_max
            act_data['minimum_length_of_speeches_in_act'] = act._speechesLength_min
            act_data['median_length_of_speeches_in_act'] = act._speechesLength_med

            configurations_json = self.generates_data_struct_for_config(act._configurations)
            act_data['scenes'] = configurations_json

            acts_data.append(act_data)

        return acts_data

    # generates an array of ordered dictionaries containing configuration data
    def generates_data_struct_for_config(self, configurations):
        configurations_data = []

        for configuration in configurations:
            configuration_data = OrderedDict({})
            configuration_data['number_of_scene'] = configuration._number
            configuration_data['number_of_speeches_in_scene'] = len(configuration._speeches)

            if configuration._appearing_speakers:
                configuration_data['appearing_speakers'] = configuration._appearing_speakers
            else:
                configuration_data['appearing_speakers'] = 0

            configuration_data['average_length_of_speeches_in_scene'] = configuration._speechesLength_avg
            configuration_data['maximum_length_of_speeches_in_scene'] = configuration._speechesLength_max
            configuration_data['minimum_length_of_speeches_in_scene'] = configuration._speechesLength_min
            configuration_data['median_length_of_speeches_in_scene'] = configuration._speechesLength_med

            if configuration._speeches:
                configuration_data['speeches'] = self.generates_data_struct_for_speeches(configuration._speeches)
            else:
                configuration_data['speeches'] = 0

            

            configurations_data.append(configuration_data)

        return configurations_data

    # generates an array of ordered dictionaries containing speeches data
    def generates_data_struct_for_speeches(self, speeches):
        speeches_data = []

        for speech in speeches:
            speech_data = OrderedDict({})

            speech_data['speaker'] = speech._speaker
            speech_data['length'] = speech._length

            speeches_data.append(speech_data)

        return speeches_data

    # generates configuration matrix CSV for one drama
    def generate_config_matrix_CSV(self, drama_model):
        doc = open(drama_model._author+"_"+drama_model._title+'_matrix.csv', 'w', newline="")
        writer = csv.writer(doc, delimiter=",")
        cf = drama_model._configuration_matrix
        writer.writerows(cf)
        doc.close

    # generates normalized JSON
    def generates_normalized_JSON(self, dramas):
        dramaJsonArray = []
        for drama in dramas:
            dramaJsonArray.append(self.generate_drama_data(drama))

        dramas_json = json.dumps(dramaJsonArray, indent=4, ensure_ascii=True)
        doc = open('Dramas_data.json', 'w')
        doc.write(dramas_json)
        doc.close

    # generates denormalized JSON
    def generate_denormalized_JSON(self, dramas):
        dramas_output = OrderedDict({})
        i = 0
        drama_level_infos = []
        speakers_level_infos = OrderedDict({})
        acts_level_infos = OrderedDict({})
        scenes_level_infos = OrderedDict({})

        for drama in dramas:
            drama_level_info = self.generate_denormalized_drama_data(drama, i)
            drama_level_infos.append(drama_level_info)

            speakers_level_info = self.generates_data_struct_for_speakers(drama._speakers)
            speakers_level_infos[i] = speakers_level_info

            acts_level_info = self.generate_denormalized_act_data(drama._acts)
            acts_level_infos[i] = acts_level_info

            scenes_level_info = OrderedDict({})
            iterator = 0
            for act in drama._acts:
                scenes_level_info[iterator] = self.generates_data_struct_for_config(act._configurations)
                iterator = iterator + 1
            scenes_level_infos[i] = scenes_level_info

            i = i + 1

        dramas_output["drama_data"] = drama_level_infos
        dramas_output["speakers_data"] = speakers_level_infos
        dramas_output["acts_data"] = acts_level_infos
        dramas_output["scenes_data"] = scenes_level_infos

        dramas_json = json.dumps(dramas_output, indent=4, ensure_ascii=True)
        doc = open('Dramas_data.json', 'w')
        doc.write(dramas_json)
        doc.close

    # generates denormalized drama data
    def generate_denormalized_drama_data(self, drama, drama_id):
        drama_data = OrderedDict({})
        drama_data['id'] = drama_id
        drama_data['title'] = drama._title
        drama_data['author'] = drama._author
        drama_data['date'] = drama._date
        drama_data['year'] = drama._year
        drama_data['type'] = drama._type
        drama_data['castgroup'] = drama._castgroup
        drama_data['speaker_count_castgroup'] = drama._speakerCountCast
        drama_data['speaker_count'] = drama._speakerCountAll
        drama_data['configuration_density'] = drama._configuration_density
        drama_data['number_of_speeches_in_drama'] = len(drama.get_speeches_drama())
        drama_data['average_length_of_speeches_in_drama'] = drama._speechesLength_avg
        drama_data['maximum_length_of_speeches_in_drama'] = drama._speechesLength_max
        drama_data['minimum_length_of_speeches_in_drama'] = drama._speechesLength_min
        drama_data['median_length_of_speeches_in_drama'] = drama._speechesLength_med
        drama_data['number_of_acts'] = self.get_number_of_acts(drama)
        drama_data['number_of_scenes'] = self.get_number_of_scenes(drama)
        drama_data['speakers'] = self.get_list_of_speakers(drama);
        return drama_data

    # returns number of acts
    def get_number_of_acts(self, drama):
        return len(drama._acts)

    # returns number of scenes
    def get_number_of_scenes(self, drama):
        number = 0
        for act in drama._acts:
            number = number + len(act._configurations)
        return number

    # returns list of all speakers
    def get_list_of_speakers(self, drama):
        speakersList = []
        for speaker in drama._speakers:
            speakersList.append(speaker._name)

        return speakersList

    # generates denormalized data for acts
    def generate_denormalized_act_data(self, acts):
        acts_data = []
        iterator = 1
        for act in acts:
            act_data = OrderedDict({})
            act_data['number_of_act'] = act._number
            act_data['number_of_speeches_in_act'] = len(act.get_speeches_act())
            act_data['appearing_speakers'] = act._appearing_speakers
            
            act_data['average_length_of_speeches_in_act'] = act._speechesLength_avg
            act_data['maximum_length_of_speeches_in_act'] = act._speechesLength_max
            act_data['minimum_length_of_speeches_in_act'] = act._speechesLength_min
            act_data['median_length_of_speeches_in_act'] = act._speechesLength_med

            acts_data.append(act_data)

        return acts_data

