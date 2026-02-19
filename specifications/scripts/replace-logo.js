const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../hedera-did-method/index.html');
const replacementPath = path.join(__dirname, '../hedera-did-method/logo-replacement.html');

const oldLogoRe = /<a id="logo" href="[^"]*">\s*<img[^>]*>\s*<\/a>/;
const newLogo = fs.readFileSync(replacementPath, 'utf8').trim();

let html = fs.readFileSync(indexPath, 'utf8');
if (!oldLogoRe.test(html)) {
  console.error('replace-logo: could not find logo block in index.html');
  process.exit(1);
}
html = html.replace(oldLogoRe, newLogo);
fs.writeFileSync(indexPath, html);
console.log('replace-logo: logo replaced in index.html');
