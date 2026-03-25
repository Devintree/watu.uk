const fs = require('fs');

let file = fs.readFileSync('src/routes/admin-api.ts', 'utf8');

if (!file.includes("import { sendEmail }")) {
  file = file.replace(/import { Hono } from 'hono'/, "import { Hono } from 'hono'\nimport { sendEmail } from '../lib/email'");
}

const sendEmailCode = `
    if (table === 'orders' && keys.includes('status')) {
      const newStatus = body.status;
      try {
        const order: any = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
        if (order && order.user_email) {
          const statusMap: Record<string, string> = {
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'paid': 'Paid',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'refunded': 'Refunded'
          };
          const zhStatusMap: Record<string, string> = {
            'pending': '待付款',
            'confirmed': '已确认',
            'paid': '已付款',
            'completed': '已完成',
            'cancelled': '已取消',
            'refunded': '已退款'
          };
          
          const title = \`Order Status Updated: \${statusMap[newStatus] || newStatus} / 订单状态更新：\${zhStatusMap[newStatus] || newStatus}\`;
          const html = \`<div style="font-family: sans-serif; padding: 20px;">
            <h2>\${title}</h2>
            <p>Dear \${order.user_name},</p>
            <p>Your order (<strong>\${order.order_no}</strong>) status has been updated to: <strong>\${statusMap[newStatus] || newStatus}</strong>.</p>
            <p>您好 \${order.user_name}，</p>
            <p>您的订单 (<strong>\${order.order_no}</strong>) 状态已更新为：<strong>\${zhStatusMap[newStatus] || newStatus}</strong>。</p>
          </div>\`;
          await sendEmail(c.env.DB, order.user_email, title, html);
        }
      } catch (e) {
        console.error('Email send failed', e);
      }
    }
`;

file = file.replace(/await c\.env\.DB\.prepare\(query\)\.bind\(\.\.\.values, id\)\.run\(\)/, "await c.env.DB.prepare(query).bind(...values, id).run()\n" + sendEmailCode);

fs.writeFileSync('src/routes/admin-api.ts', file);
console.log("Patched admin-api.ts for order email notification");
