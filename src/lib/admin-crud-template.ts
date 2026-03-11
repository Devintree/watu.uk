export const crudTemplate = (title: string, table: string, schema: any) => `
<div id="crud-app">
  <div class="flex items-center justify-between mb-6">
    <h2 class="font-bold text-gray-800">${title} ({{ items.length }})</h2>
    <button @click="openAddModal" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
      + 添加记录
    </button>
  </div>

  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th v-for="col in columns" :key="col.key" class="px-4 py-3 text-gray-600 font-medium">{{ col.label }}</th>
            <th class="px-4 py-3 text-gray-600 font-medium">推荐</th>
            <th class="px-4 py-3 text-gray-600 font-medium">排序</th>
            <th class="px-4 py-3 text-gray-600 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
            <td v-for="col in columns" :key="col.key" class="px-4 py-3">
              <img v-if="col.type === 'image' && item[col.key] && JSON.parse(item[col.key])[0]" :src="JSON.parse(item[col.key])[0]" class="h-10 w-10 object-cover rounded" />
              <span v-else class="truncate block max-w-xs">{{ item[col.key] }}</span>
            </td>
            <td class="px-4 py-3">
              <button @click="toggleFeatured(item)" :class="item.is_featured ? 'text-amber-500' : 'text-gray-300'">
                <i class="fas fa-star text-lg"></i>
              </button>
            </td>
            <td class="px-4 py-3">
              <input type="number" v-model="item.sort_order" @change="updateSort(item)" class="w-16 px-2 py-1 border rounded text-center">
            </td>
            <td class="px-4 py-3 flex gap-2">
              <button @click="openEditModal(item)" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">编辑</button>
              <button @click="deleteItem(item.id)" class="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Modal -->
  <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
      <h3 class="font-bold text-xl mb-4">{{ form.id ? '编辑记录' : '添加记录' }}</h3>
      
      <form @submit.prevent="saveItem" class="space-y-4">
        <div v-for="field in formSchema" :key="field.key" class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-1">{{ field.label }}</label>
          
          <template v-if="field.type === 'textarea'">
            <textarea v-model="form[field.key]" class="border rounded-lg p-2 text-sm" rows="3"></textarea>
          </template>
          
          <template v-else-if="field.type === 'select'">
            <select v-model="form[field.key]" class="border rounded-lg p-2 text-sm">
              <option v-for="opt in field.options" :value="opt.value">{{ opt.label }}</option>
            </select>
          </template>

          <template v-else-if="field.type === 'image'">
            <input type="file" accept="image/*" @change="e => handleImageUpload(e, field.key)" class="text-sm">
            <div v-if="form[field.key]" class="mt-2 flex gap-2 overflow-x-auto">
              <div v-for="(img, idx) in (typeof form[field.key] === 'string' ? JSON.parse(form[field.key] || '[]') : form[field.key])" class="relative">
                <img :src="img" class="h-16 w-16 object-cover rounded border">
                <button type="button" @click="removeImage(field.key, idx)" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">&times;</button>
              </div>
            </div>
          </template>
          
          <template v-else>
            <input :type="field.type || 'text'" v-model="form[field.key]" class="border rounded-lg p-2 text-sm">
          </template>
        </div>
        
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button type="button" @click="showModal = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">取消</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">{{ form.id ? '保存修改' : '确认添加' }}</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
const { createApp } = Vue;

createApp({
  data() {
    return {
      table: '${table}',
      items: [],
      columns: ${JSON.stringify(schema.columns)},
      formSchema: ${JSON.stringify(schema.form)},
      showModal: false,
      form: {}
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      const res = await fetch('/admin/api/' + this.table);
      this.items = await res.json();
    },
    openAddModal() {
      this.form = {};
      // Initialize json arrays
      this.formSchema.forEach(f => {
        if (f.type === 'image') this.form[f.key] = '[]';
      });
      this.showModal = true;
    },
    openEditModal(item) {
      this.form = { ...item };
      this.showModal = true;
    },
    async saveItem() {
      const method = this.form.id ? 'PUT' : 'POST';
      const url = '/admin/api/' + this.table + (this.form.id ? '/' + this.form.id : '');
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.form)
      });
      
      if(res.ok) {
        this.showModal = false;
        this.fetchData();
      } else {
        alert('保存失败');
      }
    },
    async deleteItem(id) {
      if(!confirm('确定要删除吗？')) return;
      await fetch('/admin/api/' + this.table + '/' + id, { method: 'DELETE' });
      this.fetchData();
    },
    async toggleFeatured(item) {
      item.is_featured = item.is_featured ? 0 : 1;
      await fetch('/admin/api/' + this.table + '/' + item.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: item.is_featured })
      });
      this.fetchData(); // Sort order might change if we sort by it
    },
    async updateSort(item) {
      await fetch('/admin/api/' + this.table + '/' + item.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: parseInt(item.sort_order) || 0 })
      });
      this.fetchData();
    },
    async handleImageUpload(e, key) {
      const file = e.target.files[0];
      if(!file) return;
      
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 800;
          let width = img.width;
          let height = img.height;
          if (width > height && width > max_size) {
            height *= max_size / width;
            width = max_size;
          } else if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/webp', 0.8);
          
          let currentImages = [];
          try { currentImages = JSON.parse(this.form[key] || '[]'); } catch(e){}
          currentImages.push(base64);
          this.form[key] = JSON.stringify(currentImages);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input
    },
    removeImage(key, idx) {
      let currentImages = [];
      try { currentImages = JSON.parse(this.form[key] || '[]'); } catch(e){}
      currentImages.splice(idx, 1);
      this.form[key] = JSON.stringify(currentImages);
    }
  }
}).mount('#crud-app');
</script>
`
