# Frontend 生产部署

本文使用 Docker Compose 部署前端和独立 Nginx。前端容器提供静态页面；外层 Nginx 负责 `80/443`、SSL 证书及 `/api/`、`/static/` 到 Gateway 的反向代理。

访问域名：`http://chena7.cn`

## 1. 前置条件

- 域名 `chena7.cn` 和 `www.chena7.cn` 的 A 记录已指向服务器公网 IP。
- 云安全组和服务器防火墙已放行 TCP `80`、`443`。
- Gateway 容器名称为 `gateway`，且已经加入 `chenaqi-net` 网络。
- SSL 证书位于 `/home/docker/chenaqiweb/nginx/ssl/fullchain.pem` 和 `/home/docker/chenaqiweb/nginx/ssl/privkey.pem`。

检查 Gateway 网络：

```bash
docker inspect gateway --format '{{json .NetworkSettings.Networks}}'
```

若 Gateway 已经运行但不在该网络中，将它加入网络：

```bash
docker network connect chenaqi-net gateway
```

若还未创建网络，执行：

```bash
docker network create chenaqi-net
```

## 2. 部署前端

进入前端项目目录：

```bash
cd /home/newweb/frontend
```

构建并启动：

```bash
docker compose -f deploy/prod/docker-compose.yml up -d --build
```

查看运行状态和日志：

```bash
docker compose -f deploy/prod/docker-compose.yml ps
docker compose -f deploy/prod/docker-compose.yml logs -f frontend
```

浏览器访问：

```text
https://chena7.cn
```

## 3. 请求转发

容器内 Nginx 的规则如下：

```text
https://chena7.cn/        -> nginx -> frontend:80
https://chena7.cn/api/... -> nginx -> gateway:8079/api/...
https://chena7.cn/static/... -> nginx -> gateway:8079/static/...
```

因此前端生产环境保持 `VITE_API_BASE_URL=/api` 即可，不需要写服务器 IP 或 Gateway 的公网地址。

## 4. 更新部署

代码更新后，在前端项目目录重新构建并启动：

```bash
cd /home/newweb/frontend
docker compose -f deploy/prod/docker-compose.yml up -d --build
```

该命令会替换旧的前端容器。检查更新后的日志：

```bash
docker compose -f deploy/prod/docker-compose.yml logs -f frontend
```

## 5. 常用排查

查看 Nginx 日志：

```bash
docker logs -f renai-frontend
```

在前端容器内检查是否能访问 Gateway：

```bash
docker exec renai-frontend wget -S -O - http://gateway:8079/health
```

若 `chena7.cn` 无法访问，先确认 DNS 已生效、端口 `80` 未被其他 Nginx 或容器占用，并检查服务器安全组规则。

## 6. HTTPS

HTTP 会自动跳转到 HTTPS。续期证书后，重载 Nginx：

```bash
docker exec nginx nginx -s reload
```
