import { Hono } from 'hono';
import Stripe from 'stripe';

export const stripeRoute = new Hono<{
  Bindings: {
    DB: D1Database;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    STRIPE_PUBLISHABLE_KEY: string;
  };
}>();

// 创建结账会话
stripeRoute.post('/checkout', async (c) => {
  const { order_no } = await c.req.json();
  const db = c.env.DB;
  
  // 1. 查找订单
  const order: any = await db.prepare('SELECT * FROM orders WHERE order_no = ?').bind(order_no).first();
  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  // 2. 初始化 Stripe
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16' as any,
  });

  try {
    // 3. 创建 Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: (order.currency || 'gbp').toLowerCase(),
            product_data: {
              name: order.service_title,
              description: `Order: ${order.order_no} (${order.service_type})`,
            },
            unit_amount: Math.round(order.amount * 100), // Stripe 使用最小货币单位（如便士/美分）
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${new URL(c.req.url).origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${new URL(c.req.url).origin}/payment-failed`,
      metadata: {
        order_no: order.order_no,
      },
    });

    // 4. 将 session_id 保存到数据库
    await db.prepare('UPDATE orders SET stripe_session_id = ? WHERE order_no = ?')
      .bind(session.id, order.order_no).run();

    return c.json({ url: session.url });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 处理 Webhook
stripeRoute.post('/webhook', async (c) => {
  const sig = c.req.header('stripe-signature');
  const body = await c.req.text();
  
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16' as any,
  });

  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig!,
      c.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    return c.text(`Webhook Error: ${err.message}`, 400);
  }

  // 处理支付成功
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const order_no = session.metadata?.order_no;
    const payment_intent = session.payment_intent as string;

    if (order_no) {
      await c.env.DB.prepare(`
        UPDATE orders 
        SET status = 'paid', payment_status = 'paid', stripe_payment_intent = ?, paid_at = CURRENT_TIMESTAMP
        WHERE order_no = ?
      `).bind(payment_intent, order_no).run();
    }
  }

  // 处理退款成功
  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge;
    const payment_intent = charge.payment_intent as string;
    
    if (payment_intent) {
      await c.env.DB.prepare(`
        UPDATE orders 
        SET status = 'refunded', payment_status = 'refunded'
        WHERE stripe_payment_intent = ?
      `).bind(payment_intent).run();
    }
  }

  return c.json({ received: true });
});
