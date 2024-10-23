# Dockerfile
FROM node:18

# Instalar dependencias necesarias para Puppeteer
RUN apt-get update && apt-get install -y \
  wget \
  gnupg \
  --no-install-recommends \
  fonts-liberation \
  libappindicator3-1 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxrandr2 \
  xdg-utils \
  libxss1 \
  libasound2 \
  libcups2 \
  && rm -rf /var/lib/apt/lists/*

# Configurar la carpeta de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Instalar dependencias y compilar la aplicación
RUN npm install && npm run build

# Exponer el puerto de la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:prod"]
