import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { getCookie } from 'hono/cookie'
import { getLayout } from '../lib/layout'
import { getCurrency, t } from '../lib/i18n'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

export const userRoute = new Hono<{ Bindings: Bindings }>()

// Middleware to check auth
userRoute.use('*', async (c, next) => {
  const token = getCookie(c, 'auth_token')
  if (!token) {
    if (c.req.path.startsWith('/api/')) return c.json({ success: false, error: 'Unauthorized' }, 401)
    return c.redirect('/?login=1')
  }

  try {
    const secret = c.env.JWT_SECRET || 'fallback_secret_please_change'
    const payload = await verify(token, secret)
    c.set('user', payload)
    await next()
  } catch (e) {
    if (c.req.path.startsWith('/api/')) return c.json({ success: false, error: 'Unauthorized' }, 401)
    return c.redirect('/?login=1')
  }
})

// Get orders API
userRoute.get('/api/orders', async (c) => {
  try {
    const user = c.get('user')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE user_email = ? ORDER BY created_at DESC'
    ).bind(user.email).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch orders' }, 500)
  }
})

// View: My Orders Page
userRoute.get('/orders', async (c) => {
  const lang = (c.req.query('lang') || 'en') as 'zh' | 'en'
  const currency = getCurrency(c)
  
  const content = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="user-orders-app">
      <h1 class="text-3xl font-bold mb-8 text-gray-900">${lang === 'zh' ? '我的订单' : 'My Orders'}</h1>
      
      <div v-if="loading" class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-3xl text-[#d4af37]"></i>
        <p class="mt-4 text-gray-500">${lang === 'zh' ? '加载中...' : 'Loading...'}</p>
      </div>
      
      <div v-else-if="orders.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <i class="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">${lang === 'zh' ? '您还没有订单' : 'You have no orders yet'}</p>
        <a href="/?lang=${lang}" class="mt-4 inline-block px-6 py-2 bg-[#d4af37] text-white rounded hover:bg-[#b08d2c] transition">${lang === 'zh' ? '去预订' : 'Book Now'}</a>
      </div>
      
      <div v-else class="space-y-6">
        <div v-for="order in orders" :key="order.id" class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="border-b px-6 py-4 flex justify-between items-center bg-gray-50">
            <div>
              <span class="text-sm text-gray-500">
                ${lang === 'zh' ? '订单号' : 'Order No'}: {{ order.order_no }}
              </span>
              <span class="ml-4 text-sm text-gray-500">
                {{ new Date(order.created_at).toLocaleDateString() }}
              </span>
            </div>
            <div>
              <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                {{ getStatusText(order.status) }}
              </span>
            </div>
          </div>
          
          <div class="p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div class="mb-4 md:mb-0">
              <h3 class="text-xl font-semibold text-gray-900">{{ order.service_title }}</h3>
              <p class="text-gray-600 mt-2">
                <i class="fas fa-calendar-alt w-5 text-center"></i>
                <span v-if="order.check_in">{{ order.check_in }} ~ {{ order.check_out }}</span>
                <span v-else-if="order.service_date">{{ order.service_date }}</span>
                <span v-else>${lang === 'zh' ? '待确认' : 'TBD'}</span>
              </p>
              <p class="text-gray-600 mt-1">
                <i class="fas fa-user-friends w-5 text-center"></i>
                {{ order.guests }} ${lang === 'zh' ? '人' : 'Guests'}
              </p>
            </div>
            
            <div class="text-right">
              <p class="text-sm text-gray-500 mb-1">${lang === 'zh' ? '总价' : 'Total'}</p>
              <p class="text-2xl font-bold text-[#d4af37]">
                {{ order.currency === 'GBP' ? '£' : '¥' }}{{ order.amount }}
              </p>
              <div v-if="order.status === 'pending' || order.status === 'confirmed'" class="mt-4">
                <button @click="payOrder(order)" class="px-6 py-2 bg-[#d4af37] text-white rounded hover:bg-[#b08d2c] transition text-sm">
                  ${lang === 'zh' ? '立即付款' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <script>
      const { createApp, ref, onMounted } = Vue
      
      createApp({
        setup() {
          const orders = ref([])
          const loading = ref(true)
          
          const fetchOrders = async () => {
            try {
              const res = await fetch('/user/api/orders')
              const data = await res.json()
              if (data.success) {
                orders.value = data.data
              } else {
                if (res.status === 401) {
                  window.location.href = '/?login=1&lang=${lang}'
                }
              }
            } catch (e) {
              console.error(e)
            } finally {
              loading.value = false
            }
          }
          
          const getStatusText = (status) => {
            const map = {
              'pending': '${lang === 'zh' ? '待付款' : 'Pending'}',
              'confirmed': '${lang === 'zh' ? '已确认' : 'Confirmed'}',
              'paid': '${lang === 'zh' ? '已付款' : 'Paid'}',
              'completed': '${lang === 'zh' ? '已完成' : 'Completed'}',
              'cancelled': '${lang === 'zh' ? '已取消' : 'Cancelled'}',
              'refunded': '${lang === 'zh' ? '已退款' : 'Refunded'}'
            }
            return map[status] || status
          }
          
          const getStatusClass = (status) => {
            const map = {
              'pending': 'bg-yellow-100 text-yellow-800',
              'confirmed': 'bg-blue-100 text-blue-800',
              'paid': 'bg-green-100 text-green-800',
              'completed': 'bg-gray-100 text-gray-800',
              'cancelled': 'bg-red-100 text-red-800',
              'refunded': 'bg-purple-100 text-purple-800'
            }
            return map[status] || 'bg-gray-100 text-gray-800'
          }
          
          const payOrder = async (order) => {
            try {
              const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_no: order.order_no, currency: order.currency })
              })
              const data = await res.json()
              if (data.url) {
                window.location.href = data.url
              } else {
                alert('${lang === 'zh' ? '支付初始化失败' : 'Failed to initialize payment'}')
              }
            } catch (e) {
              console.error(e)
              alert('${lang === 'zh' ? '支付初始化失败' : 'Failed to initialize payment'}')
            }
          }
          
          onMounted(fetchOrders)
          
          return { orders, loading, getStatusText, getStatusClass, payOrder }
        }
      }).mount('#user-orders-app')
    </script>
  `
  
  return c.html(getLayout(content, lang === 'zh' ? '我的订单' : 'My Orders', undefined, currency))
})

