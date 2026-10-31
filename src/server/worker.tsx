import { renderToString } from 'preact-render-to-string';
import { H3 } from 'h3';
import { App } from '../app';
import { createStore, StoreContext, type Bootstrap } from '../model';
import { defaultDesign } from '../catalog';
import { createApi, type Env } from './api';
import { sessionUser } from './auth';
declare const __CLIENT_ASSETS__: {file:string;css?:string[]};
// Load the official Aizhan tracker only on the production domain.
const analyticsScript = `<script>
  var _mtj = _mtj || [];
  (function () {
    var mtj = document.createElement("script");
    mtj.async = true;
    mtj.src = "https://node90.aizhantj.com:21233/tjjs/?k=dmruox4cjno";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(mtj, s);
  })();
</script>`;
const escapeJSON=(x:unknown)=>JSON.stringify(x).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
export function createApp(env:Env){const app=new H3();app.all('/api/**',event=>createApi(env).fetch(event.req as Request));
const page=async(request:Request,id?:string)=>{let design=defaultDesign();if(id){const row=await env.DB.prepare('SELECT data FROM designs WHERE id=?').bind(id).first<{data:string}>();if(!row)return new Response('设计不存在或已删除',{status:404,headers:{'Content-Type':'text/plain; charset=utf-8'}});design=JSON.parse(row.data);}
const bootstrap:Bootstrap={design,user:await sessionUser(env.DB,request),shared:!!id};const store=createStore(bootstrap);const content=renderToString(<StoreContext.Provider value={store}><App/></StoreContext.Provider>);const assets=__CLIENT_ASSETS__;
return new Response(`<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f7f6f2"><title>珠间 · Bead Studio</title><meta name="description" content="在线设计、保存与定制你的专属手串。"><link rel="icon" href="/favicon.svg">${(assets.css||[]).map(p=>`<link rel="stylesheet" href="/${p}">`).join('')}</head><body><div id="app">${content}</div><script type="application/json" id="bootstrap">${escapeJSON(bootstrap)}</script><script type="module" src="/${assets.file}"></script>${new URL(request.url).hostname==='beads.bool.win'?analyticsScript:''}</body></html>`,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY'}});};
app.get('/',e=>page(e.req as Request));app.get('/design/:id',e=>page(e.req as Request,e.context.params!.id));app.all('/**',()=>new Response('页面不存在',{status:404}));return app;}
export default {async fetch(request:Request,env:Env){const url=new URL(request.url);if(url.pathname.startsWith('/assets/')||url.pathname==='/favicon.svg')return env.ASSETS?env.ASSETS.fetch(request):new Response('Not found',{status:404});return createApp(env).fetch(request);}};
