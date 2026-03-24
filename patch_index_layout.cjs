const fs = require('fs');
let code = fs.readFileSync('src/index.tsx', 'utf8');
code = code.replace("return c.html(getLayout(lang, lang === 'zh' ? '联系我们' : 'Contact Us', `", "return c.html(getLayout(lang, lang === 'zh' ? '联系我们' : 'Contact Us', `");
// actually let's just do it with a simple replacement
let idx = code.lastIndexOf('`)');
if (idx !== -1) {
  code = code.slice(0, idx) + '`, undefined, currency)' + code.slice(idx + 2);
}
fs.writeFileSync('src/index.tsx', code);
