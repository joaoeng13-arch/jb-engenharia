# JB Engenharia e Construção — Site institucional

## Estrutura

- `index.html`: landing page com HTML/CSS embutido e JS mínimo para menu e portfólio.
- `admin/index.html` e `admin/config.yml`: painel Decap CMS.
- `obras/`: cada obra cadastrada pelo painel vira um arquivo JSON individual.
- `scripts/build-obras.js`: agrega esses arquivos para a galeria pública.
- `data/obras.json`: saída da publicação (vazia inicialmente).
- `netlify.toml`: faz a Netlify rodar a agregação sem instalar dependências.
- `assets/`: logo refinada a partir do arquivo original fornecido, favicon, imagens enviadas pelo Decap e imagem reserva.

## Visualização local

Abra `index.html` em um navegador para ver a landing page com uma galeria inicial vazia (obras cadastradas exclusivamente pela equipe). As imagens genéricas de arquitetura do banner e da seção Sobre são externas e exigem internet. Você também pode executar um servidor HTTP local (ex.: `python -m http.server 8080`) e acessar `http://localhost:8080`.

**Nenhuma obra fictícia é exibida.** Quando a primeira obra real for cadastrada, ela aparecerá automaticamente na galeria no próximo deploy.

## Publicar com painel administrativo funcional

1. Crie um repositório **GitHub** com o conteúdo de `site-engenharia/` na **raiz** do repositório (branch `main`).
2. Na **Netlify**, escolha **Add new project > Import an existing project**, conecte esse repositório e publique. O arquivo `netlify.toml` já define o comando `node scripts/build-obras.js` e diretório `.`.
3. Nas configurações da Netlify, ative **Identity**, escolha cadastro **Invite only** e envie convite ao administrador.
4. Habilite **Git Gateway** nas configurações de Identity, com permissão para acessar o repositório conectado.
5. Abra `https://SEU-DOMINIO/admin/`, faça login, entre em **Portfólio de Obras** e cadastre uma obra real com foto, categoria, status, cidade e descrição.
6. Ao salvar/publicar a entrada, o Decap CMS cria ou atualiza o arquivo JSON em `obras/` no repositório. Um novo deploy gera `data/obras.json`, e a galeria do site passa a exibir as obras reais. Aguarde a conclusão do deploy da Netlify antes de atualizar a página pública.

**Importante:** Apenas abrir `/admin/` localmente ou hospedar os arquivos no GitHub Pages **não** configura autenticação Git Gateway/Netlify Identity. O painel precisa da configuração acima em uma implantação Netlify (ou adaptação para outro backend). Não deixe cadastros públicos abertos.

## Notas

- CSS está totalmente dentro de `<style>` no `index.html`, conforme solicitado.
- Os arquivos extras são necessários para integrar o Decap CMS à galeria pública sem frameworks nem servidores customizados.
- As URLs das imagens de arquitetura do hero e do Sobre são externas e meramente ilustrativas; nenhuma imagem enviada como referência de paleta foi usada como obra. Para funcionar 100% offline, troque as imagens remotas por imagens locais.
- Marca recebida em 150 × 150 px: foi recortada a margem preta, ampliada com interpolação Lanczos, leve nitidez e fundo transparente para uso em tamanhos pequenos. Para impressos e logotipos grandes, solicite o arquivo vetorial original (.SVG/.AI/.PDF).
- Identidade baseada nas referências: preto (#0B0C0E), grafite (#1C2024), dourado (#C99D48), creme (#F8F7F4), com verde somente para botões de WhatsApp.
- Instagram: https://www.instagram.com/jb_engenharia18/.
- As informações dos serviços e trajetória foram fornecidas para criação desta peça. Antes da publicação, confirme qualquer credencial profissional e afirmação comercial que deva ser documentada.
