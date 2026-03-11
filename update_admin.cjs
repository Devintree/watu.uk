const fs = require('fs');

let adminCode = fs.readFileSync('/home/user/webapp/src/routes/admin.ts', 'utf8');

// We will replace everything from `adminRoute.get('/hotels'` downwards except the export default
const splitToken = "adminRoute.get('/hotels', async (c) => {";
if (adminCode.includes(splitToken)) {
  const parts = adminCode.split(splitToken);
  
  const newCode = parts[0] + `import { crudTemplate } from '../lib/admin-crud-template'

const hotelSchema = {
  columns: [
    { key: 'images', label: '图片', type: 'image' },
    { key: 'title_zh', label: '标题(中)' },
    { key: 'city', label: '城市' },
    { key: 'price_per_night', label: '价格/晚' }
  ],
  form: [
    { key: 'title_zh', label: '标题(中)' },
    { key: 'title_en', label: '标题(英)' },
    { key: 'city', label: '城市', type: 'select', options: [{value:'london',label:'伦敦'}, {value:'oxford',label:'牛津'}, {value:'cambridge',label:'剑桥'}, {value:'manchester',label:'曼彻斯特'}, {value:'edinburgh',label:'爱丁堡'}] },
    { key: 'address', label: '详细地址' },
    { key: 'price_per_night', label: '价格/晚 (£)', type: 'number' },
    { key: 'room_type', label: '房型', type: 'select', options: [{value:'single',label:'单人间'},{value:'double',label:'双人间'},{value:'ensuite',label:'套间'},{value:'apartment',label:'整租公寓'}] },
    { key: 'images', label: '上传图片', type: 'image' },
    { key: 'sort_order', label: '排序', type: 'number' }
  ]
}

const rentalSchema = {
  columns: [
    { key: 'images', label: '图片', type: 'image' },
    { key: 'title_zh', label: '标题(中)' },
    { key: 'city', label: '城市' },
    { key: 'price_per_month', label: '价格/月' }
  ],
  form: [
    { key: 'title_zh', label: '标题(中)' },
    { key: 'title_en', label: '标题(英)' },
    { key: 'city', label: '城市', type: 'select', options: [{value:'london',label:'伦敦'}, {value:'oxford',label:'牛津'}, {value:'cambridge',label:'剑桥'}, {value:'manchester',label:'曼彻斯特'}, {value:'edinburgh',label:'爱丁堡'}] },
    { key: 'address', label: '详细地址' },
    { key: 'price_per_month', label: '价格/月 (£)', type: 'number' },
    { key: 'property_type', label: '物业类型', type: 'select', options: [{value:'studio',label:'Studio'},{value:'1bed',label:'一室一厅'},{value:'2bed',label:'两室一厅'},{value:'shared',label:'合租'}] },
    { key: 'bedrooms', label: '卧室数', type: 'number' },
    { key: 'bathrooms', label: '卫浴数', type: 'number' },
    { key: 'images', label: '上传图片', type: 'image' },
    { key: 'sort_order', label: '排序', type: 'number' }
  ]
}

const guideSchema = {
  columns: [
    { key: 'avatar', label: '头像', type: 'image' },
    { key: 'name_zh', label: '姓名' },
    { key: 'price_per_day', label: '日均价' },
    { key: 'experience_years', label: '经验(年)' }
  ],
  form: [
    { key: 'name_zh', label: '姓名(中)' },
    { key: 'name_en', label: '姓名(英)' },
    { key: 'bio_zh', label: '简介(中)', type: 'textarea' },
    { key: 'bio_en', label: '简介(英)', type: 'textarea' },
    { key: 'price_per_day', label: '日均价 (£)', type: 'number' },
    { key: 'experience_years', label: '从业年限', type: 'number' },
    { key: 'avatar', label: '上传头像(JSON数组)', type: 'image' },
    { key: 'sort_order', label: '排序', type: 'number' }
  ]
}

const tourSchema = {
  columns: [
    { key: 'images', label: '图片', type: 'image' },
    { key: 'title_zh', label: '标题' },
    { key: 'duration_days', label: '天数' },
    { key: 'price_per_person', label: '价格/人' }
  ],
  form: [
    { key: 'title_zh', label: '标题(中)' },
    { key: 'title_en', label: '标题(英)' },
    { key: 'description_zh', label: '描述(中)', type: 'textarea' },
    { key: 'description_en', label: '描述(英)', type: 'textarea' },
    { key: 'price_per_person', label: '价格/人 (£)', type: 'number' },
    { key: 'duration_days', label: '行程天数', type: 'number' },
    { key: 'min_age', label: '最小年龄', type: 'number' },
    { key: 'max_age', label: '最大年龄', type: 'number' },
    { key: 'images', label: '上传图片', type: 'image' },
    { key: 'sort_order', label: '排序', type: 'number' }
  ]
}

adminRoute.get('/hotels', (c) => {
  return c.html(adminLayout('酒店管理', crudTemplate('酒店管理', 'hotels', hotelSchema), 'hotels'))
})

adminRoute.get('/rentals', (c) => {
  return c.html(adminLayout('租房管理', crudTemplate('租房管理', 'rentals', rentalSchema), 'rentals'))
})

adminRoute.get('/guides', (c) => {
  return c.html(adminLayout('导游管理', crudTemplate('导游管理', 'guides', guideSchema), 'guides'))
})

adminRoute.get('/study-tours', (c) => {
  return c.html(adminLayout('游学管理', crudTemplate('游学管理', 'study_tours', tourSchema), 'study_tours'))
})

export default adminRoute
`;

  fs.writeFileSync('/home/user/webapp/src/routes/admin.ts', newCode);
  console.log('Successfully updated admin.ts');
} else {
  console.log('Could not find split token');
}
