import { Hono } from 'hono'
import { Lang } from '../lib/i18n'

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
  <title>Admin Login - 英英</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 min-h-screen flex items-center justify-center">
  <div class="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
    <div class="text-center mb-6">
      <div class="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <span class="text-white font-bold text-3xl">英</span>
      </div>
      <h1 class="text-xl font-bold text-gray-900">管理后台</h1>
      <p class="text-gray-500 text-sm">YingYing Admin</p>
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
  ]
  
  return `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - 英英管理后台</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
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
          <span class="text-white font-bold text-xl">英</span>
        </div>
        <div>
          <div class="text-white font-bold leading-none">英英</div>
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
  let recentOrders: any[] = []
  let recentInquiries: any[] = []
  
  try {
    const [ordersR, inquiriesR, hotelsR, rentalsR, guidesR, toursR, revenueR, recentOrdersR, recentInqR] = await Promise.all([
      c.env.DB.prepare('SELECT COUNT(*) as c FROM orders').first(),
      c.env.DB.prepare('SELECT COUNT(*) as c FROM inquiries').first(),
      c.env.DB.prepare('SELECT COUNT(*) as c FROM hotels').first(),
      c.env.DB.prepare('SELECT COUNT(*) as c FROM rentals').first(),
      c.env.DB.prepare('SELECT COUNT(*) as c FROM guides').first(),
      c.env.DB.prepare('SELECT COUNT(*) as c FROM study_tours').first(),
      c.env.DB.prepare('SELECT SUM(amount) as total FROM orders WHERE payment_status = ?').bind('paid').first(),
      c.env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all(),
      c.env.DB.prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 5').all(),
    ])
    stats.orders = (ordersR as any)?.c || 0
    stats.inquiries = (inquiriesR as any)?.c || 0
    stats.hotels = (hotelsR as any)?.c || 0
    stats.rentals = (rentalsR as any)?.c || 0
    stats.guides = (guidesR as any)?.c || 0
    stats.tours = (toursR as any)?.c || 0
    stats.revenue = (revenueR as any)?.total || 0
    recentOrders = recentOrdersR.results || []
    recentInquiries = recentInqR.results || []
  } catch (e) { console.error(e) }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-700',
  }

  const content = `
  <!-- Stats Grid -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    ${[
      {icon: '📋', label: '总订单', value: stats.orders, href: '/admin/orders', color: 'bg-blue-500'},
      {icon: '💷', label: '已收款', value: `£${stats.revenue.toFixed(0)}`, href: '/admin/orders?status=paid', color: 'bg-green-500'},
      {icon: '💬', label: '待回复咨询', value: stats.inquiries, href: '/admin/inquiries', color: 'bg-amber-500'},
      {icon: '🏨', label: '房源/服务', value: stats.hotels + stats.rentals, href: '/admin/hotels', color: 'bg-purple-500'},
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

  <!-- Quick Access -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
    ${[
      {href: '/admin/hotels', icon: '🏨', label: '酒店管理', sub: stats.hotels + ' 条'},
      {href: '/admin/rentals', icon: '🏠', label: '租房管理', sub: stats.rentals + ' 条'},
      {href: '/admin/guides', icon: '🗺️', label: '导游管理', sub: stats.guides + ' 名'},
      {href: '/admin/study-tours', icon: '🎓', label: '游学管理', sub: stats.tours + ' 个'},
    ].map(item => `
      <a href="${item.href}" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
        <div class="text-3xl mb-1">${item.icon}</div>
        <div class="font-semibold text-gray-800 text-sm">${item.label}</div>
        <div class="text-xs text-gray-400">${item.sub}</div>
      </a>
    `).join('')}
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Recent Orders -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="font-bold text-gray-800">最新订单</h2>
        <a href="/admin/orders" class="text-blue-600 text-sm hover:underline">查看全部</a>
      </div>
      <div class="divide-y divide-gray-50">
        ${recentOrders.length > 0 ? recentOrders.map((o: any) => `
          <div class="p-4 hover:bg-gray-50">
            <div class="flex items-center justify-between mb-1">
              <span class="font-medium text-sm text-gray-800">${o.order_no}</span>
              <span class="text-xs px-2 py-0.5 rounded-full ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}">${o.status}</span>
            </div>
            <div class="text-xs text-gray-500">${o.user_name} · ${o.service_type} · <strong>£${o.amount}</strong></div>
          </div>
        `).join('') : '<div class="p-8 text-center text-gray-400">暂无订单</div>'}
      </div>
    </div>

    <!-- Recent Inquiries -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="font-bold text-gray-800">最新咨询</h2>
        <a href="/admin/inquiries" class="text-blue-600 text-sm hover:underline">查看全部</a>
      </div>
      <div class="divide-y divide-gray-50">
        ${recentInquiries.length > 0 ? recentInquiries.map((i: any) => `
          <div class="p-4 hover:bg-gray-50">
            <div class="flex items-center justify-between mb-1">
              <span class="font-medium text-sm text-gray-800">${i.name}</span>
              <span class="text-xs px-2 py-0.5 rounded-full ${i.status === 'new' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}">${i.status === 'new' ? '待回复' : i.status}</span>
            </div>
            <div class="text-xs text-gray-500 truncate">${i.message}</div>
          </div>
        `).join('') : '<div class="p-8 text-center text-gray-400">暂无咨询</div>'}
      </div>
    </div>
  </div>
  `

  return c.html(adminLayout('数据概览', content, 'dashboard'))
})

// Orders management
adminRoute.get('/orders', async (c) => {
  const status = c.req.query('status') || ''
  let orders: any[] = []
  try {
    const q = status ? 'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC' : 'SELECT * FROM orders ORDER BY created_at DESC'
    const result = status ? await c.env.DB.prepare(q).bind(status).all() : await c.env.DB.prepare(q).all()
    orders = result.results || []
  } catch (e) { console.error(e) }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-700',
    refunded: 'bg-orange-100 text-orange-700',
  }

  const statusLabels: Record<string, string> = {
    pending: '待确认', confirmed: '已确认', paid: '已支付', 
    cancelled: '已取消', completed: '已完成', refunded: '已退款'
  }

  const serviceLabels: Record<string, string> = {
    hotel: '🏨 酒店', rental: '🏠 租房', guide: '🗺️ 导游', study_tour: '🎓 游学'
  }

  const content = `
  <div class="flex items-center justify-between mb-6">
    <div class="flex gap-2 flex-wrap">
      ${['', 'pending', 'confirmed', 'paid', 'completed', 'cancelled'].map(s => `
        <a href="/admin/orders${s ? '?status=' + s : ''}" 
           class="px-4 py-2 rounded-full text-sm font-medium transition-colors ${status === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'}">
          ${s ? (statusLabels[s] || s) : '全部'}
        </a>
      `).join('')}
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">订单号</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">客户</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">服务</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">金额</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">状态</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">时间</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          ${orders.length > 0 ? orders.map((o: any) => `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 font-mono text-xs text-blue-600">${o.order_no}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-gray-800">${o.user_name}</div>
                <div class="text-xs text-gray-400">${o.user_email}</div>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs">${serviceLabels[o.service_type] || o.service_type}</span>
                <div class="text-xs text-gray-400 truncate max-w-24">${o.service_title || ''}</div>
              </td>
              <td class="px-4 py-3 font-bold text-gray-900">£${o.amount}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded-full text-xs ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}">
                  ${statusLabels[o.status] || o.status}
                </span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-400">${new Date(o.created_at).toLocaleDateString('zh-CN')}</td>
              <td class="px-4 py-3">
                <div class="flex gap-1">
                  <button onclick="updateOrderStatus('${o.order_no}', 'confirmed')" 
                          class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100" title="确认">
                    ✓
                  </button>
                  <button onclick="updateOrderStatus('${o.order_no}', 'completed')" 
                          class="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100" title="完成">
                    ✓✓
                  </button>
                  <button onclick="updateOrderStatus('${o.order_no}', 'cancelled')" 
                          class="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100" title="取消">
                    ✗
                  </button>
                </div>
              </td>
            </tr>
          `).join('') : `<tr><td colspan="7" class="px-4 py-12 text-center text-gray-400">暂无订单</td></tr>`}
        </tbody>
      </table>
    </div>
  </div>

  <script>
  async function updateOrderStatus(orderNo, status) {
    if (!confirm('确认将订单 ' + orderNo + ' 状态改为 ' + status + ' ?')) return;
    try {
      const res = await fetch('/admin/api/orders/' + orderNo, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status })
      });
      if (res.ok) { window.location.reload(); }
      else { alert('操作失败'); }
    } catch(e) { alert('操作失败'); }
  }
  </script>
  `

  return c.html(adminLayout('订单管理', content, 'orders'))
})

// Admin API for orders
adminRoute.patch('/api/orders/:orderNo', async (c) => {
  const orderNo = c.req.param('orderNo')
  const body = await c.req.json()
  const { status } = body
  
  const validStatuses = ['pending', 'confirmed', 'paid', 'cancelled', 'completed', 'refunded']
  if (!validStatuses.includes(status)) {
    return c.json({ error: 'Invalid status' }, 400)
  }
  
  try {
    await c.env.DB.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_no = ?').bind(status, orderNo).run()
    return c.json({ success: true })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// Inquiries management
adminRoute.get('/inquiries', async (c) => {
  let inquiries: any[] = []
  try {
    const result = await c.env.DB.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all()
    inquiries = result.results || []
  } catch (e) { console.error(e) }

  const content = `
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-4 border-b border-gray-100">
      <h2 class="font-bold text-gray-800">客户咨询 (${inquiries.length})</h2>
    </div>
    <div class="divide-y divide-gray-50">
      ${inquiries.length > 0 ? inquiries.map((i: any) => `
        <div class="p-4 ${i.status === 'new' ? 'bg-yellow-50' : ''}">
          <div class="flex items-start justify-between mb-2">
            <div>
              <span class="font-semibold text-gray-800">${i.name}</span>
              <span class="text-sm text-gray-500 ml-2">${i.email}</span>
              ${i.phone ? `<span class="text-sm text-gray-500 ml-2">${i.phone}</span>` : ''}
              ${i.wechat ? `<span class="text-sm text-green-500 ml-2">微信: ${i.wechat}</span>` : ''}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-0.5 rounded-full ${i.status === 'new' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}">${i.status === 'new' ? '待回复' : i.status}</span>
              <span class="text-xs text-gray-400">${new Date(i.created_at).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
          <p class="text-gray-600 text-sm mb-2">${i.message}</p>
          ${i.admin_reply ? `<div class="bg-blue-50 rounded-lg p-3 text-sm text-blue-700 mt-2">回复: ${i.admin_reply}</div>` : ''}
          <div class="flex gap-2 mt-2">
            <button onclick="replyInquiry(${i.id})" class="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100">回复</button>
            <button onclick="closeInquiry(${i.id})" class="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-100">关闭</button>
          </div>
        </div>
      `).join('') : '<div class="p-12 text-center text-gray-400">暂无咨询</div>'}
    </div>
  </div>

  <!-- Reply Modal -->
  <div id="replyModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center;padding:1rem" class="flex">
    <div class="bg-white rounded-xl p-6 w-full max-w-md">
      <h3 class="font-bold mb-4">回复咨询</h3>
      <input type="hidden" id="replyId">
      <textarea id="replyText" rows="4" placeholder="请输入回复内容..." class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none mb-4"></textarea>
      <div class="flex gap-3">
        <button onclick="document.getElementById('replyModal').style.display='none'" class="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm">取消</button>
        <button onclick="submitReply()" class="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold">发送回复</button>
      </div>
    </div>
  </div>

  <script>
  function replyInquiry(id) {
    document.getElementById('replyId').value = id;
    document.getElementById('replyModal').style.display = 'flex';
  }
  async function submitReply() {
    const id = document.getElementById('replyId').value;
    const reply = document.getElementById('replyText').value;
    if (!reply) { alert('请输入回复内容'); return; }
    try {
      await fetch('/admin/api/inquiries/' + id, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ admin_reply: reply, status: 'replied' })
      });
      window.location.reload();
    } catch(e) { alert('操作失败'); }
  }
  async function closeInquiry(id) {
    await fetch('/admin/api/inquiries/' + id, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ status: 'closed' })
    });
    window.location.reload();
  }
  </script>
  `
  return c.html(adminLayout('咨询管理', content, 'inquiries'))
})

adminRoute.patch('/api/inquiries/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  try {
    const sets = Object.entries(body).map(([k, v]) => `${k} = ?`).join(', ')
    const values = [...Object.values(body), id]
    await c.env.DB.prepare(`UPDATE inquiries SET ${sets} WHERE id = ?`).bind(...values).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

// Hotels management
adminRoute.get('/hotels', async (c) => {
  let hotels: any[] = []
  try {
    const result = await c.env.DB.prepare('SELECT * FROM hotels ORDER BY created_at DESC').all()
    hotels = result.results || []
  } catch (e) { console.error(e) }

  const content = `
  <div class="flex items-center justify-between mb-6">
    <h2 class="font-bold text-gray-800">酒店/住宿列表 (${hotels.length})</h2>
    <button onclick="document.getElementById('addHotelModal').style.display='flex'" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
      + 添加酒店
    </button>
  </div>
  
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">标题</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">城市</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">价格/晚</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">评分</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">状态</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          ${hotels.map((h: any) => `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-800">${h.title_zh}</td>
              <td class="px-4 py-3 text-gray-600">${h.city}</td>
              <td class="px-4 py-3 font-bold text-blue-700">£${h.price_per_night}</td>
              <td class="px-4 py-3">⭐ ${h.rating} (${h.review_count})</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded-full text-xs ${h.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${h.is_available ? '可预订' : '已下架'}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <a href="/hotels/${h.id}?lang=zh" target="_blank" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">预览</a>
                  <button onclick="toggleAvailability('hotel', ${h.id}, ${h.is_available})" class="text-xs bg-${h.is_available ? 'red' : 'green'}-50 text-${h.is_available ? 'red' : 'green'}-600 px-2 py-1 rounded">${h.is_available ? '下架' : '上架'}</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Add Hotel Modal -->
  <div id="addHotelModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:flex-start;justify-content:center;padding:1rem;overflow-y:auto" class="flex">
    <div class="bg-white rounded-xl p-6 w-full max-w-2xl my-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-lg">添加酒店/住宿</h3>
        <button onclick="document.getElementById('addHotelModal').style.display='none'" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      <form onsubmit="submitAddHotel(event)" class="grid grid-cols-2 gap-4">
        <div class="col-span-2 grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">中文标题 *</label>
            <input type="text" name="title_zh" required class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">English Title *</label>
            <input type="text" name="title_en" required class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">城市 *</label>
          <select name="city" required class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400">
            <option value="london">伦敦</option>
            <option value="oxford">牛津</option>
            <option value="cambridge">剑桥</option>
            <option value="edinburgh">爱丁堡</option>
            <option value="manchester">曼彻斯特</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">每晚价格(£) *</label>
          <input type="number" name="price_per_night" required min="1" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400">
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">地址 *</label>
          <input type="text" name="address" required class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400">
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">中文描述</label>
          <textarea name="description_zh" rows="3" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none"></textarea>
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">图片URLs（每行一个）</label>
          <textarea name="images_raw" rows="2" placeholder="https://..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none"></textarea>
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">设施（逗号分隔）</label>
          <input type="text" name="amenities_raw" placeholder="WiFi,停车位,厨房..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400">
        </div>
        <div class="col-span-2 flex gap-3">
          <button type="button" onclick="document.getElementById('addHotelModal').style.display='none'" class="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm">取消</button>
          <button type="submit" class="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold">保存</button>
        </div>
      </form>
    </div>
  </div>

  <script>
  async function toggleAvailability(type, id, current) {
    const newVal = current ? 0 : 1;
    const table = type === 'hotel' ? 'hotels' : (type === 'rental' ? 'rentals' : 'guides');
    await fetch('/admin/api/toggle-availability', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ table, id, available: newVal })
    });
    window.location.reload();
  }
  async function submitAddHotel(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    const body = Object.fromEntries(data.entries());
    // Process images and amenities
    body.images = JSON.stringify(body.images_raw ? body.images_raw.split('\\n').map(s => s.trim()).filter(Boolean) : []);
    body.amenities_zh = JSON.stringify(body.amenities_raw ? body.amenities_raw.split(',').map(s => s.trim()).filter(Boolean) : []);
    body.amenities_en = body.amenities_zh;
    delete body.images_raw;
    delete body.amenities_raw;
    
    try {
      const res = await fetch('/admin/api/hotels', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
      if (res.ok) {
        document.getElementById('addHotelModal').style.display = 'none';
        window.location.reload();
      } else { alert('保存失败'); }
    } catch(e) { alert('保存失败'); }
  }
  </script>
  `

  return c.html(adminLayout('酒店管理', content, 'hotels'))
})

// Toggle availability API
adminRoute.post('/api/toggle-availability', async (c) => {
  const { table, id, available } = await c.req.json()
  const allowedTables = ['hotels', 'rentals', 'guides']
  if (!allowedTables.includes(table)) return c.json({ error: 'Invalid table' }, 400)
  const field = table === 'guides' ? 'is_available' : 'is_available'
  try {
    await c.env.DB.prepare(`UPDATE ${table} SET ${field} = ? WHERE id = ?`).bind(available, id).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

// Add hotel API
adminRoute.post('/api/hotels', async (c) => {
  const body = await c.req.json()
  try {
    await c.env.DB.prepare(`
      INSERT INTO hotels (title_zh, title_en, description_zh, description_en, city, address, images, amenities_zh, amenities_en, price_per_night, max_guests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2)
    `).bind(
      body.title_zh, body.title_en || body.title_zh,
      body.description_zh || '', body.description_en || '',
      body.city, body.address,
      body.images || '[]', body.amenities_zh || '[]', body.amenities_en || '[]',
      parseFloat(body.price_per_night)
    ).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

// Rentals, Guides, Study Tours admin pages (simplified listing)
adminRoute.get('/rentals', async (c) => {
  let rentals: any[] = []
  try {
    const result = await c.env.DB.prepare('SELECT * FROM rentals ORDER BY created_at DESC').all()
    rentals = result.results || []
  } catch (e) { console.error(e) }

  const content = `
  <div class="flex items-center justify-between mb-6">
    <h2 class="font-bold text-gray-800">租房房源 (${rentals.length})</h2>
    <button onclick="alert('请直接通过数据库或API添加房源')" class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">+ 添加房源</button>
  </div>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="text-left px-4 py-3 text-gray-600">标题</th>
            <th class="text-left px-4 py-3 text-gray-600">城市/区域</th>
            <th class="text-left px-4 py-3 text-gray-600">月租</th>
            <th class="text-left px-4 py-3 text-gray-600">房型</th>
            <th class="text-left px-4 py-3 text-gray-600">状态</th>
            <th class="text-left px-4 py-3 text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          ${rentals.map((r: any) => `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">${r.title_zh}</td>
              <td class="px-4 py-3 text-gray-600">${r.city} ${r.area || ''}</td>
              <td class="px-4 py-3 font-bold text-green-700">£${r.price_per_month}</td>
              <td class="px-4 py-3">${r.property_type}</td>
              <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs ${r.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${r.is_available ? '可租' : '已租'}</span></td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <a href="/rentals/${r.id}?lang=zh" target="_blank" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">预览</a>
                  <button onclick="toggleAvailability('rental', ${r.id}, ${r.is_available})" class="text-xs bg-${r.is_available ? 'red' : 'green'}-50 text-${r.is_available ? 'red' : 'green'}-600 px-2 py-1 rounded">${r.is_available ? '下架' : '上架'}</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>
  <script>
  async function toggleAvailability(type, id, current) {
    await fetch('/admin/api/toggle-availability', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ table: type + 's', id, available: current ? 0 : 1 }) });
    window.location.reload();
  }
  </script>
  `
  return c.html(adminLayout('租房管理', content, 'rentals'))
})

adminRoute.get('/guides', async (c) => {
  let guides: any[] = []
  try {
    const result = await c.env.DB.prepare('SELECT * FROM guides ORDER BY created_at DESC').all()
    guides = result.results || []
  } catch (e) { console.error(e) }

  const content = `
  <div class="flex items-center justify-between mb-6">
    <h2 class="font-bold text-gray-800">导游列表 (${guides.length})</h2>
  </div>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="text-left px-4 py-3">姓名</th>
            <th class="text-left px-4 py-3">覆盖城市</th>
            <th class="text-left px-4 py-3">日价格</th>
            <th class="text-left px-4 py-3">评分</th>
            <th class="text-left px-4 py-3">状态</th>
            <th class="text-left px-4 py-3">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          ${guides.map((g: any) => `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">${g.name_zh}</td>
              <td class="px-4 py-3 text-gray-600 text-xs">${g.cities || ''}</td>
              <td class="px-4 py-3 font-bold text-amber-700">£${g.price_per_day}</td>
              <td class="px-4 py-3">⭐ ${g.rating} (${g.review_count})</td>
              <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs ${g.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${g.is_available ? '接单中' : '暂停'}</span></td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <a href="/guides/${g.id}?lang=zh" target="_blank" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">预览</a>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>
  `
  return c.html(adminLayout('导游管理', content, 'guides'))
})

