# 组队模块前端接口文档

## 基础信息

- **Base URL**: `http://host:8101/api`
- **WebSocket**: `ws://host:8101/api/ws/chat`
- **认证方式**: 所有接口需登录（Session Cookie）
- **通用响应格式**: `{ "code": 0, "data": ..., "message": "ok" }` —— `code=0` 表示成功
- **日期格式**: 请求用 `"yyyy-MM-dd HH:mm"`（如 `"2026-08-30 18:00"`），响应用 `ISO 8601`（如 `"2026-08-30T18:00:00+08:00"`）

---

## 一、队伍管理

### 1.1 队伍字段说明

```json
{
  "id": 1,                              // 队伍ID
  "name": "周末篮球队",                   // 队伍名称
  "description": "周末一起打球",           // 描述
  "expireTime": "2026-08-30T18:00:00+08:00",  // 过期时间
  "maxNum": 5,                          // 最大人数
  "status": 0,                          // 0=公开 1=私有 2=加密
  "createTime": "2026-07-30T10:00:00+08:00",
  "updateTime": "2026-07-30T10:00:00+08:00",
  "userId": 1,                          // 队长ID（创建人）
  "hasJoin": false,                     // 当前用户是否已加入
  "hasJoinNum": 2                       // 当前已加入人数
}
```

> 密码字段**永远不会返回**给前端。

### 1.2 队伍列表

