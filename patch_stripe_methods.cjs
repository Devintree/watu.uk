const fs = require('fs');

let code = fs.readFileSync('src/routes/stripe.ts', 'utf8');
code = code.replace(
  `payment_method_types: ['card'],`,
  `payment_method_types: ['card', 'alipay', 'wechat_pay'],
      payment_method_options: {
        wechat_pay: {
          client: 'web',
        },
      },`
);

fs.writeFileSync('src/routes/stripe.ts', code);
console.log("Patched stripe.ts for alipay and wechat_pay");
