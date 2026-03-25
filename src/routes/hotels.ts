import { Hono } from 'hono'
import {  Lang, t , getCurrency } from '../lib/i18n'
import { getLayout, cityBadge, starRating, priceDisplay } from '../lib/layout'

type Bindings = { DB: D1Database }

const hotelsRoute = new Hono<{ Bindings: Bindings }>()

// Hotels list
hotelsRoute.get('/', async (c) => {
  const lang = (c.req.query('lang') || 'en') as Lang
  const currency = getCurrency(c);
  const city = c.req.query('city') || ''
  const T = (key: any) => t(lang, key)

  let hotels: any[] = []
  try {
    const today = new Date().toISOString().split('T')[0];
    const baseQuery = `
            SELECT 
        h.*,
        COALESCE(
          (SELECT MIN(ri.price) FROM room_inventory ri JOIN room_types rt ON ri.room_type_id = rt.id WHERE rt.hotel_id = h.id AND ri.date = ? AND ri.is_closed = 0 AND ri.available_count > 0),
          (SELECT MIN(base_price) FROM room_types WHERE hotel_id = h.id AND is_active = 1),
          h.price_per_night
        ) as dynamic_price,
        COALESCE(
          (SELECT MIN(ri.price_cny) FROM room_inventory ri JOIN room_types rt ON ri.room_type_id = rt.id WHERE rt.hotel_id = h.id AND ri.date = ? AND ri.is_closed = 0 AND ri.available_count > 0),
          (SELECT MIN(base_price_cny) FROM room_types WHERE hotel_id = h.id AND is_active = 1),
          h.price_per_night_cny
        ) as dynamic_price_cny
      FROM hotels h 
      WHERE h.is_available = 1
    `;
    const query = city 
      ? baseQuery + ' AND city = ? ORDER BY h.is_featured DESC, h.sort_order DESC, h.rating DESC'
      : baseQuery + ' ORDER BY h.is_featured DESC, h.sort_order DESC, h.rating DESC'
    
    const result = city 
      ? await c.env.DB.prepare(query).bind(today, today, city).all()
      : await c.env.DB.prepare(query).bind(today, today).all()
    hotels = result.results || []
  } catch (e) {
    console.error('DB error:', e)
  }

  const cities = ['', 'london', 'oxford', 'cambridge', 'edinburgh', 'manchester']
  const cityNames: Record<string, Record<string, string>> = {
    '': {zh: '全部城市', en: 'All Cities'},
    london: {zh: '伦敦', en: 'London'},
    oxford: {zh: '牛津', en: 'Oxford'},
    cambridge: {zh: '剑桥', en: 'Cambridge'},
    edinburgh: {zh: '爱丁堡', en: 'Edinburgh'},
    manchester: {zh: '曼彻斯特', en: 'Manchester'},
  }

  const content = `
  <!-- Header -->
  <section class="gradient-bg py-12 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center space-x-2 text-white/70 text-sm mb-3">
        <a href="/?lang=${lang}" class="hover:text-white">
          <i class="fas fa-home"></i>
        </a>
        <i class="fas fa-chevron-right text-xs"></i>
        <span class="text-white">${T('nav_hotels')}</span>
      </div>
      <h1 class="text-3xl md:text-4xl font-bold mb-2">${T('service_hotel_title')}</h1>
      <p class="text-white/80">${T('service_hotel_desc')}</p>
    </div>
  </section>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
      <div class="flex flex-wrap gap-2">
        ${cities.map(c => `
          <a href="/hotels?city=${c}&lang=${lang}" 
             class="px-4 py-2 rounded-full text-sm font-medium transition-colors ${city === c ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'}">
            ${cityNames[c]?.[lang] || c}
          </a>
        `).join('')}
      </div>
    </div>

    <!-- Results count -->
    <div class="flex items-center justify-between mb-6">
      <p class="text-gray-600">
        ${lang === 'zh' ? `找到 <strong class="text-gray-900">${hotels.length}</strong> 个房源` : `Found <strong class="text-gray-900">${hotels.length}</strong> properties`}
        ${city ? ` ${lang === 'zh' ? '在' : 'in'} <strong>${cityNames[city]?.[lang] || city}</strong>` : ''}
      </p>
    </div>

    <!-- Hotels Grid -->
    ${hotels.length > 0 ? `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${hotels.map((hotel: any) => {
        const images = JSON.parse(hotel.images || '[]')
        const amenities = JSON.parse(lang === 'zh' ? (hotel.amenities_zh || '[]') : (hotel.amenities_en || '[]'))
        return `
        <a href="/hotels/${hotel.id}?lang=${lang}" class="card-hover bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 fade-in block cursor-pointer group flex flex-col h-full">
          <div class="relative h-56 overflow-hidden flex-shrink-0">
            <img src="${images[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'}" 
                 alt="${lang === 'zh' ? hotel.title_zh : hotel.title_en}"
                 class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
            <div class="absolute top-3 left-3">
              ${cityBadge(hotel.city, lang)}
            </div>
            <div class="absolute top-3 right-3 bg-white/95 rounded-full px-3 py-1 text-xs font-bold text-blue-700 shadow">
              ${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? hotel.dynamic_price : hotel.dynamic_price_cny}/${T('per_night')}
            </div>
          </div>
          <div class="p-5 flex flex-col flex-grow">
            <h3 class="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">${lang === 'zh' ? hotel.title_zh : hotel.title_en}</h3>
            <p class="text-gray-500 text-xs mb-2 flex items-center line-clamp-1">
              <i class="fas fa-map-marker-alt mr-1.5 text-blue-400"></i>
              ${hotel.address}
            </p>
            <div class="flex items-center space-x-2 mb-3">
              ${starRating(hotel.rating || 0)}
              <span class="text-sm text-gray-500">${hotel.rating || 0} (${hotel.review_count || 0} ${T('reviews')})</span>
            </div>
            
            <p class="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed font-normal flex-grow">
              ${(lang === 'zh' ? hotel.description_zh : hotel.description_en)?.replace(/<[^>]*>?/gm, '').trim() || ''}
            </p>
            
            <div class="flex flex-wrap gap-1.5 mb-4 h-6 overflow-hidden">
              ${amenities.slice(0, 4).map((a: string) => `<span class="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium whitespace-nowrap">${a}</span>`).join('')}
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
              <div>
                <span class="font-bold text-blue-700 text-xl">${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? hotel.dynamic_price : hotel.dynamic_price_cny}</span>
                <span class="text-gray-500 text-sm ml-1">/${T('per_night')}</span>
              </div>
              <span class="btn-primary text-white px-5 py-2 rounded-full text-sm font-semibold shadow-sm group-hover:shadow-md transition-all">
                ${T('book_now')}
              </span>
            </div>
          </div>
        </a>`
      }).join('')}
    </div>
    ` : `
    <div class="text-center py-16">
      <i class="fas fa-search text-gray-300 text-5xl mb-4"></i>
      <h3 class="text-xl font-semibold text-gray-500 mb-2">${lang === 'zh' ? '暂无房源' : 'No properties found'}</h3>
      <p class="text-gray-400">${lang === 'zh' ? '请尝试其他城市或条件' : 'Try a different city or criteria'}</p>
    </div>
    `}
  </div>
  `

  return c.html(getLayout(lang, T('nav_hotels'), content, '/hotels', currency))
})

