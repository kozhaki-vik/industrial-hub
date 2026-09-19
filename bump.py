import json
with open('package.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
data['version'] = '2.19.15'
with open('package.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)
print('Bumped version to 2.19.15')
