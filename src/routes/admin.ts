import { Hono } from 'hono'
import { Lang } from '../lib/i18n'
import { crudTemplate } from '../lib/admin-crud-template'
import { blogListTemplate, pageListTemplate, richEditTemplate } from '../lib/admin-pages-templates'
import { hotelListTemplate, hotelEditTemplate, roomTypeListTemplate, priceCalendarTemplate } from '../lib/admin-hotel-templates'

type Bindings = { DB: D1Database; ADMIN_PASSWORD: string }

const adminRoute = new Hono<{ Bindings: Bindings }>()

// Simple auth middleware
adminRoute.use('*', async (c, next) => {
  const url = new URL(c.req.url)
  if (url.pathname === '/admin/login') return next()
  
  const authCookie = c.req.raw.headers.get('cookie')?.match(/admin_auth=([^;]+)/)?.[1]
  if (authCookie !== 'authenticated') {
    return c.redirect('/admin/login')
  }
  return next()
})

// Login page
adminRoute.get('/login', (c) => {
  const error = c.req.query('error')
  return c.html(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - Watu</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 min-h-screen flex items-center justify-center">
  <div class="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
    <div class="text-center mb-6">
      <div class="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <span class="text-white font-bold text-3xl">W</span>
      </div>
      <h1 class="text-xl font-bold text-gray-900">管理后台</h1>
      <p class="text-gray-500 text-sm">Watu Admin</p>
    </div>
    ${error ? `<div class="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">密码错误，请重试</div>` : ''}
    <form method="POST" action="/admin/login">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">管理员密码</label>
        <input type="password" name="password" required autofocus
               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm">
      </div>
      <button type="submit" class="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors">
        登录
      </button>
    </form>
  </div>
</body>
</html>`)
})

adminRoute.post('/login', async (c) => {
  const body = await c.req.parseBody()
  const password = body.password as string
  const adminPassword = c.env.ADMIN_PASSWORD || 'admin123'
  
  if (password === adminPassword) {
    const headers = new Headers()
    headers.set('Set-Cookie', 'admin_auth=authenticated; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400')
    headers.set('Location', '/admin')
    return new Response(null, { status: 302, headers })
  }
  return c.redirect('/admin/login?error=1')
})

adminRoute.get('/logout', (c) => {
  const headers = new Headers()
  headers.set('Set-Cookie', 'admin_auth=; Path=/; HttpOnly; Max-Age=0')
  headers.set('Location', '/admin/login')
  return new Response(null, { status: 302, headers })
})

function adminLayout(title: string, content: string, activeMenu: string = ''): string {
  const menuItems = [
    {href: '/admin', icon: '📊', label: '数据概览', key: 'dashboard'},
    {href: '/admin/orders', icon: '📋', label: '订单管理', key: 'orders'},
    {href: '/admin/inquiries', icon: '💬', label: '咨询管理', key: 'inquiries'},
    {href: '/admin/hotels', icon: '🏨', label: '酒店管理', key: 'hotels'},
    {href: '/admin/rentals', icon: '🏠', label: '租房管理', key: 'rentals'},
    {href: '/admin/guides', icon: '🗺️', label: '导游管理', key: 'guides'},
    {href: '/admin/study-tours', icon: '🎓', label: '游学管理', key: 'study_tours'},
    {href: '/admin/blogs', icon: '📝', label: '博客管理', key: 'blogs'},
    {href: '/admin/pages', icon: '📄', label: '单页管理', key: 'pages'}
  ]
  
  return `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Watu管理后台</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    .sidebar { width: 240px; min-height: 100vh; background: linear-gradient(180deg, #1e3a5f 0%, #1a5276 100%); }
    .menu-item { transition: all 0.15s; }
    .menu-item.active { background: rgba(255,255,255,0.15); border-left: 3px solid #f59e0b; }
    .menu-item:hover { background: rgba(255,255,255,0.1); }
  </style>
</head>
<body class="bg-gray-100 flex" style="min-height:100vh">
  <!-- Sidebar -->
  <aside class="sidebar fixed left-0 top-0 z-50 hidden md:flex flex-col">
    <div class="p-5 border-b border-white/10">
      <div class="flex items-center space-x-2">
        <div class="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <span class="text-white font-bold text-xl">W</span>
        </div>
        <div>
          <div class="text-white font-bold leading-none">Watu</div>
          <div class="text-white/50 text-xs">Admin Panel</div>
        </div>
      </div>
    </div>
    <nav class="flex-1 p-3 space-y-1">
      ${menuItems.map(item => `
        <a href="${item.href}" class="menu-item flex items-center space-x-3 px-3 py-2.5 rounded-lg text-white/80 hover:text-white ${activeMenu === item.key ? 'active text-white' : ''}">
          <span>${item.icon}</span>
          <span class="text-sm font-medium">${item.label}</span>
        </a>
      `).join('')}
    </nav>
    <div class="p-3 border-t border-white/10">
      <a href="/?lang=zh" target="_blank" class="flex items-center space-x-2 px-3 py-2 text-white/60 hover:text-white text-sm rounded-lg hover:bg-white/10">
        <i class="fas fa-external-link-alt"></i>
        <span>查看前台</span>
      </a>
      <a href="/admin/logout" class="flex items-center space-x-2 px-3 py-2 text-white/60 hover:text-white text-sm rounded-lg hover:bg-white/10">
        <i class="fas fa-sign-out-alt"></i>
        <span>退出登录</span>
      </a>
    </div>
  </aside>

  <!-- Main content -->
  <div class="flex-1 md:ml-60 min-h-screen">
    <!-- Top bar -->
    <header class="bg-white shadow-sm sticky top-0 z-40 px-6 h-14 flex items-center justify-between">
      <h1 class="font-bold text-gray-800">${title}</h1>
      <div class="flex items-center space-x-3 text-sm text-gray-500">
        <span><i class="fas fa-clock mr-1"></i>${new Date().toLocaleDateString('zh-CN')}</span>
        <a href="/admin/logout" class="text-red-500 hover:text-red-600">退出</a>
      </div>
    </header>
    <main class="p-6">
      ${content}
    </main>
  </div>
</body>
</html>`
}

// Dashboard
adminRoute.get('/', async (c) => {
  let stats = { orders: 0, inquiries: 0, hotels: 0, rentals: 0, guides: 0, tours: 0, revenue: 0 }
  
  try {
    const [ordersR, inquiriesR, hotelsR, rentalsR, guidesR, toursR, revenueR] = await Promise.all([
      c.env.DB.prepare('SELECT COUNT(*) as c FROM orders').first(),
      c.env.DB.prepare('SELECT COUNT(*) as c FROM inquiries').first(),
      c.env.DB.prepare('SELECT COUNT(*) as c FROM hotels').first(),
      c.env.DB.prepare('SELECT COUNT(*) as c FROM rentals').first(),
      c.env.DB.prepare('SELECT COUNT(*) as c FROM guides').first(),
      c.env.DB.prepare('SELECT COUNT(*) as c FROM study_tours').first(),
      c.env.DB.prepare('SELECT SUM(amount) as total FROM orders WHERE payment_status = ?').bind('paid').first()
    ])
    stats.orders = (ordersR as any)?.c || 0
    stats.inquiries = (inquiriesR as any)?.c || 0
    stats.hotels = (hotelsR as any)?.c || 0
    stats.rentals = (rentalsR as any)?.c || 0
    stats.guides = (guidesR as any)?.c || 0
    stats.tours = (toursR as any)?.c || 0
    stats.revenue = (revenueR as any)?.total || 0
  } catch (e) { console.error(e) }

  const content = `
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    ${[
      {icon: '📋', label: '总订单', value: stats.orders, href: '/admin/orders', color: 'bg-blue-500'},
      {icon: '💷', label: '已收款', value: "£" + stats.revenue.toFixed(0), href: '/admin/orders', color: 'bg-green-500'},
      {icon: '💬', label: '待回复咨询', value: stats.inquiries, href: '/admin/inquiries', color: 'bg-amber-500'},
      {icon: '🏨', label: '酒店数量', value: stats.hotels, href: '/admin/hotels', color: 'bg-purple-500'},
    ].map(s => `
      <a href="${s.href}" class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-2">
          <span class="text-2xl">${s.icon}</span>
          <div class="w-8 h-8 ${s.color} rounded-lg flex items-center justify-center">
            <i class="fas fa-arrow-right text-white text-xs"></i>
          </div>
        </div>
        <div class="text-2xl font-bold text-gray-900">${s.value}</div>
        <div class="text-sm text-gray-500">${s.label}</div>
      </a>
    `).join('')}
  </div>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
    <i class="fas fa-chart-line text-4xl mb-4 text-gray-300"></i>
    <p>欢迎使用 Watu 管理后台，请从左侧菜单选择要管理的功能模块。</p>
  </div>
  `

  return c.html(adminLayout('数据概览', content, 'dashboard'))
})

// === Hotel Revamp Routes ===

adminRoute.get('/hotels', (c) => {
  return c.html(adminLayout('酒店管理', hotelListTemplate, 'hotels'))
})

adminRoute.get('/hotels/edit/:id', (c) => {
  const id = c.req.param('id')
  return c.html(adminLayout(id === 'new' ? '添加酒店' : '编辑酒店', hotelEditTemplate(id), 'hotels'))
})

adminRoute.get('/hotels/:hotelId/rooms', (c) => {
  const hotelId = c.req.param('hotelId')
  return c.html(adminLayout('房型管理', roomTypeListTemplate(hotelId), 'hotels'))
})

adminRoute.get('/hotels/:hotelId/rooms/:roomId/calendar', (c) => {
  const hotelId = c.req.param('hotelId')
  const roomId = c.req.param('roomId')
  return c.html(adminLayout('价格与房态日历', priceCalendarTemplate(roomId, hotelId), 'hotels'))
})

// === Existing Routes (Using generic CRUD template for others) ===

const rentalSchema = {
  columns: [
    { key: 'images', label: '图片', type: 'image' },
    { key: 'title_zh', label: '标题(中)' },
    { key: 'city', label: '城市' },
    { key: 'price_per_month', label: '价格/月' }
  ],
  form: [
    { key: 'title_zh', label: '标题(中)' },
    { key: 'title_en', label: '标题(英)' },
    { key: 'city', label: '城市', type: 'select', options: [{value:'london',label:'伦敦'}, {value:'oxford',label:'牛津'}, {value:'cambridge',label:'剑桥'}, {value:'manchester',label:'曼彻斯特'}, {value:'edinburgh',label:'爱丁堡'}] },
    { key: 'address', label: '详细地址' },
    { key: 'price_per_month', label: '价格/月 (£)', type: 'number' },
    { key: 'property_type', label: '物业类型', type: 'select', options: [{value:'studio',label:'Studio'},{value:'1bed',label:'一室一厅'},{value:'2bed',label:'两室一厅'},{value:'shared',label:'合租'}] },
    { key: 'bedrooms', label: '卧室数', type: 'number' },
    { key: 'bathrooms', label: '卫浴数', type: 'number' },
    { key: 'images', label: '上传图片', type: 'image' },
    { key: 'sort_order', label: '排序', type: 'number' }
  ]
}

const guideSchema = {
  columns: [
    { key: 'avatar', label: '头像', type: 'image' },
    { key: 'name_zh', label: '姓名' },
    { key: 'price_per_day', label: '日均价' },
    { key: 'experience_years', label: '经验(年)' }
  ],
  form: [
    { key: 'name_zh', label: '姓名(中)' },
    { key: 'name_en', label: '姓名(英)' },
    { key: 'bio_zh', label: '简介(中)', type: 'textarea' },
    { key: 'bio_en', label: '简介(英)', type: 'textarea' },
    { key: 'price_per_day', label: '日均价 (£)', type: 'number' },
    { key: 'experience_years', label: '从业年限', type: 'number' },
    { key: 'avatar', label: '上传头像(JSON数组)', type: 'image' },
    { key: 'sort_order', label: '排序', type: 'number' }
  ]
}

const tourSchema = {
  columns: [
    { key: 'images', label: '图片', type: 'image' },
    { key: 'title_zh', label: '标题' },
    { key: 'duration_days', label: '天数' },
    { key: 'price_per_person', label: '价格/人' }
  ],
  form: [
    { key: 'title_zh', label: '标题(中)' },
    { key: 'title_en', label: '标题(英)' },
    { key: 'description_zh', label: '描述(中)', type: 'textarea' },
    { key: 'description_en', label: '描述(英)', type: 'textarea' },
    { key: 'price_per_person', label: '价格/人 (£)', type: 'number' },
    { key: 'duration_days', label: '行程天数', type: 'number' },
    { key: 'min_age', label: '最小年龄', type: 'number' },
    { key: 'max_age', label: '最大年龄', type: 'number' },
    { key: 'images', label: '上传图片', type: 'image' },
    { key: 'sort_order', label: '排序', type: 'number' }
  ]
}

adminRoute.get('/rentals', (c) => c.html(adminLayout('租房管理', crudTemplate('租房管理', 'rentals', rentalSchema), 'rentals')))
adminRoute.get('/guides', (c) => c.html(adminLayout('导游管理', crudTemplate('导游管理', 'guides', guideSchema), 'guides')))
adminRoute.get('/study-tours', (c) => c.html(adminLayout('游学管理', crudTemplate('游学管理', 'study_tours', tourSchema), 'study_tours')))

// === Blogs and Pages ===
adminRoute.get('/blogs', (c) => c.html(adminLayout('博客管理', blogListTemplate, 'blogs')))
adminRoute.get('/blogs/edit/:id', (c) => {
  const id = c.req.param('id')
  return c.html(adminLayout(id === 'new' ? '添加博客' : '编辑博客', richEditTemplate('blogs', id), 'blogs'))
})
adminRoute.get('/pages', (c) => c.html(adminLayout('单页管理', pageListTemplate, 'pages')))
adminRoute.get('/pages/edit/:id', (c) => {
  const id = c.req.param('id')
  return c.html(adminLayout('编辑单页', richEditTemplate('pages', id), 'pages'))
})

export default adminRoute
