import { Hono } from 'hono'
import {  Lang, t , getCurrency } from '../lib/i18n'
import { getLayout, starRating } from '../lib/layout'

type Bindings = { DB: D1Database }
const studyToursRoute = new Hono<{ Bindings: Bindings }>()

studyToursRoute.get('/', async (c) => {
  const lang = (c.req.query('lang') || 'en') as Lang
  const currency = getCurrency(c);
  const T = (key: any) => t(lang, key)

  let tours: any[] = []
  try {
    const result = await c.env.DB.prepare('SELECT * FROM study_tours WHERE is_active = 1 ORDER BY created_at DESC').all()
    tours = result.results || []
  } catch (e) { console.error(e) }

  const content = `
  <section class="gradient-bg py-12 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center space-x-2 text-white/70 text-sm mb-3">
        <a href="/?lang=${lang}" class="hover:text-white"><i class="fas fa-home"></i></a>
        <i class="fas fa-chevron-right text-xs"></i>
        <span>${T('nav_study_tours')}</span>
      </div>
      <h1 class="text-3xl md:text-4xl font-bold mb-2">${T('service_study_title')}</h1>
      <p class="text-white/80 max-w-2xl">${T('service_study_desc')}</p>
    </div>
  </section>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <!-- Highlights Banner -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      ${[
        {icon: 'fas fa-university', text_zh: '名校深度参访', text_en: 'University Visits'},
        {icon: 'fas fa-language', text_zh: '语言强化训练', text_en: 'Language Training'},
        {icon: 'fas fa-shield-alt', text_zh: '全程安全保障', text_en: 'Full Safety Cover'},
        {icon: 'fas fa-star', text_zh: '中文随行导师', text_en: 'Chinese Tutor'},
      ].map(({icon, text_zh, text_en}) => `
        <div class="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
          <i class="${icon} text-purple-600 text-xl mb-2"></i>
          <div class="text-sm font-medium text-purple-800">${lang === 'zh' ? text_zh : text_en}</div>
        </div>
      `).join('')}
    </div>

    ${tours.length > 0 ? `
    <div class="space-y-6">
      ${tours.map((tour: any) => {
        const images = (() => { try { return JSON.parse(tour.images || '[]') } catch { return [] } })()
        const highlights = (() => { try { return JSON.parse(lang === 'zh' ? (tour.highlights_zh || '[]') : (tour.highlights_en || '[]')) } catch { return [] } })()
        const cities = (() => { try { return JSON.parse(tour.cities || '[]') } catch { return [] } })()
        
        const cityNames: Record<string, Record<string, string>> = {
          london: {zh: '伦敦', en: 'London'},
          oxford: {zh: '牛津', en: 'Oxford'},
          cambridge: {zh: '剑桥', en: 'Cambridge'},
        }
        
        return `
        <div class="card-hover bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 fade-in">
          <div class="grid grid-cols-1 md:grid-cols-3">
            <div class="relative h-56 md:h-auto overflow-hidden">
              <img src="${images[0] || 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=600'}"
                   class="w-full h-full object-cover" alt="${lang === 'zh' ? tour.title_zh : tour.title_en}">
              <div class="absolute top-3 right-3 bg-purple-600 text-white text-sm px-3 py-1 rounded-full font-bold">
                ${tour.duration_days}${lang === 'zh' ? '天' : 'D'}
              </div>
            </div>
            <div class="md:col-span-2 p-6">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-1">${lang === 'zh' ? tour.title_zh : tour.title_en}</h3>
                  <div class="flex flex-wrap gap-1">
                    ${cities.map((ct: string) => `<span class="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">${cityNames[ct]?.[lang] || ct}</span>`).join('')}
                    <span class="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">${tour.min_age}-${tour.max_age}${lang === 'zh' ? '岁' : ' yrs'}</span>
                  </div>
                </div>
                <div class="text-right flex-shrink-0 ml-4">
                  <span class="text-2xl font-bold text-purple-700">${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? tour.price_per_person : tour.price_per_person_cny}</span>
                  <div class="text-xs text-gray-500">${T('per_person')}</div>
                </div>
              </div>
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">${lang === 'zh' ? tour.description_zh : tour.description_en}</p>
              <div class="flex flex-wrap gap-2 mb-4">
                ${highlights.slice(0, 4).map((h: string) => `
                  <span class="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">
                    <i class="fas fa-check text-green-500 mr-1"></i>${h}
                  </span>
                `).join('')}
              </div>
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">
                  <i class="fas fa-users mr-1"></i>
                  ${lang === 'zh' ? `${tour.min_people}-${tour.max_people}人` : `${tour.min_people}-${tour.max_people} people`}
                  ${tour.next_available ? ` · <i class="fas fa-calendar mr-1"></i>${tour.next_available}${lang === 'zh' ? '开营' : ''}` : ''}
                </div>
                <a href="/study-tours/${tour.id}?lang=${lang}" 
                   class="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors">
                  ${T('view_details')}
                </a>
              </div>
            </div>
          </div>
        </div>`
      }).join('')}
    </div>
    ` : `<div class="text-center py-16"><i class="fas fa-graduation-cap text-gray-300 text-5xl mb-4"></i><h3 class="text-xl font-semibold text-gray-500">${lang === 'zh' ? '暂无游学项目' : 'No study tours available'}</h3></div>`}

    <!-- Contact CTA -->
    <div class="mt-12 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white text-center">
      <h2 class="text-2xl font-bold mb-2">${lang === 'zh' ? '想定制专属游学行程？' : 'Want a Customized Study Tour?'}</h2>
      <p class="text-white/80 mb-4">${lang === 'zh' ? '我们提供个性化定制服务，根据您的需求和预算量身打造' : 'We offer personalized programs tailored to your needs and budget'}</p>
      <button onclick="document.getElementById('customModal').classList.add('active')"
              class="bg-white text-purple-700 px-6 py-3 rounded-full font-bold hover:bg-purple-50 transition-colors">
        ${lang === 'zh' ? '联系我们定制' : 'Contact Us for Custom Tour'}
      </button>
    </div>
  </div>

  <!-- Custom Inquiry Modal -->
  <div id="customModal" class="modal">
    <div class="modal-content p-6 w-full max-w-md">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">${lang === 'zh' ? '定制游学咨询' : 'Custom Study Tour Enquiry'}</h2>
        <button onclick="document.getElementById('customModal').classList.remove('active')" class="text-gray-400"><i class="fas fa-times"></i></button>
      </div>
      <form onsubmit="submitCustom(event)" class="space-y-3">
        <input type="hidden" name="serviceType" value="study_tour">
        <input type="text" name="name" required placeholder="${lang === 'zh' ? '您的姓名 *' : 'Your Name *'}" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400">
        <input type="email" name="email" required placeholder="${lang === 'zh' ? '邮箱地址 *' : 'Email *'}" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400">
        <input type="tel" name="phone" placeholder="${lang === 'zh' ? '联系电话' : 'Phone'}" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400">
        <input type="text" name="wechat" placeholder="${lang === 'zh' ? '微信号' : 'WeChat ID'}" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400">
        <textarea name="message" required rows="4"
                  placeholder="${lang === 'zh' ? '请描述需求：孩子年龄、人数、期望城市、时间、预算...' : 'Please describe: age, group size, cities, timing, budget...'}"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 resize-none"></textarea>
        <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-colors">${lang === 'zh' ? '提交咨询' : 'Submit Enquiry'}</button>
      </form>
    </div>
  </div>

  <script>
        const currency = '${currency}';
  const lang = '${lang}';
  async function submitCustom(e) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    body.currency = typeof currency !== 'undefined' ? currency : 'GBP';

    try {
      await fetch('/api/inquiries', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
      document.getElementById('customModal').classList.remove('active');
      alert(lang === 'zh' ? '咨询已提交！我们会尽快联系您。' : 'Enquiry submitted! We will contact you soon.');
    } catch(e) { alert('Failed'); }
  }
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); }));
  </script>
  `

  return c.html(getLayout(lang, T('nav_study_tours'), content, '/study-tours', currency))
})

