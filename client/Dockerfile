FROM node:24
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

COPY . .

ARG API_URL
RUN sed -i "s|API_URL_PLACEHOLDER|${API_URL}|g" src/environments/environment.ts

RUN npm install -g http-server

RUN npm run build

EXPOSE 4000
CMD ["http-server", "dist/client/browser", "-p", "4000"]
