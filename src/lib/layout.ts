import { Lang, t, TranslationKey } from './i18n'

export function getLayout(lang: Lang, title: string, content: string, currentPath: string = '/'): string {
  const T = (key: TranslationKey) => t(lang, key)
  const otherLang = lang === 'zh' ? 'en' : 'zh'
  
  const navLinks = [
    { key: 'nav_home' as TranslationKey, href: '/' },
    { key: 'nav_hotels' as TranslationKey, href: '/hotels' },
    { key: 'nav_rentals' as TranslationKey, href: '/rentals' },
    { key: 'nav_guides' as TranslationKey, href: '/guides' },
    { key: 'nav_study_tours' as TranslationKey, href: '/study-tours' },
  ]
  
  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/'
    return currentPath.startsWith(href)
  }
  
  return `<!DOCTYPE html>
<html lang="${lang}" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${lang === 'zh' ? 'Watu · 英国中文住宿伙伴' : 'Watu · UK Chinese Travel Partner'}</title>
  <meta name="description" content="${lang === 'zh' ? 'Watu - 英国中文住宿伙伴，学旅安心之选。提供酒店预订、租房代办、中文导游、游学接待服务' : 'Watu - Your UK Chinese accommodation partner, the trusted choice for study and travel. Hotels, rentals, Mandarin guides and study tours.'}">  
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .gradient-bg { background: linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 50%, #1a5276 100%); }
    .card-hover { transition: transform 0.2s, box-shadow 0.2s; }
    .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
    .nav-link { position: relative; }
    .nav-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #f59e0b; transition: width 0.3s; }
    .nav-link:hover::after, .nav-link.active::after { width: 100%; }
    .btn-primary { background: linear-gradient(135deg, #f59e0b, #d97706); transition: all 0.2s; }
    .btn-primary:hover { background: linear-gradient(135deg, #d97706, #b45309); transform: translateY(-1px); }
    .star-rating { color: #f59e0b; }
    .tag { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; }
    ::-webkit-scrollbar-thumb { background: #2d6a9f; border-radius: 3px; }
    .hero-overlay { background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%); }
    .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; padding: 1rem; }
    .modal.active { display: flex; }
    .modal-content { background: white; border-radius: 16px; max-width: 640px; width: 100%; max-height: 90vh; overflow-y: auto; }
    .fade-in { animation: fadeIn 0.5s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .sticky-nav { position: sticky; top: 0; z-index: 100; backdrop-filter: blur(10px); background: rgba(255,255,255,0.95); }
    @media (max-width: 768px) {
      .mobile-menu { display: none; }
      .mobile-menu.open { display: block; }
    }
  </style>
</head>
<body class="bg-gray-50 text-gray-800">

<!-- Navigation -->
<nav class="sticky-nav shadow-sm border-b border-gray-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a href="/?lang=${lang}" class="flex items-center flex-shrink-0">
        <img src="/static/watu-logo.png" alt="Watu" class="h-8 w-auto">
        <div class="ml-2 hidden sm:block">
          <div class="text-xs text-gray-400 leading-none whitespace-nowrap">${lang === 'zh' ? '英国中文住宿伙伴 | 学旅安心之选' : 'UK Chinese Travel Partner'}</div>
        </div>
      </a>
      
      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center space-x-6">
        ${navLinks.map(link => `
          <a href="${link.href}?lang=${lang}" 
             class="nav-link text-sm font-medium text-gray-700 hover:text-blue-700 py-1 ${isActive(link.href) ? 'active text-blue-700' : ''}">
            ${T(link.key)}
          </a>
        `).join('')}
      </div>
      
      <!-- Right Actions -->
      <div class="flex items-center space-x-3">
        <!-- Language Switch -->
        <a href="${currentPath}?lang=${otherLang}" 
           class="flex items-center space-x-1 px-3 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
          <i class="fas fa-globe text-xs"></i>
          <span>${T('lang_switch')}</span>
        </a>
        
        <!-- Book CTA -->
        <a href="/hotels?lang=${lang}" 
           class="hidden sm:flex items-center space-x-1 btn-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
          <i class="fas fa-calendar-check text-xs"></i>
          <span>${T('book_now')}</span>
        </a>
        
        <!-- Mobile Menu Button -->
        <button onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>
    
    <!-- Mobile Menu -->
    <div id="mobileMenu" class="mobile-menu md:hidden pb-4">
      <div class="flex flex-col space-y-1 pt-2 border-t border-gray-100">
        ${navLinks.map(link => `
          <a href="${link.href}?lang=${lang}" 
             class="px-3 py-2 rounded-lg text-sm font-medium ${isActive(link.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}">
            ${T(link.key)}
          </a>
        `).join('')}
        <a href="/contact?lang=${lang}" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          ${T('nav_contact')}
        </a>
      </div>
    </div>
  </div>
</nav>

<!-- Main Content -->
<main>
  ${content}
</main>

<!-- Footer -->
<footer class="gradient-bg text-white mt-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <!-- Brand -->
      <div class="md:col-span-1">
        <div class="flex items-center mb-4">
          <img src="/static/watu-logo.png" alt="Watu" class="h-8 w-auto" style="filter: brightness(0) invert(1);">
        </div>
        <p class="text-white/70 text-sm leading-relaxed mb-4">${T('footer_desc')}</p>
        <div class="flex space-x-3">
          <a href="#" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <i class="fab fa-weixin text-sm"></i>
          </a>
          <a href="#" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <i class="fab fa-weibo text-sm"></i>
          </a>
          <a href="#" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <i class="fab fa-instagram text-sm"></i>
          </a>
        </div>
      </div>
      
      <!-- Services -->
      <div>
        <h4 class="font-semibold text-white mb-3">${T('footer_services')}</h4>
        <ul class="space-y-2 text-sm text-white/70">
          <li><a href="/hotels?lang=${lang}" class="hover:text-white transition-colors">${T('nav_hotels')}</a></li>
          <li><a href="/rentals?lang=${lang}" class="hover:text-white transition-colors">${T('nav_rentals')}</a></li>
          <li><a href="/guides?lang=${lang}" class="hover:text-white transition-colors">${T('nav_guides')}</a></li>
          <li><a href="/study-tours?lang=${lang}" class="hover:text-white transition-colors">${T('nav_study_tours')}</a></li>
        </ul>
      </div>
      
      <!-- Company -->
      <div>
        <h4 class="font-semibold text-white mb-3">${T('footer_company')}</h4>
        <ul class="space-y-2 text-sm text-white/70">
          <li><a href="/page/about?lang=${lang}" class="hover:text-white transition-colors">${T('footer_about')}</a></li>
          <li><a href="/blogs?lang=${lang}" class="hover:text-white transition-colors">${T('footer_blog')}</a></li>
          <li><a href="/page/faq?lang=${lang}" class="hover:text-white transition-colors">${T('footer_faq')}</a></li>
          <li><a href="/page/terms?lang=${lang}" class="hover:text-white transition-colors">${T('footer_terms')}</a></li>
          <li><a href="/page/privacy?lang=${lang}" class="hover:text-white transition-colors">${T('footer_privacy')}</a></li>
          <li><a href="/page/contact?lang=${lang}" class="hover:text-white transition-colors">${T('footer_contact')}</a></li>
        </ul>
      </div>
      
      <!-- Contact -->
      <div>
        <h4 class="font-semibold text-white mb-3">${T('footer_contact')}</h4>
        <ul class="space-y-3 text-sm text-white/70">
          <li class="flex items-start space-x-2">
            <i class="fas fa-building w-4 mt-1"></i>
            <span>Watu Technology UK Ltd</span>
          </li>
          <li class="flex items-start space-x-2">
            <i class="fas fa-map-marker-alt w-4 mt-1"></i>
            <span class="leading-relaxed">Room 2c09 South Bank Technopark,<br>90 London Road,<br>London, England, SE1 6LN</span>
          </li>
          <li class="flex items-center space-x-2">
            <i class="fas fa-envelope w-4"></i>
            <a href="mailto:info@watu.uk" class="hover:text-white transition-colors">info@watu.uk</a>
          </li>
          <li class="flex items-center space-x-2">
            <i class="fab fa-weixin w-4"></i>
            <span>WatuUK</span>
          </li>
        </ul>
      </div>
    </div>
    
    <div class="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
      <div>${T('footer_copyright')}</div>
      <div class="flex items-center space-x-3">
        <span class="text-xs opacity-70">${lang === 'zh' ? '支持的安全支付方式：' : 'Secure payments by:'}</span>
        <img src="https://themes.getmotopress.com/booklium-default/wp-content/uploads/sites/29/2019/11/cards.svg" alt="Payment Methods" class="h-6 w-auto opacity-90 hover:opacity-100 transition-opacity">
      </div>
    </div>
  </div>
</footer>

<script>
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
}

// Close mobile menu on outside click
document.addEventListener('click', function(e) {
  const menu = document.getElementById('mobileMenu');
  const btn = e.target.closest('button');
  if (menu.classList.contains('open') && !e.target.closest('nav')) {
    menu.classList.remove('open');
  }
});
</script>
</body>
</html>`
}

