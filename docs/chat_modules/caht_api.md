聊天模块 API 文档
基础信息
Base URL: http://host:8101/api
WebSocket: ws://host:8101/api/ws/chat
认证: 所有接口需要登录（Session Cookie，Redis 存储）
msgType: 0=文本, 1=图片, 2=系统消息
status: 0=未读, 1=已读, 2=已撤回
一、REST API
1. 开始会话（点击"联系我"）
POST /api/chat/conversation/start?targetId={userId}
响应:

{
  "code": 0,
  "message": "ok",
  "data": {
    "conversationId": 1,
    "targetUserId": 2,
    "targetUsername": "张三",
    "targetAvatarUrl": "https://cos.xxx/avatar.jpg",
    "unreadCount": 0,
    "online": false
  }
}
2. 我的会话列表（消息页导航栏入口）
GET /api/chat/conversations
响应:

{
  "code": 0,
  "data": [
    {
      "conversationId": 1,
      "targetUserId": 2,
      "targetUsername": "张三",
      "targetAvatarUrl": "https://cos.xxx/avatar.jpg",
      "lastMessage": "你好，很高兴认识你",
      "lastMessageTime": 1721740800000,
      "unreadCount": 3,
      "online": true
    }
  ]
}
按 lastMessageTime 倒序排列。前端用 unreadCount 显示红点角标，online 显示绿色在线状态。

3. 消息历史（分页，往上翻加载更多）
GET /api/chat/messages/{conversationId}?pageNum=1&pageSize=20
响应（最新消息在前，前端取到后 reverse 显示）:

{
  "code": 0,
  "data": [
    {
      "messageId": 100,
      "conversationId": 1,
      "senderId": 1,
      "receiverId": 2,
      "content": "好的，明天见",
      "msgType": 0,
      "status": 1,
      "createTime": 1721741000000
    }
  ]
}
4. 发送消息（HTTP 降级兜底）
POST /api/chat/send
Content-Type: application/json

{
  "conversationId": 1,
  "receiverId": 2,
  "content": "你好",
  "msgType": 0
}
conversationId 可为 null（首次发送时自动创建会话），msgType 默认 0。

响应:

{
  "code": 0,
  "data": {
    "messageId": 101,
    "conversationId": 1,
    "senderId": 1,
    "receiverId": 2,
    "content": "你好",
    "msgType": 0,
    "status": 0,
    "createTime": 1721741100000
  }
}
5. 标记已读
PUT /api/chat/read/{conversationId}
响应: { "code": 0, "data": true }

6. 删除/隐藏会话（类似微信左滑删除）
DELETE /api/chat/conversation/{conversationId}
仅隐藏当前用户的会话列表，对方不受影响。会话有新消息时自动恢复显示。

7. 未读消息总数（导航栏角标用）
GET /api/chat/unread
响应: { "code": 0, "data": 5 }

二、WebSocket 协议
连接地址: ws://host:8101/api/ws/chat

浏览器自动携带 Session Cookie，服务端握手时校验登录态。拒绝未登录连接。

发送消息
客户端 → 服务端:
{"type":"SEND","conversationId":1,"receiverId":2,"content":"你好","msgType":0}

服务端 → 发送者 (ACK):
{"type":"ACK","messageId":101,"conversationId":1,"content":"你好","createTime":1721741100000}

服务端 → 接收者 (实时推送):
{"type":"NEW_MSG","messageId":101,"conversationId":1,"senderId":1,"content":"你好","msgType":0,"createTime":1721741100000}
conversationId 可为 null（首次发送）

标记已读
客户端 → 服务端:
{"type":"READ","conversationId":1}

服务端 → 对方 (已读回执):
{"type":"READ","conversationId":1,"readerId":2,"time":1721741200000}
前端收到 READ 后更新"已读/未读"状态（如微信的灰色小字→已读）

心跳
→ {"type":"PING"}
← {"type":"PONG"}
建议每 30 秒发送一次 PING

