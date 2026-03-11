import { Hono } from 'hono'
import { Lang, t } from '../lib/i18n'
import { getLayout, cityBadge, starRating } from '../lib/layout'

type Bindings = { DB: D1Database }
const guidesRoute = new Hono<{ Bindings: Bindings }>()

guidesRoute.get('/', async (c) => {
  const lang = (c.req.query('lang') || 'zh') as Lang
  const city = c.req.query('city') || ''
  const T = (key: any) => t(lang, key)

  let guides: any[] = []
  try {
    const result = await c.env.DB.prepare('SELECT * FROM guides WHERE is_available = 1 ORDER BY rating DESC').all()
    guides = result.results || []
    if (city) guides = guides.filter((g: any) => { try { return JSON.parse(g.cities || '[]').includes(city) } catch { return false } })
  } catch (e) { console.error(e) }

  const content = `
  <section class="gradient-bg py-12 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center space-x-2 text-white/70 text-sm mb-3">
        <a href="/?lang=${lang}" class="hover:text-white"><i class="fas fa-home"></i></a>
        <i class="fas fa-chevron-right text-xs"></i>
        <span>${T('nav_guides')}</span>
      </div>
      <h1 class="text-3xl md:text-4xl font-bold mb-2">${T('service_guide_title')}</h1>
      <p class="text-white/80">${T('service_guide_desc')}</p>
    </div>
  </section>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
      <div class="flex flex-wrap gap-2">
        ${['', 'london', 'oxford', 'cambridge', 'edinburgh', 'manchester'].map(c => {
          const names: Record<string, Record<string, string>> = {'': {zh: '全部城市', en: 'All'}, london: {zh: '伦敦', en: 'London'}, oxford: {zh: '牛津', en: 'Oxford'}, cambridge: {zh: '剑桥', en: 'Cambridge'}, edinburgh: {zh: '爱丁堡', en: 'Edinburgh'}, manchester: {zh: '曼彻斯特', en: 'Manchester'}}
          return `<a href="/guides?city=${c}&lang=${lang}" class="px-4 py-2 rounded-full text-sm font-medium transition-colors ${city === c ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'}">${names[c]?.[lang] || c}</a>`
        }).join('')}
      </div>
    </div>

    ${guides.length > 0 ? `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${guides.map((g: any) => {
        const cities = (() => { try { return JSON.parse(g.cities || '[]') } catch { return [] } })()
        const specialties = (() => { try { return JSON.parse(lang === 'zh' ? (g.specialties_zh || '[]') : (g.specialties_en || '[]')) } catch { return [] } })()
        return `
        <div class="card-hover bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 fade-in">
          <div class="relative h-40 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div class="absolute bottom-3 left-3 flex gap-1">
              ${cities.slice(0, 2).map((ct: string) => cityBadge(ct, lang)).join('')}
            </div>
          </div>
          <div class="p-5">
            <div class="flex items-center space-x-3 mb-3">
              <img src="${g.avatar}" class="w-12 h-12 rounded-full object-cover border-2 border-amber-100" onerror="this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'">
              <div>
                <h3 class="font-bold text-gray-900">${lang === 'zh' ? g.name_zh : g.name_en}</h3>
                <div class="flex items-center space-x-1">
                  ${starRating(g.rating || 0)}
                  <span class="text-xs text-gray-500">${g.rating || 0} (${g.review_count || 0})</span>
                </div>
              </div>
            </div>
            <p class="text-gray-600 text-sm mb-3 line-clamp-2">${lang === 'zh' ? g.bio_zh : g.bio_en}</p>
            <div class="flex flex-wrap gap-1 mb-4">
              ${specialties.slice(0, 3).map((s: string) => `<span class="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">${s}</span>`).join('')}
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <span class="font-bold text-amber-700 text-lg">£${g.price_per_day}</span>
                <span class="text-gray-500 text-sm ml-1">/${T('per_day')}</span>
              </div>
              <a href="/guides/${g.id}?lang=${lang}" class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors">
                ${T('guide_book')}
              </a>
            </div>
          </div>
        </div>`
      }).join('')}
    </div>
    ` : `<div class="text-center py-16"><i class="fas fa-map-marked-alt text-gray-300 text-5xl mb-4"></i><h3 class="text-xl font-semibold text-gray-500">${lang === 'zh' ? '暂无导游' : 'No guides found'}</h3></div>`}
  </div>
  `

  return c.html(getLayout(lang, T('nav_guides'), content, '/guides'))
})