```
GET /api/team/list?searchText=&pageNum=1&status=0
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `searchText` | 否 | 按名称或描述模糊搜索；有值时忽略 status |
| `pageNum` | 否，默认1 | 页码 |
| `status` | 否 | 0=公开，2=加密。不传默认0 |

- `status=0` → 首页"公开"标签
- `status=2` → 首页"加密"标签
- `searchText` 有值 → 搜索结果（含私有队伍），前端搜索框用
- 每页固定 10 条
- 自动过滤已过期、已删除的队伍

响应 `data` 为 `Team[]`。

### 1.3 获取队伍详情

```
GET /api/team/get?id=1
```

用于编辑页回填，或查看队伍信息。**仅队长**能拿到完整信息用于编辑。

### 1.4 创建队伍

```
POST /api/team/add
```

```json
{
  "name": "周末篮球队",              // 必填
  "description": "周末一起打球",
  "expireTime": "2026-08-30 18:00",  // 必填，格式 yyyy-MM-dd HH:mm
  "maxNum": 3,                       // 必填，范围 1-100
  "password": "optional",            // status=2 时必填
  "status": 0                        // 0=公开 1=私有 2=加密
}
```

约束：
- 每个用户最多创建 **5** 个队伍
- 创建成功后当前用户自动成为队长 + 成员
- 响应 `data` 返回新队伍 ID（Long）

### 1.5 更新队伍

```
POST /api/team/update
```

```json
{
  "id": 1,                           // 必填
  "name": "新名称",
  "description": "新描述",
  "expireTime": "2026-08-30 18:00",
  "maxNum": 5,
  "password": "optional",
  "status": 2
}
```

约束：
- 仅**队长**可操作
- `maxNum` 不能小于当前成员数
- 改为加密时必须设置密码
- 不允许修改创建人（userId）和创建时间

响应 `data` 为 `true`/`false`。

### 1.6 加入队伍

```
POST /api/team/join
```

```json
{
  "teamId": 1,
  "password": "optional",       // 加密队伍必填
  "inviteCode": "optional"      // 私有队伍必填
}
```

三种队伍的加入方式：

| 队伍状态 | 需要的参数 | 说明 |
|---------|-----------|------|
| 0 公开 | 仅 `teamId` | 直接加入 |
| 1 私有 | `teamId` + `inviteCode` | 邀请码从 Redis 校验 |
| 2 加密 | `teamId` + `password` | 校验队伍设置的密码 |

约束：
- 不能加入自己创建的队伍
- 不能重复加入（已加入会报错）
- 不能加入已满 / 已过期 / 已解散的队伍
- 每人最多加入 **100** 个队伍

### 1.7 退出队伍

```
POST /api/team/quit
```

```json
{ "teamId": 1 }
```

> **队长不能直接退出**，必须先转让队长或解散队伍。

### 1.8 解散队伍

```
POST /api/team/delete
```

```json
{ "id": 1 }
```

仅**队长**可操作。软删除（队伍不再可见，成员关系清除）。

### 1.9 我创建的队伍

```
GET /api/team/list/my/create?searchText=&pageNum=1
```

### 1.10 我加入的队伍

```
GET /api/team/list/my/join?searchText=&pageNum=1
```

两个接口返回格式与 1.2 相同（`Team[]`）。

### 1.11 转让队长

```
POST /api/team/transfer
```

```json
{
  "teamId": 1,
  "userId": 2          // 目标用户ID，必须在队伍中
}
```

> 转让后**原队长自动退出队伍**。

### 1.12 生成邀请码

```
POST /api/team/invite/generate
```

```json
{ "teamId": 1 }
```

> 仅队长可操作。每次生成一个 **8 位字母数字**随机码，24 小时有效。一个队伍可以有多个有效邀请码。

响应 `data` 为邀请码字符串（String）。

前端用法：拿到邀请码 → 生成 QR 码或分享链接 → 其他人用邀请码加入（1.6 入参 `inviteCode`）

### 1.13 获取队伍成员

```
GET /api/team/members?teamId=1
```

响应：

```json
[
  {
    "userId": 1,
    "username": "张三",
    "avatarUrl": "https://cos.xxx/avatar.jpg",
    "gender": 1,
    "phone": "13800138000",
    "email": "a@b.com",
    "profile": "个人简介",
    "joinTime": "2026-07-30T10:00:00+08:00"
  }
]
```

按加入时间升序。队长的 `joinTime` 为队伍创建时间。

### 1.14 业务约束速查

| 约束项 | 值 |
|--------|-----|
| 每人最多创建 | 5 个队伍 |
| 每人最多加入 | 100 个队伍 |
| 队伍最大人数 | 100 |
| 邀请码有效期 | 24 小时 |
| 列表分页大小 | 10 |

---

## 二、队伍聊天

> 与 1:1 私聊共用同一个 WebSocket 连接（`/ws/chat`），通过不同的 `type` 区分。不会冲突。

### 2.1 队伍会话列表

```
GET /api/team/chat/conversations
```

```json
{
  "code": 0,
  "data": [
    {
      "teamId": 1,
      "teamName": "周末篮球队",
      "lastMessage": "下午3点球场见",
      "lastMessageTime": 1721740800000,
      "memberCount": 5
    }
  ]
}
```

> 按 `lastMessageTime` 倒序。`lastMessage` 超过 50 字自动截断加 `"..."`。

**消息页混合展示**：前端需要同时调用
- `GET /api/chat/conversations` → 私聊会话列表
- `GET /api/team/chat/conversations` → 队伍会话列表

合并后按 `lastMessageTime` 统一排序。区分方式：
- 有 `teamId` 字段 → 队伍聊天
- 有 `targetUserId` 字段 → 私聊

### 2.2 队伍消息历史

```
GET /api/team/chat/messages/{teamId}?pageNum=1&pageSize=20
```

```json
{
  "code": 0,
  "data": [
    {
      "messageId": 200,
      "teamId": 1,
      "senderId": 2,
      "senderName": "张三",
      "senderAvatarUrl": "https://cos.xxx/avatar.jpg",
      "content": "下午3点球场见",
      "msgType": 0,
      "status": 0,
      "createTime": 1721741000000
    }
  ]
}
```

- 最新消息在前，前端拿到后 **reverse** 再渲染
- **新成员只能看到加入后的消息**，加入前的历史不可见

### 2.3 发送队伍消息（HTTP，降级兜底）

```
POST /api/team/chat/send
```

```json
{
  "teamId": 1,
  "content": "大家好",
  "msgType": 0
}
```

| 字段 | 说明 |
|------|------|
| `teamId` | 必填 |
| `content` | 必填，最大 5000 字符 |
| `msgType` | 选填，默认 0。0=文本 1=图片 2=系统消息 |

### 2.4 WebSocket 协议（队伍）

**发送消息**：
```json
→ {"type":"SEND_TEAM","teamId":1,"content":"大家好","msgType":0}
```

**ACK 回执**（发给发送者自己）：
```json
← {"type":"ACK_TEAM","messageId":201,"teamId":1,"content":"大家好","createTime":1721741100000}
```

**实时推送**（广播给队伍所有在线成员，排除发送者）：
```json
← {"type":"NEW_TEAM_MSG","messageId":201,"teamId":1,"senderId":2,"content":"大家好","msgType":0,"createTime":1721741100000}
```

### 2.5 前端实现要点

```
消息页（导航栏【消息】入口）：
  1. 页面加载 → GET /api/chat/conversations + GET /api/team/chat/conversations
  2. 合并两个列表，按 lastMessageTime 倒序
  3. 建立 WebSocket 连接

会话列表条目展示：
  - 私聊：头像 + 昵称 + 最后消息 + 时间 + 未读红点 + 在线绿点
  - 队伍：默认群头像 + 队伍名 + 最后消息 + 时间 + 成员数

点击队伍条目 → 队伍聊天界面：
  1. GET /api/team/chat/messages/{teamId}?pageNum=1
  2. 往上翻 → pageNum++ 加载更早消息
  3. 发送 → WebSocket SEND_TEAM，失败降级 HTTP POST

收到 NEW_TEAM_MSG：
  - 当前在该队伍聊天页 → append 到消息列表底部
  - 当前不在该页 → 更新会话列表最后消息预览

