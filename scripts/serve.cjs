const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../dist');
const port=Number(process.argv[process.argv.indexOf('--port')+1])||4175;
if (!fs.existsSync(path.join(root,'index.html'))) throw new Error('Run npm run build first.');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.pdf':'application/pdf'};
http.createServer((request,response)=>{
  let pathname;
  try { pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname); } catch { response.writeHead(400);response.end('Bad request');return; }
  if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405);response.end('Method not allowed');return; }
  let file=path.resolve(root,'.'+pathname);
  if (!file.startsWith(root+path.sep) && file!==root) { response.writeHead(403);response.end('Forbidden');return; }
  if (pathname.endsWith('/')) file=path.join(file,'index.html');
  let status=200;
  if(!fs.existsSync(file) && !path.extname(file) && fs.existsSync(file+'.html')) file+='.html';
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()) { status=404;file=path.join(root,'404.html'); }
  const data=fs.readFileSync(file);
  response.writeHead(status,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':data.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self'; frame-src 'none'; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'none'"});
  response.end(request.method==='HEAD'?undefined:data);
}).listen(port,'127.0.0.1',()=>console.log(`Right Away Lending preview: http://127.0.0.1:${port}`));
