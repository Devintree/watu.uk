const fs = require('fs');

let file = fs.readFileSync('src/routes/admin.ts', 'utf8');

file = file.replace(/{href: '\/admin\/pages', icon: '📄', label: '单页管理', key: 'pages'}/g, 
  "{href: '/admin/pages', icon: '📄', label: '单页管理', key: 'pages'},\n    {href: '/admin/settings', icon: '⚙️', label: '系统设置', key: 'settings'}");

// Inject the settings route
const settingsRoute = `
adminRoute.get('/settings', (c) => {
  const content = \`
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">系统设置</h2>
      <p class="text-gray-500 text-sm mt-1">配置邮件通知及其他全局参数</p>
    </div>
    
    <div id="settings-app" class="bg-white rounded-lg shadow p-6 max-w-2xl">
      <h3 class="text-lg font-semibold border-b pb-2 mb-4"><i class="fas fa-envelope mr-2 text-gray-500"></i>邮件发送设置 (Resend API)</h3>
      <p class="text-sm text-gray-500 mb-6">配置此项后，系统将在订单状态变更时自动向用户发送邮件通知。前往 <a href="https://resend.com" target="_blank" class="text-blue-500 hover:underline">Resend.com</a> 申请 API Key。</p>
      
      <div v-if="loading" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> 加载中...</div>
      <form v-else @submit.prevent="saveSettings" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Resend API Key</label>
          <input type="password" v-model="form.resend_api_key" placeholder="re_..." class="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">发件人邮箱 (Sender Email)</label>
          <input type="email" v-model="form.sender_email" placeholder="noreply@yourdomain.com" class="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div class="pt-4">
          <button type="submit" :disabled="saving" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i> {{ saving ? '保存中...' : '保存设置' }}
          </button>
        </div>
      </form>
    </div>
    
    <script>
      const { createApp, ref, onMounted } = Vue
      createApp({
        setup() {
          const loading = ref(true)
          const saving = ref(false)
          const form = ref({
            resend_api_key: '',
            sender_email: ''
          })
          
          const loadSettings = async () => {
            try {
              const res = await fetch('/admin/api/settings/email')
              const data = await res.json()
              if (data.success && data.data) {
                form.value = {
                  resend_api_key: data.data.resend_api_key || '',
                  sender_email: data.data.sender_email || ''
                }
              }
            } catch (e) {
              console.error(e)
            } finally {
              loading.value = false
            }
          }
          
          const saveSettings = async () => {
            saving.value = true
            try {
              const res = await fetch('/admin/api/settings/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form.value)
              })
              const data = await res.json()
              if (data.success) {
                alert('设置保存成功')
              } else {
                alert('保存失败')
              }
            } catch (e) {
              alert('请求出错')
            } finally {
              saving.value = false
            }
          }
          
          onMounted(loadSettings)
          
          return { loading, saving, form, saveSettings }
        }
      }).mount('#settings-app')
    </script>
  \`
  return c.html(adminLayout('系统设置', content, 'settings'))
})
`

file = file.replace(/export { adminRoute }/, settingsRoute + "\nexport { adminRoute }");

fs.writeFileSync('src/routes/admin.ts', file);
console.log("Patched admin.ts for settings UI");
