const fs = require('fs');

let adminCode = fs.readFileSync('/home/user/webapp/src/routes/admin.ts', 'utf8');

// Replace the previous generated schemas and routes for blogs/pages
const splitToken = "const blogSchema = {";
if (adminCode.includes(splitToken)) {
  const parts = adminCode.split(splitToken);
  
  const newCode = parts[0] + `import { blogListTemplate, pageListTemplate, richEditTemplate } from '../lib/admin-pages-templates'

adminRoute.get('/blogs', (c) => {
  return c.html(adminLayout('博客管理', blogListTemplate, 'blogs'))
})

adminRoute.get('/blogs/edit/:id', (c) => {
  const id = c.req.param('id')
  return c.html(adminLayout(id === 'new' ? '添加博客' : '编辑博客', richEditTemplate('blogs', id), 'blogs'))
})

adminRoute.get('/pages', (c) => {
  return c.html(adminLayout('单页管理', pageListTemplate, 'pages'))
})

adminRoute.get('/pages/edit/:id', (c) => {
  const id = c.req.param('id')
  return c.html(adminLayout('编辑单页', richEditTemplate('pages', id), 'pages'))
})

export default adminRoute
`;

  fs.writeFileSync('/home/user/webapp/src/routes/admin.ts', newCode);
  console.log('Successfully updated admin.ts to use separate list and edit pages');
} else {
  console.log('Could not find split token');
}