export function starRating(rating: number): string {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return `<span class="star-rating">
    ${'<i class="fas fa-star text-xs"></i>'.repeat(full)}
    ${half ? '<i class="fas fa-star-half-alt text-xs"></i>' : ''}
    ${'<i class="far fa-star text-xs"></i>'.repeat(empty)}
  </span>`
}

export function cityBadge(city: string, lang: Lang): string {
  const cityMap: Record<string, {zh: string, en: string}> = {
    london: {zh: '伦敦', en: 'London'},
    oxford: {zh: '牛津', en: 'Oxford'},
    cambridge: {zh: '剑桥', en: 'Cambridge'},
    edinburgh: {zh: '爱丁堡', en: 'Edinburgh'},
    manchester: {zh: '曼彻斯特', en: 'Manchester'},
  }
  const cityName = cityMap[city]?.[lang] || city
  const colors: Record<string, string> = {
    london: 'bg-blue-100 text-blue-700',
    oxford: 'bg-purple-100 text-purple-700',
    cambridge: 'bg-green-100 text-green-700',
    edinburgh: 'bg-red-100 text-red-700',
    manchester: 'bg-orange-100 text-orange-700',
  }
  return `<span class="tag ${colors[city] || 'bg-gray-100 text-gray-700'}">${cityName}</span>`
}

export function priceDisplay(price: number, unit: string, lang: Lang): string {
  return `<span class="font-bold text-blue-700 text-lg">£${price}</span><span class="text-gray-500 text-sm ml-1">${unit}</span>`
}
