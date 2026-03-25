import { Hono } from 'hono'
import {  Lang, t , getCurrency } from '../lib/i18n'
import { getLayout, cityBadge } from '../lib/layout'

type Bindings = { DB: D1Database }
const rentalsRoute = new Hono<{ Bindings: Bindings }>()

rentalsRoute.get('/', async (c) => {
  var lang = (c.req.query('lang') || 'en') as Lang
  const currency = getCurrency(c);
  const city = c.req.query('city') || ''
  const T = (key: any) => t(lang, key)

  let rentals: any[] = []
  try {
    const q = city ? 'SELECT * FROM rentals WHERE is_available = 1 AND city = ? ORDER BY created_at DESC' : 'SELECT * FROM rentals WHERE is_available = 1 ORDER BY created_at DESC'
    const result = city ? await c.env.DB.prepare(q).bind(city).all() : await c.env.DB.prepare(q).all()
    rentals = result.results || []
  } catch (e) { console.error(e) }

  const roomTypes: Record<string, Record<string, string>> = {
    studio: {zh: '工作室/单间', en: 'Studio'},
    '1bed': {zh: '一居室', en: '1 Bedroom'},
    '2bed': {zh: '两居室', en: '2 Bedrooms'},
    '3bed': {zh: '三居室', en: '3 Bedrooms'},
    shared: {zh: '合租', en: 'House Share'},
  }

  const content = `
  <section class="gradient-bg py-12 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center space-x-2 text-white/70 text-sm mb-3">
        <a href="/?lang=${lang}" class="hover:text-white"><i class="fas fa-home"></i></a>
        <i class="fas fa-chevron-right text-xs"></i>
        <span class="text-white">${T('nav_rentals')}</span>
      </div>
      <h1 class="text-3xl md:text-4xl font-bold mb-2">${T('service_rental_title')}</h1>
      <p class="text-white/80">${T('service_rental_desc')}</p>
    </div>
  </section>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <!-- Info Banner -->
    <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start space-x-3">
      <i class="fas fa-info-circle text-amber-500 mt-0.5"></i>
      <div class="text-sm text-amber-800">
        <strong>${lang === 'zh' ? '全程中文代办服务：' : 'Full Chinese Agency Service:'}</strong>
        ${lang === 'zh' ? '我们提供看房、议价、合同审核、签约全程代办，协助开设银行账户，帮您顺利安家英国。' : 'We provide full Chinese-language service including viewings, negotiation, contract review, signing, and bank account assistance.'}
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
      <div class="flex flex-wrap gap-2">
        ${['', 'london', 'oxford', 'cambridge', 'edinburgh', 'manchester'].map(c => {
          const names: Record<string, Record<string, string>> = {'': {zh: '全部城市', en: 'All Cities'}, london: {zh: '伦敦', en: 'London'}, oxford: {zh: '牛津', en: 'Oxford'}, cambridge: {zh: '剑桥', en: 'Cambridge'}, edinburgh: {zh: '爱丁堡', en: 'Edinburgh'}, manchester: {zh: '曼彻斯特', en: 'Manchester'}}
          return `<a href="/rentals?city=${c}&lang=${lang}" class="px-4 py-2 rounded-full text-sm font-medium transition-colors ${city === c ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'}">${names[c]?.[lang] || c}</a>`
        }).join('')}
      </div>
    </div>

    <div class="mb-4 text-gray-600 text-sm">
      ${lang === 'zh' ? `找到 <strong class="text-gray-900">${rentals.length}</strong> 个房源` : `Found <strong class="text-gray-900">${rentals.length}</strong> properties`}
    </div>

    ${rentals.length > 0 ? `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${rentals.map((r: any) => {
        const images = JSON.parse(r.images || '[]')
        const amenities = JSON.parse(lang === 'zh' ? (r.amenities_zh || '[]') : (r.amenities_en || '[]'))
        return `
        <div class="card-hover bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 fade-in">
          <div class="relative h-52 overflow-hidden">
            <img src="${images[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'}" 
                 class="w-full h-full object-cover transition-transform hover:scale-105" alt="${lang === 'zh' ? r.title_zh : r.title_en}">
            <div class="absolute top-3 left-3">${cityBadge(r.city, lang)}</div>
            <div class="absolute top-3 right-3 bg-white/95 rounded-full px-2 py-1 text-xs font-bold text-green-700 shadow">
              ${roomTypes[r.property_type]?.[lang] || r.property_type}
            </div>
            ${r.bills_included ? `<div class="absolute bottom-3 left-3 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">${lang === 'zh' ? '包水电' : 'Bills incl.'}</div>` : ''}
          </div>
          <div class="p-5">
            <h3 class="font-bold text-gray-900 text-base mb-1">${lang === 'zh' ? r.title_zh : r.title_en}</h3>
            <p class="text-gray-500 text-xs mb-2 flex items-center">
              <i class="fas fa-map-marker-alt mr-1 text-green-400"></i>${r.area || ''}, ${r.city}
            </p>
            <div class="flex items-center space-x-3 text-xs text-gray-500 mb-3">
              <span><i class="fas fa-bed mr-1"></i>${r.bedrooms} ${lang === 'zh' ? '卧' : 'bed'}</span>
              <span><i class="fas fa-bath mr-1"></i>${r.bathrooms} ${lang === 'zh' ? '浴' : 'bath'}</span>
              ${r.available_from ? `<span><i class="fas fa-calendar mr-1"></i>${r.available_from}</span>` : ''}
            </div>
            <p class="text-gray-600 text-sm mb-3 line-clamp-2">${lang === 'zh' ? r.description_zh : r.description_en}</p>
            <div class="flex flex-wrap gap-1 mb-4">
              ${amenities.slice(0, 3).map((a: string) => `<span class="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">${a}</span>`).join('')}
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <span class="font-bold text-green-700 text-lg">${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? r.price_per_month : r.price_per_month_cny}</span>
                <span class="text-gray-500 text-sm ml-1">/${T('per_month')}</span>
              </div>
              <a href="/rentals/${r.id}?lang=${lang}" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors">
                ${T('inquire')}
              </a>
            </div>
          </div>
        </div>`
      }).join('')}
    </div>
    ` : `<div class="text-center py-16"><i class="fas fa-home text-gray-300 text-5xl mb-4"></i><h3 class="text-xl font-semibold text-gray-500">${lang === 'zh' ? '暂无房源' : 'No properties found'}</h3></div>`}

    <!-- Rental Agency CTA -->
    <div class="mt-12 bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white text-center">
      <i class="fas fa-handshake text-4xl mb-4 opacity-80"></i>
      <h2 class="text-2xl font-bold mb-2">${lang === 'zh' ? '找不到合适的房源？' : 'Can\'t find the right property?'}</h2>
      <p class="text-white/80 mb-4">${lang === 'zh' ? '告诉我们您的需求，我们的专业团队为您量身定制找房方案' : 'Tell us your requirements and our expert team will find the perfect property for you'}</p>
      <button onclick="document.getElementById('customRequestModal').classList.add('active')" 
              class="bg-white text-green-700 px-6 py-3 rounded-full font-bold hover:bg-green-50 transition-colors">
        ${lang === 'zh' ? '提交找房需求' : 'Submit Property Request'}
      </button>
    </div>
  </div>

  <!-- Custom Request Modal -->
  <div id="customRequestModal" class="modal">
    <div class="modal-content p-6 w-full max-w-md">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">${lang === 'zh' ? '提交找房需求' : 'Property Request'}</h2>
        <button onclick="document.getElementById('customRequestModal').classList.remove('active')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form onsubmit="submitCustomRequest(event)" class="space-y-3">
        <input type="text" name="name" required placeholder="${lang === 'zh' ? '您的姓名 *' : 'Your Name *'}"
               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400">
        <input type="email" name="email" required placeholder="${lang === 'zh' ? '邮箱地址 *' : 'Email *'}"
               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400">
        <input type="tel" name="phone" placeholder="${lang === 'zh' ? '联系电话' : 'Phone'}"
               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400">
        <input type="text" name="wechat" placeholder="${lang === 'zh' ? '微信号' : 'WeChat ID'}"
               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400">
        <textarea name="message" required rows="4"
                  placeholder="${lang === 'zh' ? '请描述您的找房需求：城市、房型、预算、入住时间等...' : 'Describe your requirements: city, type, budget, move-in date...'}"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 resize-none"></textarea>
        <input type="hidden" name="serviceType" value="rental">
        <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors">
          ${lang === 'zh' ? '发送需求' : 'Send Request'}
        </button>
      </form>
    </div>
  </div>

  <script>
        var currency = '${currency}';
  var lang = '${lang}';
  async function submitCustomRequest(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    const body = Object.fromEntries(data.entries());
    body.currency = typeof currency !== 'undefined' ? currency : 'GBP';

    try {
      await fetch('/api/inquiries', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
      document.getElementById('customRequestModal').classList.remove('active');
      alert(lang === 'zh' ? '需求已提交！我们会尽快联系您。' : 'Request submitted! We will contact you soon.');
    } catch(e) { alert(lang === 'zh' ? '提交失败，请重试' : 'Failed, please retry'); }
  }
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); }));
  </script>
  `

  return c.html(getLayout(lang, T('nav_rentals'), content, '/rentals', currency))
})

