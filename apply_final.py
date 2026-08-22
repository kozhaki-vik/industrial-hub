import re

translations_ru = {
    "mon_puzzle_title": "Гайд по головоломке (Puzzle)",
    "mon_cctv_title": "Коды камер видеонаблюдения (CCTV)",
    "mon_cctv_hint": "Нажмите, чтобы скопировать",
    "elec_rustrician_btn": "Открыть в Rustrician",
    "elec_consumption": "Потребление",
    "elec_battery_reserve": "Резерв батареи",
    "elec_components": "Компоненты",
    "elec_propose_btn": "Предложить правку",
    "elec_view_scheme": "Смотреть схему",
    "elec_note_important": "Важный нюанс:"
}

translations_en = {
    "mon_puzzle_title": "Puzzle Guide",
    "mon_cctv_title": "CCTV Camera Codes",
    "mon_cctv_hint": "Click to copy",
    "elec_rustrician_btn": "Open in Rustrician",
    "elec_consumption": "Consumption",
    "elec_battery_reserve": "Battery Reserve",
    "elec_components": "Components",
    "elec_propose_btn": "Propose an edit",
    "elec_view_scheme": "View scheme",
    "elec_note_important": "Important Note:"
}

translations_ua = {
    "mon_puzzle_title": "Гайд по головоломці (Puzzle)",
    "mon_cctv_title": "Коди камер відеоспостереження (CCTV)",
    "mon_cctv_hint": "Натисніть, щоб скопіювати",
    "elec_rustrician_btn": "Відкрити в Rustrician",
    "elec_consumption": "Споживання",
    "elec_battery_reserve": "Резерв батареї",
    "elec_components": "Компоненти",
    "elec_propose_btn": "Запропонувати правку",
    "elec_view_scheme": "Дивитися схему",
    "elec_note_important": "Важливий нюанс:"
}

with open('src/i18n.js', 'r', encoding='utf-8') as f:
    content = f.read()

def insert_in_block(block_str, translations):
    # This time we insert them at the end of the block since they might not exist.
    # Find the closing brace of the translation object.
    # We can just append them right before the last closing brace of the block, but wait, the block is `en: { translation: { ... } },`
    # Let's find `translation: {` and append it there for safety. Or just find the end of the block.
    # The safest way is to use regex or string replace.
    # Actually, we can check if the key exists, and if it does, replace it. If not, insert it.
    for key, val in translations.items():
        escaped_val = val.replace('\\n', '\\\\n').replace('"', '\\"')
        pattern = r'("?' + re.escape(key) + r'"?):\s*"([^"]*)"'
        if re.search(pattern, block_str):
            block_str = re.sub(pattern, r'\1: "' + escaped_val + '"', block_str)
        else:
            # Insert at the top of the translation block
            insert_pos = block_str.find('translation: {') + len('translation: {')
            insert_str = f'\n      "{key}": "{escaped_val}",'
            block_str = block_str[:insert_pos] + insert_str + block_str[insert_pos:]
    return block_str

ru_split = content.split('en: {')
prefix = ru_split[0]
rest = ru_split[1]

en_split = rest.split('ua: {')
en_block = 'en: {' + en_split[0]
ua_block = 'ua: {' + en_split[1]

new_prefix = insert_in_block(prefix, translations_ru)
new_en_block = insert_in_block(en_block, translations_en)
new_ua_block = insert_in_block(ua_block, translations_ua)

new_content = new_prefix + new_en_block + new_ua_block

with open('src/i18n.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Translation applied!")