adminRoute.get('/study-tours', async (c) => {
  let tours: any[] = []
  try {
    const result = await c.env.DB.prepare('SELECT * FROM study_tours ORDER BY created_at DESC').all()
    tours = result.results || []
  } catch (e) { console.error(e) }

  const content = `
  <div class="flex items-center justify-between mb-6">
    <h2 class="font-bold text-gray-800">游学项目 (${tours.length})</h2>
  </div>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="text-left px-4 py-3">项目名称</th>
            <th class="text-left px-4 py-3">天数</th>
            <th class="text-left px-4 py-3">年龄</th>
            <th class="text-left px-4 py-3">价格/人</th>
            <th class="text-left px-4 py-3">下期开营</th>
            <th class="text-left px-4 py-3">状态</th>
            <th class="text-left px-4 py-3">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          ${tours.map((t: any) => `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">${t.title_zh}</td>
              <td class="px-4 py-3">${t.duration_days}天</td>
              <td class="px-4 py-3">${t.min_age}-${t.max_age}岁</td>
              <td class="px-4 py-3 font-bold text-purple-700">£${t.price_per_person}</td>
              <td class="px-4 py-3 text-gray-600">${t.next_available || '-'}</td>
              <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${t.is_active ? '招募中' : '已结束'}</span></td>
              <td class="px-4 py-3">
                <a href="/study-tours/${t.id}?lang=zh" target="_blank" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">预览</a>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>
  `
  return c.html(adminLayout('游学管理', content, 'study_tours'))
})

export default adminRoute
