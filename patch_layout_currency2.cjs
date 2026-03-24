const fs = require('fs');
let code = fs.readFileSync('src/lib/layout.ts', 'utf8');

// Update getLayout signature
code = code.replace(
  `export const getLayout = (lang: 'zh' | 'en', title: string, content: string, currentPath: string = '/') => {`,
  `export const getLayout = (lang: 'zh' | 'en', title: string, content: string, currentPath: string = '/', currency: 'GBP' | 'CNY' = 'GBP') => {`
);

// Add currency switcher HTML
const currencyHtml = `
        <!-- Currency Switch -->
        <div class="relative group cursor-pointer">
          <div class="flex items-center space-x-1 px-3 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors" onclick="document.cookie='currency=' + (document.cookie.includes('currency=GBP') || !document.cookie.includes('currency=') ? 'CNY' : 'GBP') + '; path=/; max-age=31536000'; window.location.reload();">
            <i class="fas fa-pound-sign text-xs" style="display: \${currency === 'GBP' ? 'inline-block' : 'none'}"></i>
            <i class="fas fa-yen-sign text-xs" style="display: \${currency === 'CNY' ? 'inline-block' : 'none'}"></i>
            <span>\${currency}</span>
          </div>
        </div>
`;

code = code.replace(
  `<!-- Language Switch -->`,
  currencyHtml + `\n        <!-- Language Switch -->`
);

fs.writeFileSync('src/lib/layout.ts', code);
console.log("Layout patched with currency switcher");
