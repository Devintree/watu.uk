const fs = require('fs');

let i18nCode = fs.readFileSync('/home/user/webapp/src/lib/i18n.ts', 'utf8');

i18nCode = i18nCode.replace(
  "footer_contact: '联系我们',",
  "footer_contact: '联系我们',\n    footer_terms: '服务条款',\n    footer_privacy: '隐私政策',"
);

i18nCode = i18nCode.replace(
  "footer_contact: 'Contact',",
  "footer_contact: 'Contact',\n    footer_terms: 'Terms of Service',\n    footer_privacy: 'Privacy Policy',"
);

fs.writeFileSync('/home/user/webapp/src/lib/i18n.ts', i18nCode);