studyToursRoute.get('/:id', async (c) => {
  const lang = (c.req.query('lang') || 'en') as Lang
  const currency = getCurrency(c);
  const id = c.req.param('id')
  const T = (key: any) => t(lang, key)

  let tour: any = null
  try { tour = await c.env.DB.prepare('SELECT * FROM study_tours WHERE id = ?').bind(id).first() } catch (e) { console.error(e) }
  if (!tour) return c.redirect('/study-tours?lang=' + lang)

  const images = (() => { try { return JSON.parse(tour.images || '[]') } catch { return [] } })()
  const highlights = (() => { try { return JSON.parse(lang === 'zh' ? (tour.highlights_zh || '[]') : (tour.highlights_en || '[]')) } catch { return [] } })()
  const includes = (() => { try { return JSON.parse(lang === 'zh' ? (tour.includes_zh || '[]') : (tour.includes_en || '[]')) } catch { return [] } })()
  const excludes = (() => { try { return JSON.parse(lang === 'zh' ? (tour.excludes_zh || '[]') : (tour.excludes_en || '[]')) } catch { return [] } })()
  const itinerary = (() => { try { return JSON.parse(lang === 'zh' ? (tour.itinerary_zh || '[]') : (tour.itinerary_en || '[]')) } catch { return [] } })()

  const content = `
  <div class="bg-gray-50 border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3">
      <div class="flex items-center space-x-2 text-sm text-gray-500">
        <a href="/?lang=${lang}" class="hover:text-blue-600"><i class="fas fa-home"></i></a>
        <i class="fas fa-chevron-right text-xs"></i>
        <a href="/study-tours?lang=${lang}" class="hover:text-blue-600">${T('nav_study_tours')}</a>
        <i class="fas fa-chevron-right text-xs"></i>
        <span class="text-gray-900 truncate">${lang === 'zh' ? tour.title_zh : tour.title_en}</span>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <!-- Images -->
        <div class="grid grid-cols-3 gap-2 h-72 mb-6 rounded-2xl overflow-hidden">
          <div class="col-span-2"><img src="${images[0] || 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=800'}" class="w-full h-full object-cover"></div>
          <div class="flex flex-col gap-2">
            ${images.slice(1, 3).map((img: string) => `<div class="flex-1 overflow-hidden"><img src="${img}" class="w-full h-full object-cover"></div>`).join('')}
            ${images.length < 3 ? `<div class="flex-1 bg-gray-100"></div>`.repeat(Math.max(0, 3 - images.length - 1)) : ''}
          </div>
        </div>

        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">${lang === 'zh' ? tour.title_zh : tour.title_en}</h1>

        <!-- Key Info -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div class="bg-purple-50 rounded-xl p-3 text-center">
            <i class="fas fa-calendar-alt text-purple-500 text-lg mb-1"></i>
            <div class="font-bold text-gray-900">${tour.duration_days}${lang === 'zh' ? '天' : ' Days'}</div>
            <div class="text-xs text-gray-500">${T('study_duration')}</div>
          </div>
          <div class="bg-blue-50 rounded-xl p-3 text-center">
            <i class="fas fa-user text-blue-500 text-lg mb-1"></i>
            <div class="font-bold text-gray-900">${tour.min_age}-${tour.max_age}</div>
            <div class="text-xs text-gray-500">${T('study_age')}</div>
          </div>
          <div class="bg-green-50 rounded-xl p-3 text-center">
            <i class="fas fa-users text-green-500 text-lg mb-1"></i>
            <div class="font-bold text-gray-900">${tour.min_people}-${tour.max_people}</div>
            <div class="text-xs text-gray-500">${lang === 'zh' ? '人数' : 'People'}</div>
          </div>
          <div class="bg-amber-50 rounded-xl p-3 text-center">
            <i class="fas fa-calendar-check text-amber-500 text-lg mb-1"></i>
            <div class="font-bold text-gray-900 text-sm">${tour.next_available || (lang === 'zh' ? '随时' : 'Anytime')}</div>
            <div class="text-xs text-gray-500">${lang === 'zh' ? '下期开营' : 'Next Start'}</div>
          </div>
        </div>

        <!-- Description -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 class="text-lg font-bold mb-3">${lang === 'zh' ? '项目介绍' : 'Programme Overview'}</h2>
          <p class="text-gray-600 leading-relaxed">${lang === 'zh' ? tour.description_zh : tour.description_en}</p>
        </div>

        <!-- Highlights -->
        ${highlights.length > 0 ? `
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 class="text-lg font-bold mb-4">${T('study_highlights')}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${highlights.map((h: string) => `
              <div class="flex items-start space-x-3">
                <i class="fas fa-check-circle text-purple-500 mt-0.5 flex-shrink-0"></i>
                <span class="text-gray-700 text-sm">${h}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Itinerary -->
        ${itinerary.length > 0 ? `
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 class="text-lg font-bold mb-4">${T('study_itinerary')}</h2>
          <div class="space-y-3">
            ${itinerary.map((day: any) => `
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">${day.day}</div>
                <div class="flex-1 bg-gray-50 rounded-xl p-3">
                  <span class="text-gray-700 text-sm">${lang === 'zh' ? day.zh : day.en}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Includes/Excludes -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${includes.length > 0 ? `
          <div class="bg-green-50 rounded-2xl p-5 border border-green-100">
            <h3 class="font-bold text-green-800 mb-3"><i class="fas fa-check-circle mr-2"></i>${T('study_includes')}</h3>
            <ul class="space-y-2">
              ${includes.map((inc: string) => `<li class="text-sm text-green-700 flex items-start space-x-2"><i class="fas fa-check mt-0.5 text-green-500"></i><span>${inc}</span></li>`).join('')}
            </ul>
          </div>
          ` : ''}
          ${excludes.length > 0 ? `
          <div class="bg-red-50 rounded-2xl p-5 border border-red-100">
            <h3 class="font-bold text-red-800 mb-3"><i class="fas fa-times-circle mr-2"></i>${T('study_excludes')}</h3>
            <ul class="space-y-2">
              ${excludes.map((exc: string) => `<li class="text-sm text-red-700 flex items-start space-x-2"><i class="fas fa-times mt-0.5 text-red-400"></i><span>${exc}</span></li>`).join('')}
            </ul>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-20">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-4">
            <div class="text-center pb-4 border-b border-gray-100 mb-4">
              <div class="text-sm text-gray-500 mb-1">${T('price_from')}</div>
              <span class="text-3xl font-bold text-purple-700">${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? tour.price_per_person : tour.price_per_person_cny}</span>
              <span class="text-gray-500 ml-1">/${T('per_person')}</span>
            </div>
            <button onclick="document.getElementById('bookingModal').classList.add('active')"
                    class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-colors mb-3">
              <i class="fas fa-graduation-cap mr-2"></i>${T('study_book')}
            </button>
            <button onclick="document.getElementById('inquiryModal').classList.add('active')"
                    class="w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:border-purple-400 hover:text-purple-600 transition-colors">
              <i class="fas fa-comments mr-2"></i>${lang === 'zh' ? '详细咨询' : 'Enquire More'}
            </button>
            <div class="mt-4 text-xs text-gray-500 text-center">
              ${lang === 'zh' ? '✓ 全程中文随行 ✓ 安全保险 ✓ 透明定价' : '✓ Chinese tutor ✓ Insurance ✓ Clear pricing'}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Booking Modal -->
  <div id="bookingModal" class="modal">
    <div class="modal-content p-6 w-full max-w-md">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">${lang === 'zh' ? '游学报名' : 'Study Tour Booking'}</h2>
        <button onclick="document.getElementById('bookingModal').classList.remove('active')" class="text-gray-400"><i class="fas fa-times"></i></button>
      </div>
      <form onsubmit="submitBooking(event)" class="space-y-3">
        <input type="hidden" name="serviceType" value="study_tour">
        <input type="hidden" name="serviceId" value="${tour.id}">
        <input type="hidden" name="serviceTitle" value="${lang === 'zh' ? tour.title_zh.replace(/"/g, '') : tour.title_en.replace(/"/g, '')}">
        <input type="hidden" name="lang" value="${lang}">
        <div class="bg-purple-50 rounded-xl p-3 text-sm text-purple-800">
          <strong>${lang === 'zh' ? tour.title_zh : tour.title_en}</strong><br>
          ${lang === 'zh' ? `${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? tour.price_per_person : tour.price_per_person_cny}/人` : `${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? tour.price_per_person : tour.price_per_person_cny}/person`}
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">${lang === 'zh' ? '期望出发日期 *' : 'Preferred Start Date *'}</label>
          <input type="date" name="serviceDate" required min="${tour.next_available || new Date().toISOString().split('T')[0]}"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">${lang === 'zh' ? '报名人数 *' : 'Number of Participants *'}</label>
          <input type="number" name="guests" required min="${tour.min_people}" max="${tour.max_people}" value="${tour.min_people}"
                 onchange="updateTotal(this.value)"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400">
        </div>
        <input type="text" name="userName" required placeholder="${T('order_name')} *"
               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400">
        <input type="email" name="userEmail" required placeholder="${T('order_email')} *"
               class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400">
        <div class="grid grid-cols-2 gap-3">
          <input type="tel" name="userPhone" placeholder="${T('order_phone')}"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400">
          <input type="text" name="userWechat" placeholder="${T('order_wechat')}"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400">
        </div>
        <textarea name="specialRequests" rows="2" placeholder="${T('order_special')}"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 resize-none"></textarea>
        <div class="bg-gray-50 rounded-xl p-3 text-sm flex justify-between">
          <span>${T('order_total')}</span>
          <strong id="totalDisplay">${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? tour.price_per_person : tour.price_per_person_cny}</strong>
        </div>
        <input type="hidden" id="amountInput" name="amount" value="${tour.price_per_person}">
        <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-colors">
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
        <input type="hidden" name="serviceType" value="study_tour">
        <input type="hidden" name="serviceId" value="${tour.id}">
        <input type="text" name="name" required placeholder="${T('inquiry_name')} *" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400">
        <input type="email" name="email" required placeholder="${T('inquiry_email')} *" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400">
        <input type="tel" name="phone" placeholder="${T('inquiry_phone')}" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400">
        <input type="text" name="wechat" placeholder="${T('inquiry_wechat')}" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400">
        <textarea name="message" required rows="3" placeholder="${T('inquiry_message')}" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 resize-none"></textarea>
        <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-colors">${T('inquiry_submit')}</button>
      </form>
    </div>
  </div>

  <script>
        const currency = '${currency}';
  const lang = '${lang}';
  const pricePerPerson = ${currency === 'GBP' ? tour.price_per_person : tour.price_per_person_cny};
  function updateTotal(n) {
    const total = n * pricePerPerson;
    document.getElementById('totalDisplay').textContent = (currency === 'GBP' ? '£' : '¥') + total;
    document.getElementById('amountInput').value = total;
  }
  async function submitBooking(e) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    body.currency = typeof currency !== 'undefined' ? currency : 'GBP';

    const btn = e.target.querySelector('[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
      const result = await res.json();
      if (result.checkoutUrl) { window.location.href = result.checkoutUrl; }
      else if (result.success) {
        document.getElementById('bookingModal').classList.remove('active');
        alert((lang === 'zh' ? '报名成功！订单号: ' : 'Booking confirmed! Order: ') + result.orderNo);
      } else { alert(result.error || 'Error'); }
    } catch(e) { alert(lang === 'zh' ? '提交失败' : 'Failed'); } finally { btn.disabled = false; }
  }
  async function submitInquiry(e) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    body.currency = typeof currency !== 'undefined' ? currency : 'GBP';

    try {
      await fetch('/api/inquiries', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
      document.getElementById('inquiryModal').classList.remove('active');
      alert(lang === 'zh' ? '咨询已提交！' : 'Enquiry submitted!');
    } catch(e) { alert('Failed'); }
  }
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); }));
  </script>
  `

  return c.html(getLayout(lang, lang === 'zh' ? tour.title_zh : tour.title_en, content, '/study-tours', currency))
})

export default studyToursRoute
