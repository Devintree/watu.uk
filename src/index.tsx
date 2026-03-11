import { Hono } from 'hono'
import { logger } from 'hono/logger'
import homeRoute from './routes/home'
import hotelsRoute from './routes/hotels'
import rentalsRoute from './routes/rentals'
import guidesRoute from './routes/guides'
import studyToursRoute from './routes/studyTours'
import apiRoute from './routes/api'
import adminRoute from './routes/admin'
import paymentRoute from './routes/payment'
import { getLayout } from './lib/layout'
import { t } from './lib/i18n'

type Bindings = {
  DB: D1Database
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  SITE_URL: string
  ADMIN_PASSWORD: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())

// Routes
app.route('/', homeRoute)
app.route('/hotels', hotelsRoute)
app.route('/rentals', rentalsRoute)
app.route('/guides', guidesRoute)
app.route('/study-tours', studyToursRoute)
app.route('/api', apiRoute)
app.route('/admin', adminRoute)
app.route('/payment', paymentRoute)

// Contact page
app.get('/contact', (c) => {
  const lang = (c.req.query('lang') || 'zh') as 'zh' | 'en'
  
  return c.html(getLayout(lang, lang === 'zh' ? '联系我们' : 'Contact Us', `
  <section class="gradient-bg py-12 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <h1 class="text-3xl font-bold mb-2">${lang === 'zh' ? '联系我们' : 'Contact Us'}</h1>
      <p class="text-white/80">${lang === 'zh' ? '我们随时为您提供帮助' : 'We are always here to help'}</p>
    </div>
  </section>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 class="text-xl font-bold text-gray-900 mb-6">${lang === 'zh' ? '联系方式' : 'Get in Touch'}</h2>
        <div class="space-y-4">
          ${[
            {icon: 'fab fa-weixin text-green-500', label: lang === 'zh' ? '微信' : 'WeChat', value: 'YingYingUK'},
            {icon: 'fas fa-envelope text-blue-500', label: lang === 'zh' ? '邮箱' : 'Email', value: 'hello@yingying.uk'},
            {icon: 'fas fa-phone text-amber-500', label: lang === 'zh' ? '电话' : 'Phone', value: '+44 7700 900000'},
            {icon: 'fas fa-map-marker-alt text-red-500', label: lang === 'zh' ? '地址' : 'Location', value: 'London, United Kingdom'},
          ].map(item => `
            <div class="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <i class="${item.icon} text-xl w-6"></i>
              <div>
                <div class="text-xs text-gray-500">${item.label}</div>
                <div class="font-semibold text-gray-800">${item.value}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-900 mb-6">${lang === 'zh' ? '发送消息' : 'Send a Message'}</h2>
        <form onsubmit="submitContact(event)" class="space-y-4">
          <input type="text" name="name" required placeholder="${lang === 'zh' ? '您的姓名' : 'Your Name'}" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400">
          <input type="email" name="email" required placeholder="${lang === 'zh' ? '邮箱地址' : 'Email Address'}" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400">
          <input type="text" name="wechat" placeholder="${lang === 'zh' ? '微信号（可选）' : 'WeChat ID (optional)'}" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400">
          <textarea name="message" required rows="4" placeholder="${lang === 'zh' ? '您的问题或需求...' : 'Your message...'}" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none"></textarea>
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors">
            ${lang === 'zh' ? '发送' : 'Send Message'}
          </button>
        </form>
        <script>
        async function submitContact(e) {
          e.preventDefault();
          const body = Object.fromEntries(new FormData(e.target).entries());
          body.serviceType = 'general';
          try {
            await fetch('/api/inquiries', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
            alert('${lang === 'zh' ? '消息已发送！我们会尽快回复您。' : 'Message sent! We will reply soon.'}');
            e.target.reset();
          } catch(e) { alert('Failed'); }
        }
        </script>
      </div>
    </div>
  </div>
  `, '/contact'))
})

// 404 handler
app.notFound((c) => {
  const lang = (c.req.query('lang') || 'zh') as 'zh' | 'en'
  return c.html(`<!DOCTYPE html>
<html>
<head>
  <title>404 - Not Found</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
  <div class="text-center">
    <div class="text-8xl font-bold text-gray-200 mb-4">404</div>
    <h1 class="text-2xl font-bold text-gray-700 mb-2">${lang === 'zh' ? '页面未找到' : 'Page Not Found'}</h1>
    <p class="text-gray-500 mb-6">${lang === 'zh' ? '您访问的页面不存在' : 'The page you are looking for does not exist'}</p>
    <a href="/?lang=${lang}" class="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors">
      ${lang === 'zh' ? '返回首页' : 'Back to Home'}
    </a>
  </div>
</body>
</html>`, 404)
})

export default app