// Hotel detail
hotelsRoute.get('/:id', async (c) => {
  const lang = (c.req.query('lang') || 'en') as Lang
  const currency = getCurrency(c);
  const id = c.req.param('id')
  const T = (key: any) => t(lang, key)

  let hotel: any = null
  let reviews: any[] = []
  try {
    const today = new Date().toISOString().split('T')[0];
    hotel = await c.env.DB.prepare(`
      SELECT 
        h.*,
        COALESCE(
          (SELECT MIN(ri.price) FROM room_inventory ri JOIN room_types rt ON ri.room_type_id = rt.id WHERE rt.hotel_id = h.id AND ri.date = ? AND ri.is_closed = 0 AND ri.available_count > 0),
          (SELECT MIN(base_price) FROM room_types WHERE hotel_id = h.id AND is_active = 1),
          h.price_per_night
        ) as dynamic_price,
        COALESCE(
          (SELECT MIN(ri.price_cny) FROM room_inventory ri JOIN room_types rt ON ri.room_type_id = rt.id WHERE rt.hotel_id = h.id AND ri.date = ? AND ri.is_closed = 0 AND ri.available_count > 0),
          (SELECT MIN(base_price_cny) FROM room_types WHERE hotel_id = h.id AND is_active = 1),
          h.price_per_night_cny
        ) as dynamic_price_cny
      FROM hotels h 
      WHERE h.id = ?
    `).bind(today, today, id).first()
    const reviewsResult = await c.env.DB.prepare(
      'SELECT * FROM reviews WHERE service_type = ? AND service_id = ? AND is_approved = 1 ORDER BY created_at DESC'
    ).bind('hotel', id).all()
    reviews = reviewsResult.results || []
  } catch (e) {
    console.error('DB error:', e)
  }

  if (!hotel) {
    return c.html(getLayout(lang, 'Not Found', '<div class="text-center py-20"><h1 class="text-2xl">Not Found</h1></div>', '/hotels', currency))
  }

  const images = JSON.parse(hotel.images || '[]')
  const amenities = JSON.parse(lang === 'zh' ? (hotel.amenities_zh || '[]') : (hotel.amenities_en || '[]'))

  const content = `
  <!-- Breadcrumb -->
  <div class="bg-gray-50 border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3">
      <div class="flex items-center space-x-2 text-sm text-gray-500">
        <a href="/?lang=${lang}" class="hover:text-blue-600"><i class="fas fa-home"></i></a>
        <i class="fas fa-chevron-right text-xs"></i>
        <a href="/hotels?lang=${lang}" class="hover:text-blue-600">${T('nav_hotels')}</a>
        <i class="fas fa-chevron-right text-xs"></i>
        <span class="text-gray-900 font-medium">${lang === 'zh' ? hotel.title_zh : hotel.title_en}</span>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      
      <!-- Left: Details -->
      <div class="lg:col-span-2">
        <!-- Title & Info -->
        <div class="mb-4 mt-2">
          <div class="flex items-start justify-between mb-2">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
              ${lang === 'zh' ? hotel.title_zh : hotel.title_en}
              ${hotel.star_rating ? `<span class="text-amber-500 text-xl ml-2">${'⭐'.repeat(hotel.star_rating)}</span>` : ''}
            </h1>
            ${cityBadge(hotel.city, lang)}
          </div>
          <div class="flex items-center text-gray-600 text-sm mb-4">
            ${hotel.address ? `<span class="flex items-center"><i class="fas fa-map-marker-alt text-blue-400 mr-1"></i>${hotel.address}</span>` : ''}
          </div>
        </div>

        <!-- Image Gallery (h-52 is ~30% smaller than h-72) -->
        <div class="relative mb-6">
          <div class="grid grid-cols-3 gap-2 h-[250px] md:h-[320px]">
            <div class="col-span-2 rounded-2xl overflow-hidden cursor-pointer" onclick="openLightbox(0)">
              <img src="${images[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'}" 
                   class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt="main">
            </div>
            <div class="flex flex-col gap-2">
              ${images.slice(1, 3).map((img: string, i: number) => `
                <div class="flex-1 rounded-xl overflow-hidden cursor-pointer" onclick="openLightbox(${i+1})">
                  <img src="${img}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt="img${i}">
                </div>
              `).join('')}
              ${images.length > 3 ? `
                <div class="flex-1 rounded-xl overflow-hidden relative cursor-pointer" onclick="openLightbox(3)">
                  <img src="${images[3]}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt="more">
                  <div class="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-lg">
                    +${images.length - 3}
                  </div>
                </div>
              ` : images.length === 2 ? `<div class="flex-1 rounded-xl bg-gray-100"></div>` : ''}
            </div>
          </div>
        </div>

        <!-- Room Types -->
        ${hotel.rooms && hotel.rooms.length > 0 ? `
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">${lang === 'zh' ? '可选房型' : 'Available Rooms'}</h2>
          <div class="space-y-4">
            ${hotel.rooms.map((rt: any) => {
              let rtImages = [];
              try { rtImages = JSON.parse(rt.images || '[]'); } catch(e) {}
              return `
              <div class="flex flex-col md:flex-row border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                ${rtImages[0] ? `
                  <div class="md:w-1/3 h-40 md:h-auto cursor-pointer" onclick="openRoomImg('${rtImages[0]}')">
                    <img src="${rtImages[0]}" class="w-full h-full object-cover" alt="room">
                  </div>
                ` : `<div class="md:w-1/3 h-40 md:h-auto bg-gray-50 flex items-center justify-center text-gray-300"><i class="fas fa-bed text-3xl"></i></div>`}
                <div class="p-4 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <h3 class="font-bold text-lg text-gray-800">${lang === 'zh' ? rt.name_zh : rt.name_en}</h3>
                    <div class="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                      ${rt.room_size_sqm ? `<span class="bg-gray-50 px-2 py-1 rounded"><i class="fas fa-vector-square mr-1"></i>${rt.room_size_sqm} ㎡</span>` : ''}
                      ${rt.bed_type ? `<span class="bg-gray-50 px-2 py-1 rounded"><i class="fas fa-bed mr-1"></i>${rt.bed_type}</span>` : ''}
                      <span class="bg-gray-50 px-2 py-1 rounded"><i class="fas fa-user mr-1"></i>${lang === 'zh' ? '最多' : 'Max'} ${rt.max_guests} ${lang === 'zh' ? '人' : 'Guests'}</span>
                    </div>
                  </div>
                  <div class="mt-4 flex items-center justify-between">
                    <div class="text-blue-700 font-bold text-xl">${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? rt.base_price : rt.base_price_cny}<span class="text-sm text-gray-500 font-normal"> /${T('per_night')}${lang==='zh'?'起':' from'}</span></div>
                  </div>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Amenities -->
        ${amenities && amenities.length > 0 ? `
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">${T('hotel_amenities')}</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            ${amenities.map((a: string) => `
              <div class="flex items-center space-x-2 text-gray-700">
                <i class="fas fa-check-circle text-green-500 text-sm flex-shrink-0"></i>
                <span class="text-sm">${a}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Reviews -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">
            ${lang === 'zh' ? '客户评价' : 'Reviews'} 
            <span class="text-gray-400 font-normal">(${reviews.length > 0 ? (hotel.review_count || reviews.length) : 0})</span>
            ${hotel.rating ? `<span class="ml-2 text-amber-500 text-sm">${hotel.rating} / 5.0</span>` : ''}
          </h2>
          ${reviews.length > 0 ? reviews.map((r: any) => `
            <div class="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-gray-800">${r.reviewer_name}</span>
                <div class="flex items-center space-x-1">
                  ${starRating(r.rating)}
                </div>
              </div>
              <p class="text-gray-600 text-sm">${lang === 'zh' ? (r.comment_zh || r.comment_en) : (r.comment_en || r.comment_zh)}</p>
            </div>
          `).join('') : `
            <p class="text-gray-400 text-center py-4">${lang === 'zh' ? '暂无评价' : 'No reviews yet'}</p>
          `}
        </div>

        <!-- Hotel Description & Details (Placed UNDER reviews as requested) -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">${lang === 'zh' ? '酒店介绍' : 'Hotel Details'}</h2>
          
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl mb-4">
            ${hotel.phone ? `<span class="flex items-center"><i class="fas fa-phone-alt text-gray-400 mr-2"></i>${hotel.phone}</span>` : ''}
            ${hotel.email ? `<span class="flex items-center"><i class="fas fa-envelope text-gray-400 mr-2"></i><a href="mailto:${hotel.email}" class="hover:text-blue-600">${hotel.email}</a></span>` : ''}
            ${hotel.opening_year ? `<span class="flex items-center"><i class="fas fa-calendar-alt text-gray-400 mr-2"></i>${lang==='zh'?'开业:':'Opened:'} ${hotel.opening_year}</span>` : ''}
            ${hotel.room_count ? `<span class="flex items-center"><i class="fas fa-door-open text-gray-400 mr-2"></i>${lang==='zh'?'客房数:':'Rooms:'} ${hotel.room_count}</span>` : ''}
          </div>

          ${(lang === 'zh' ? hotel.description_zh : hotel.description_en) ? `
          <div class="prose max-w-none text-gray-600 leading-relaxed text-sm md:text-base">
            ${lang === 'zh' ? hotel.description_zh : hotel.description_en}
          </div>
          ` : ''}
        </div>

        <!-- Policies -->
        ${(lang === 'zh' ? hotel.policies_zh : hotel.policies_en) ? `
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-3">${lang === 'zh' ? '住宿政策' : 'Hotel Policies'}</h2>
          <div class="prose max-w-none text-gray-600 leading-relaxed text-sm">
            ${lang === 'zh' ? hotel.policies_zh : hotel.policies_en}
          </div>
        </div>
        ` : ''}

      </div>

      <!-- Lightbox functionality -->
      <script>
        const currency = '${currency}';
        const galleryImages = ${JSON.stringify(images)};
        let currentImgIndex = 0;
        
        function openLightbox(index) {
          if(!galleryImages || galleryImages.length === 0) return;
          currentImgIndex = index;
          document.getElementById('lightboxImg').src = galleryImages[currentImgIndex];
          document.getElementById('lightbox').classList.remove('hidden');
          document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
        
        function closeLightbox() {
          document.getElementById('lightbox').classList.add('hidden');
          document.body.style.overflow = 'auto';
        }
        
        function nextImg(e) {
          if(e) e.stopPropagation();
          currentImgIndex = (currentImgIndex + 1) % galleryImages.length;
          document.getElementById('lightboxImg').src = galleryImages[currentImgIndex];
        }
        
        function prevImg(e) {
          if(e) e.stopPropagation();
          currentImgIndex = (currentImgIndex - 1 + galleryImages.length) % galleryImages.length;
          document.getElementById('lightboxImg').src = galleryImages[currentImgIndex];
        }

        function openRoomImg(src) {
          document.getElementById('lightboxImg').src = src;
          document.getElementById('lightbox').classList.remove('hidden');
          document.body.style.overflow = 'hidden';
        }
      </script>

      <!-- Lightbox DOM -->
      <div id="lightbox" class="fixed inset-0 bg-black/95 z-[100] hidden flex flex-col items-center justify-center" onclick="closeLightbox()">
        <button class="absolute top-6 right-6 text-white/70 hover:text-white text-4xl p-2 z-[110]">&times;</button>
        <button onclick="prevImg(event)" class="absolute left-4 md:left-10 text-white/70 hover:text-white text-5xl p-4 z-[110]">&lsaquo;</button>
        <button onclick="nextImg(event)" class="absolute right-4 md:right-10 text-white/70 hover:text-white text-5xl p-4 z-[110]">&rsaquo;</button>
        <img id="lightboxImg" onclick="event.stopPropagation()" class="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-opacity duration-300" src="" />
        <div class="absolute bottom-6 text-white/70 text-sm" onclick="event.stopPropagation()">
          ${lang === 'zh' ? '点击左右箭头切换，点击背景关闭' : 'Use arrows to navigate, click background to close'}
        </div>
      </div>

      <!-- Right: Booking Card -->
      <div class="lg:col-span-1">
        <div class="sticky top-20">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div class="text-center mb-4 pb-4 border-b border-gray-100">
              <span class="text-3xl font-bold text-blue-700">${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? hotel.dynamic_price : hotel.dynamic_price_cny}</span>
              <span class="text-gray-500 ml-1">/${T('per_night')}</span>
            </div>
            
            <form id="bookingForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${T('hotel_checkin')}</label>
                <input type="date" id="checkIn" name="checkIn" required
                       min="${new Date().toISOString().split('T')[0]}"
                       class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${T('hotel_checkout')}</label>
                <input type="date" id="checkOut" name="checkOut" required
                       min="${new Date().toISOString().split('T')[0]}"
                       class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${T('hotel_guests')}</label>
                <select id="guests" name="guests" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400">
                  ${Array.from({length: hotel.max_guests}, (_, i) => i + 1).map(n => `<option value="${n}">${n} ${lang === 'zh' ? '位' : 'guest(s)'}</option>`).join('')}
                </select>
              </div>
              
              <!-- Price calc -->
              <div id="priceCalc" class="hidden bg-blue-50 rounded-xl p-3 text-sm">
                <div class="flex justify-between text-gray-600 mb-1">
                  <span id="nightsText"></span>
                  <span id="nightsTotal"></span>
                </div>
                <div class="flex justify-between font-bold text-gray-900 border-t border-blue-200 pt-2 mt-2">
                  <span>${T('order_total')}</span>
                  <span id="grandTotal"></span>
                </div>
              </div>
              
              <button type="button" onclick="openBookingModal()" 
                      class="w-full btn-primary text-white py-3 rounded-xl font-bold shadow-md text-base">
                ${T('book_now')}
              </button>
            </form>
            
            <div class="mt-4 pt-4 border-t border-gray-100">
              <button onclick="openInquiryModal()" class="w-full flex items-center justify-center space-x-2 text-gray-600 border border-gray-200 py-2.5 rounded-xl text-sm hover:border-blue-400 hover:text-blue-600 transition-colors">
                <i class="fab fa-weixin text-green-500"></i>
                <span>${lang === 'zh' ? '微信咨询' : 'WeChat Enquiry'}</span>
              </button>
            </div>
          </div>
          
          <!-- Safety Info -->
          <div class="mt-4 bg-green-50 rounded-xl p-4 text-sm text-green-700">
            <i class="fas fa-shield-alt mr-2"></i>
            ${lang === 'zh' ? '已严格审核 · 安全保障 · 支持退款' : 'Verified · Secure · Refundable'}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Booking Modal -->
  <div id="bookingModal" class="modal">
    <div class="modal-content p-6 w-full max-w-lg">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">${lang === 'zh' ? '填写预订信息' : 'Booking Details'}</h2>
        <button onclick="closeModal('bookingModal')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="finalBookingForm" onsubmit="submitBooking(event)">
        <input type="hidden" name="serviceType" value="hotel">
        <input type="hidden" name="serviceId" value="${hotel.id}">
        <input type="hidden" name="serviceTitle" value="${lang === 'zh' ? hotel.title_zh : hotel.title_en}">
        <input type="hidden" name="lang" value="${lang}">
        <input type="hidden" name="pricePerNight" value="${hotel.dynamic_price}">
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">${T('hotel_checkin')} *</label>
              <input type="date" name="checkIn" id="modalCheckIn" required
                     class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">${T('hotel_checkout')} *</label>
              <input type="date" name="checkOut" id="modalCheckOut" required
                     class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${T('order_name')} *</label>
            <input type="text" name="userName" required placeholder="${lang === 'zh' ? '请输入您的姓名' : 'Enter your full name'}"
                   class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${T('order_email')} *</label>
            <input type="email" name="userEmail" required placeholder="your@email.com"
                   class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">${T('order_phone')}</label>
              <input type="tel" name="userPhone" placeholder="+44 xxx"
                     class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">${T('order_wechat')}</label>
              <input type="text" name="userWechat" placeholder="WeChat ID"
                     class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${T('order_special')}</label>
            <textarea name="specialRequests" rows="2" placeholder="${lang === 'zh' ? '如有特殊需求请填写...' : 'Any special requirements...'}"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none"></textarea>
          </div>
          
          <div class="bg-blue-50 rounded-xl p-4 text-sm">
            <div class="flex justify-between text-gray-600 mb-1">
              <span id="modalNightsText">${lang === 'zh' ? '请选择日期' : 'Please select dates'}</span>
              <span id="modalNightsTotal"></span>
            </div>
            <div class="flex justify-between font-bold text-gray-900">
              <span>${T('order_total')}</span>
              <span id="modalGrandTotal">-</span>
            </div>
          </div>
        </div>
        
        <div class="mt-6 flex gap-3">
          <button type="button" onclick="closeModal('bookingModal')"
                  class="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50">
            ${T('cancel')}
          </button>
          <button type="submit" 
                  class="flex-1 btn-primary text-white py-3 rounded-xl text-sm font-bold shadow-md">
            <i class="fas fa-credit-card mr-2"></i>
            ${T('order_pay')}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Inquiry Modal -->
  <div id="inquiryModal" class="modal">
    <div class="modal-content p-6 w-full max-w-md">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">${T('inquiry_title')}</h2>
        <button onclick="closeModal('inquiryModal')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      <p class="text-gray-500 text-sm mb-4">${T('inquiry_subtitle')}</p>
      <form id="inquiryForm" onsubmit="submitInquiry(event)">
        <input type="hidden" name="serviceType" value="hotel">
        <input type="hidden" name="serviceId" value="${hotel.id}">
        <div class="space-y-3">
          <input type="text" name="name" required placeholder="${T('inquiry_name')}"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400">
          <input type="email" name="email" required placeholder="${T('inquiry_email')}"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400">
          <input type="tel" name="phone" placeholder="${T('inquiry_phone')}"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400">
          <input type="text" name="wechat" placeholder="${T('inquiry_wechat')}"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400">
          <textarea name="message" required rows="3" placeholder="${T('inquiry_message')}"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none"></textarea>
        </div>
        <button type="submit" class="w-full btn-primary text-white py-3 rounded-xl font-bold mt-4">
          ${T('inquiry_submit')}
        </button>
      </form>
    </div>
  </div>

  <script>
        const currency = '${currency}';
  const pricePerNight = ${currency === 'GBP' ? hotel.dynamic_price : hotel.dynamic_price_cny};
  const lang = '${lang}';
  
  function changeMainImg(src) {
    document.getElementById('mainImg').src = src;
  }
  
  function openBookingModal() {
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    if (checkIn) document.getElementById('modalCheckIn').value = checkIn;
    if (checkOut) document.getElementById('modalCheckOut').value = checkOut;
    document.getElementById('bookingModal').classList.add('active');
    updateModalPrice();
  }
  
  function openInquiryModal() {
    document.getElementById('inquiryModal').classList.add('active');
  }
  
  function closeModal(id) {
    document.getElementById(id).classList.remove('active');
  }
  
  // Click outside to close
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', function(e) {
      if (e.target === m) m.classList.remove('active');
    });
  });
  
  // Date change handlers
  ['checkIn', 'checkOut'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', updatePriceCalc);
  });
  
  ['modalCheckIn', 'modalCheckOut'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', updateModalPrice);
  });
  
  function calcNights(inDate, outDate) {
    const d1 = new Date(inDate), d2 = new Date(outDate);
    return Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
  }
  
  function updatePriceCalc() {
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const calc = document.getElementById('priceCalc');
    if (checkIn && checkOut) {
      const nights = calcNights(checkIn, checkOut);
      if (nights > 0) {
        const total = nights * pricePerNight;
        document.getElementById('nightsText').textContent = lang === 'zh' ? nights + ' 晚 × ' + (currency === 'GBP' ? '£' : '¥') + pricePerNight : nights + ' nights × ' + (currency === 'GBP' ? '£' : '¥') + pricePerNight;
        document.getElementById('nightsTotal').textContent = (currency === 'GBP' ? '£' : '¥') + total;
        document.getElementById('grandTotal').textContent = (currency === 'GBP' ? '£' : '¥') + total;
        calc.classList.remove('hidden');
      }
    }
  }
  
  function updateModalPrice() {
    const checkIn = document.getElementById('modalCheckIn').value;
    const checkOut = document.getElementById('modalCheckOut').value;
    if (checkIn && checkOut) {
      const nights = calcNights(checkIn, checkOut);
      if (nights > 0) {
        const total = nights * pricePerNight;
        document.getElementById('modalNightsText').textContent = lang === 'zh' ? nights + ' 晚 × £' + pricePerNight : nights + ' nights × £' + pricePerNight;
        document.getElementById('modalNightsTotal').textContent = (currency === 'GBP' ? '£' : '¥') + total;
        document.getElementById('modalGrandTotal').textContent = (currency === 'GBP' ? '£' : '¥') + total;
      }
    }
  }
  
  async function submitBooking(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const body = Object.fromEntries(data.entries());
    
    // Calculate total
    const nights = calcNights(body.checkIn, body.checkOut);
    body.amount = (nights * pricePerNight).toString();
    body.currency = typeof currency !== 'undefined' ? currency : 'GBP';
    body.guests = document.getElementById('guests')?.value || '1';
    
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = lang === 'zh' ? '处理中...' : 'Processing...';
    btn.disabled = true;
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      });
      const result = await res.json();
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else if (result.success) {
        closeModal('bookingModal');
        showSuccess(result.orderNo);
      } else {
        alert(result.error || 'Error occurred');
      }
    } catch (err) {
      alert(lang === 'zh' ? '提交失败，请重试' : 'Submission failed, please try again');
    } finally {
      btn.disabled = false;
    }
  }
  
  async function submitInquiry(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const body = Object.fromEntries(data.entries());
    
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      });
      closeModal('inquiryModal');
      alert(lang === 'zh' ? '咨询已提交！我们会在24小时内回复您。' : 'Enquiry submitted! We will reply within 24 hours.');
    } catch (err) {
      alert(lang === 'zh' ? '提交失败，请重试' : 'Failed, please try again');
    }
  }
  
  function showSuccess(orderNo) {
    document.querySelector('main').innerHTML = \`
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-lg">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-check text-green-500 text-2xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">\${lang === 'zh' ? '预订成功！' : 'Booking Confirmed!'}</h2>
          <p class="text-gray-500 mb-4">\${lang === 'zh' ? '订单号: ' : 'Order No: '}\${orderNo}</p>
          <p class="text-gray-600 text-sm mb-6">\${lang === 'zh' ? '我们会在24小时内通过邮件或微信与您确认详情。' : 'We will confirm details via email or WeChat within 24 hours.'}</p>
          <a href="/?lang=\${lang}" class="btn-primary text-white px-6 py-3 rounded-xl font-semibold inline-block">\${lang === 'zh' ? '返回首页' : 'Back to Home'}</a>
        </div>
      </div>
    \`;
  }
  </script>
  `

  return c.html(getLayout(lang, lang === 'zh' ? hotel.title_zh : hotel.title_en, content, '/hotels', currency))
})

export default hotelsRoute
