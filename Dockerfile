# Usamos uma versão estável do Node.js
FROM node:20-alpine

# Criamos a pasta de trabalho dentro do container
WORKDIR /app

# Copiamos os arquivos de dependências primeiro (para otimizar o cache)
COPY package*.json ./

# Instalamos as dependências (ignorando conflitos de versão se houver)
RUN npm install --legacy-peer-deps

# Copiamos o restante do código do seu site
COPY . .

# Geramos o build do TypeScript (se o seu projeto usar)
RUN npm run build --if-present

# Expomos a porta padrão
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
