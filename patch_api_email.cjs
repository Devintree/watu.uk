const fs = require('fs');

let file = fs.readFileSync('src/routes/api.ts', 'utf8');

if (!file.includes("import { sendEmail }")) {
  file = file.replace(/import { Hono } from 'hono'/, "import { Hono } from 'hono'\nimport { sendEmail } from '../lib/email'");
}

const sendEmailCode = `
    // Send email notification
    try {
      const emailHtml = \`
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>\${lang === 'zh' ? '订单创建成功' : 'Order Created'}</h2>
          <p>\${lang === 'zh' ? '尊敬的' : 'Dear'} \${userName},</p>
          <p>\${lang === 'zh' ? '您的订单已成功创建，订单号为：' : 'Your order has been created successfully. Order Number:'} <strong>\${orderNo}</strong></p>
          <p>\${lang === 'zh' ? '服务项目' : 'Service'}: \${serviceTitle}</p>
          <p>\${lang === 'zh' ? '金额' : 'Amount'}: \${currency === 'gbp' ? '£' : '¥'}\${amountNum}</p>
          <p>\${lang === 'zh' ? '我们将尽快为您处理。' : 'We will process it shortly.'}</p>
        </div>
      \`;
      await sendEmail(c.env.DB, userEmail, lang === 'zh' ? '订单创建成功' : 'Order Created', emailHtml);
    } catch (e) {
      console.error('Email send failed', e);
    }
`;

// Insert the email sending logic right after the DB insert
file = file.replace(/\)\.run\(\)/, ").run()\n" + sendEmailCode);

fs.writeFileSync('src/routes/api.ts', file);
console.log("Patched api.ts for email notification");
