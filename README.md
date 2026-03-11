# 英英 YingYing UK - 英国华人服务平台

## 项目概述
专为华人打造的英国综合服务平台，提供酒店预订、租房代办、中文导游、游学接待四大服务。

**定位**：在英国专注服务华人的一站式服务平台，覆盖来英游客和在英华人。

---

## 🌐 访问地址
- **开发环境**: http://localhost:3000
- **管理后台**: http://localhost:3000/admin （默认密码: `admin123`）

---

## ✅ 已完成功能

### 前台功能
| 功能 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 英雄区、四大服务、精选展示、城市导航 |
| 酒店列表 | `/hotels` | 按城市筛选、卡片展示、评分 |
| 酒店详情 | `/hotels/:id` | 图片画廊、设施、在线预订、评价 |
| 租房列表 | `/rentals` | 房源展示、房型筛选 |
| 租房详情 | `/rentals/:id` | 详细信息、咨询表单 |
| 导游列表 | `/guides` | 导游卡片、城市筛选 |
| 导游详情 | `/guides/:id` | 简介、套餐、预约功能 |
| 游学列表 | `/study-tours` | 项目卡片、亮点展示 |
| 游学详情 | `/study-tours/:id` | 行程安排、报名流程 |
| 联系我们 | `/contact` | 联系方式、留言表单 |
| 支付成功 | `/payment/success` | 订单确认页 |
| 支付取消 | `/payment/cancel` | 取消/重试页 |

### 多语言
- 支持中文（默认）和英文切换
- URL参数：`?lang=zh` 或 `?lang=en`
- 所有内容双语化：标题、描述、按钮、提示

### 在线预订流程
1. 用户选择服务 → 点击"立即预订"
2. 弹出预订表单（姓名/邮箱/日期/人数）
3. 调用 `/api/orders` 创建订单
4. 如已配置 Stripe → 跳转至 Stripe Checkout
5. 支付完成 → 返回 `/payment/success`

### 管理后台
| 功能 | 路径 |
|------|------|
| 数据概览 | `/admin` |
| 订单管理 | `/admin/orders` |
| 咨询管理 | `/admin/inquiries` |
| 酒店管理 | `/admin/hotels` |
| 租房管理 | `/admin/rentals` |
| 导游管理 | `/admin/guides` |
| 游学管理 | `/admin/study-tours` |

---

## 🗄️ 数据架构

### 存储服务
- **Cloudflare D1** - 主数据库（SQLite）

### 数据模型
| 表名 | 说明 |
|------|------|
| `hotels` | 酒店/住宿信息 |
| `rentals` | 租房房源 |
| `guides` | 导游信息 |
| `guide_packages` | 导游套餐 |
| `study_tours` | 游学项目 |
| `orders` | 订单（通用） |
| `inquiries` | 咨询/询盘 |
| `reviews` | 用户评价 |
| `settings` | 网站配置 |

---

## 💰 支付集成 (Stripe)

### 配置方式
在 `.dev.vars` 中添加：
```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
SITE_URL=https://your-domain.com
ADMIN_PASSWORD=your-admin-password
```

### Stripe Webhook
配置 webhook 端点：`/api/webhooks/stripe`
监听事件：`checkout.session.completed`

---

## 🚀 部署说明

### 本地开发
```bash
# 安装依赖
npm install

# 初始化本地数据库
npm run db:migrate:local
npm run db:seed

# 构建
npm run build

# 启动（PM2）
pm2 start ecosystem.config.cjs

# 或直接
npm run dev:sandbox
```

### Cloudflare Pages 部署
```bash
# 配置 API Key
setup_cloudflare_api_key

# 创建 D1 数据库
npx wrangler d1 create webapp-production

# 更新 wrangler.jsonc 中的 database_id

# 部署
npm run deploy:prod

# 生产数据库迁移
npm run db:migrate:prod
```

---

## 🛠️ 技术栈
- **框架**: Hono v4
- **运行时**: Cloudflare Workers/Pages
- **数据库**: Cloudflare D1 (SQLite)
- **支付**: Stripe Checkout
- **样式**: TailwindCSS (CDN)
- **图标**: Font Awesome
- **构建**: Vite + @hono/vite-build

---

## 📋 待开发功能
- [ ] 用户注册/登录系统
- [ ] 用户个人中心（订单历史）
- [ ] 微信支付集成
- [ ] 评价系统前台
- [ ] 邮件通知（预订确认）
- [ ] 高级搜索（日期、价格范围）
- [ ] 图片上传（R2存储）
- [ ] 博客/资讯模块
- [ ] 站内消息系统

---

## 📞 联系信息
- **邮箱**: hello@yingying.uk
- **微信**: YingYingUK
- **电话**: +44 7700 900000
- **地址**: London, UK

---

*© 2026 英英 YingYing UK. 版权所有*
