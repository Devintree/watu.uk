import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  SITE_URL: string
}

const apiRoute = new Hono<{ Bindings: Bindings }>()

apiRoute.use('*', cors())

// Generate order number
function generateOrderNo(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `YY-${timestamp}-${random}`
}

// ============================
// Create Order
// ============================
apiRoute.post('/orders', async (c) => {
  try {
    const body = await c.req.json()
    const {
      serviceType, serviceId, serviceTitle,
      userName, userEmail, userPhone, userWechat,
      checkIn, checkOut, serviceDate,
      guests, amount, currency = 'gbp',
      specialRequests, lang = 'zh'
    } = body

    if (!serviceType || !serviceId || !userName || !userEmail || !amount) {
      return c.json({ error: 'Missing required fields', success: false }, 400)
    }

    const orderNo = generateOrderNo()
    const amountNum = parseFloat(amount)

    if (isNaN(amountNum) || amountNum <= 0) {
      return c.json({ error: 'Invalid amount', success: false }, 400)
    }

    // Save order to DB
    await c.env.DB.prepare(`
      INSERT INTO orders (
        order_no, user_name, user_email, user_phone, user_wechat,
        service_type, service_id, service_title,
        check_in, check_out, service_date,
        guests, amount, currency, special_requests, status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid')
    `).bind(
      orderNo, userName, userEmail, userPhone || null, userWechat || null,
      serviceType, parseInt(serviceId), serviceTitle,
      checkIn || null, checkOut || null, serviceDate || null,
      parseInt(guests) || 1, amountNum, currency.toLowerCase(),
      specialRequests || null
    ).run()

    // Try Stripe checkout
    const stripeKey = c.env.STRIPE_SECRET_KEY
    if (stripeKey && stripeKey.startsWith('sk_')) {
      try {
        const siteUrl = c.env.SITE_URL || new URL(c.req.url).origin
        
        // Service type display names
        const serviceNames: Record<string, string> = {
          hotel: lang === 'zh' ? '酒店住宿' : 'Hotel Accommodation',
          rental: lang === 'zh' ? '租房咨询' : 'Rental Enquiry',
          guide: lang === 'zh' ? '导游服务' : 'Guide Service',
          study_tour: lang === 'zh' ? '游学接待' : 'Study Tour',
        }

        const stripeBody = new URLSearchParams({
          'payment_method_types[0]': 'card',
          'payment_method_types[1]': 'alipay',
          'payment_method_types[2]': 'wechat_pay',
          'payment_method_options[wechat_pay][client]': 'web',
          'line_items[0][price_data][currency]': currency.toLowerCase(),
          'line_items[0][price_data][product_data][name]': serviceTitle || serviceNames[serviceType] || 'Service',
          'line_items[0][price_data][product_data][description]': `${lang === 'zh' ? '订单号' : 'Order'}: ${orderNo}`,
          'line_items[0][price_data][unit_amount]': Math.round(amountNum * 100).toString(),
          'line_items[0][quantity]': '1',
          'mode': 'payment',
          'success_url': `${siteUrl}/payment/success?order=${orderNo}&lang=${lang}`,
          'cancel_url': `${siteUrl}/payment/cancel?order=${orderNo}&lang=${lang}`,
          'customer_email': userEmail,
          'metadata[order_no]': orderNo,
          'metadata[service_type]': serviceType,
          'metadata[service_id]': serviceId.toString(),
        })

        const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stripeKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: stripeBody.toString()
        })

        if (stripeRes.ok) {
          const session: any = await stripeRes.json()
          
          // Update order with Stripe session ID
          await c.env.DB.prepare(
            'UPDATE orders SET stripe_session_id = ? WHERE order_no = ?'
          ).bind(session.id, orderNo).run()

          return c.json({
            success: true,
            orderNo,
            checkoutUrl: session.url
          })
        }
      } catch (stripeErr) {
        console.error('Stripe error:', stripeErr)
      }
    }

    // Fallback: Return success without Stripe (for demo/local)
    return c.json({
      success: true,
      orderNo,
      message: lang === 'zh' ? '预订成功，我们会尽快联系您确认' : 'Booking received, we will contact you to confirm'
    })

  } catch (err: any) {
    console.error('Order error:', err)
    return c.json({ error: err.message || 'Server error', success: false }, 500)
  }
})

// ============================
// Stripe Webhook
// ============================
apiRoute.get('/orders/:orderNo', async (c) => {
  try {
    const orderNo = c.req.param('orderNo')
    const order = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE order_no = ?'
    ).bind(orderNo).first()

    if (!order) return c.json({ error: 'Order not found' }, 404)
    return c.json({ success: true, order })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

export default apiRoute
