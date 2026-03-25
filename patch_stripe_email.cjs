const fs = require('fs');

let file = fs.readFileSync('src/routes/stripe.ts', 'utf8');

if (!file.includes("import { sendEmail }")) {
  file = file.replace(/import { Hono } from 'hono'/, "import { Hono } from 'hono'\nimport { sendEmail } from '../lib/email'");
}

// Inject paid email
const paidEmailCode = `
      // Send email
      try {
        const order: any = await c.env.DB.prepare('SELECT * FROM orders WHERE order_no = ?').bind(order_no).first();
        if (order && order.user_email) {
          const html = \`<div style="font-family: sans-serif; padding: 20px;">
            <h2>Payment Successful / 支付成功</h2>
            <p>Dear \${order.user_name},</p>
            <p>Your payment for order <strong>\${order.order_no}</strong> has been received successfully.</p>
            <p>您好 \${order.user_name}，</p>
            <p>您的订单 (<strong>\${order.order_no}</strong>) 已成功付款。</p>
          </div>\`;
          await sendEmail(c.env.DB, order.user_email, 'Payment Successful / 支付成功', html);
        }
      } catch (e) {
        console.error('Email failed', e);
      }
`;

file = file.replace(/SET status = 'paid'.*?\.run\(\);\n    }/s, match => match + paidEmailCode);

// Inject refunded email
const refundEmailCode = `
      // Send email
      try {
        const order: any = await c.env.DB.prepare('SELECT * FROM orders WHERE stripe_payment_intent = ?').bind(payment_intent).first();
        if (order && order.user_email) {
          const html = \`<div style="font-family: sans-serif; padding: 20px;">
            <h2>Order Refunded / 订单已退款</h2>
            <p>Dear \${order.user_name},</p>
            <p>Your order <strong>\${order.order_no}</strong> has been refunded.</p>
            <p>您好 \${order.user_name}，</p>
            <p>您的订单 (<strong>\${order.order_no}</strong>) 已成功退款。</p>
          </div>\`;
          await sendEmail(c.env.DB, order.user_email, 'Order Refunded / 订单已退款', html);
        }
      } catch (e) {
        console.error('Email failed', e);
      }
`;

file = file.replace(/SET status = 'refunded'.*?\.run\(\);\n    }/s, match => match + refundEmailCode);

fs.writeFileSync('src/routes/stripe.ts', file);
console.log("Patched stripe.ts for email notification");
