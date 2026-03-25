const fs = require('fs');

let file = fs.readFileSync('src/index.tsx', 'utf8');

file = file.replace(/import { authRoute } from '\.\/routes\/auth'/g, 
  "import { authRoute } from './routes/auth'\nimport { userRoute } from './routes/user'");

file = file.replace(/app\.route\('\/api\/auth', authRoute\)/g, 
  "app.route('/api/auth', authRoute)\napp.route('/user', userRoute)");

fs.writeFileSync('src/index.tsx', file);
console.log("Patched index.tsx for user route");
