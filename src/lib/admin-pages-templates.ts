export const blogListTemplate = `
<div id="blog-list">
  <div class="flex items-center justify-between mb-6">
    <h2 class="font-bold text-gray-800">博客管理 ({{ items.length }})</h2>
    <a href="/admin/blogs/edit/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
      + 添加博客
    </a>
  </div>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <table class="w-full text-sm text-left">
      <thead class="bg-gray-50 border-b border-gray-100">
        <tr>
          <th class="px-4 py-3 text-gray-600 font-medium">封面</th>
          <th class="px-4 py-3 text-gray-600 font-medium">标题</th>
          <th class="px-4 py-3 text-gray-600 font-medium">作者</th>
          <th class="px-4 py-3 text-gray-600 font-medium">浏览量</th>
          <th class="px-4 py-3 text-gray-600 font-medium">发布状态</th>
          <th class="px-4 py-3 text-gray-600 font-medium">操作</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
          <td class="px-4 py-3">
            <img v-if="item.cover_image && JSON.parse(item.cover_image)[0]" :src="JSON.parse(item.cover_image)[0]" class="h-10 w-16 object-cover rounded border" />
            <div v-else class="h-10 w-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 border">无</div>
          </td>
          <td class="px-4 py-3 font-medium text-gray-800">{{ item.title_zh }}</td>
          <td class="px-4 py-3 text-gray-600">{{ item.author || '-' }}</td>
          <td class="px-4 py-3 text-gray-600">{{ item.view_count }}</td>
          <td class="px-4 py-3">
            <span :class="item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'" class="px-2 py-1 rounded-full text-xs">
              {{ item.is_published ? '已发布' : '草稿' }}
            </span>
          </td>
          <td class="px-4 py-3 flex gap-2">
            <a :href="'/admin/blogs/edit/' + item.id" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">编辑</a>
            <button @click="deleteItem(item.id)" class="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">删除</button>
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
        const res = await fetch('/admin/api/blogs');
        this.items = await res.json();
      },
      async deleteItem(id) {
        if(!confirm('确定要删除此博客吗？')) return;
        await fetch('/admin/api/blogs/' + id, { method: 'DELETE' });
        this.fetchData();
      }
    }
  }).mount('#blog-list');
</script>
`;

export const pageListTemplate = `
<div id="page-list">
  <div class="flex items-center justify-between mb-6">
    <h2 class="font-bold text-gray-800">固定单页管理</h2>
    <span class="text-sm text-gray-500">固定页面不支持删除和新增</span>
  </div>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <table class="w-full text-sm text-left">
      <thead class="bg-gray-50 border-b border-gray-100">
        <tr>
          <th class="px-4 py-3 text-gray-600 font-medium">标识 (Slug)</th>
          <th class="px-4 py-3 text-gray-600 font-medium">页面名称 (中)</th>
          <th class="px-4 py-3 text-gray-600 font-medium">页面名称 (英)</th>
          <th class="px-4 py-3 text-gray-600 font-medium">最近更新</th>
          <th class="px-4 py-3 text-gray-600 font-medium">操作</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
          <td class="px-4 py-3 font-mono text-gray-500">{{ item.slug }}</td>
          <td class="px-4 py-3 font-medium text-gray-800">{{ item.title_zh }}</td>
          <td class="px-4 py-3 text-gray-600">{{ item.title_en }}</td>
          <td class="px-4 py-3 text-gray-500">{{ new Date(item.updated_at).toLocaleString() }}</td>
          <td class="px-4 py-3">
            <a :href="'/admin/pages/edit/' + item.id" class="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 font-medium">编辑内容</a>
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
        const res = await fetch('/admin/api/pages');
        this.items = await res.json();
      }
    }
  }).mount('#page-list');
</script>
`;

