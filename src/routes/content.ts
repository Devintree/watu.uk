import { Hono } from 'hono'
import { getLang, t } from '../lib/i18n'
import { getLayout } from '../lib/layout'

type Bindings = { DB: D1Database }
const contentRoute = new Hono<{ Bindings: Bindings }>()

// Generic static pages

// Info Sharing route
contentRoute.get('/info', async (c) => {
  const lang = getLang(c)
  const T = (key: any) => t(lang, key)
  
  try {
    const result = await c.env.DB.prepare("SELECT * FROM blogs WHERE is_published = 1 AND category = 'info' ORDER BY sort_order DESC, created_at DESC").all()
    const blogs = result.results || []

    const content = `
    <div class="bg-gray-50 py-12 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-12">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">${T('nav_info')}</h1>
          <p class="text-gray-600">${lang === 'zh' ? '探索最新的英国旅游、留学及生活资讯' : 'Discover the latest news on UK travel, study, and life'}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${blogs.map((b: any) => {
            const images = JSON.parse(b.cover_image || '[]')
            const cover = images[0] || 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600'
            const title = lang === 'zh' ? b.title_zh : b.title_en
            const summary = lang === 'zh' ? b.summary_zh : b.summary_en
            return `
            <a href="/blogs/${b.id}?lang=${lang}" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div class="h-48 overflow-hidden">
                <img src="${cover}" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">${title}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-3">${summary || ''}</p>
                <div class="flex items-center justify-between text-xs text-gray-500 mt-auto">
                  <span><i class="fas fa-eye mr-1"></i>${b.view_count || 0}</span>
                  <span>${b.created_at ? new Date(b.created_at).toISOString().split('T')[0] : ''}</span>
                </div>
              </div>
            </a>
            `
          }).join('')}
          
          ${blogs.length === 0 ? `
            <div class="col-span-3 text-center py-20 text-gray-500">
              <i class="far fa-folder-open text-4xl mb-4 text-gray-300"></i>
              <p>${lang === 'zh' ? '暂无内容' : 'No content available'}</p>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
    `
    return c.html(getLayout(lang, T('nav_info'), content, '/info'))
  } catch (e) {
    console.error('DB error:', e)
    return c.html(getLayout(lang, 'Error', '<div class="text-center py-20 text-red-500">System Error</div>', '/info'))
  }
})

contentRoute.get('/page/:slug', async (c) => {
  const lang = getLang(c)
  const slug = c.req.param('slug')
  
  try {
    const page = await c.env.DB.prepare('SELECT * FROM pages WHERE slug = ?').bind(slug).first()
    
    if (!page) {
      return c.html(getLayout(lang, '404 Not Found', '<div class="py-20 text-center text-gray-500">Page not found</div>', '/'), 404)
    }

    const title = lang === 'zh' ? page.title_zh : page.title_en
    const htmlContent = lang === 'zh' ? page.content_zh : page.content_en

    const content = `
    <div class="bg-gray-50 py-12 min-h-screen">
      <div class="max-w-4xl mx-auto px-4 sm:px-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 class="text-3xl font-bold text-gray-900 mb-8">${title}</h1>
          <div class="prose prose-blue max-w-none text-gray-700 leading-relaxed">
            ${htmlContent || ''}
          </div>
        </div>
      </div>
    </div>
    `
    return c.html(getLayout(lang, title as string, content, `/page/${slug}`))
  } catch (e) {
    console.error(e)
    return c.html('Internal Server Error', 500)
  }
})

// Blog list
contentRoute.get('/blogs', async (c) => {
  const lang = getLang(c)
  const T = (key: any) => t(lang, key)
  
  try {
    const result = await c.env.DB.prepare("SELECT * FROM blogs WHERE is_published = 1 AND (category = 'blog' OR category IS NULL) ORDER BY sort_order DESC, created_at DESC").all()
    const blogs = result.results || []

    const content = `
    <div class="bg-gray-50 py-12 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-12">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">${T('footer_blog')}</h1>
          <p class="text-gray-600">${lang === 'zh' ? '探索最新的英国旅游、留学及生活资讯' : 'Discover the latest news on UK travel, study, and life'}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${blogs.map((b: any) => {
            const images = JSON.parse(b.cover_image || '[]')
            const cover = images[0] || 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600'
            const title = lang === 'zh' ? b.title_zh : b.title_en
            const summary = lang === 'zh' ? b.summary_zh : b.summary_en
            return `
            <a href="/blogs/${b.id}?lang=${lang}" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div class="h-48 overflow-hidden">
                <img src="${cover}" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">${title}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-3">${summary || ''}</p>
                <div class="flex items-center justify-between text-xs text-gray-500 mt-auto">
                  <span><i class="fas fa-user mr-1"></i>${b.author || 'Watu'}</span>
                  <span><i class="fas fa-eye mr-1"></i>${b.view_count || 0}</span>
                </div>
              </div>
            </a>
            `
          }).join('')}
        </div>
      </div>
    </div>
    `
    return c.html(getLayout(lang, T('footer_blog'), content, '/blogs'))
  } catch (e) {
    console.error(e)
    return c.html('Internal Server Error', 500)
  }
})

// Blog Detail
contentRoute.get('/blogs/:id', async (c) => {
  const lang = getLang(c)
  const id = c.req.param('id')
  
  try {
    const blog = await c.env.DB.prepare('SELECT * FROM blogs WHERE id = ? AND is_published = 1').bind(id).first()
    
    if (!blog) {
      return c.html(getLayout(lang, '404 Not Found', '<div class="py-20 text-center text-gray-500">Blog not found</div>', '/blogs'), 404)
    }

    // Increment view count
    c.executionCtx.waitUntil(
      c.env.DB.prepare('UPDATE blogs SET view_count = view_count + 1 WHERE id = ?').bind(id).run()
    )

    const title = lang === 'zh' ? blog.title_zh : blog.title_en
    const htmlContent = lang === 'zh' ? blog.content_zh : blog.content_en
    const images = JSON.parse((blog.cover_image as string) || '[]')
    const cover = images[0] || 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200'

    const content = `
    <div class="bg-white min-h-screen pb-16">
      <div class="w-full h-64 md:h-96 relative">
        <img src="${cover}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="max-w-4xl px-4 text-center">
            <h1 class="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">${title}</h1>
            <div class="text-white/80 text-sm flex items-center justify-center space-x-4">
              <span><i class="fas fa-user mr-1"></i>${blog.author || 'Watu'}</span>
              <span><i class="far fa-calendar-alt mr-1"></i>${new Date((blog.created_at as string)).toLocaleDateString()}</span>
              <span><i class="fas fa-eye mr-1"></i>${(blog.view_count as number) + 1}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        <div class="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
          <div class="prose prose-blue max-w-none text-gray-800 leading-relaxed text-lg">
            ${htmlContent || ''}
          </div>
          
          <div class="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
            <a href="/blogs?lang=${lang}" class="text-blue-600 hover:text-blue-800 font-medium flex items-center">
              <i class="fas fa-arrow-left mr-2"></i> ${lang === 'zh' ? '返回博客列表' : 'Back to Blogs'}
            </a>
          </div>
        </div>
      </div>
    </div>
    `
    return c.html(getLayout(lang, title as string, content, '/blogs'))
  } catch (e) {
    console.error(e)
    return c.html('Internal Server Error', 500)
  }
})

export default contentRoute
