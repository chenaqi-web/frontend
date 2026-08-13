# Frontend 生产部署

本文使用 Docker Compose 部署前端。容器内的 Nginx 提供前端页面，并把 `/api/` 请求转发到同一 Docker 网络中的 Gateway。

访问域名：`http://chena7.cm`

## 1. 前置条件

- 域名 `chena7.cm` 和 `www.chena7.cn` 的 A 记录已指向服务器公网 IP。
- 云安全组和服务器防火墙已放行 TCP `80`。
- Gateway 容器名称为 `gateway`，且已经加入 `chenaqi-net` 网络。

检查 Gateway 网络：

```bash
docker inspect gateway --format '{{json .NetworkSettings.Networks}}'
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
http://chena7.cm
```

## 3. 请求转发

容器内 Nginx 的规则如下：

```text
http://chena7.cm/        -> 前端静态页面
http://chena7.cm/api/... -> gateway:8079/api/...
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

若 `chena7.cm` 无法访问，先确认 DNS 已生效、端口 `80` 未被其他 Nginx 或容器占用，并检查服务器安全组规则。

## 6. HTTPS

当前配置只提供 HTTP。启用 HTTPS 前，需放行 TCP `443` 并为 `chena7.cm` 申请证书；随后在 Nginx 中增加 `443 ssl` 配置，并将 HTTP 请求重定向到 HTTPS。
