import { Hono } from 'hono'
import { getEmailSettings } from '../lib/email'

type Bindings = {
  DB: D1Database
}

export const adminSettingsRoute = new Hono<{ Bindings: Bindings }>()

adminSettingsRoute.get('/email', async (c) => {
  const settings = await getEmailSettings(c.env.DB)
  return c.json({ success: true, data: settings })
})

adminSettingsRoute.post('/email', async (c) => {
  const { resend_api_key, sender_email } = await c.req.json()
  
  await c.env.DB.prepare(
    'INSERT INTO settings (key, value) VALUES ("resend_api_key", ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).bind(resend_api_key || '').run()
  
  await c.env.DB.prepare(
    'INSERT INTO settings (key, value) VALUES ("sender_email", ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).bind(sender_email || '').run()
  
  return c.json({ success: true })
})
