/**
 * Gera data/obras.json a partir dos arquivos da coleção Decap CMS.
 * Sem bibliotecas externas. Executado automaticamente em cada deploy da Netlify.
 */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'obras');
const output = path.join(root, 'data', 'obras.json');
const allowed = new Set(['Residencial', 'Comercial', 'Reformas', 'Infraestrutura']);
const statuses = new Set(['Concluída', 'Em Andamento']);
const files = fs.existsSync(source) ? fs.readdirSync(source).filter(file => file.endsWith('.json')).sort() : [];
const obras = [];
for (const file of files) {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(source, file), 'utf8'));
    if (typeof raw.title !== 'string' || !raw.title.trim()) continue;
    obras.push({
      title: raw.title.trim(),
      category: allowed.has(raw.category) ? raw.category : 'Engenharia',
      status: statuses.has(raw.status) ? raw.status : 'Obra',
      location: String(raw.location || 'Local não informado').trim(),
      image: String(raw.image || '/assets/obra-placeholder.svg'),
      description: String(raw.description || '').trim()
    });
  } catch (e) { console.warn(`Arquivo ignorado: ${file} — ${e.message}`); }
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(obras, null, 2) + '\n', 'utf8');
console.log(`${obras.length} obra(s) publicada(s) no portfólio.`);
