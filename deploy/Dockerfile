FROM docker.m.daocloud.io/library/node:22-alpine AS builder

WORKDIR /app
ENV npm_config_registry=https://registry.npmmirror.com

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM docker.m.daocloud.io/library/nginx:1.27-alpine

COPY deploy/prod/frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
