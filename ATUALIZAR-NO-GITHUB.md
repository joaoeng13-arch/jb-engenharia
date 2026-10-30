# Guia rápido — atualizar a JB Engenharia

1. Abra **GitHub Desktop > Current repository > jb-engenharia**.
2. Em **Repository > Show in Explorer**, abra a pasta local do repositório.
3. Faça uma cópia de segurança da pasta. **Não apague `.git`, `obras/`, `assets/obras/` ou outras imagens cadastradas.**
4. Extraia este pacote, abra `site-engenharia` e copie os arquivos/pastas de dentro para a pasta do repositório, substituindo os arquivos existentes quando necessário.
5. No GitHub Desktop: mensagem `JB Engenharia - Modernização visual e painel completo` → **Commit to main** → **Push origin**.
6. Cloudflare Pages: confira o deploy e a build command `node scripts/build-obras.js`.
7. Abra `https://jbengenharia.app` e `https://jbengenharia.app/admin/`.
8. No admin, edite **Contatos e mensagens do WhatsApp** e clique em **Publish** para validar que o site atualiza.

**Não altere a configuração do Worker OAuth nem o domínio:** a versão mantém o endereço funcional.