guidesRoute.get('/:id', async (c) => {
  const lang = (c.req.query('lang') || 'zh') as Lang
  const id = c.req.param('id')
  const T = (key: any) => t(lang, key)

  let guide: any = null
  let packages: any[] = []
  try {
    guide = await c.env.DB.prepare('SELECT * FROM guides WHERE id = ?').bind(id).first()
    const pkgResult = await c.env.DB.prepare('SELECT * FROM guide_packages WHERE guide_id = ? AND is_active = 1').bind(id).all()
    packages = pkgResult.results || []
  } catch (e) { console.error(e) }

  if (!guide) return c.redirect('/guides?lang=' + lang)

  const cities = (() => { try { return JSON.parse(guide.cities || '[]') } catch { return [] } })()
  const specialties = (() => { try { return JSON.parse(lang === 'zh' ? (guide.specialties_zh || '[]') : (guide.specialties_en || '[]')) } catch { return [] } })()

  const content = `
  <div class="bg-gray-50 border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3">
      <div class="flex items-center space-x-2 text-sm text-gray-500">
        <a href="/?lang=${lang}" class="hover:text-blue-600"><i class="fas fa-home"></i></a>
        <i class="fas fa-chevron-right text-xs"></i>
        <a href="/guides?lang=${lang}" class="hover:text-blue-600">${T('nav_guides')}</a>
        <i class="fas fa-chevron-right text-xs"></i>
        <span class="text-gray-900">${lang === 'zh' ? guide.name_zh : guide.name_en}</span>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <!-- Profile -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div class="flex items-start space-x-5">
            <img src="${guide.avatar}" class="w-24 h-24 rounded-2xl object-cover border-2 border-amber-100" onerror="this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'">
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900 mb-1">${lang === 'zh' ? guide.name_zh : guide.name_en}</h1>
              <div class="flex items-center space-x-2 mb-2">
                ${starRating(guide.rating || 0)}
                <span class="font-semibold">${guide.rating || 0}</span>
                <span class="text-gray-400 text-sm">(${guide.review_count || 0} ${T('reviews')})</span>
              </div>
              <div class="flex flex-wrap gap-2 mb-3">
                ${cities.map((ct: string) => cityBadge(ct, lang)).join('')}
              </div>
              <div class="text-sm text-gray-500">
                <span class="mr-3"><i class="fas fa-language mr-1 text-amber-400"></i>${lang === 'zh' ? '中/英文' : 'Chinese/English'}</span>
                <span><i class="fas fa-briefcase mr-1 text-amber-400"></i>${guide.experience_years}${lang === 'zh' ? '年经验' : ' years exp'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bio -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 class="text-lg font-bold mb-3">${lang === 'zh' ? '导游介绍' : 'About This Guide'}</h2>
          <p class="text-gray-600 leading-relaxed">${lang === 'zh' ? guide.bio_zh : guide.bio_en}</p>
          <div class="flex flex-wrap gap-2 mt-4">
            ${specialties.map((s: string) => `<span class="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-sm">${s}</span>`).join('')}
          </div>
        </div>

        <!-- Packages -->
        ${packages.length > 0 ? `
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold mb-4">${T('guide_packages')}</h2>
          <div class="space-y-4">
            ${packages.map((pkg: any) => {
              const includes = (() => { try { return JSON.parse(lang === 'zh' ? (pkg.includes_zh || '[]') : (pkg.includes_en || '[]')) } catch { return [] } })()
              return `
              <div class="border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h3 class="font-bold text-gray-900">${lang === 'zh' ? pkg.title_zh : pkg.title_en}</h3>
                    <p class="text-gray-500 text-sm mt-0.5">${pkg.duration_hours}${lang === 'zh' ? '小时' : ' hours'} · ${lang === 'zh' ? '最多' : 'Max'} ${pkg.max_people}${lang === 'zh' ? '人' : ' people'}</p>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-amber-700 text-xl">£${pkg.price}</span>
                    <div class="text-xs text-gray-500">${lang === 'zh' ? '/次' : '/tour'}</div>
                  </div>
                </div>
                <p class="text-gray-600 text-sm mb-3">${lang === 'zh' ? pkg.description_zh : pkg.description_en}</p>
                <div class="flex flex-wrap gap-1 mb-3">
                  ${includes.map((inc: string) => `<span class="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"><i class="fas fa-check mr-1"></i>${inc}</span>`).join('')}
                </div>
                <button onclick="openBookingModal(${pkg.id}, '${lang === 'zh' ? pkg.title_zh.replace(/'/g, '') : pkg.title_en.replace(/'/g, '')}', ${pkg.price})"
                        class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors">
                  ${T('book_now')}
                </button>
              </div>`
            }).join('')}
          </div>
        </div>
        ` : ''}
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-20">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-4">
            <div class="text-center pb-4 border-b border-gray-100 mb-4">
              <div class="text-sm text-gray-500 mb-1">${lang === 'zh' ? '全天导览' : 'Full Day'}</div>
              <span class="text-3xl font-bold text-amber-700">£${guide.price_per_day}</span>
              ${guide.price_per_half_day ? `<div class="text-sm text-gray-500 mt-1">${lang === 'zh' ? '半天' : 'Half Day'}: £${guide.price_per_half_day}</div>` : ''}
            </div>
            <button onclick="openBookingModal(null, '${lang === 'zh' ? guide.name_zh : guide.name_en}', ${guide.price_per_day})"
                    class="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-colors mb-3">
              <i class="fas fa-calendar-check mr-2"></i>${T('guide_book')}
            </button>
            <button onclick="document.getElementById('inquiryModal').classList.add('active')"
                    class="w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:border-amber-400 hover:text-amber-600 transition-colors">
              <i class="fab fa-weixin text-green-500 mr-2"></i>${lang === 'zh' ? '微信咨询' : 'WeChat Enquiry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Booking Modal -->
  <div id="bookingModal" class="modal">
    <div class="modal-content p-6 w-full max-w-md">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">${T('guide_book')}</h2>
        <button onclick="document.getElementById('bookingModal').classList.remove('active')" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
      </div>
      <form onsubmit="submitBooking(event)" class="space-y-3">
        <input type="hidden" name="serviceType" value="guide">
        <input type="hidden" name="serviceId" value="${guide.id}">
        <input type="hidden" id="bookingTitle" name="serviceTitle" value="">
        <input type="hidden" id="bookingAmount" name="amount" value="">
        <input type="hidden" name="lang" value="${lang}">
        <div id="bookingSummary" class="bg-amber-50 rounded-xl p-3 text-sm text-amber-800 mb-2"></div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">${lang === 'zh' ? '服务日期 *' : 'Service Date *'}</label>
          <input type="date" name="serviceDate" required min="${new Date().toISOString().split('T')[0]}"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400">
        </div>
        <input type="text" name="userName" required placeholder="${T('order_name')} *"
               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400">
        <input type="email" name="userEmail" required placeholder="${T('order_email')} *"
               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400">
        <div class="grid grid-cols-2 gap-3">
          <input type="tel" name="userPhone" placeholder="${T('order_phone')}"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400">
          <input type="text" name="userWechat" placeholder="${T('order_wechat')}"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400">
        </div>
        <input type="number" name="guests" min="1" max="20" value="2" placeholder="${lang === 'zh' ? '人数' : 'Number of people'}"
               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400">
        <textarea name="specialRequests" rows="2" placeholder="${T('order_special')}"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 resize-none"></textarea>
        <button type="submit" class="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-colors">
          <i class="fas fa-credit-card mr-2"></i>${T('order_pay')}
        </button>
      </form>
    </div>
  </div>

  <!-- Inquiry Modal -->
  <div id="inquiryModal" class="modal">
    <div class="modal-content p-6 w-full max-w-md">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">${T('inquiry_title')}</h2>
        <button onclick="document.getElementById('inquiryModal').classList.remove('active')" class="text-gray-400"><i class="fas fa-times"></i></button>
      </div>
      <form onsubmit="submitInquiry(event)" class="space-y-3">
        <input type="hidden" name="serviceType" value="guide">
        <input type="hidden" name="serviceId" value="${guide.id}">
        <input type="text" name="name" required placeholder="${T('inquiry_name')} *" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400">
        <input type="email" name="email" required placeholder="${T('inquiry_email')} *" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400">
        <input type="tel" name="phone" placeholder="${T('inquiry_phone')}" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400">
        <input type="text" name="wechat" placeholder="${T('inquiry_wechat')}" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400">
        <textarea name="message" required rows="3" placeholder="${T('inquiry_message')}" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 resize-none"></textarea>
        <button type="submit" class="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-colors">${T('inquiry_submit')}</button>
      </form>
    </div>
  </div>

  <script>
  const lang = '${lang}';
  function openBookingModal(pkgId, title, price) {
    document.getElementById('bookingTitle').value = title;
    document.getElementById('bookingAmount').value = price;
    document.getElementById('bookingSummary').innerHTML = lang === 'zh' ? 
      '<strong>' + title + '</strong><br>价格: £' + price : 
      '<strong>' + title + '</strong><br>Price: £' + price;
    document.getElementById('bookingModal').classList.add('active');
  }
  async function submitBooking(e) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    const btn = e.target.querySelector('[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
      const result = await res.json();
      if (result.checkoutUrl) { window.location.href = result.checkoutUrl; }
      else if (result.success) {
        document.getElementById('bookingModal').classList.remove('active');
        alert((lang === 'zh' ? '预订成功！订单号: ' : 'Booking confirmed! Order: ') + result.orderNo);
      } else { alert(result.error || 'Error'); }
    } catch(e) { alert(lang === 'zh' ? '提交失败' : 'Failed'); } finally { btn.disabled = false; }
  }
  async function submitInquiry(e) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    try {
      await fetch('/api/inquiries', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
      document.getElementById('inquiryModal').classList.remove('active');
      alert(lang === 'zh' ? '咨询已提交！' : 'Enquiry submitted!');
    } catch(e) { alert('Failed'); }
  }
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); }));
  </script>
  `

  return c.html(getLayout(lang, lang === 'zh' ? guide.name_zh : guide.name_en, content, '/guides'))
})

export default guidesRoute
