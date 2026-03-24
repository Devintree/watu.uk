const fs = require('fs');
let code = fs.readFileSync('src/lib/i18n.ts', 'utf8');

if (!code.includes("export function getCurrency(c: any): 'GBP' | 'CNY' {")) {
  code += `
export function getCurrency(c: any): 'GBP' | 'CNY' {
  const currencyCookie = c.req.raw?.headers?.get('cookie')?.match(/currency=([^;]+)/)?.[1]
  const currencyQuery = c.req.query?.('currency')
  const currency = (currencyQuery || currencyCookie || 'GBP').toUpperCase()
  return (currency === 'CNY' ? 'CNY' : 'GBP') as 'GBP' | 'CNY'
}
`;
  fs.writeFileSync('src/lib/i18n.ts', code);
  console.log("Added getCurrency to i18n");
}
