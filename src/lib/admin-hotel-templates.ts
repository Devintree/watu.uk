export const hotelListTemplate = `
<div id="hotel-list">
  <div class="flex items-center justify-between mb-6">
    <h2 class="font-bold text-gray-800">酒店基础信息管理 ({{ items.length }})</h2>
    <a href="/admin/hotels/edit/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
      + 添加新酒店
    </a>
  </div>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <table class="w-full text-sm text-left">
      <thead class="bg-gray-50 border-b border-gray-100">
        <tr>
          <th class="px-4 py-3 text-gray-600 font-medium">首图</th>
          <th class="px-4 py-3 text-gray-600 font-medium">酒店名称</th>
          <th class="px-4 py-3 text-gray-600 font-medium">城市</th>
          <th class="px-4 py-3 text-gray-600 font-medium">星级</th>
          <th class="px-4 py-3 text-gray-600 font-medium">状态</th>
          <th class="px-4 py-3 text-gray-600 font-medium text-right">操作</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
          <td class="px-4 py-3">
            <img v-if="item.cover_image" :src="item.cover_image" class="h-10 w-16 object-cover rounded border" />
            <div v-else-if="item.images && JSON.parse(item.images)[0]" class="h-10 w-16 object-cover rounded border bg-gray-100"><img :src="JSON.parse(item.images)[0]" class="h-full w-full object-cover"></div>
            <div v-else class="h-10 w-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 border">无</div>
          </td>
          <td class="px-4 py-3 font-medium text-gray-800">{{ item.title_zh }}</td>
          <td class="px-4 py-3 text-gray-600">{{ item.city }}</td>
          <td class="px-4 py-3 text-amber-500">{{ '⭐'.repeat(item.star_rating || 0) }}</td>
          <td class="px-4 py-3">
            <span :class="item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="px-2 py-1 rounded-full text-xs">
              {{ item.is_available ? '营业中' : '已下线' }}
            </span>
          </td>
          <td class="px-4 py-3 flex justify-end gap-2">
            <a :href="'/admin/hotels/' + item.id + '/rooms'" class="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded font-medium hover:bg-purple-100">管理房型与日历</a>
            <a :href="'/admin/hotels/edit/' + item.id" class="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded font-medium hover:bg-blue-100">基础信息</a>
            <button @click="deleteItem(item.id)" class="text-xs bg-red-50 text-red-600 px-2 py-1.5 rounded hover:bg-red-100">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
  Vue.createApp({
    data() { return { items: [] } },
    mounted() { this.fetchData(); },
    methods: {
      async fetchData() {
        const res = await fetch('/admin/api/hotels');
        this.items = await res.json();
      },
      async deleteItem(id) {
        if(!confirm('确定要删除该酒店吗？相关的房型和日历也会被清除！')) return;
        await fetch('/admin/api/hotels/' + id, { method: 'DELETE' });
        this.fetchData();
      }
    }
  }).mount('#hotel-list');
</script>
`;

