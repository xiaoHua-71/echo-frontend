## 4. 队伍模块

### 4.1 队伍字段

前端使用的队伍字段：

```json
{
  "id": 1,
  "name": "周末篮球队",
  "description": "周末活动",
  "expireTime": "2026-08-30T18:00:00+08:00",
  "maxNum": 5,
  "status": 0,
  "createTime": "2026-07-30T10:00:00+08:00",
  "updateTime": "2026-07-30T10:00:00+08:00",
  "userId": 1,
  "hasJoin": false,
  "hasJoinNum": 2
}
```

状态约定：`0` 公开、`1` 私有、`2` 加密。加密队伍的密码不能返回给列表或详情响应。

### 4.2 队伍列表

`GET /api/team/list?searchText=&pageNum=1&status=0`

权限：登录用户。响应 `data` 为 `Team[]`。

- `status=0`：公开队伍。
- `status=2`：加密队伍。当前前端首页标签切换会请求此值。
- `searchText`：按队伍名称或描述模糊搜索。搜索时忽略 status 过滤（包括私有队伍 status=1），方便用户通过搜索找到私有队伍。
- 返回每个队伍的 `userId`、`hasJoin`、`hasJoinNum`，否则前端无法正确显示操作按钮和人数。
- 过滤已删除队伍、已过期队伍。

### 4.3 获取队伍详情

`GET /api/team/get?id=1`

权限：登录用户。仅队伍创建者允许查看完整信息用于编辑回填；不要返回密码明文。

### 4.4 创建队伍

`POST /api/team/add`

请求 JSON：

```json
{
  "name": "周末篮球队",
  "description": "周末活动",
  "expireTime": "2026-08-30 18:00",
  "maxNum": 3,
  "password": "optional",
  "status": 0
}
```

权限：登录用户。服务端将当前用户设为队长，并创建第一条成员关系。校验名称非空、`maxNum` 在 1-100 之间、过期时间晚于当前时间；`status=2` 时密码必填，公开/私有队伍可忽略密码。每个用户最多创建 5 个队伍。成功返回新队伍 ID。

### 4.5 更新队伍

`POST /api/team/update`

请求体沿用队伍字段，至少包含 `id`，当前前端会把详情对象整体提交：

```json
{
  "id": 1,
  "name": "新名称",
  "description": "新描述",
  "expireTime": "2026-08-30 18:00",
  "maxNum": 5,
  "password": "optional",
  "status": 2
}
```

权限：仅队长。`maxNum` 不能小于当前成员数；状态改为加密时必须有密码；不允许修改创建人（userId）和创建时间。

### 4.6 加入队伍

`POST /api/team/join`

请求 JSON：

```json
{ "teamId": 1, "password": "optional", "inviteCode": "optional" }
```

权限：登录用户。三种队伍的加入方式：

| status | 含义 | 加入方式 |
|--------|------|---------|
| 0 | 公开 | 无需额外验证，直接加入 |
| 1 | 私有 | 必须提供 `inviteCode`，服务端从 Redis 校验邀请码 |
| 2 | 加密 | 必须提供 `password`，与队伍设置的密码匹配 |

校验规则：不能加入自己创建的队伍、不能重复加入、不能加入已满/已过期/已解散队伍、每个用户最多加入 100 个队伍。

### 4.7 退出队伍

`POST /api/team/quit`

```json
{ "teamId": 1 }
```

权限：登录用户。队长不能直接退出，必须先转让队长或解散队伍。成员退出后软删除成员关系。

### 4.8 解散队伍

`POST /api/team/delete`

```json
{ "id": 1 }
```

权限：仅队长。软删除队伍，同时软删除所有成员关系；接口成功返回 `code=0`，`data` 返回 `true`。

### 4.9 我的队伍列表

创建的队伍：`GET /api/team/list/my/create?searchText=&pageNum=1`

加入的队伍：`GET /api/team/list/my/join?searchText=&pageNum=1`

权限：登录用户。两者均返回 `Team[]`，支持 `searchText` 按名称或描述搜索，并包含 `userId`、`hasJoin`、`hasJoinNum`。

### 4.10 转让队长

`POST /api/team/transfer`

```json
{ "teamId": 1, "userId": 2 }
```

权限：仅当前队长。`userId` 为目标用户，必须在队伍中。转让后原队长自动退出队伍。

### 4.11 生成邀请码

`POST /api/team/invite/generate`

```json
{ "teamId": 1 }
```

权限：仅队长。每次调用生成一个新的 8 位随机邀请码，存入 Redis 有效期 24 小时。返回邀请码字符串，前端可用于生成 QR 码或分享链接。一个队伍可以同时有多个有效邀请码。

### 4.12 获取队伍成员

`GET /api/team/members?teamId=1`

权限：登录用户。返回成员列表（按加入时间排序）：

```json
[
  {
    "userId": 1,
    "username": "张三",
    "avatarUrl": "https://...",
    "gender": 1,
    "phone": "138...",
    "email": "a@b.com",
    "profile": "个人简介",
    "joinTime": "2026-07-30T10:00:00+08:00"
  }
]
```

### 4.13 业务约束汇总

| 约束项 | 值 |
|--------|-----|
| 每用户最多创建队伍数 | 5 |
| 每用户最多加入队伍数 | 100 |
| 队伍最大人数 | 100 |
| 邀请码有效期 | 24 小时 |
| 邀请码格式 | 8 位字母数字随机串 |
| 列表分页大小 | 10 |
