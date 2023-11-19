import os
import xml.etree.ElementTree as ET


def get_all_musicxml_filenames():
    cwd = os.getcwd()
    ls = os.listdir(cwd)
    def is_musicxml_file(filename): return filename.endswith('.musicxml')
    musicxml_files = list(filter(is_musicxml_file, ls))
    return musicxml_files


def choose(choices):
    # def label(pair): return f'[{pair[0] + 1}] {pair[1]}'
    # query_string = '\n'.join(map(label, enumerate(choices)))
    query_string = '\n'.join([f'[{i + 1}] {j}' for i, j in enumerate(choices)])
    print(query_string)
    while True:
        try:
            response = input('Which MusicXML file would you like to clean? ')
            index = int(response.strip())
            chosen_filename = choices[index - 1]
            return chosen_filename
        except Exception as inst:
            print(inst)


def filter_tree(tree):
    things_we_like = ['part-list', 'score-part' 'part', 'measure', 'attributes',
                      'divisions', 'key', 'fifths', 'time', 'beats', 'beat-type', 'staves', 'clef', ]


def main():
    musicxml_files = get_all_musicxml_filenames()
    chosen_filename = choose(musicxml_files)
    with open(chosen_filename, 'r') as musicxml_file:
        file_content = musicxml_file.read()
        xml_tree = ET.parse(file_content)
        print(xml_tree)


if __name__ == '__main__':
    main()
