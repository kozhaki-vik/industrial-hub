const fs = require('fs');

const p = 'index.html';
let content = fs.readFileSync(p, 'utf8');
if (!content.includes('Content-Security-Policy')) {
    content = content.replace(
        /<head>/,
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">`
    );
    fs.writeFileSync(p, content);
}
console.log('index.html fixed!');