export const hotelEditTemplate = (id: string) => `
<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
<script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
<div id="edit-app" class="pb-20">
  <div class="flex items-center justify-between mb-6">
    <h2 class="font-bold text-gray-800 text-xl">{{ isNew ? '新增酒店' : '编辑酒店基础信息' }}</h2>
    <div class="flex gap-3">
      <a href="/admin/hotels" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">返回列表</a>
      <button @click="save" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm">保存修改</button>
    </div>
  </div>

  <div class="space-y-6">
    <!-- Section 1: Basic Info -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 class="font-bold text-gray-800 border-b pb-3 mb-4">基本属性</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div><label class="block text-sm text-gray-700 mb-1">酒店名称 (中) *</label><input type="text" v-model="form.title_zh" class="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-blue-500"></div>
        <div><label class="block text-sm text-gray-700 mb-1">酒店名称 (英) *</label><input type="text" v-model="form.title_en" class="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-blue-500"></div>
        <div><label class="block text-sm text-gray-700 mb-1">星级 (1-5)</label><input type="number" min="1" max="5" v-model="form.star_rating" class="w-full border rounded-lg p-2.5"></div>
        <div><label class="block text-sm text-gray-700 mb-1">开业年份</label><input type="number" v-model="form.opening_year" class="w-full border rounded-lg p-2.5" placeholder="例如: 2018"></div>
        <div><label class="block text-sm text-gray-700 mb-1">客房数量</label><input type="number" v-model="form.room_count" class="w-full border rounded-lg p-2.5"></div>
        <div>
          <label class="block text-sm text-gray-700 mb-1">状态</label>
          <select v-model="form.is_available" class="w-full border rounded-lg p-2.5">
            <option :value="1">营业中</option>
            <option :value="0">已下线</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Section 2: Contact & Location -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 class="font-bold text-gray-800 border-b pb-3 mb-4">位置与联系方式</h3>
      
      <div class="grid grid-cols-1 gap-6 mb-6">
        <div>
          <label class="block text-sm text-gray-700 mb-1">携程酒店ID (同步数据用)</label>
          <div class="flex gap-2">
            <input type="text" v-model="form.ctrip_id" class="w-1/3 border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-blue-500" placeholder="例如: 2985758">
            <button @click="importCtrip" type="button" class="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-100 font-medium">
              <i class="fas fa-cloud-download-alt mr-1"></i> 一键导入
            </button>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div><label class="block text-sm text-gray-700 mb-1">联系电话</label><input type="text" v-model="form.phone" class="w-full border rounded-lg p-2.5"></div>
        <div><label class="block text-sm text-gray-700 mb-1">联系电邮</label><input type="email" v-model="form.email" class="w-full border rounded-lg p-2.5"></div>
        <div>
          <label class="block text-sm text-gray-700 mb-1">城市</label>
          <select v-model="form.city" class="w-full border rounded-lg p-2.5">
            <option value="london">伦敦</option><option value="oxford">牛津</option><option value="cambridge">剑桥</option>
            <option value="manchester">曼彻斯特</option><option value="edinburgh">爱丁堡</option>
          </select>
        </div>
        <div><label class="block text-sm text-gray-700 mb-1">详细地址</label><input type="text" v-model="form.address" class="w-full border rounded-lg p-2.5"></div>
        <div><label class="block text-sm text-gray-700 mb-1">经度 (Longitude)</label><input type="number" step="0.000001" v-model="form.longitude" class="w-full border rounded-lg p-2.5"></div>
        <div><label class="block text-sm text-gray-700 mb-1">纬度 (Latitude)</label><input type="number" step="0.000001" v-model="form.latitude" class="w-full border rounded-lg p-2.5"></div>
      </div>
    </div>

    <!-- Section 3: Media -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 class="font-bold text-gray-800 border-b pb-3 mb-4">酒店图片集</h3>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">酒店首图 (1张)</label>
        <div class="flex items-center gap-4">
          <img v-if="form.cover_image" :src="form.cover_image" class="h-24 w-36 object-cover rounded-lg border">
          <label class="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-100">
            上传首图<input type="file" accept="image/*" @change="e => handleSingleImage(e, 'cover_image')" class="hidden">
          </label>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">酒店画廊图片 (多张)</label>
        <div class="flex items-center mb-3">
          <label class="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
            上传画廊图片<input type="file" multiple accept="image/*" @change="handleGalleryUpload" class="hidden">
          </label>
        </div>
        <div class="flex flex-wrap gap-4" v-if="galleryList.length > 0">
          <div v-for="(img, idx) in galleryList" :key="idx" class="relative group">
            <img :src="img" class="h-24 w-36 object-cover rounded-lg border">
            <button @click="removeGalleryImage(idx)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><i class="fas fa-times text-xs"></i></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 4: Descriptions (Rich Text) -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 class="font-bold text-gray-800 border-b pb-3 mb-4">酒店详情与政策</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div>
          <label class="block text-sm text-gray-700 mb-2">酒店简介 (中文)</label>
          <div ref="descZh" class="h-[200px] bg-white border rounded"></div>
        </div>
        <div>
          <label class="block text-sm text-gray-700 mb-2">酒店简介 (英文)</label>
          <div ref="descEn" class="h-[200px] bg-white border rounded"></div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div>
          <label class="block text-sm text-gray-700 mb-2">住宿政策 (中文)</label>
          <div ref="polZh" class="h-[150px] bg-white border rounded"></div>
        </div>
        <div>
          <label class="block text-sm text-gray-700 mb-2">住宿政策 (英文)</label>
          <div ref="polEn" class="h-[150px] bg-white border rounded"></div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label class="block text-sm text-gray-700 mb-1">服务及设施 (中文) <span class="text-gray-400 text-xs">使用逗号分隔，如: 免费WiFi,健身房,游泳池</span></label>
          <textarea v-model="form.amenities_zh" rows="2" class="w-full border rounded-lg p-2.5"></textarea>
        </div>
        <div>
          <label class="block text-sm text-gray-700 mb-1">服务及设施 (英文)</label>
          <textarea v-model="form.amenities_en" rows="2" class="w-full border rounded-lg p-2.5"></textarea>
        </div>
      </div>
    </div>
  </div>
</div>
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
  Vue.createApp({
    data() {
      return {
        id: '${id}', isNew: '${id}' === 'new',
        form: {
          title_zh: '', title_en: '', star_rating: 4, opening_year: '', room_count: '', ctrip_id: '',
          phone: '', email: '', city: 'london', address: '', latitude: '', longitude: '',
          cover_image: '', images: '[]', description_zh: '', description_en: '',
          policies_zh: '', policies_en: '', amenities_zh: '', amenities_en: '', is_available: 1, price_per_night: 0
        },
        qDescZh: null, qDescEn: null, qPolZh: null, qPolEn: null
      }
    },
    computed: {
      galleryList() { try { return JSON.parse(this.form.images || '[]'); } catch { return []; } }
    },
    mounted() {
      const tb = [['bold', 'italic', 'underline'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['clean']];
      this.qDescZh = new Quill(this.$refs.descZh, { theme: 'snow', modules: { toolbar: tb } });
      this.qDescEn = new Quill(this.$refs.descEn, { theme: 'snow', modules: { toolbar: tb } });
      this.qPolZh = new Quill(this.$refs.polZh, { theme: 'snow', modules: { toolbar: tb } });
      this.qPolEn = new Quill(this.$refs.polEn, { theme: 'snow', modules: { toolbar: tb } });
      
      [this.qDescZh, this.qDescEn, this.qPolZh, this.qPolEn].forEach((q, i) => {
        const fields = ['description_zh', 'description_en', 'policies_zh', 'policies_en'];
        q.on('text-change', () => { this.form[fields[i]] = q.root.innerHTML; });
      });

      if (!this.isNew) this.fetchData();
    },
    methods: {
      async fetchData() {
        const res = await fetch('/admin/api/hotels/' + this.id);
        if (res.ok) {
          const data = await res.json();
          this.form = { ...this.form, ...data };
          if(this.form.description_zh) this.qDescZh.clipboard.dangerouslyPasteHTML(this.form.description_zh);
          if(this.form.description_en) this.qDescEn.clipboard.dangerouslyPasteHTML(this.form.description_en);
          if(this.form.policies_zh) this.qPolZh.clipboard.dangerouslyPasteHTML(this.form.policies_zh);
          if(this.form.policies_en) this.qPolEn.clipboard.dangerouslyPasteHTML(this.form.policies_en);
        }
      },
      async save() {
        if (!this.form.title_zh || !this.form.title_en) { alert('请输入中英文名称'); return; }
        const url = '/admin/api/hotels' + (this.isNew ? '' : '/' + this.id);
        const res = await fetch(url, { method: this.isNew ? 'POST' : 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(this.form) });
        if(res.ok) { alert('保存成功'); window.location.href='/admin/hotels'; } else alert('保存失败');
      },
      
      async importCtrip() {
        if (!this.form.ctrip_id) { alert('请输入携程ID'); return; }
        try {
          const res = await fetch('/admin/api/proxy/ctrip/' + this.form.ctrip_id);
          const json = await res.json();
          if (json && json.data) {
            const d = json.data;
            if (d.hotel_name) this.form.title_zh = d.hotel_name;
            if (d.star_level) this.form.star_rating = parseInt(d.star_level);
            if (d.open_year) this.form.opening_year = d.open_year;
            if (d.room_total) this.form.room_count = parseInt(d.room_total);
            if (d.phone) this.form.phone = d.phone;
            
            // map city
            if (d.city_name) {
              const cn = d.city_name;
              if (cn.includes('伦敦')) this.form.city = 'london';
              else if (cn.includes('牛津')) this.form.city = 'oxford';
              else if (cn.includes('剑桥')) this.form.city = 'cambridge';
              else if (cn.includes('爱丁堡')) this.form.city = 'edinburgh';
              else if (cn.includes('曼彻斯特')) this.form.city = 'manchester';
            }
            if (d.address) this.form.address = d.address;
            
            if (d.coordinates) {
              if (d.coordinates.lat) this.form.latitude = d.coordinates.lat;
              if (d.coordinates.lng) this.form.longitude = d.coordinates.lng;
            }
            
            if (d.description) {
              this.form.description_zh = '<p>' + d.description + '</p>';
              if (this.qDescZh) this.qDescZh.root.innerHTML = this.form.description_zh;
            }
            
            if (d.media && d.media.images && d.media.images.length > 0) {
              this.form.cover_image = d.media.images[0];
              this.form.images = JSON.stringify(d.media.images);
            }
            alert('导入成功，请检查各项数据后保存。');
          } else {
            alert('未能获取到有效数据');
          }
        } catch(e) {
          alert('导入失败: ' + e.message);
        }
      },
      compressImage(file, callback) {
        const reader = new FileReader();
        reader.onload = ev => {
          const img = new Image();
          img.onload = () => {
            const cvs = document.createElement('canvas');
            const max = 1200; let w = img.width, h = img.height;
            if(w > h && w > max) { h *= max/w; w = max; } else if(h > max) { w *= max/h; h = max; }
            cvs.width = w; cvs.height = h;
            cvs.getContext('2d').drawImage(img, 0, 0, w, h);
            callback(cvs.toDataURL('image/webp', 0.8));
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      },
      handleSingleImage(e, field) {
        if(e.target.files[0]) this.compressImage(e.target.files[0], base64 => this.form[field] = base64);
        e.target.value='';
      },
      handleGalleryUpload(e) {
        Array.from(e.target.files).forEach(f => {
          this.compressImage(f, base64 => {
            let arr = [...this.galleryList]; arr.push(base64);
            this.form.images = JSON.stringify(arr);
          });
        });
        e.target.value='';
      },
      removeGalleryImage(idx) {
        let arr = [...this.galleryList]; arr.splice(idx, 1);
        this.form.images = JSON.stringify(arr);
      }
    }
  }).mount('#edit-app');
</script>
`;

