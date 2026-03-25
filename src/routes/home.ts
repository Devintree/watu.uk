import { Hono } from 'hono'
import {  Lang, t , getCurrency } from '../lib/i18n'
import { getLayout, cityBadge, starRating } from '../lib/layout'

type Bindings = {
  DB: D1Database
}

const homeRoute = new Hono<{ Bindings: Bindings }>()

homeRoute.get('/', async (c) => {
  const lang = (c.req.query('lang') || 'en') as Lang
  const currency = getCurrency(c);
  const T = (key: any) => t(lang, key)

  // Fetch featured hotels
  let featuredHotels: any[] = []
  let featuredGuides: any[] = []
  let featuredStudyTours: any[] = []
  let featuredInfoBlogs: any[] = []
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const hotelsResult = await c.env.DB.prepare(`
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
      WHERE h.is_available = 1 AND h.is_featured = 1
      ORDER BY h.sort_order DESC, h.rating DESC
      LIMIT 4`).bind(today, today).all()
    hotels = hotelResult.results || []

    // Fetch guides
    const guideResult = await c.env.DB.prepare(
      "SELECT * FROM guides WHERE is_featured = 1 ORDER BY sort_order DESC LIMIT 4"
    ).all()
    guides = guideResult.results || []

    // Fetch study tours
    const tourResult = await c.env.DB.prepare(
      "SELECT * FROM study_tours WHERE is_featured = 1 ORDER BY sort_order DESC LIMIT 4"
    ).all()
    studyTours = tourResult.results || []

    // Fetch info sharing
    const infoResult = await c.env.DB.prepare(
      "SELECT * FROM blogs WHERE is_published = 1 AND category = 'info' ORDER BY sort_order DESC, created_at DESC LIMIT 4"
    ).all()
    
    featuredInfoBlogs = infoResult.results || []

  } catch (e) {
    console.error('DB error:', e)
  }

  const content = `
  <!-- Hero Section -->
  <section class="relative flex items-center" style="min-height:540px; background: linear-gradient(135deg, rgba(30,58,95,0.92) 0%, rgba(45,106,159,0.85) 100%), url('https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600') center/cover no-repeat;">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 w-full py-10">
      <div class="max-w-3xl fade-in">
        <!-- Badge -->
        <div class="inline-flex items-center space-x-2 bg-amber-400/20 border border-amber-400/30 rounded-full px-4 py-1.5 mb-6">
          <i class="fas fa-crown text-amber-400 text-xs"></i>
          <span class="text-amber-300 text-sm font-medium">${lang === 'zh' ? '专为华人打造 · 品质保证' : 'Built for Chinese Community · Quality Assured'}</span>
        </div>
        
        <h1 class="text-3xl md:text-5xl font-bold text-white leading-tight mb-4 md:whitespace-nowrap">
          ${lang === 'zh' ? '<span class="text-amber-400">Watu</span> &mdash; 您在英国的华人住宿与旅行专家' : '<span class="text-amber-400">Watu</span> &mdash; Your UK Chinese Travel Partner'}
        </h1>
        <p class="text-xl text-white/80 mb-8 max-w-2xl md:whitespace-nowrap">
          ${T('hero_subtitle')}
        </p>
        
        <!-- Search Bar -->
        <div class="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mb-8">
          <div class="flex flex-col sm:flex-row gap-2">
            <select class="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400">
              <option value="">${lang === 'zh' ? '选择服务类型' : 'Select Service Type'}</option>
              <option value="hotels">${T('nav_hotels')}</option>
              <option value="rentals">${T('nav_rentals')}</option>
              <option value="guides">${T('nav_guides')}</option>
              <option value="study-tours">${T('nav_study_tours')}</option>
            </select>
            <select class="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400">
              <option value="">${lang === 'zh' ? '选择城市' : 'Select City'}</option>
              <option value="london">${T('city_london')}</option>
              <option value="oxford">${T('city_oxford')}</option>
              <option value="cambridge">${T('city_cambridge')}</option>
              <option value="edinburgh">${T('city_edinburgh')}</option>
              <option value="manchester">${T('city_manchester')}</option>
            </select>
            <button onclick="handleSearch()" class="btn-primary text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg">
              <i class="fas fa-search"></i>
              <span>${T('search')}</span>
            </button>
          </div>
        </div>
        
        <!-- Stats -->
        <div class="flex flex-wrap gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-amber-400">500+</div>
            <div class="text-white/70 text-xs">${lang === 'zh' ? '精选房源' : 'Properties'}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-amber-400">50+</div>
            <div class="text-white/70 text-xs">${lang === 'zh' ? '专业导游' : 'Expert Guides'}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-amber-400">2000+</div>
            <div class="text-white/70 text-xs">${lang === 'zh' ? '服务客户' : 'Happy Clients'}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-amber-400">4.9★</div>
            <div class="text-white/70 text-xs">${lang === 'zh' ? '平均评分' : 'Avg Rating'}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Scroll indicator -->
    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
      <i class="fas fa-chevron-down text-white/60 text-lg"></i>
    </div>
  </section>

  <!-- Services Grid -->
  <section class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <div class="inline-block bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-sm font-medium mb-3">${T('services_title')}</div>
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">${T('services_subtitle')}</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Hotel Card -->
        <a href="/hotels?lang=${lang}" class="group card-hover bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:border-blue-300">
          <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i class="fas fa-hotel text-white text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">${T('service_hotel_title')}</h3>
          <p class="text-gray-600 text-sm leading-relaxed mb-4">${T('service_hotel_desc')}</p>
          <div class="flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
            <span>${T('view_details')}</span>
            <i class="fas fa-arrow-right ml-2"></i>
          </div>
        </a>
        
        <!-- Rental Card -->
        <a href="/rentals?lang=${lang}" class="group card-hover bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 hover:border-green-300">
          <div class="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i class="fas fa-home text-white text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">${T('service_rental_title')}</h3>
          <p class="text-gray-600 text-sm leading-relaxed mb-4">${T('service_rental_desc')}</p>
          <div class="flex items-center text-green-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
            <span>${T('view_details')}</span>
            <i class="fas fa-arrow-right ml-2"></i>
          </div>
        </a>
        
        <!-- Guide Card -->
        <a href="/guides?lang=${lang}" class="group card-hover bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200 hover:border-amber-300">
          <div class="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i class="fas fa-map-marked-alt text-white text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">${T('service_guide_title')}</h3>
          <p class="text-gray-600 text-sm leading-relaxed mb-4">${T('service_guide_desc')}</p>
          <div class="flex items-center text-amber-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
            <span>${T('view_details')}</span>
            <i class="fas fa-arrow-right ml-2"></i>
          </div>
        </a>
        
        <!-- Study Tour Card -->
        <a href="/study-tours?lang=${lang}" class="group card-hover bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 hover:border-purple-300">
          <div class="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i class="fas fa-graduation-cap text-white text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">${T('service_study_title')}</h3>
          <p class="text-gray-600 text-sm leading-relaxed mb-4">${T('service_study_desc')}</p>
          <div class="flex items-center text-purple-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
            <span>${T('view_details')}</span>
            <i class="fas fa-arrow-right ml-2"></i>
          </div>
        </a>
      </div>
    </div>
  </section>

  <!-- Featured Hotels -->
  ${featuredHotels.length > 0 ? `
  <section class="py-16 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">${lang === 'zh' ? '精选住宿' : 'Featured Accommodation'}</h2>
          <p class="text-gray-600 mt-1">${lang === 'zh' ? '严选优质房源，放心入住' : 'Handpicked quality properties'}</p>
        </div>
        <a href="/hotels?lang=${lang}" class="text-blue-600 font-semibold text-sm hover:text-blue-700 flex items-center space-x-1">
          <span>${T('view_all')}</span>
          <i class="fas fa-arrow-right text-xs"></i>
        </a>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${featuredHotels.map((hotel: any) => {
          const images = JSON.parse(hotel.images || '[]')
          const amenities = JSON.parse(lang === 'zh' ? (hotel.amenities_zh || '[]') : (hotel.amenities_en || '[]'))
          return `
          <a href="/hotels/${hotel.id}?lang=${lang}" class="card-hover bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div class="relative h-52 overflow-hidden">
              <img src="${images[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'}" 
                   alt="${lang === 'zh' ? hotel.title_zh : hotel.title_en}"
                   class="w-full h-full object-cover transition-transform hover:scale-105">
              <div class="absolute top-3 left-3">
                ${cityBadge(hotel.city, lang)}
              </div>
              <div class="absolute top-3 right-3 bg-white/90 rounded-full px-2 py-1 text-xs font-semibold text-blue-700">
                ${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? hotel.dynamic_price : hotel.dynamic_price_cny}/${T('per_night')}
              </div>
            </div>
            <div class="p-5">
              <h3 class="font-bold text-gray-900 mb-1 text-base">${lang === 'zh' ? hotel.title_zh : hotel.title_en}</h3>
              <div class="flex items-center space-x-2 mb-2">
                ${starRating(hotel.rating)}
                <span class="text-sm text-gray-500">${hotel.rating} (${hotel.review_count} ${T('reviews')})</span>
              </div>
              <div class="flex flex-wrap gap-1 mb-3">
                ${amenities.slice(0, 3).map((a: string) => `<span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">${a}</span>`).join('')}
              </div>
              <div class="flex items-center justify-between">
                <span class="font-bold text-blue-700">${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? hotel.dynamic_price : hotel.dynamic_price_cny}<span class="text-sm text-gray-500 font-normal">/${T('per_night')}</span></span>
                <span class="btn-primary text-white text-xs px-3 py-1.5 rounded-full font-semibold">${T('book_now')}</span>
              </div>
            </div>
          </a>`
        }).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Cities Section -->
  <section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-10">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">${T('cities_title')}</h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        ${[
          {city: 'london', icon: 'fas fa-landmark', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400'},
          {city: 'oxford', icon: 'fas fa-university', img: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=400'},
          {city: 'cambridge', icon: 'fas fa-book-open', img: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=400'},
          {city: 'edinburgh', icon: 'fas fa-chess-rook', img: 'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=400'},
          {city: 'manchester', icon: 'fas fa-city', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400'},
        ].map(({city, icon, img}) => `
          <a href="/hotels?city=${city}&lang=${lang}" class="relative group rounded-2xl overflow-hidden h-32 cursor-pointer card-hover">
            <img src="${img}" alt="${(T as any)('city_' + city)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-colors"></div>
            <div class="absolute bottom-0 left-0 right-0 p-3 text-center">
              <i class="${icon} text-white/80 text-sm mb-1"></i>
              <div class="text-white font-bold text-sm">${(T as any)('city_' + city)}</div>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="py-16 gradient-bg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-white mb-3">${T('features_title')}</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${[
          {icon: 'fas fa-comments', key_title: 'feature_chinese', key_desc: 'feature_chinese_desc', color: 'bg-blue-500'},
          {icon: 'fas fa-shield-alt', key_title: 'feature_trusted', key_desc: 'feature_trusted_desc', color: 'bg-green-500'},
          {icon: 'fas fa-lock', key_title: 'feature_safe', key_desc: 'feature_safe_desc', color: 'bg-amber-500'},
          {icon: 'fas fa-map-pin', key_title: 'feature_local', key_desc: 'feature_local_desc', color: 'bg-purple-500'},
        ].map(({icon, key_title, key_desc, color}) => `
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div class="w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4">
              <i class="${icon} text-white text-xl"></i>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">${(T as any)(key_title)}</h3>
            <p class="text-white/70 text-sm leading-relaxed">${(T as any)(key_desc)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Featured Guides -->
  ${featuredGuides.length > 0 ? `
  <section class="py-16 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">${lang === 'zh' ? '专业中文导游' : 'Professional Chinese Guides'}</h2>
          <p class="text-gray-600 mt-1">${lang === 'zh' ? '深耕英国多年，为您讲述英伦故事' : 'Years of UK experience, telling British stories for you'}</p>
        </div>
        <a href="/guides?lang=${lang}" class="text-blue-600 font-semibold text-sm hover:text-blue-700 flex items-center space-x-1">
          <span>${T('view_all')}</span>
          <i class="fas fa-arrow-right text-xs"></i>
        </a>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${featuredGuides.map((guide: any) => {
          const cities = JSON.parse(guide.cities || '[]')
          const specialties = JSON.parse(lang === 'zh' ? (guide.specialties_zh || '[]') : (guide.specialties_en || '[]'))
          return `
          <a href="/guides/${guide.id}?lang=${lang}" class="card-hover bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-start space-x-4 mb-4">
              <img src="${guide.avatar}" alt="${lang === 'zh' ? guide.name_zh : guide.name_en}"
                   class="w-16 h-16 rounded-full object-cover border-2 border-blue-100">
              <div class="flex-1">
                <h3 class="font-bold text-gray-900 text-base">${lang === 'zh' ? guide.name_zh : guide.name_en}</h3>
                <div class="flex items-center space-x-1 mt-0.5">
                  ${starRating(guide.rating)}
                  <span class="text-xs text-gray-500">${guide.rating}</span>
                </div>
                <div class="flex flex-wrap gap-1 mt-1.5">
                  ${cities.slice(0, 2).map((city: string) => cityBadge(city, lang)).join('')}
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-1 mb-4">
              ${specialties.slice(0, 3).map((s: string) => `<span class="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">${s}</span>`).join('')}
            </div>
            <div class="flex items-center justify-between">
              <span class="font-bold text-blue-700">${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? guide.price_per_day : guide.price_per_day_cny}<span class="text-sm text-gray-500 font-normal">/${T('per_day')}</span></span>
              <span class="btn-primary text-white text-xs px-3 py-1.5 rounded-full font-semibold">${T('guide_book')}</span>
            </div>
          </a>`
        }).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Study Tours -->
  ${featuredStudyTours.length > 0 ? `
  <section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">${lang === 'zh' ? '精品游学项目' : 'Premium Study Tours'}</h2>
          <p class="text-gray-600 mt-1">${lang === 'zh' ? '开启英伦学术之旅，拓展国际视野' : 'Begin your academic journey in the UK'}</p>
        </div>
        <a href="/study-tours?lang=${lang}" class="text-blue-600 font-semibold text-sm hover:text-blue-700 flex items-center space-x-1">
          <span>${T('view_all')}</span>
          <i class="fas fa-arrow-right text-xs"></i>
        </a>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${featuredStudyTours.map((tour: any) => {
          const images = JSON.parse(tour.images || '[]')
          const highlights = JSON.parse(lang === 'zh' ? (tour.highlights_zh || '[]') : (tour.highlights_en || '[]'))
          return `
          <a href="/study-tours/${tour.id}?lang=${lang}" class="card-hover bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div class="relative h-48 overflow-hidden">
              <img src="${images[0] || 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=600'}" 
                   alt="${lang === 'zh' ? tour.title_zh : tour.title_en}"
                   class="w-full h-full object-cover transition-transform hover:scale-105">
              <div class="absolute top-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                ${tour.duration_days}${lang === 'zh' ? '天' : ' Days'}
              </div>
            </div>
            <div class="p-5">
              <h3 class="font-bold text-gray-900 mb-1 text-base">${lang === 'zh' ? tour.title_zh : tour.title_en}</h3>
              <div class="flex flex-wrap gap-1 mb-3">
                ${highlights.slice(0, 2).map((h: string) => `<span class="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">${h}</span>`).join('')}
              </div>
              <div class="flex items-center text-xs text-gray-500 space-x-3 mb-3">
                <span><i class="fas fa-user-friends mr-1"></i>${tour.min_age}-${tour.max_age}${lang === 'zh' ? '岁' : ' yrs'}</span>
                <span><i class="fas fa-users mr-1"></i>${lang === 'zh' ? '最多' : 'Max'} ${tour.max_people}${lang === 'zh' ? '人' : ' ppl'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-bold text-blue-700">${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? tour.price_per_person : tour.price_per_person_cny}<span class="text-sm text-gray-500 font-normal">/${T('per_person')}</span></span>
                <span class="btn-primary text-white text-xs px-3 py-1.5 rounded-full font-semibold">${T('study_book')}</span>
              </div>
            </div>
          </a>`
        }).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  
  <!-- Info Sharing Section -->
  ${featuredInfoBlogs.length > 0 ? `
  <section class="py-16 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex justify-between items-end mb-10">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">${lang === 'zh' ? '最新信息分享' : 'Latest Info Sharing'}</h2>
          <p class="text-gray-600">${lang === 'zh' ? '为您提供英国本地实用资讯与指南' : 'Practical local information and guides for the UK'}</p>
        </div>
        <a href="/info?lang=${lang}" class="hidden sm:inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
          ${lang === 'zh' ? '查看更多' : 'View All'} <i class="fas fa-arrow-right ml-2"></i>
        </a>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${featuredInfoBlogs.map(blog => {
          let imageUrl = 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800';
          try {
            if (blog.cover_image) {
              const images = JSON.parse(blog.cover_image);
              if (images && images.length > 0) imageUrl = images[0];
            }
          } catch(e) {}
          
          const blogTitle = lang === 'zh' ? blog.title_zh : (blog.title_en || blog.title_zh);
          
          return `
          <a href="/blogs/${blog.id}?lang=${lang}" class="card-hover relative rounded-2xl overflow-hidden shadow-sm block group aspect-[3/4]">
            <img src="${imageUrl}" alt="${blogTitle}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80"></div>
            
            <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors z-10">
              <i class="far fa-heart text-sm"></i>
            </div>
            
            <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 class="font-bold text-base md:text-lg leading-tight line-clamp-2 mb-2 group-hover:text-amber-300 transition-colors">${blogTitle}</h3>
              <div class="flex items-center text-xs text-white/80">
                <div class="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold mr-2 border border-white/30">
                  ${blog.author ? blog.author.charAt(0).toUpperCase() : 'W'}
                </div>
                <span>${blog.author || 'Watu'}</span>
              </div>
            </div>
          </a>`
        }).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- CTA Section -->
  <section class="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
      <h2 class="text-3xl font-bold text-white mb-4">
        ${lang === 'zh' ? '准备好开启您的英国之旅了吗？' : 'Ready to Start Your UK Journey?'}
      </h2>
      <p class="text-white/80 text-lg mb-8">
        ${lang === 'zh' ? '专业中文客服7×24小时在线，微信、电话、邮件即时响应' : 'Professional Chinese-speaking support available 24/7 via WeChat, phone and email'}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/contact?lang=${lang}" class="inline-flex items-center justify-center space-x-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-8 py-4 rounded-full transition-colors shadow-lg">
          <i class="fab fa-weixin"></i>
          <span>${lang === 'zh' ? '微信咨询' : 'WeChat Enquiry'}</span>
        </a>
        <a href="/hotels?lang=${lang}" class="inline-flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 font-semibold px-8 py-4 rounded-full transition-colors">
          <i class="fas fa-search"></i>
          <span>${lang === 'zh' ? '浏览所有服务' : 'Browse All Services'}</span>
        </a>
      </div>
    </div>
  </section>

  <script>
  function handleSearch() {
    const serviceType = document.querySelector('select:first-of-type').value;
    const city = document.querySelector('select:last-of-type').value;
    const lang = '${lang}';
    
    let url = '/';
    if (serviceType) {
      url = '/' + serviceType;
    }
    url += '?lang=' + lang;
    if (city) url += '&city=' + city;
    window.location.href = url;
  }
  </script>
  `

  const title = lang === 'zh' ? '首页' : 'Home'
  return c.html(getLayout(lang, title, content, '/', currency))
})

export default homeRoute