export const richEditTemplate = (table: string, id: string) => `
<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
<script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
<div id="edit-app" class="pb-20">
  <div class="flex items-center justify-between mb-6">
    <h2 class="font-bold text-gray-800 text-xl">{{ isNew ? '添加' : '编辑' }}{{ table === 'blogs' ? '博客' : '单页' }}</h2>
    <div class="flex gap-3">
      <a href="/admin/\${table}" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">返回列表</a>
      <button @click="save" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors">保存修改</button>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
    <!-- Common fields -->
    <div v-if="table === 'pages'" class="grid grid-cols-1 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">页面标识 (Slug) <span class="text-red-500">*固定不可改</span></label>
        <input type="text" v-model="form.slug" disabled class="w-full border rounded-lg p-2.5 bg-gray-50 text-gray-500 font-mono">
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">标题 (中文) <span class="text-red-500">*</span></label>
        <input type="text" v-model="form.title_zh" class="w-full border rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow" placeholder="输入中文标题">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">标题 (英文) <span class="text-red-500">*</span></label>
        <input type="text" v-model="form.title_en" class="w-full border rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow" placeholder="Enter English title">
      </div>
    </div>

    <template v-if="table === 'blogs'">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">作者</label>
          <input type="text" v-model="form.author" class="w-full border rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow" placeholder="默认: Watu">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">排序 (数字越大越靠前)</label>
          <input type="number" v-model="form.sort_order" class="w-full border rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">是否发布</label>
          <select v-model="form.is_published" class="w-full border rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow">
            <option :value="1">已发布 (公开可见)</option>
            <option :value="0">草稿 (仅后台可见)</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">摘要 (中文)</label>
          <textarea v-model="form.summary_zh" rows="3" class="w-full border rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow" placeholder="文章列表显示的简短描述..."></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">摘要 (英文)</label>
          <textarea v-model="form.summary_en" rows="3" class="w-full border rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow" placeholder="Short description for the list..."></textarea>
        </div>
      </div>

      <!-- Cover Image Upload -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">上传封面/组图 (支持单图或多图选择)</label>
        <div class="mt-1 flex items-center">
          <label class="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
            <i class="fas fa-cloud-upload-alt mr-2"></i> 选择图片
            <input type="file" multiple accept="image/*" @change="handleImageUpload" class="hidden">
          </label>
          <span class="ml-3 text-xs text-gray-400">第一张图将作为主封面展示</span>
        </div>
        <div class="mt-4 flex flex-wrap gap-4" v-if="imageList.length > 0">
          <div v-for="(img, idx) in imageList" :key="idx" class="relative group">
            <img :src="img" class="h-32 w-48 object-cover rounded-lg border border-gray-200 shadow-sm">
            <div class="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button @click="removeImage(idx)" class="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors">
                <i class="fas fa-trash-alt text-sm"></i>
              </button>
            </div>
            <span v-if="idx===0" class="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded shadow">主封面</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Rich Text Editors -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <span class="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> 正文内容 (中文)
        </label>
        <div class="border rounded-xl overflow-hidden shadow-sm">
          <div ref="quillZh" class="h-[500px] bg-white"></div>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <span class="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span> 正文内容 (英文)
        </label>
        <div class="border rounded-xl overflow-hidden shadow-sm">
          <div ref="quillEn" class="h-[500px] bg-white"></div>
        </div>
      </div>
    </div>

  </div>
</div>

<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
  const { createApp } = Vue;
  createApp({
    data() {
      return {
        table: '\${table}',
        id: '\${id}',
        isNew: '\${id}' === 'new',
        form: {
          title_zh: '', title_en: '',
          content_zh: '', content_en: '',
          author: '', summary_zh: '', summary_en: '', cover_image: '[]',
          sort_order: 0, is_published: 1, slug: ''
        },
        quillZh: null,
        quillEn: null
      }
    },
    computed: {
      imageList() {
        try { return JSON.parse(this.form.cover_image || '[]'); } 
        catch { return []; }
      }
    },
    mounted() {
      const toolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ];
      
      this.quillZh = new Quill(this.$refs.quillZh, { theme: 'snow', modules: { toolbar: toolbarOptions } });
      this.quillEn = new Quill(this.$refs.quillEn, { theme: 'snow', modules: { toolbar: toolbarOptions } });
      
      this.quillZh.on('text-change', () => { this.form.content_zh = this.quillZh.root.innerHTML; });
      this.quillEn.on('text-change', () => { this.form.content_en = this.quillEn.root.innerHTML; });

      // Override Quill image handler to inject base64 directly (simplest robust approach)
      const imageHandler = (quillEditor) => () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        input.onchange = () => {
          const file = input.files[0];
          if (/^image\\//.test(file.type)) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const range = quillEditor.getSelection();
              quillEditor.insertEmbed(range.index, 'image', e.target.result);
            };
            reader.readAsDataURL(file);
          }
        };
      };

      this.quillZh.getModule('toolbar').addHandler('image', imageHandler(this.quillZh));
      this.quillEn.getModule('toolbar').addHandler('image', imageHandler(this.quillEn));

      if (!this.isNew) {
        this.fetchData();
      }
    },
    methods: {
      async fetchData() {
        const res = await fetch('/admin/api/' + this.table + '/' + this.id);
        if (res.ok) {
          const data = await res.json();
          this.form = { ...this.form, ...data };
          if (this.form.content_zh) Object.getPrototypeOf(this.quillZh).clipboard.dangerouslyPasteHTML.call(this.quillZh, this.form.content_zh);
          if (this.form.content_en) Object.getPrototypeOf(this.quillEn).clipboard.dangerouslyPasteHTML.call(this.quillEn, this.form.content_en);
        }
      },
      async save() {
        if (!this.form.title_zh || !this.form.title_en) {
          alert('请填写中英文标题'); return;
        }
        // Force sync contents
        this.form.content_zh = this.quillZh.root.innerHTML;
        this.form.content_en = this.quillEn.root.innerHTML;
        
        const method = this.isNew ? 'POST' : 'PUT';
        const url = '/admin/api/' + this.table + (this.isNew ? '' : '/' + this.id);
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });
        if (res.ok) {
          alert('保存成功！');
          window.location.href = '/admin/' + this.table;
        } else {
          alert('保存失败，请检查网络或日志。');
        }
      },
      handleImageUpload(e) {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        
        const compressAndAdd = (file) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const max_size = 1200;
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
              
              let arr = [...this.imageList];
              arr.push(base64);
              this.form.cover_image = JSON.stringify(arr);
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(file);
        };

        files.forEach(compressAndAdd);
        e.target.value = '';
      },
      removeImage(idx) {
        let arr = [...this.imageList];
        arr.splice(idx, 1);
        this.form.cover_image = JSON.stringify(arr);
      }
    }
  }).mount('#edit-app');
</script>
<style>
  .ql-editor { font-size: 15px; line-height: 1.6; color: #374151; padding: 1.5rem; }
  .ql-toolbar { border-color: #f3f4f6 !important; background: #f9fafb; padding: 12px 8px !important; }
  .ql-container { border-color: #f3f4f6 !important; font-family: inherit; }
  .ql-editor img { border-radius: 0.5rem; max-width: 100%; margin: 1rem 0; }
</style>
`;
