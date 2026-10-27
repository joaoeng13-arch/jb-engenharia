# Configuração do painel de obras — Cloudflare + GitHub

**O ZIP prepara a integração, mas o login só funcionará depois de criar o aplicativo OAuth e publicar o Worker.**

1. No GitHub, abra Settings → Developer settings → OAuth Apps → New OAuth App (na conta que controla o repositório). Nome: `JB Engenharia CMS`; Homepage URL: `https://jbengenharia.app`; Authorization callback URL: `https://jb-engenharia-oauth.SEU_SUBDOMINIO.workers.dev/callback`. Salve o **Client ID** e gere um **Client Secret**. O endereço de callback precisa corresponder exatamente ao endereço real do Worker; você pode editar o OAuth App depois de publicar o Worker.
2. Na Cloudflare, acesse Compute → Workers & Pages → Create → Worker. Nome sugerido: `jb-engenharia-oauth`. Publique o código do arquivo `cloudflare-oauth/worker.js` pelo editor do Worker. Descubra o endereço `*.workers.dev` efetivo.
3. Em Worker → Settings → Variables and Secrets, configure: `GITHUB_CLIENT_ID` (Client ID), `GITHUB_CLIENT_SECRET` (**secret**, não texto público), `STATE_SECRET` (**secret**, string longa aleatória), `SITE_ORIGIN` = `https://jbengenharia.app`. O Worker precisa estar disponível em HTTPS.
4. Atualize no GitHub OAuth App a callback URL para `https://ENDERECO-REAL-DO-WORKER/callback`.
5. No arquivo `admin/config.yml`, substitua `https://jb-engenharia-oauth.SEU_SUBDOMINIO.workers.dev` em `base_url` pela origem real do Worker (sem barra final), e publique essa alteração.
6. No Cloudflare Pages → projeto `jb-engenharia` → Settings → Builds & deployments, configure Build command `node scripts/build-obras.js`, Build output directory `.` e root directory vazio (raiz). Faça novo deploy.
7. Entre em `https://jbengenharia.app/admin/`, clique em login com GitHub, autorize o aplicativo e cadastre uma obra. O login exige permissão de escrita no repositório.
8. Após salvar a obra, confira o commit em `obras/` no GitHub, aguarde o novo deploy e confira a galeria.

**Segurança:** a aplicação OAuth solicitará escopo `repo` (amplo, inclusive para repositórios privados). Use uma conta GitHub com acesso restrito, não compartilhe os tokens e não publique o Client Secret. A autenticação do GitHub autoriza acesso ao repositório de acordo com as permissões da conta; não é uma lista independente de usuários do site.

**Atenção:** se o GitHub bloquear o popup ou o Decap mostrar erro de login, confira o endereço real do Worker, `SITE_ORIGIN`, a callback URL e o console do navegador. A integração precisa ser testada em produção após configurar as credenciais.
