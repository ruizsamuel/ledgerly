FROM node:latest AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Reemplazar variable en environment.js en tiempo de compilación
ARG API_URL
RUN sed -i "s|API_URL_PLACEHOLDER|${API_URL}|g" src/environments/environment.ts

RUN npm install -g http-server

RUN npm run build


EXPOSE 4000
CMD ["http-server", "dist/client/browser", "-p", "4000"]
