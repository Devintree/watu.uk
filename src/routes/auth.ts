import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { sendEmail } from '../lib/email'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

export const authRoute = new Hono<{ Bindings: Bindings }>()

// Send OTP
authRoute.post('/send-code', async (c) => {
  try {
    const { email } = await c.req.json()
    if (!email || !email.includes('@')) {
      return c.json({ success: false, error: 'Invalid email' }, 400)
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    // Code expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60000).toISOString()

    await c.env.DB.prepare(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)'
    ).bind(email, code, expiresAt).run()

    // Send email
    const subject = 'Your Verification Code / 您的验证码'
    const html = `<div style="font-family: sans-serif; padding: 20px;">
      <h2>Verification Code / 验证码</h2>
      <p>Your verification code is / 您的验证码是: <strong style="font-size: 24px; color: #f59e0b;">${code}</strong></p>
      <p>This code will expire in 10 minutes. / 此验证码将于10分钟后过期。</p>
    </div>`

    // Wait for settings
    const sent = await sendEmail(c.env.DB, email, subject, html)
    if (!sent) {
      // For development/debugging if no email settings are configured, print it to console
      console.log(`[DEV MODE] Verification code for ${email} is ${code}`)
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Send code error:', error)
    return c.json({ success: false, error: 'Failed to send code' }, 500)
  }
})

// Login with OTP
authRoute.post('/login', async (c) => {
  try {
    const { email, code } = await c.req.json()
    if (!email || !code) {
      return c.json({ success: false, error: 'Email and code are required' }, 400)
    }

    // Verify code
    const result: any = await c.env.DB.prepare(
      'SELECT id FROM verification_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at > CURRENT_TIMESTAMP ORDER BY id DESC LIMIT 1'
    ).bind(email, code).first()

    if (!result) {
      return c.json({ success: false, error: 'Invalid or expired code' }, 400)
    }

    // Mark as used
    await c.env.DB.prepare('UPDATE verification_codes SET used = 1 WHERE id = ?').bind(result.id).run()

    // Check if user exists, else create
    let user: any = await c.env.DB.prepare('SELECT id, email, name, role FROM users WHERE email = ?').bind(email).first()
    if (!user) {
      const insertRes = await c.env.DB.prepare(
        'INSERT INTO users (email, name) VALUES (?, ?)'
      ).bind(email, email.split('@')[0]).run()
      user = { id: insertRes.meta.last_row_id, email, name: email.split('@')[0], role: 'user' }
    }

    // Generate JWT
    const secret = c.env.JWT_SECRET || 'fallback_secret_please_change'
    const token = await sign({
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
    }, secret)

    // Set cookie
    setCookie(c, 'auth_token', token, {
      path: '/',
      secure: true,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'Lax'
    })

    return c.json({ success: true, user })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ success: false, error: 'Login failed' }, 500)
  }
})

// Logout
authRoute.post('/logout', async (c) => {
  deleteCookie(c, 'auth_token', { path: '/' })
  return c.json({ success: true })
})

// Get current user
authRoute.get('/me', async (c) => {
  const token = getCookie(c, 'auth_token')
  if (!token) return c.json({ success: false, user: null })

  try {
    const secret = c.env.JWT_SECRET || 'fallback_secret_please_change'
    const payload = await verify(token, secret)
    return c.json({ success: true, user: payload })
  } catch (e) {
    return c.json({ success: false, user: null })
  }
})
