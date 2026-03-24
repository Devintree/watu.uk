const fs = require('fs');
let code = fs.readFileSync('src/lib/admin-hotel-templates.ts', 'utf8');

// 1. Hotels -> price_per_night_cny
code = code.replace("price_per_night: 0,", "price_per_night: 0, price_per_night_cny: 0,");
code = code.replace(
  `<div><label class="block text-sm mb-1">参考均价 (£)</label><input type="number" v-model="form.price_per_night" class="w-full border rounded p-2"></div>`,
  `<div><label class="block text-sm mb-1">参考均价 (£)</label><input type="number" v-model="form.price_per_night" class="w-full border rounded p-2"></div>
        <div><label class="block text-sm mb-1">参考均价 (¥)</label><input type="number" v-model="form.price_per_night_cny" class="w-full border rounded p-2"></div>`
);

// 2. Room types -> base_price_cny
code = code.replace("base_price: 100,", "base_price: 100, base_price_cny: 900,");
code = code.replace(
  `<div><label class="block text-sm mb-1">默认基础价 (£)*</label><input type="number" v-model="form.base_price" class="w-full border rounded p-2"></div>`,
  `<div><label class="block text-sm mb-1">默认基础价 (£)*</label><input type="number" v-model="form.base_price" class="w-full border rounded p-2"></div>
        <div><label class="block text-sm mb-1">默认基础价 (¥)*</label><input type="number" v-model="form.base_price_cny" class="w-full border rounded p-2"></div>`
);
code = code.replace(
  `<td class="px-4 py-3 font-bold text-blue-600">£{{ item.base_price }}</td>`,
  `<td class="px-4 py-3 font-bold text-blue-600">£{{ item.base_price }} / ¥{{ item.base_price_cny }}</td>`
);

// 3. Room inventory -> price_cny
code = code.replace(
  `batch: { start_date:'', end_date:'', price: 100, available_count: 5, is_closed: 0 }`,
  `batch: { start_date:'', end_date:'', price: 100, price_cny: 900, available_count: 5, is_closed: 0 }`
);
code = code.replace(
  `this.batch = { start_date: day.date, end_date: day.date, price: day.price||0, available_count: day.available_count||0, is_closed: day.is_closed||0 };`,
  `this.batch = { start_date: day.date, end_date: day.date, price: day.price||0, price_cny: day.price_cny||0, available_count: day.available_count||0, is_closed: day.is_closed||0 };`
);
code = code.replace(
  `<div><label class="block text-sm mb-1">价格 (£)</label><input type="number" v-model="batch.price" class="w-full border rounded p-2"></div>`,
  `<div><label class="block text-sm mb-1">价格 (£)</label><input type="number" v-model="batch.price" class="w-full border rounded p-2"></div>
        <div><label class="block text-sm mb-1">价格 (¥)</label><input type="number" v-model="batch.price_cny" class="w-full border rounded p-2"></div>`
);
code = code.replace(
  `<div v-if="day.price" class="text-sm font-bold text-blue-600 text-center mt-2">£{{ day.price }}</div>`,
  `<div v-if="day.price" class="text-sm font-bold text-blue-600 text-center mt-2">£{{ day.price }}<br/>¥{{ day.price_cny }}</div>`
);

fs.writeFileSync('src/lib/admin-hotel-templates.ts', code);
console.log('Admin hotel templates patched');
