const fs = require('fs');

let file = fs.readFileSync('src/index.tsx', 'utf8');

file = file.replace(/import apiRoute from '\.\/routes\/api'/g, 
  "import apiRoute from './routes/api'\nimport { authRoute } from './routes/auth'");

file = file.replace(/app\.route\('\/api', apiRoute\)/g, 
  "app.route('/api', apiRoute)\napp.route('/api/auth', authRoute)");

fs.writeFileSync('src/index.tsx', file);
console.log("Patched index.tsx for auth");