export const roomTypeListTemplate = (hotelId: string) => `
<div id="rooms-app">
  <div class="mb-4 text-sm"><a href="/admin/hotels" class="text-blue-600 hover:underline">← 返回酒店列表</a></div>
  <div class="flex items-center justify-between mb-6">
    <h2 class="font-bold text-gray-800 text-xl">房型管理 <span class="text-gray-500 text-base font-normal ml-2">ID: ${hotelId}</span></h2>
    <button @click="showAddModal=true" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
      + 添加房型
    </button>
  </div>
  
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <table class="w-full text-sm text-left">
      <thead class="bg-gray-50 border-b border-gray-100">
        <tr>
          <th class="px-4 py-3 font-medium">房型名称</th>
          <th class="px-4 py-3 font-medium">床型</th>
          <th class="px-4 py-3 font-medium">面积(㎡)</th>
          <th class="px-4 py-3 font-medium">最多人数</th>
          <th class="px-4 py-3 font-medium">基础底价</th>
          <th class="px-4 py-3 font-medium text-right">操作</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
          <td class="px-4 py-3 font-medium">{{ item.name_zh }}</td>
          <td class="px-4 py-3 text-gray-600">{{ item.bed_type }}</td>
          <td class="px-4 py-3 text-gray-600">{{ item.room_size_sqm || '-' }}</td>
          <td class="px-4 py-3 text-gray-600">{{ item.max_guests }}</td>
          <td class="px-4 py-3 font-bold text-blue-600">£{{ item.base_price }}</td>
          <td class="px-4 py-3 flex justify-end gap-2">
            <a :href="'/admin/hotels/${hotelId}/rooms/' + item.id + '/calendar'" class="text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded font-medium border border-amber-200 hover:bg-amber-100"><i class="fas fa-calendar-alt mr-1"></i>价格/房态日历</a>
            <button @click="editRoom(item)" class="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded font-medium hover:bg-gray-200">修改</button>
            <button @click="deleteItem(item.id)" class="text-xs bg-red-50 text-red-600 px-2 py-1.5 rounded hover:bg-red-100">删除</button>
          </td>
        </tr>
        <tr v-if="items.length===0"><td colspan="6" class="px-4 py-8 text-center text-gray-400">暂无房型数据，请先添加</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Room Modal -->
  <div v-if="showAddModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl max-w-2xl w-full p-6">
      <h3 class="font-bold text-xl mb-4">{{ form.id ? '编辑房型' : '添加房型' }}</h3>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div><label class="block text-sm mb-1">房型名称(中)*</label><input v-model="form.name_zh" class="w-full border rounded p-2"></div>
        <div><label class="block text-sm mb-1">房型名称(英)*</label><input v-model="form.name_en" class="w-full border rounded p-2"></div>
        <div><label class="block text-sm mb-1">床型描述 (如: 1张大床)</label><input v-model="form.bed_type" class="w-full border rounded p-2"></div>
        <div><label class="block text-sm mb-1">房间面积 (㎡)</label><input type="number" v-model="form.room_size_sqm" class="w-full border rounded p-2"></div>
        <div><label class="block text-sm mb-1">最多入住人数</label><input type="number" v-model="form.max_guests" class="w-full border rounded p-2"></div>
        <div><label class="block text-sm mb-1">默认基础价 (£)*</label><input type="number" v-model="form.base_price" class="w-full border rounded p-2"></div>
      </div>
      <div class="flex justify-end gap-3 mt-6 border-t pt-4">
        <button @click="showAddModal=false" class="px-4 py-2 bg-gray-100 rounded">取消</button>
        <button @click="saveRoom" class="px-4 py-2 bg-blue-600 text-white rounded">保存</button>
      </div>
    </div>
  </div>
</div>
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
  Vue.createApp({
    data() { return { items: [], showAddModal: false, form: {} } },
    mounted() { this.fetchData(); },
    methods: {
      async fetchData() {
        const res = await fetch('/admin/api/room_types?hotel_id=${hotelId}');
        this.items = await res.json();
      },
      editRoom(item) { this.form = {...item}; this.showAddModal = true; },
      async saveRoom() {
        this.form.hotel_id = ${hotelId};
        const method = this.form.id ? 'PUT' : 'POST';
        const url = '/admin/api/room_types' + (this.form.id ? '/' + this.form.id : '');
        await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(this.form)});
        this.showAddModal = false; this.form = {}; this.fetchData();
      },
      async deleteItem(id) {
        if(confirm('删除?')) { await fetch('/admin/api/room_types/'+id, {method:'DELETE'}); this.fetchData(); }
      }
    }
  }).mount('#rooms-app');
</script>
`;

