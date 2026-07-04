import zipfile
import xml.etree.ElementTree as ET
import sys

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.XML(xml_content)
            
            WORD_NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
            PARA = WORD_NAMESPACE + 'p'
            TEXT = WORD_NAMESPACE + 't'
            
            text = []
            for paragraph in tree.iter(PARA):
                texts = [node.text for node in paragraph.iter(TEXT) if node.text]
                if texts:
                    text.append(''.join(texts))
            
            return '\n'.join(text)
    except Exception as e:
        return str(e)

with open('output_utf8.txt', 'w', encoding='utf-8') as f:
    f.write("--- FILE 1: Kolkata_Bus_Tracking_System_Development_Plan.docx ---\n")
    f.write(extract_text_from_docx(sys.argv[1]) + "\n")
    f.write("\n--- FILE 2: Bus Tracking System Development Plan.docx ---\n")
    f.write(extract_text_from_docx(sys.argv[2]) + "\n")