队伍名自动同步：
  - 队伍名来自 team.name
  - 队长修改队伍名 → 群聊名自动更新（无需额外操作）
```

### 2.6 消息类型速查

| msgType | 含义 |
|---------|------|
| 0 | 文本消息 |
| 1 | 图片消息（content 为图片 URL） |
| 2 | 系统消息（如"XXX 加入了队伍"） |

| status | 含义 |
|--------|------|
| 0 | 正常 |
| 1 | 已撤回 |

---

## 三、页面交互流程

### 3.1 首页浏览队伍

```
首页 → GET /api/team/list?status=0  → 展示公开队伍列表
切换标签 → GET /api/team/list?status=2 → 展示加密队伍列表
搜索框 → GET /api/team/list?searchText=xxx → 展示搜索结果（含私有队伍）
点击队伍 → 查看详情 / 点击"加入"按钮
```

### 3.2 创建队伍

```
右上角"+" → 创队表单 → POST /api/team/add → 成功后跳转队伍详情
```

### 3.3 私有队伍加入流程

```
队长 → 生成邀请码（POST /api/team/invite/generate）
     → 前端生成 QR 码 或 分享链接/邀请码文本

其他人 → 扫码/输入邀请码
       → POST /api/team/join { teamId, inviteCode }
       → 成功加入
```

### 3.4 队长管理

```
队伍详情页（队长视角）：
  [修改信息] → POST /api/team/update
  [转让队长] → 选择成员 → POST /api/team/transfer
  [解散队伍] → 确认 → POST /api/team/delete
  [生成邀请码] → POST /api/team/invite/generate
  [查看成员] → GET /api/team/members?teamId=1
```

### 3.5 消息页

```
导航栏【消息】：
  请求私聊 + 队伍会话 → 合并列表 → 按时间排序
  点击私聊条目 → 进入普通聊天界面
  点击队伍条目 → 进入队伍聊天界面
```

---

## 四、WebSocket 生命周期

```
页面进入 → new WebSocket("ws://host:8101/api/ws/chat")
        → onopen: 启动心跳定时器(30s PING)
        → onmessage: 根据 type 分发
            私聊: SEND / ACK / NEW_MSG / READ
            队伍: SEND_TEAM / ACK_TEAM / NEW_TEAM_MSG
            通用: PONG / ERROR
        → onclose: 清除心跳，切换到 HTTP 降级模式
        → 5s 后尝试重连（指数退避: 5s→10s→20s→30s 上限）
页面离开 → 关闭 WebSocket
```

### 消息发送优先级

```
发送消息：
  1. WebSocket（在线 → 实时）
  2. HTTP POST（WebSocket 异常 → 降级兜底）

接收消息：
  1. WebSocket 推送（实时）
  2. 重新进入页面时拉取历史（补漏）
```

---

## 五、接口速查表

| # | 方法 | 路径 | 权限 | 说明 |
|---|------|------|------|------|
| 1 | GET | `/api/team/list` | 登录 | 队伍列表 |
| 2 | GET | `/api/team/get` | 登录 | 队伍详情 |
| 3 | POST | `/api/team/add` | 登录 | 创建队伍 |
| 4 | POST | `/api/team/update` | 队长 | 更新队伍 |
| 5 | POST | `/api/team/join` | 登录 | 加入队伍 |
| 6 | POST | `/api/team/quit` | 非队长 | 退出队伍 |
| 7 | POST | `/api/team/delete` | 队长 | 解散队伍 |
| 8 | GET | `/api/team/list/my/create` | 登录 | 我创建的 |
| 9 | GET | `/api/team/list/my/join` | 登录 | 我加入的 |
| 10 | POST | `/api/team/transfer` | 队长 | 转让队长 |
| 11 | POST | `/api/team/invite/generate` | 队长 | 生成邀请码 |
| 12 | GET | `/api/team/members` | 登录 | 成员列表 |
| 13 | GET | `/api/team/chat/conversations` | 登录 | 队伍会话列表 |
| 14 | GET | `/api/team/chat/messages/{teamId}` | 成员 | 队伍消息历史 |
| 15 | POST | `/api/team/chat/send` | 成员 | 发送队伍消息 |

### WebSocket 消息类型

| type | 方向 | 说明 |
|------|------|------|
| `SEND_TEAM` | → | 发送队伍消息 |
| `ACK_TEAM` | ← | 发送成功回执 |
| `NEW_TEAM_MSG` | ← | 实时推送（广播） |
| `SEND` | → | 发送私聊消息 |
| `ACK` | ← | 私聊发送回执 |
| `NEW_MSG` | ← | 私聊实时推送 |
| `READ` | → / ← | 标记已读 / 已读回执 |
| `PING` | → | 心跳 |
| `PONG` | ← | 心跳响应 |
| `ERROR` | ← | 错误 |
