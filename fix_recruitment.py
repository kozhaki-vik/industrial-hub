import re

with open('src/views/ClanManagerTabs/RecruitmentTab.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('                })()}\n              \n                    <div className="mt-8', '              \n                    <div className="mt-8')

code = code.replace('              </form>', '                })()}\n              </form>')

with open('src/views/ClanManagerTabs/RecruitmentTab.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Fixed RecruitmentTab')
