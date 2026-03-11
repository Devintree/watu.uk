const fs = require('fs');

let adminApiCode = fs.readFileSync('/home/user/webapp/src/routes/admin-api.ts', 'utf8');
adminApiCode = adminApiCode.replace("const ALLOWED_TABLES = ['hotels', 'rentals', 'guides', 'study_tours']", "const ALLOWED_TABLES = ['hotels', 'rentals', 'guides', 'study_tours', 'blogs', 'pages']");
fs.writeFileSync('/home/user/webapp/src/routes/admin-api.ts', adminApiCode);

let adminCode = fs.readFileSync('/home/user/webapp/src/routes/admin.ts', 'utf8');

// Update menuItems in adminLayout
adminCode = adminCode.replace(
  "{href: '/admin/study-tours', icon: '🎓', label: '游学管理', key: 'study_tours'},",
  "{href: '/admin/study-tours', icon: '🎓', label: '游学管理', key: 'study_tours'},\n    {href: '/admin/blogs', icon: '📝', label: '博客管理', key: 'blogs'},\n    {href: '/admin/pages', icon: '📄', label: '单页管理', key: 'pages'},"
);

// Add the schema and routes at the end
const additionalSchemas = `
const blogSchema = {
  columns: [
    { key: 'cover_image', label: '封面', type: 'image' },
    { key: 'title_zh', label: '标题' },
    { key: 'author', label: '作者' }
  ],
  form: [
    { key: 'title_zh', label: '标题(中)' },
    { key: 'title_en', label: '标题(英)' },
    { key: 'author', label: '作者' },
    { key: 'summary_zh', label: '摘要(中)', type: 'textarea' },
    { key: 'summary_en', label: '摘要(英)', type: 'textarea' },
    { key: 'content_zh', label: '内容(中) - 支持HTML', type: 'textarea' },
    { key: 'content_en', label: '内容(英) - 支持HTML', type: 'textarea' },
    { key: 'cover_image', label: '上传封面(JSON数组)', type: 'image' },
    { key: 'sort_order', label: '排序', type: 'number' }
  ]
}

const pageSchema = {
  columns: [
    { key: 'slug', label: '标识符 (Slug)' },
    { key: 'title_zh', label: '页面名称' }
  ],
  form: [
    { key: 'slug', label: '标识符 (如 about, faq 等不可随意更改)' },
    { key: 'title_zh', label: '页面标题(中)' },
    { key: 'title_en', label: '页面标题(英)' },
    { key: 'content_zh', label: '页面内容(中) - 支持HTML', type: 'textarea' },
    { key: 'content_en', label: '页面内容(英) - 支持HTML', type: 'textarea' }
  ]
}

adminRoute.get('/blogs', (c) => {
  return c.html(adminLayout('博客管理', crudTemplate('博客管理', 'blogs', blogSchema), 'blogs'))
})

adminRoute.get('/pages', (c) => {
  return c.html(adminLayout('单页管理', crudTemplate('固定单页管理', 'pages', pageSchema), 'pages'))
})

export default adminRoute
`;

adminCode = adminCode.replace("export default adminRoute", additionalSchemas);

fs.writeFileSync('/home/user/webapp/src/routes/admin.ts', adminCode);
