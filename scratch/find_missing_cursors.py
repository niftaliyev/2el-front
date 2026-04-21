
import os
import re

def find_missing_cursors(directory):
    pattern = re.compile(r'<([a-zA-Z0-9]+)\s+([^>]*onClick=[^>]*)>', re.DOTALL)
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.jsx'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    matches = pattern.finditer(content)
                    for match in matches:
                        tag = match.group(1)
                        attrs = match.group(2)
                        
                        if tag.lower() in ['button', 'a', 'link']:
                            continue
                            
                        # Check if className exists and contains cursor-pointer
                        class_match = re.search(r'className=["\'`]([^"\'`]+)["\'`]', attrs)
                        if class_match:
                            classes = class_match.group(1)
                            if 'cursor-pointer' not in classes:
                                print(f"FILE: {path}\nTAG: {tag}\nATTRS: {attrs.strip()}\n")
                        else:
                            # No className at all, so definitely no cursor-pointer
                            print(f"FILE: {path}\nTAG: {tag}\nATTRS: {attrs.strip()}\n")

if __name__ == "__main__":
    find_missing_cursors(r'd:\ElanAz\2el-front')
