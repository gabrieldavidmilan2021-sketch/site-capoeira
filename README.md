# Roda de Capoeira — Loja

Pequena loja com frontend estático e backend Node.js para persistência local dos produtos.

## Estrutura

- `index.html`, `admin.html` — páginas públicas e painel administrativo
- `css/` — estilos
- `js/` — scripts (principal: `js/script.js`)
- `server.js` — servidor Node que serve arquivos estáticos e expõe `/api/store` (GET/PUT)
- `data/store.json` — arquivo criado pelo servidor para persistir produtos

## Requisitos

- Node.js 16+ instalado

## Rodar localmente

```bash
npm install
npm start
# abre em http://localhost:3000
```

Para abrir a mesma loja no celular, conecte o celular à mesma rede Wi-Fi do
computador e use no navegador do celular o endereço `http://IP_DO_PC:3000`.
O `npm start` mostra esse endereço como `Acesso pelo celular`. Não use
`localhost` no celular, pois nele esse nome aponta para o próprio aparelho.

Use sempre a mesma pasta do projeto ao iniciar o servidor. O catálogo fica em
`data/store.json` no computador e é sincronizado pela API `/api/store`.

## Git / GitHub

Sugestões antes de subir:

- adicionar `.gitignore` (já incluído) para não versionar `node_modules` e `data/store.json`.
- se `data/store.json` já foi commitado, remova-o do histórico ou delete e commit novamente:

```bash
git rm --cached data/store.json
git commit -m "Remove local store from repo"
```

Comandos para criar e enviar para um repositório remoto:

```bash
git init
git add .
git commit -m "Initial site + server"
git remote add origin <URL-do-repo>
git branch -M main
git push -u origin main
```

## Deploy

Opções recomendadas (mantendo o backend Node ativo):

- Vercel / Render / Railway / Heroku — conectar o repositório e usar o script `start` (`node server.js`).

Observação: GitHub Pages não executa `server.js`. Se publicar via Pages, o painel admin que salva em `/api/store` não funcionará.

### Deploy rápido no Render

1. Crie conta em https://render.com e clique em "New Web Service".
2. Conecte seu repositório GitHub.
3. Build command: (deixe em branco)  — Start command: `npm start`.
4. Deploy.

## Próximos passos

- (opcional) Configurar `data/store.json` para usar um DB remoto (SQLite, MongoDB, etc.) para produção.
- (opcional) Consolidar scripts em `js/` para reduzir duplicação.

---

Se quiser, eu posso: 1) criar o repositório remoto no GitHub e subir os arquivos; 2) preparar instruções específicas para Vercel ou Render; 3) remover `data/store.json` do repositório histórico. Diga o que prefere.