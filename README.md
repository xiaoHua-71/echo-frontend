# Echo：标签匹配与组队聊天平台前端

> 一个基于 Vue 3 + Vite + TypeScript + Vant 的移动端社交组队平台前端。
> 通过兴趣标签发现合适的伙伴，创建或加入队伍，并使用 WebSocket 进行私聊和队伍群聊。

[![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-2.x-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vant](https://img.shields.io/badge/Vant-3.x-07c160?logo=vant&logoColor=white)](https://vant-ui.github.io/vant/)

## 项目简介

Echo 是一个面向兴趣社交、活动组队和即时交流场景的全栈项目，当前仓库为前端应用。它把“找到同好”“发起组队”“加入队伍”“持续沟通”串成一条完整流程，适合用于学习 Vue 3 工程化开发、移动端 UI、用户匹配、队伍管理和 WebSocket 聊天。

核心关键词：`Vue 3`、`Vite`、`TypeScript`、`Vant`、`Vue Router`、`Axios`、`标签匹配`、`兴趣社交`、`组队系统`、`队伍管理`、`私聊`、`群聊`、`WebSocket`、`移动端前端`。

## 功能亮点

- **标签匹配**：通过多级兴趣标签筛选用户，快速发现志趣相投的伙伴。
- **推荐流**：以用户卡片展示简介、兴趣标签和快捷聊天入口，支持推荐模式切换。
- **队伍广场**：搜索公开、私有和加密队伍，查看人数、状态和队伍描述。
- **完整组队流程**：创建、编辑、加入、退出、解散、转让队长和查看成员。
- **邀请机制**：队长可生成限时邀请码，便于通过链接、二维码或邀请码招募成员。
- **私聊与队伍群聊**：统一消息中心，聚合私聊和队伍会话，支持未读数、历史消息和在线状态。
- **实时通信**：WebSocket 负责实时消息、ACK、心跳和自动重连，HTTP 接口提供消息发送降级兜底。
- **用户中心**：支持账号注册、邮箱注册、登录、资料编辑，以及查看已创建和已加入的队伍。
- **移动端体验**：基于 Vant 组件库构建，适配移动端导航、表单、弹窗、列表和聊天交互。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 前端框架 | Vue 3、Vue Router 4 |
| 开发语言 | TypeScript |
| 构建工具 | Vite |
| UI 组件 | Vant 3 |
| 网络请求 | Axios、Cookie Session |
| 实时通信 | WebSocket |
| 状态管理 | Vue Composition API、本地响应式状态 |

## 项目结构

```text
src/
├── components/       可复用用户卡片、队伍卡片组件
├── layouts/          页面布局与底部导航
├── pages/            首页、标签搜索、队伍、消息、聊天、用户页面
├── services/         用户、标签、队伍、聊天 API
├── states/           用户状态、聊天未读状态
├── models/            TypeScript 数据模型与 WebSocket 类型
├── plugins/           Axios 实例与响应拦截器
└── config/            路由与应用配置
docs/                 队伍与聊天模块接口文档
```

## 快速开始

### 环境要求

- Node.js 16+
- npm 8+ 或 Yarn 1+
- Echo 后端服务运行在 `http://localhost:8101`

后端项目：[echo](https://github.com/xiaoHua-71/echo)

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 启动开发环境

```bash
npm run dev
```

开发服务器默认地址为 `http://localhost:3000`。Vite 会将 `/api` 请求代理到 `http://localhost:8101`，请先启动后端并确保数据库、Redis 等后端依赖已经就绪。

### 构建与预览

```bash
npm run build
npm run preview
```

## 通信说明

开发环境 HTTP API 前缀为 `/api`，WebSocket 地址为：

```text
ws://localhost:8101/api/ws/chat
```

聊天模块采用“WebSocket 实时通信 + HTTP 降级发送”的策略：网络正常时优先使用 WebSocket，连接断开时自动重连，并使用 HTTP 接口保证消息仍可发送。详细接口约定见：

- [队伍模块前端接口文档](docs/team/team-frontend-api.md)
- [队伍模块接口文档](docs/team/team-api.md)
- [聊天模块接口文档](docs/chat_modules/caht_api.md)

## 适用场景

Echo 可作为以下项目的前端实践或二次开发基础：兴趣社交 App、活动报名与组队平台、校园社团匹配、游戏开黑组队、运动搭子匹配、学习小组招募、实时聊天 Demo，以及 Vue 3 全栈项目课程设计。

## 当前状态

项目已完成用户、标签匹配、队伍管理、消息中心和实时聊天等主要页面与交互。生产部署时请根据实际后端域名配置 Axios 的生产环境地址，并通过 HTTPS/WSS、登录态安全策略和后端权限校验完善上线配置。

## License

本项目用于学习和交流，具体开源许可协议可根据发布需要补充。