export const priceCalendarTemplate = (roomId: string, hotelId: string) => `
<div id="cal-app">
  <div class="mb-4 text-sm">
    <a href="/admin/hotels/${hotelId}/rooms" class="text-blue-600 hover:underline">← 返回房型列表</a>
  </div>
  <div class="flex items-center justify-between mb-6">
    <h2 class="font-bold text-gray-800 text-xl">房态与房价日历 <span class="text-gray-500 text-sm ml-2">{{ currentMonthStr }}</span></h2>
    <div class="flex gap-2">
      <button @click="prevMonth" class="px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200">&lt; 上月</button>
      <button @click="nextMonth" class="px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200">下月 &gt;</button>
      <button @click="showBatchModal=true" class="ml-4 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700">批量修改</button>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="grid grid-cols-7 bg-gray-50 border-b border-gray-100 text-center text-sm font-medium text-gray-600">
      <div class="py-2" v-for="day in ['日','一','二','三','四','五','六']">{{ day }}</div>
    </div>
    <div class="grid grid-cols-7 border-b border-gray-100">
      <div v-for="(day, idx) in days" :key="idx" 
           @click="day.date ? editSingleDay(day) : null"
           class="min-h-[100px] border-r border-b border-gray-100 p-2 relative"
           :class="[day.date ? 'cursor-pointer hover:bg-blue-50 transition-colors' : 'bg-gray-50', day.is_closed ? 'bg-red-50/50' : '']">
        <div v-if="day.date">
          <div class="text-right text-xs text-gray-400 mb-1">{{ new Date(day.date).getDate() }}</div>
          <div v-if="day.price" class="text-sm font-bold text-blue-600 text-center mt-2">£{{ day.price }}</div>
          <div v-if="day.price" class="text-xs text-center mt-1" :class="day.available_count>0 ? 'text-green-600':'text-red-500'">余: {{ day.available_count }}</div>
          <div v-if="day.is_closed" class="absolute inset-0 bg-red-100/40 flex items-center justify-center font-bold text-red-500 transform -rotate-12 pointer-events-none text-xs border border-red-200 m-1 rounded">已关房</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Batch Modal -->
  <div v-if="showBatchModal || singleEditDate" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl max-w-md w-full p-6">
      <h3 class="font-bold text-xl mb-4">{{ singleEditDate ? '修改单日数据: ' + singleEditDate : '批量修改房态房价' }}</h3>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <template v-if="!singleEditDate">
          <div><label class="block text-sm mb-1">开始日期</label><input type="date" v-model="batch.start_date" class="w-full border rounded p-2"></div>
          <div><label class="block text-sm mb-1">结束日期</label><input type="date" v-model="batch.end_date" class="w-full border rounded p-2"></div>
        </template>
        <div><label class="block text-sm mb-1">价格 (£)</label><input type="number" v-model="batch.price" class="w-full border rounded p-2"></div>
        <div><label class="block text-sm mb-1">可售房量</label><input type="number" v-model="batch.available_count" class="w-full border rounded p-2"></div>
        <div class="col-span-2">
          <label class="block text-sm mb-1">开关房状态</label>
          <select v-model="batch.is_closed" class="w-full border rounded p-2">
            <option :value="0">正常售卖</option><option :value="1">关房(不可售)</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end gap-3 mt-6 border-t pt-4">
        <button @click="closeModal" class="px-4 py-2 bg-gray-100 rounded">取消</button>
        <button @click="saveBatch" class="px-4 py-2 bg-blue-600 text-white rounded">保存</button>
      </div>
    </div>
  </div>
</div>
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
  Vue.createApp({
    data() { 
      const now = new Date();
      return { 
        roomId: '${roomId}',
        currentYear: now.getFullYear(),
        currentMonth: now.getMonth(),
        inventory: [],
        showBatchModal: false,
        singleEditDate: null,
        batch: { start_date:'', end_date:'', price: 100, available_count: 5, is_closed: 0 }
      } 
    },
    computed: {
      currentMonthStr() { return \`\${this.currentYear}年\${this.currentMonth + 1}月\`; },
      days() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        let arr = [];
        for(let i=0; i<firstDay; i++) arr.push({}); // padding
        for(let i=1; i<=daysInMonth; i++) {
          const dateStr = \`\${this.currentYear}-\${String(this.currentMonth+1).padStart(2,'0')}-\${String(i).padStart(2,'0')}\`;
          const inv = this.inventory.find(x => x.date === dateStr);
          arr.push({ date: dateStr, ...inv });
        }
        while(arr.length % 7 !== 0) arr.push({});
        return arr;
      }
    },
    mounted() { this.fetchData(); },
    methods: {
      async fetchData() {
        const monthStr = \`\${this.currentYear}-\${String(this.currentMonth+1).padStart(2,'0')}\`;
        const res = await fetch(\`/admin/api/inventory/\${this.roomId}?month=\${monthStr}\`);
        this.inventory = await res.json();
      },
      prevMonth() { this.currentMonth--; if(this.currentMonth<0) { this.currentMonth=11; this.currentYear--; } this.fetchData(); },
      nextMonth() { this.currentMonth++; if(this.currentMonth>11) { this.currentMonth=0; this.currentYear++; } this.fetchData(); },
      editSingleDay(day) {
        this.singleEditDate = day.date;
        this.batch = { start_date: day.date, end_date: day.date, price: day.price||0, available_count: day.available_count||0, is_closed: day.is_closed||0 };
      },
      closeModal() { this.showBatchModal = false; this.singleEditDate = null; },
      async saveBatch() {
        this.batch.room_type_id = this.roomId;
        await fetch('/admin/api/inventory-bulk', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(this.batch) });
        this.closeModal();
        this.fetchData();
      }
    }
  }).mount('#cal-app');
</script>
`;
