const fs = require('fs');
let file = fs.readFileSync('src/routes/admin-api.ts', 'utf8');

file = file.replace(/import { Hono } from 'hono'/g, 
  "import { Hono } from 'hono'\nimport { adminSettingsRoute } from './admin-settings'");

file = file.replace(/const adminApi = new Hono<\{ Bindings: Bindings \}>\(\)/g, 
  "const adminApi = new Hono<{ Bindings: Bindings }>()\nadminApi.route('/settings', adminSettingsRoute)");

fs.writeFileSync('src/routes/admin-api.ts', file);
console.log("Patched admin-api.ts for settings route");
