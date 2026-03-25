const fs = require('fs');

let file = fs.readFileSync('src/routes/api.ts', 'utf8');

file = file.replace(/const siteUrl = c\.env\.SITE_URL \|\| 'http:\/\/localhost:3000'/g, 
  "const siteUrl = c.env.SITE_URL || new URL(c.req.url).origin");

file = file.replace(/'payment_method_types\[\]': 'card',/g, 
  `'payment_method_types[0]': 'card',
          'payment_method_types[1]': 'alipay',
          'payment_method_types[2]': 'wechat_pay',
          'payment_method_options[wechat_pay][client]': 'web',`);

fs.writeFileSync('src/routes/api.ts', file);
console.log("Patched api.ts");
