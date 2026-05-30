import os
import glob

def fix_latex_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<Latex>' not in content and '<Latex ' not in content:
        return
        
    if "import Latex from 'react-latex-next'" not in content:
        return

    # Replace <Latex>
    new_content = content.replace('<Latex>', '<Latex delimiters={LATEX_DELIMITERS} strict={false}>')
    
    # Add import if needed
    if 'LATEX_DELIMITERS' not in new_content:
        import_stmt = "import Latex from 'react-latex-next';\nimport { LATEX_DELIMITERS } from '@/components/AnnotatableText';"
        new_content = new_content.replace("import Latex from 'react-latex-next';", import_stmt)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('c:\\Users\\elnim\\Desktop\\dsatuz\\src'):
    for file in files:
        if file.endswith('.tsx'):
            fix_latex_in_file(os.path.join(root, file))