rentalsRoute.get('/:id', async (c) => {
  var lang = (c.req.query('lang') || 'en') as Lang
  const currency = getCurrency(c);
  const id = c.req.param('id')
  const T = (key: any) => t(lang, key)

  let rental: any = null
  try { rental = await c.env.DB.prepare('SELECT * FROM rentals WHERE id = ?').bind(id).first() } catch (e) { console.error(e) }
  if (!rental) return c.redirect('/rentals?lang=' + lang)

  const images = JSON.parse(rental.images || '[]')
  const amenities = JSON.parse(lang === 'zh' ? (rental.amenities_zh || '[]') : (rental.amenities_en || '[]'))
  const transport = lang === 'zh' ? rental.transport_zh : rental.transport_en

  const content = `
  <div class="bg-gray-50 border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3">
      <div class="flex items-center space-x-2 text-sm text-gray-500">
        <a href="/?lang=${lang}" class="hover:text-blue-600"><i class="fas fa-home"></i></a>
        <i class="fas fa-chevron-right text-xs"></i>
        <a href="/rentals?lang=${lang}" class="hover:text-blue-600">${T('nav_rentals')}</a>
        <i class="fas fa-chevron-right text-xs"></i>
        <span class="text-gray-900">${lang === 'zh' ? rental.title_zh : rental.title_en}</span>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="grid grid-cols-3 gap-2 h-72 mb-6">
          <div class="col-span-2 rounded-2xl overflow-hidden">
            <img src="${images[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'}" class="w-full h-full object-cover">
          </div>
          <div class="flex flex-col gap-2">
            ${images.slice(1, 3).map((img: string) => `<div class="flex-1 rounded-xl overflow-hidden"><img src="${img}" class="w-full h-full object-cover"></div>`).join('')}
            ${images.length < 3 ? '<div class="flex-1 rounded-xl bg-gray-100"></div>'.repeat(3 - images.length - 1) : ''}
          </div>
        </div>

        <div class="mb-6">
          <div class="flex items-start justify-between mb-2">
            <h1 class="text-2xl font-bold text-gray-900">${lang === 'zh' ? rental.title_zh : rental.title_en}</h1>
            ${cityBadge(rental.city, lang)}
          </div>
          <p class="text-gray-500 flex items-center text-sm"><i class="fas fa-map-marker-alt text-green-400 mr-1"></i>${rental.area || ''}, ${rental.city}</p>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 class="text-lg font-bold mb-4">${lang === 'zh' ? '房源详情' : 'Property Details'}</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div class="text-center bg-gray-50 rounded-xl p-3">
              <i class="fas fa-bed text-green-500 text-xl mb-1"></i>
              <div class="font-bold text-gray-900">${rental.bedrooms}</div>
              <div class="text-xs text-gray-500">${T('rental_beds')}</div>
            </div>
            <div class="text-center bg-gray-50 rounded-xl p-3">
              <i class="fas fa-bath text-green-500 text-xl mb-1"></i>
              <div class="font-bold text-gray-900">${rental.bathrooms}</div>
              <div class="text-xs text-gray-500">${T('rental_baths')}</div>
            </div>
            <div class="text-center bg-gray-50 rounded-xl p-3">
              <i class="fas fa-couch text-green-500 text-xl mb-1"></i>
              <div class="font-bold text-gray-900 text-sm">${rental.furnishing === 'furnished' ? (lang === 'zh' ? '已装修' : 'Furnished') : (lang === 'zh' ? '未装修' : 'Unfurnished')}</div>
              <div class="text-xs text-gray-500">${T('rental_furnishing')}</div>
            </div>
          </div>
          <div class="flex items-center space-x-4 text-sm">
            <span class="${rental.bills_included ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-50'} px-3 py-1 rounded-full">
              <i class="fas fa-bolt mr-1"></i>
              ${lang === 'zh' ? '水电费' : 'Bills'}: ${rental.bills_included ? T('rental_bills_incl') : T('rental_bills_excl')}
            </span>
            ${rental.available_from ? `<span class="text-blue-600 bg-blue-50 px-3 py-1 rounded-full"><i class="fas fa-calendar mr-1"></i>${rental.available_from}</span>` : ''}
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 class="text-lg font-bold mb-3">${lang === 'zh' ? '房源介绍' : 'Description'}</h2>
          <p class="text-gray-600 leading-relaxed">${lang === 'zh' ? rental.description_zh : rental.description_en}</p>
        </div>

        ${amenities.length > 0 ? `
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 class="text-lg font-bold mb-4">${lang === 'zh' ? '配套设施' : 'Amenities'}</h2>
          <div class="grid grid-cols-2 gap-2">
            ${amenities.map((a: string) => `<div class="flex items-center space-x-2 text-gray-700 text-sm"><i class="fas fa-check-circle text-green-500"></i><span>${a}</span></div>`).join('')}
          </div>
        </div>
        ` : ''}

        ${transport ? `
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold mb-3"><i class="fas fa-bus text-green-500 mr-2"></i>${lang === 'zh' ? '交通信息' : 'Transport'}</h2>
          <p class="text-gray-600 text-sm">${transport}</p>
        </div>
        ` : ''}
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-20">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-4">
            <div class="text-center pb-4 border-b border-gray-100 mb-4">
              <span class="text-3xl font-bold text-green-700">${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? rental.price_per_month : rental.price_per_month_cny}</span>
              <span class="text-gray-500 ml-1">/${T('per_month')}</span>
              <div class="text-sm text-gray-500 mt-1">${lang === 'zh' ? `押金: ${rental.deposit_months}个月` : `Deposit: ${rental.deposit_months} month(s)`}</div>
            </div>
            <button onclick="document.getElementById('inquiryModal').classList.add('active')" 
                    class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors mb-3">
              <i class="fas fa-comments mr-2"></i>${T('rental_inquire')}
            </button>
            <div class="bg-green-50 rounded-xl p-3 text-sm text-green-700">
              <i class="fas fa-shield-alt mr-2"></i>
              ${lang === 'zh' ? '专业中文中介 · 合同保障 · 透明费用' : 'Professional Chinese agent · Contract protection · Transparent fees'}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Inquiry Modal -->
  <div id="inquiryModal" class="modal">
    <div class="modal-content p-6 w-full max-w-md">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">${T('inquiry_title')}</h2>
        <button onclick="document.getElementById('inquiryModal').classList.remove('active')" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
      </div>
      <form onsubmit="submitInquiry(event)" class="space-y-3">
        <input type="hidden" name="serviceType" value="rental">
        <input type="hidden" name="serviceId" value="${rental.id}">
        <input type="text" name="name" required placeholder="${T('inquiry_name')} *" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400">
        <input type="email" name="email" required placeholder="${T('inquiry_email')} *" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400">
        <input type="tel" name="phone" placeholder="${T('inquiry_phone')}" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400">
        <input type="text" name="wechat" placeholder="${T('inquiry_wechat')}" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400">
        <textarea name="message" required rows="3" placeholder="${T('inquiry_message')}" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 resize-none"></textarea>
        <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors">${T('inquiry_submit')}</button>
      </form>
    </div>
  </div>
  <script>
        var currency = '${currency}';
  var lang = '${lang}';
  async function submitInquiry(e) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    try {
      await fetch('/api/inquiries', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
      document.getElementById('inquiryModal').classList.remove('active');
      alert(lang === 'zh' ? '咨询已提交！我们会在24小时内回复您。' : 'Enquiry submitted! We will reply within 24 hours.');
    } catch(e) { alert(lang === 'zh' ? '提交失败' : 'Failed'); }
  }
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); }));
  </script>
  `

  return c.html(getLayout(lang, lang === 'zh' ? rental.title_zh : rental.title_en, content, '/rentals', currency))
})

export default rentalsRoute
