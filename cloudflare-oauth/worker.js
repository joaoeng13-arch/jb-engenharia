/**
 * CÓPIA DE REFERÊNCIA do Cloudflare Worker de autenticação já configurado.
 * Não é necessário atualizar o Worker ao instalar a nova versão do site.
 * Caso precise reimplantar no futuro, informe GITHUB_CLIENT_ID (text)
 * e GITHUB_CLIENT_SECRET (Secret) em Settings > Variables and Secrets.
 * Callback cadastrado no GitHub: https://jb-engenharia-oauth.jb-engenharia2018.workers.dev/callback
 */
const SITE_ORIGIN = 'https://jbengenharia.app';
const enc = new TextEncoder();
const randomString = () => Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
async function sign(value,secret){
  const k=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const b=await crypto.subtle.sign('HMAC',k,enc.encode(value));
  return Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
}
const clearCookie='__Host-jb_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';
function html(body,status=200){return new Response(body,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",'Set-Cookie':clearCookie}})}
function callbackPage(token){
  const message='authorization:github:success:'+JSON.stringify({token,provider:'github'});
  // JSON.stringify escape prevents the token from being interpreted as HTML/script.
  const jsMessage=JSON.stringify(message).replace(/</g,'\\u003c');
  return html(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>JB Engenharia - Autenticação</title><style>body{background:#111;color:#fff;font:16px system-ui;display:grid;place-items:center;min-height:90vh;margin:0}main{text-align:center}small{color:#aaa}</style></head><body><main><h2>JB Engenharia</h2><p>Concluindo autenticação...</p><small>Esta janela será fechada após o login.</small></main><script>(function(){const target=${JSON.stringify(SITE_ORIGIN)};const message=${jsMessage};let sent=false;function send(){if(window.opener){window.opener.postMessage(message,target);sent=true;}}window.addEventListener('message',e=>{if(e.origin===target&&e.source===window.opener&&e.data==='authorizing:github')send()});if(window.opener){window.opener.postMessage('authorizing:github',target)}setTimeout(()=>{if(!sent)send()},450);setTimeout(()=>window.close(),5000)})();</script></body></html>`);
}
export default {async fetch(request,env){
  const url=new URL(request.url);
  if(!env.GITHUB_CLIENT_ID||!env.GITHUB_CLIENT_SECRET)return new Response('Credenciais OAuth ausentes',{status:503});
  if(url.pathname==='/auth'){
    const state=randomString(),sig=await sign(state,env.GITHUB_CLIENT_SECRET);
    const target=new URL('https://github.com/login/oauth/authorize');
    target.searchParams.set('client_id',env.GITHUB_CLIENT_ID);
    target.searchParams.set('redirect_uri',url.origin+'/callback');
    target.searchParams.set('scope','repo');
    target.searchParams.set('state',state);
    return new Response(null,{status:302,headers:{Location:target.href,'Set-Cookie':`__Host-jb_oauth_state=${state}.${sig}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,'Cache-Control':'no-store'}});
  }
  if(url.pathname==='/callback'){
    if(url.searchParams.has('error'))return html('<p>Autorização não concluída.</p>',403);
    const code=url.searchParams.get('code'),state=url.searchParams.get('state');
    const cookie=request.headers.get('Cookie')||'';
    const saved=cookie.match(/(?:^|;\s*)__Host-jb_oauth_state=([^;]+)/);
    if(!code||!state||!saved)return html('<p>Solicitação de autenticação inválida.</p>',400);
    const expected=state+'.'+await sign(state,env.GITHUB_CLIENT_SECRET);
    // Comparação de comprimento constante para o cookie assinado.
    const a=enc.encode(saved[1]),b=enc.encode(expected);let diff=a.length^b.length;
    for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a[i]||0)^(b[i]||0);
    if(diff)return html('<p>Estado OAuth inválido.</p>',403);
    let result;
    try{
      const response=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,code,redirect_uri:url.origin+'/callback'})});
      result=response.ok?await response.json():{};
    }catch{return html('<p>Falha de comunicação com o GitHub.</p>',502)}
    if(!result.access_token)return html('<p>Falha ao obter acesso ao GitHub.</p>',502);
    return callbackPage(result.access_token);
  }
  return new Response('JB Engenharia OAuth ativo.',{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
}};
