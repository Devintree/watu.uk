import { Hono } from 'hono'
import {  Lang, t , getCurrency } from '../lib/i18n'
import { getLayout } from '../lib/layout'

type Bindings = { DB: D1Database }
const paymentRoute = new Hono<{ Bindings: Bindings }>()

paymentRoute.get('/success', async (c) => {
  const lang = (c.req.query('lang') || 'en') as Lang
  const currency = getCurrency(c);
  const orderNo = c.req.query('order') || ''
  const T = (key: any) => t(lang, key)

  let order: any = null
  try {
    if (orderNo) {
      order = await c.env.DB.prepare('SELECT * FROM orders WHERE order_no = ?').bind(orderNo).first()
      if (order) {
        await c.env.DB.prepare(`
          UPDATE orders SET status = 'confirmed', payment_status = 'paid', paid_at = CURRENT_TIMESTAMP
          WHERE order_no = ? AND payment_status = 'unpaid'
        `).bind(orderNo).run()
      }
    }
  } catch (e) { console.error(e) }

  const content = `
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12">
    <div class="bg-white rounded-3xl p-10 max-w-md w-full mx-4 text-center shadow-2xl border border-green-100">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="fas fa-check-circle text-green-500 text-4xl"></i>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        ${lang === 'zh' ? '支付成功！' : 'Payment Successful!'}
      </h1>
      <p class="text-gray-500 mb-4 text-sm">
        ${lang === 'zh' ? '您的预订已确认，感谢您选择英英服务平台' : 'Your booking is confirmed. Thank you for choosing YingYing UK!'}
      </p>
      
      ${order ? `
      <div class="bg-gray-50 rounded-2xl p-4 mb-6 text-left text-sm">
        <div class="flex justify-between mb-2">
          <span class="text-gray-500">${lang === 'zh' ? '订单号' : 'Order No.'}</span>
          <span class="font-mono font-semibold text-gray-800">${order.order_no}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span class="text-gray-500">${lang === 'zh' ? '服务' : 'Service'}</span>
          <span class="text-gray-800">${order.service_title || order.service_type}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span class="text-gray-500">${lang === 'zh' ? '金额' : 'Amount'}</span>
          <span class="font-bold text-green-700">${order.currency === 'GBP' ? '£' : '¥'}${order.amount}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">${lang === 'zh' ? '联系邮箱' : 'Email'}</span>
          <span class="text-gray-800">${order.user_email}</span>
        </div>
      </div>
      ` : `
      <div class="bg-gray-50 rounded-2xl p-4 mb-6 text-sm text-gray-600">
        ${lang === 'zh' ? `订单号: ${orderNo}` : `Order: ${orderNo}`}
      </div>
      `}
      
      <div class="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-blue-700">
        <i class="fas fa-info-circle mr-2"></i>
        ${lang === 'zh' 
          ? '我们会在24小时内通过邮件和微信与您确认服务详情。如有疑问，请联系我们：hello@yingying.uk'
          : 'We will confirm service details via email and WeChat within 24 hours. Questions? Contact: hello@yingying.uk'}
      </div>
      
      <div class="flex gap-3">
        <a href="/?lang=${lang}" class="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          ${lang === 'zh' ? '返回首页' : 'Back to Home'}
        </a>
        <a href="/hotels?lang=${lang}" class="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          ${lang === 'zh' ? '继续预订' : 'Book More'}
        </a>
      </div>
    </div>
  </div>
  `

  return c.html(getLayout(lang, lang === 'zh' ? '支付成功' : 'Payment Success', content, '/', currency))
})

paymentRoute.get('/cancel', async (c) => {
  const lang = (c.req.query('lang') || 'en') as Lang
  const currency = getCurrency(c);
  const orderNo = c.req.query('order') || ''

  const content = `
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-gray-50 py-12">
    <div class="bg-white rounded-3xl p-10 max-w-md w-full mx-4 text-center shadow-2xl">
      <div class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="fas fa-times-circle text-orange-500 text-4xl"></i>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        ${lang === 'zh' ? '支付已取消' : 'Payment Cancelled'}
      </h1>
      <p class="text-gray-500 mb-4 text-sm">
        ${lang === 'zh' ? '您已取消本次支付，您的预订尚未完成。' : 'You have cancelled this payment. Your booking is not complete.'}
      </p>
      ${orderNo ? `<div class="bg-gray-50 rounded-xl p-3 mb-6 text-sm text-gray-600">${lang === 'zh' ? `订单号: ${orderNo}` : `Order: ${orderNo}`}</div>` : ''}
      <div class="bg-amber-50 rounded-xl p-4 mb-6 text-sm text-amber-700">
        <i class="fas fa-lightbulb mr-2"></i>
        ${lang === 'zh' ? '如果您遇到支付问题，可以通过微信咨询我们：YingYingUK' : 'If you have payment issues, contact us on WeChat: YingYingUK'}
      </div>
      <div class="flex gap-3">
        <a href="/?lang=${lang}" class="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          ${lang === 'zh' ? '返回首页' : 'Back to Home'}
        </a>
        <button onclick="history.back()" class="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          ${lang === 'zh' ? '重试支付' : 'Try Again'}
        </button>
      </div>
    </div>
  </div>
  `

  return c.html(getLayout(lang, lang === 'zh' ? '支付取消' : 'Payment Cancelled', content, '/', currency))
})

export default paymentRoute