错误
{"type":"ERROR","message":"消息内容不能为空"}
三、前端实现要点
通信兜底链路
发送消息:
  1. WebSocket SEND（在线 → 毫秒级实时）
  2. HTTP POST /api/chat/send（WebSocket异常 → 降级兜底）

接收消息:
  1. WebSocket NEW_MSG 推送（正常在线时）
  2. WebSocket 重连后 GET /api/chat/conversations（补拉遗漏消息）

未读数:
  1. WebSocket NEW_MSG 到达时客户端 +1
  2. 切换页面/重连时 GET /api/chat/unread 全量同步
前端页面说明
匹配页 / 推荐页:

每个用户卡片右下角【联系我】按钮
点击 → POST /chat/conversation/start?targetId=X
获取 conversationId → 跳转聊天界面
消息页（导航栏【消息】入口）:

页面加载 → GET /chat/conversations + 建立 WebSocket
每个会话条目展示: 对方头像 + 昵称 + 最后消息摘要(截断50字) + 时间 + 未读红点 + 在线绿点
点击条目 → 跳转聊天界面
左滑 → DELETE /chat/conversation/{id} 隐藏
聊天界面:

页面加载 → GET /chat/messages/{id}?pageNum=1 + 建立 WebSocket
消息气泡: 自己发的靠右(绿色)，对方发的靠左(白色)
往上滚动 → pageNum++ 加载更早消息，prepend 到列表顶部
输入框发送 → WebSocket SEND，失败降级 HTTP POST
收到 NEW_MSG → append 到列表底部，若当前在此会话则自动发送 READ
收到 READ 回执 → 更新自己发出的消息状态为"已读"
WebSocket 生命周期
页面进入 → new WebSocket("ws://host:8101/api/ws/chat")
         → onopen: 启动心跳定时器(30s PING)
         → onmessage: 分发 type (NEW_MSG/ACK/READ/PONG/ERROR)
         → onclose: 清除心跳定时器，切换到 HTTP 降级模式
         → 5秒后尝试重连（指数退避: 5s→10s→20s→30s上限）
页面离开 → 关闭 WebSocket
四、整体流程图
┌─────────────────────────────────────────────────────────┐
│                    匹配页 / 推荐页                        │
│  用户A 浏览用户B → 点击【联系我】                          │
└──────────────────┬──────────────────────────────────────┘
                   │
              POST /chat/conversation/start?targetId=B
                   │
                   ▼
          ┌────────────────┐
          │ 返回conversationId│
          │ + B的昵称/头像    │
          └────────┬───────┘
                   │
                   ▼
          ┌──────────────────┐
          │  前端跳转聊天界面  │
          │  + 建立 WebSocket  │
          │  + GET /messages  │
          └────────┬─────────┘
                   │
          ┌────────▼────────┐
          │  A 发送消息       │
          │  {"type":"SEND"} │
          └────────┬────────┘
                   │
           ┌───────▼────────┐
           │ 优先走WebSocket  │── 失败 ──→ POST /chat/send (HTTP降级)
           └───────┬────────┘
                   │ 成功
                   ▼
          ┌──────────────────────┐
          │  服务端 ChatServiceImpl│
          │  1. Message 写 MySQL  │
          │  2. 更新 Conversation  │
          │  3. Redis 未读数 +1    │
          │  4. WebSocket 推给 B   │
          └──────────┬───────────┘
                     │
               ┌─────▼──────┐
               │  B 在线?     │
               └─────┬──────┘
               在线   │   离线
               ▼     │     ▼
            WebSocket│  消息已落DB
            实时推送  │  B下次打开
               │     │  GET /conversations
               ▼     │  即可看到
                     │
┌────────────────────▼────────────────────────────────────┐
│                  【消息】页面（导航栏）                     │
│  GET /chat/conversations                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🟢 张三 (在线)    ③ "明天见"          10:30      │   │
│  │ ⚪ 李四          0   "你好"           昨天       │   │
│  └──────────────────────────────────────────────────┘   │
│  每个条目: 头像+昵称+最后消息摘要+时间+未读红点+在线绿点    │
└─────────────────────────────────────────────────────────┘