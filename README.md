# JB Engenharia — site institucional + painel de obras

O visual da página principal e os arquivos de imagens foram preservados.

## Publicação na Cloudflare Pages

Repositório: `joaoeng13-arch/jb-engenharia`, branch `main`.

**Configuração essencial do build na Cloudflare Pages:**
- Framework preset: `None`
- Build command: `node scripts/build-obras.js`
- Build output directory: `.` (raiz do repositório)
- Root directory: vazio / raiz

Sem o comando de build, os arquivos cadastrados em `obras/*.json` não são reunidos em `data/obras.json` e a galeria não será atualizada.

## Login administrativo

Leia `CONFIGURAR-ADMIN-CLOUDFLARE.md` e configure o Worker OAuth. Não coloque segredos no GitHub.
