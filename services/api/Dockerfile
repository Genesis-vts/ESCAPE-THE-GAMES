# syntax=docker/dockerfile:1

# --- build ---------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
COPY services/api/package.json ./services/api/
RUN npm ci --workspace services/api --include-workspace-root

COPY services/api ./services/api
RUN npm run build --workspace services/api

# --- runtime -------------------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
COPY services/api/package.json ./services/api/
RUN npm ci --workspace services/api --include-workspace-root --omit=dev && npm cache clean --force

COPY --from=build /app/services/api/dist ./services/api/dist

# Usuário sem privilégios (o `node` já existe na imagem oficial).
USER node

EXPOSE 3000

# Nenhum segredo é embutido na imagem: TODAS as credenciais chegam por variável
# de ambiente, injetadas pelo orquestrador a partir do cofre de segredos.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "services/api/dist/index.js"]
