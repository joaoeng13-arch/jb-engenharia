/** JB Engenharia - OAuth proxy for Decap CMS, deploy as Cloudflare Worker.
 * Configure GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SITE_ORIGIN.
 * Never store credentials in this file or in the Git repository.
 */
const json = (data, status=200) => new Response(JSON.stringify(data), {status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const esc = (s) => JSON.stringify(s).replace(/</g,'\\u003c');
function b64(bytes) {return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function unb64(s) {return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}
async function sign(key, message) {
 const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return b64(new Uint8Array(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(message))));
}
function html(body,status=200) {return new Response(body,{status,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','content-security-policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; referrer-policy: no-referrer"}});}
export default {async fetch(request,env) {
 const url=new URL(request.url);
 const origin=env.SITE_ORIGIN;
 if(!env.GITHUB_CLIENT_ID||!env.GITHUB_CLIENT_SECRET||!env.STATE_SECRET||!origin) return json({error:'Worker ainda não configurado'},503);
 if(!/^https:\/\/[^/]+$/.test(origin)) return json({error:'SITE_ORIGIN inválido'},500);
 if(url.pathname==='/auth') {
   const nonce=b64(crypto.getRandomValues(new Uint8Array(24)));
   const payload=b64(new TextEncoder().encode(JSON.stringify({nonce,exp:Date.now()+600000})));
   const state=payload+'.'+await sign(env.STATE_SECRET,payload);
   const github=new URL('https://github.com/login/oauth/authorize');
   github.searchParams.set('client_id',env.GITHUB_CLIENT_ID);
   github.searchParams.set('redirect_uri',url.origin+'/callback');
   github.searchParams.set('scope','repo');
   github.searchParams.set('state',state);
   return Response.redirect(github.toString(),302);
 }
 if(url.pathname==='/callback') {
   const state=url.searchParams.get('state')||'';
   const parts=state.split('.');
   if(parts.length!==2 || (await sign(env.STATE_SECRET,parts[0]))!==parts[1]) return html('Estado OAuth inválido',400);
   let payload;try{payload=JSON.parse(new TextDecoder().decode(unb64(parts[0])));}catch{return html('Estado inválido',400)}
   if(typeof payload.exp!=='number'||Date.now()>payload.exp) return html('Autorização expirada',400);
   if(url.searchParams.has('error')) return html('Autorização recusada. Feche esta janela e tente novamente.',403);
   const code=url.searchParams.get('code');if(!code)return html('Código OAuth ausente',400);
   const res=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify({client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,code,redirect_uri:url.origin+'/callback',state})});
   if(!res.ok)return html('Erro na troca do código OAuth',502);
   const token=await res.json();if(!token.access_token)return html('GitHub não forneceu token',403);
   const message='authorization:github:success:'+JSON.stringify({token:token.access_token,provider:'github'});
   // The opener is the Decap CMS page. Restrict postMessage to the configured site origin.
   return html(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Autorização JB Engenharia</title><body><p>Autorização concluída. Esta janela pode ser fechada.</p><script>if(window.opener){window.opener.postMessage(${esc(message)},${esc(origin)});setTimeout(()=>window.close(),800);}</script></body></html>`);
 }
 return json({message:'JB Engenharia OAuth - utilize /auth'});
}};
