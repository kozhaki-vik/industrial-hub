import sys

with open('src/views/ClanManager.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to extract the recruitment block
recruit_start = content.find("            : activeTab === 'recruitment' ? (")
if recruit_start == -1:
    print('Recruit block not found')
    sys.exit(1)

# Find the end of the recruitment block, which is before the end marker or where the next div is
recruit_end = content.find("            )}", recruit_start)
recruit_block = content[recruit_start:recruit_end].replace("            : activeTab === 'recruitment' ? (", "            ) : activeTab === 'recruitment' ? (") + "            ) : ("

# The 'в разработке' block starts at line 373: ') : ('
dev_block_start = content.find("            ) : (\n              <div className=\"flex-1")
dev_block_end = content.find("            )}", dev_block_start) + len("            )}")

dev_block = content[dev_block_start + len("            ) : ("):recruit_start].strip()

# Now construct the correct order
before = content[:dev_block_start]

new_content = before + "\n" + recruit_block + "\n              " + dev_block + "\n            )}" + content[recruit_end + len("            )}"):]

with open('src/views/ClanManager.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Fixed layout!')
