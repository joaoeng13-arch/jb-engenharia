/**
 * JB ENGENHARIA — Build estático para Cloudflare Pages.
 * Executar: node scripts/build-obras.js
 * - Converte obras/*.json (Decap CMS) em data/obras.json, mantendo registros antigos.
 * - Respeita a opção de publicação e preserva várias imagens, textos e informações.
 * - Atualiza metadados SEO no HTML com os valores editados no Decap CMS.
 * Não precisa de npm install ou bibliotecas externas.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const obrasDir = path.join(root, 'obras');
const output = path.join(root, 'data', 'obras.json');
const pathOf = name => path.join(root, name);
const str = (v, fallback = '') => typeof v === 'string' ? v.trim() : fallback;
const number = v => v === '' || v === undefined || v === null ? null : (Number.isFinite(Number(v)) ? Number(v) : null);
const validImage = src => /^https:\/\//.test(src) || (src.startsWith('/') && !src.startsWith('//'));
function imagePath(value) { const s = str(value); if (!s) return ''; if (validImage(s)) return s; if (s.startsWith('assets/')) return '/' + s; return ''; }
const files = fs.existsSync(obrasDir) ? fs.readdirSync(obrasDir).filter(f => f.toLowerCase().endsWith('.json')).sort() : [];
const works = [];
for (const file of files) {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(obrasDir, file), 'utf8'));
    if (!raw || !str(raw.title)) throw new Error('Campo title ausente');
    if (raw.published === false || raw.visible === false) continue;
    const gallery = (Array.isArray(raw.gallery) ? raw.gallery : []).map(photo => {
      const src = imagePath(typeof photo === 'string' ? photo : photo?.image || photo?.photo);
      return src ? { image: src, caption: str(typeof photo === 'object' ? photo?.caption : '') } : null;
    }).filter(Boolean);
    works.push({
      title: str(raw.title),
      category: str(raw.category, 'Engenharia'),
      status: str(raw.status, 'Obra'),
      location: str(raw.location, 'Local não informado'),
      image: imagePath(raw.image) || '/assets/obra-placeholder.svg',
      description: str(raw.description),
      short_description: str(raw.short_description),
      full_description: str(raw.full_description),
      gallery,
      area: number(raw.area),
      start_date: str(raw.start_date),
      end_date: str(raw.end_date),
      services_done: str(raw.services_done),
      video_url: str(raw.video_url),
      featured: Boolean(raw.featured),
      published: true,
      order: number(raw.order) ?? 50
    });
  } catch (error) { console.warn(`Obra ignorada (${file}): ${error.message}`); }
}
works.sort((a,b) => Number(b.featured) - Number(a.featured) || a.order - b.order || b.start_date.localeCompare(a.start_date));
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(works,null,2) + '\n','utf8');
console.log(`[JB Engenharia] ${works.length} obra(s) publicadas; ${files.length} arquivo(s) encontrado(s).`);

// Atualizar metadados HTML do site com os campos do painel: redes sociais/Google.
// Renderizar metadados durante o build evita depender de JavaScript nos compartilhamentos.
const seoFile = pathOf('data/aparencia.json');
const htmlFile = pathOf('index.html');
if (fs.existsSync(seoFile) && fs.existsSync(htmlFile)) {
  try {
    const seo = JSON.parse(fs.readFileSync(seoFile,'utf8'));
    const esc = s => String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
    let html = fs.readFileSync(htmlFile,'utf8');
    function meta(key,value) {
      if (!str(value)) return;
      const attr = key.startsWith('og:') ? 'property' : 'name';
      const pat = new RegExp(`<meta ${attr}="${key}" content="[^"]*">`, 'i');
      const tag = `<meta ${attr}="${key}" content="${esc(value)}">`;
      html = pat.test(html) ? html.replace(pat,tag) : html.replace('</head>',`  ${tag}\n</head>`);
    }
    const site='https://jbengenharia.app';
    meta('description',seo.seo_description);
    meta('og:description',seo.seo_description);
    meta('og:title',seo.browser_title);
    const og=str(seo.og_image);if(og)meta('og:image',og.startsWith('/')?site+og:og);
    if(str(seo.browser_title)) html=html.replace(/<title>[^<]*<\/title>/,`<title>${esc(seo.browser_title)}</title>`);
    const fav=str(seo.favicon);if(fav)html=html.replace(/(<link rel="icon" type="image\/png" href=")[^"]*(" id="favicon">)/,`$1${esc(fav)}$2`);
    fs.writeFileSync(htmlFile,html,'utf8');
    console.log('[JB Engenharia] Metadados SEO atualizados.');
  } catch (err) { console.warn('[JB Engenharia] SEO não modificado:',err.message); }
}
