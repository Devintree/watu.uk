import Stripe from 'stripe';
import { Hono } from 'hono'

type Bindings = { DB: D1Database }
const adminApi = new Hono<{ Bindings: Bindings }>()

// Auth check
adminApi.use('*', async (c, next) => {
  const authCookie = c.req.raw.headers.get('cookie')?.match(/admin_auth=([^;]+)/)?.[1]
  if (authCookie !== 'authenticated') {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  return next()
})

const ALLOWED_TABLES = ['hotels', 'rentals', 'guides', 'study_tours', 'blogs', 'pages', 'room_types', 'room_inventory', 'orders', 'inquiries']

// Advanced bulk update for calendar inventory
adminApi.post('/inventory-bulk', async (c) => {
  try {
    const { room_type_id, start_date, end_date, price, price_cny, available_count, is_closed } = await c.req.json()
    
    // Generate all dates in the range
    const dates = []
    let curr = new Date(start_date)
    const end = new Date(end_date)
    while (curr <= end) {
      dates.push(curr.toISOString().split('T')[0])
      curr.setDate(curr.getDate() + 1)
    }
    
    // Prepare batched statements using D1's UPSERT equivalent (INSERT OR REPLACE / ON CONFLICT)
    const stmts = dates.map(date => 
      c.env.DB.prepare(`
        INSERT INTO room_inventory (room_type_id, date, price, price_cny, available_count, is_closed) 
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(room_type_id, date) DO UPDATE SET 
          price = excluded.price, 
          price_cny = excluded.price_cny, 
          available_count = excluded.available_count, 
          is_closed = excluded.is_closed
      `).bind(room_type_id, date, price, price_cny, available_count, is_closed)
    )
    
    await c.env.DB.batch(stmts)
    return c.json({ success: true, updated: dates.length })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// Get inventory for a specific room and month
adminApi.get('/inventory/:roomId', async (c) => {
  const roomId = c.req.param('roomId')
  const month = c.req.query('month') // Format: YYYY-MM
  
  if (!month) return c.json({ error: 'Month parameter is required' }, 400)
  
  try {
    const result = await c.env.DB.prepare('SELECT * FROM room_inventory WHERE room_type_id = ? AND date LIKE ?').bind(roomId, `${month}%`).all()
    return c.json(result.results || [])
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})


// Proxy for Ctrip API to bypass CORS
adminApi.get('/proxy/ctrip/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const response = await fetch('https://qiansu.yztmc.cn/get_ctripinfo.php?id=' + id);
    const data = await response.json();
    return c.json(data);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
})

// generic CRUD endpoints below



// Badge counts for sidebar
adminApi.get('/stats/badges', async (c) => {
  try {
    const [ordersResult, inquiriesResult] = await Promise.all([
      c.env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").first(),
      c.env.DB.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'").first()
    ]);
    return c.json({
      orders: (ordersResult as any)?.count || 0,
      inquiries: (inquiriesResult as any)?.count || 0
    });
  } catch (e) {
    return c.json({ orders: 0, inquiries: 0 });
  }
})

// GET all


// 退款 API
adminApi.post('/orders/:id/refund', async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;
  
  const order: any = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
  if (!order || !order.stripe_payment_intent) {
    return c.json({ error: 'Order not found or not paid via Stripe' }, 400);
  }
  if (order.payment_status === 'refunded') {
    return c.json({ error: 'Already refunded' }, 400);
  }

  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as any });
  
  try {
    const refund = await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent,
    });
    
    await db.prepare("UPDATE orders SET status = 'refunded', payment_status = 'refunded' WHERE id = ?").bind(id).run();
    return c.json({ success: true, refund });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

adminApi.get('/:table', async (c) => {
  const table = c.req.param('table')
  if (!ALLOWED_TABLES.includes(table)) return c.json({ error: 'Invalid table' }, 400)
  
  const hotelId = c.req.query('hotel_id')
  let query = `SELECT * FROM ${table} ORDER BY created_at DESC`
  
  if (table === 'room_types' && hotelId) {
    query = `SELECT * FROM room_types WHERE hotel_id = ${hotelId} ORDER BY created_at DESC`
  } else if (table !== 'pages' && table !== 'room_types' && table !== 'room_inventory' && table !== 'orders' && table !== 'inquiries') {
    query = `SELECT * FROM ${table} ORDER BY sort_order DESC, created_at DESC`
  } else if (table === 'pages') {
    query = `SELECT * FROM pages ORDER BY id ASC`
  }
  
  const results = await c.env.DB.prepare(query).all()
  return c.json(results.results)
})

// GET one
adminApi.get('/:table/:id', async (c) => {
  const table = c.req.param('table')
  const id = c.req.param('id')
  if (!ALLOWED_TABLES.includes(table)) return c.json({ error: 'Invalid table' }, 400)
  const result = await c.env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first()
  return c.json(result)
})

// POST create
adminApi.post('/:table', async (c) => {
  const table = c.req.param('table')
  if (!ALLOWED_TABLES.includes(table)) return c.json({ error: 'Invalid table' }, 400)
  
  const body = await c.req.json()
  
  let ctripReview = '';
  if (body.ctrip_review_content) {
    ctripReview = body.ctrip_review_content;
    delete body.ctrip_review_content;
  }
  
  const keys = Object.keys(body)
  const values = Object.values(body)
  
  const placeholders = keys.map(() => '?').join(', ')
  const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
  
  try {
    const res = await c.env.DB.prepare(query).bind(...values).run()
    
    if (table === 'hotels' && ctripReview) {
      await c.env.DB.prepare(
        'INSERT INTO reviews (service_type, service_id, reviewer_name, rating, comment_zh, comment_en, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind('hotel', res.meta.last_row_id, 'Ctrip Guest', body.rating || 5, ctripReview, '', 1).run()
    }
    
    return c.json({ success: true, id: res.meta.last_row_id })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// PUT update
adminApi.put('/:table/:id', async (c) => {
  const table = c.req.param('table')
  const id = c.req.param('id')
  if (!ALLOWED_TABLES.includes(table)) return c.json({ error: 'Invalid table' }, 400)
  
  const body = await c.req.json()
  
  let ctripReview = '';
  if (body.ctrip_review_content) {
    ctripReview = body.ctrip_review_content;
    delete body.ctrip_review_content;
  }
  
  const keys = Object.keys(body)
  const values = Object.values(body)
  
  const setString = keys.map(k => `${k} = ?`).join(', ')
  const query = `UPDATE ${table} SET ${setString} WHERE id = ?`
  
  try {
    await c.env.DB.prepare(query).bind(...values, id).run()
    
    if (table === 'hotels' && ctripReview) {
      // Check if a review already exists
      const existing = await c.env.DB.prepare('SELECT id FROM reviews WHERE service_type = ? AND service_id = ? AND reviewer_name = ?').bind('hotel', id, 'Ctrip Guest').first();
      if (!existing) {
        await c.env.DB.prepare(
          'INSERT INTO reviews (service_type, service_id, reviewer_name, rating, comment_zh, comment_en, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind('hotel', id, 'Ctrip Guest', body.rating || 5, ctripReview, '', 1).run()
      }
    }
    
    return c.json({ success: true })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// DELETE
adminApi.delete('/:table/:id', async (c) => {
  const table = c.req.param('table')
  const id = c.req.param('id')
  if (!ALLOWED_TABLES.includes(table)) return c.json({ error: 'Invalid table' }, 400)
  
  try {
    await c.env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run()
    return c.json({ success: true })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

export default adminApi
