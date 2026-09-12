const fs = require('fs');
const path = require('path');

// Monuments.jsx
let p = 'src/views/Monuments.jsx';
let content = fs.readFileSync(p, 'utf8');
if (!content.includes("import { useTranslation, Trans } from 'react-i18next';")) {
    content = content.replace(/import \{ useTranslation \} from 'react-i18next';/, "import { useTranslation, Trans } from 'react-i18next';");
}
content = content.replace(
    /dangerouslySetInnerHTML=\{\{__html: t\('mon_note_rad'\)\.replace\('Примечание о радиации:', '<strong>Примечание о радиации:<\/strong>'\)\.replace\('Radiation Note:', '<strong>Radiation Note:<\/strong>'\)\.replace\('Примітка щодо радіації:', '<strong>Примітка щодо радіації:<\/strong>'\)\}\>\n\s*<\/p>/g,
    `>\n                      <Trans i18nKey="mon_note_rad">\n                          <strong>Примечание о радиации:</strong>\n                      </Trans>\n                    </p>`
);
fs.writeFileSync(p, content);

// Electricity.jsx
p = 'src/views/Electricity.jsx';
content = fs.readFileSync(p, 'utf8');
if (!content.includes("import { useTranslation, Trans } from 'react-i18next';")) {
    content = content.replace(/import \{ useTranslation \} from 'react-i18next';/, "import { useTranslation, Trans } from 'react-i18next';");
}
content = content.replace(
    /dangerouslySetInnerHTML=\{\{__html: t\('elec_note_important'\) \+ ' ' \+ selectedScheme\.note\}\>\n\s*<\/p>/g,
    `>\n                  <Trans i18nKey="elec_note_important" /> {selectedScheme.note}\n                </p>`
);
fs.writeFileSync(p, content);

// Gamma.jsx
p = 'src/views/Gamma.jsx';
content = fs.readFileSync(p, 'utf8');
if (!content.includes("import { useTranslation, Trans } from 'react-i18next';")) {
    content = content.replace(/import \{ useTranslation \} from 'react-i18next';/, "import { useTranslation, Trans } from 'react-i18next';");
}
content = content.replace(
    /dangerouslySetInnerHTML=\{\{ __html: t\('gamma_suggest_desc'\) \}\><\/p>/g,
    `>\n                  <Trans i18nKey="gamma_suggest_desc" />\n                </p>`
);
fs.writeFileSync(p, content);

console.log('React fixes applied!');
