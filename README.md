# JB Engenharia e Construção — Site institucional 2.0

**Identidade:** preto e branco, nova logomarca enviada pela empresa, SVGs embutidos.
**Hospedagem existente:** Cloudflare Pages — `https://jbengenharia.app`
**Repositório existente:** `joaoeng13-arch/jb-engenharia` (branch `main`)
**Admin:** `https://jbengenharia.app/admin/` (Decap CMS)
**OAuth em produção:** `https://jb-engenharia-oauth.jb-engenharia2018.workers.dev`

## Atualizar mantendo tudo funcionando

1. **Faça um backup da pasta atual** `jb-engenharia` no computador ou crie uma branch/commit de segurança no GitHub Desktop.
2. Extraia o ZIP. Copie **o conteúdo de `site-engenharia/`**, não essa pasta como subpasta, para a raiz do repositório `jb-engenharia`.
3. **Preserve as obras e imagens já cadastradas:** não exclua os arquivos existentes em `obras/*.json`, `assets/obras/`, `assets/uploads/` nem alterações que você tenha feito no seu repositório. A atualização contém novas configurações em `data/*.json`.
4. Confirme que `admin/config.yml` continua apontando para o GitHub `joaoeng13-arch/jb-engenharia` e o Worker `jb-engenharia-oauth.jb-engenharia2018.workers.dev`.
5. Faça **Commit to main → Push origin** no GitHub Desktop.
6. Cloudflare Pages fará novo deploy. Mantenha a configuração de build:
   - `Production branch`: `main`
   - `Framework preset`: `None`
   - `Build command`: `node scripts/build-obras.js`
   - `Build output directory`: `.` (um ponto)
   - `Root directory`: raiz do repositório
7. Abra o site, teste os botões e entre no `/admin/` com GitHub. Faça uma alteração simples de texto no painel e confirme nova publicação no Pages.

**Não é necessário** alterar domínios, DNS, Tunnels, OAuth App, Client ID, Client Secret ou o Worker que já está online. O arquivo `cloudflare-oauth/worker.js` no pacote é uma **cópia de referência/recuperação**, não é publicado automaticamente como Worker pelo GitHub Pages.

## O que o painel controla

No painel, abra **Configurações e conteúdos do site** para editar:

- **Dados da empresa / Sobre Nós** — razão social, slogan, engenheiro, texto institucional, foto, diferenciais.
- **Página inicial e banners** — títulos, imagem do hero, botões, indicadores, textos e exibição das seções.
- **Contatos e WhatsApp** — número completo com DDI/DDD, telefone apresentado, e-mail, Instagram, localização, horário, textos de botões e mensagens automáticas diferentes por contexto. Use `{obra}` na mensagem para obras e `{servico}` para serviços.
- **Serviços** — título, texto, SVG e ordem, com opção de ocultar.
- **Diferenciais** — listas de cards com SVG, ordem e visibilidade.
- **Depoimentos** — apenas testemunhos reais e autorizados; se não houver, a seção não aparece.
- **Logomarcas, favicon e SEO** — troca de logo, ícone, título e descrição, compartilhamento.

Em **Portfólio de Obras**, há cadastro de imagens adicionais, legenda, data de início/conclusão, área em m², informação técnica, vídeo, categoria, situação, destaque, ordem, descrição curta/completa e botão para publicar/ocultar. Registros antigos com apenas `title`, `category`, `status`, `location`, `image`, `description` continuam compatíveis. Quando uma obra antiga não possui o campo `published`, ela continua pública. 

O site lê os JSONs de `data/` e renderiza as alterações. Para portfólio, o build lê a coleção `obras/` e gera `data/obras.json` com apenas as obras publicadas. **O build não exclui os JSONs originais de obra.**

## Estrutura

```text
jb-engenharia/
├── index.html                  # Página única: HTML/CSS embutido + JS leve
├── admin/
│   ├── index.html              # Decap CMS
│   └── config.yml              # Configurações, coleções, OAuth
├── assets/
│   ├── logo-jb-branca.png      # Nova logo recortada com transparência
│   ├── logo-jb-preta.png
│   ├── logo-original-enviada.png
│   ├── favicon.png
│   └── uploads/                # Mídia do painel
├── data/                       # JSONs de conteúdo
│   ├── empresa.json
│   ├── inicio.json
│   ├── contatos.json
│   ├── servicos.json
│   ├── diferenciais.json
│   ├── depoimentos.json
│   ├── aparencia.json
│   └── obras.json
├── obras/                      # JSON individual de cada obra, preservado
├── scripts/build-obras.js
├── cloudflare-oauth/worker.js  # Referência, não requer deploy
├── _headers
├── sitemap.xml
└── robots.txt
```

## Prévia local

Execute `python -m http.server 8080` ou `npx serve .` na pasta do site e acesse `http://localhost:8080`. Não abra o HTML pelo endereço `file://` se quiser carregar os JSONs dinamicamente (o navegador bloqueia `fetch` local).

## Cuidados

- Nenhuma senha ou credencial OAuth deve ser colocada no repositório.
- O login do painel depende do GitHub OAuth e das permissões no repositório; não há usuários ou senhas separados no site.
- Fotos de obras e depoimentos só devem ser publicados com autorização.
- As imagens arquitetônicas genéricas inicialmente usadas no banner e Sobre Nós podem ser trocadas por imagens próprias no painel.
- Ícones de engenharia são SVGs embutidos; logo é PNG com fundo transparente derivado do arquivo fornecido.
- Campos de SEO atualizam as tags HTML durante o build e no navegador.
