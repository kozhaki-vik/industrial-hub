import re
with open('src/views/ClanManager.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

match = re.search(r'const contextValue = \{\n(.*?)\n\};', code, re.DOTALL)
if match:
    vars_text = match.group(1).replace('\n', ' ').strip()
    vars_list = [v.strip() for v in vars_text.split(',')]
    
    new_props = []
    for v in vars_list:
        if v:
            new_props.append(f'{v}: typeof {v} !== \"undefined\" ? {v} : undefined')
    
    new_context = 'const contextValue = {\n  ' + ',\n  '.join(new_props) + '\n};'
    code = code.replace(match.group(0), new_context)
    
    with open('src/views/ClanManager.jsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print('Done!')
else:
    print('Not found')
