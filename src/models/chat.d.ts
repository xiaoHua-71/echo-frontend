/**
 * 会话类型（对应 GET /chat/conversations 和 POST /chat/conversation/start 返回）
 */
export type ConversationType = {
    conversationId: number;
    targetUserId: number;
    targetUsername: string;
    targetAvatarUrl: string;
    lastMessage?: string;
    lastMessageTime?: number;
    unreadCount: number;
    online: boolean;
};

export type TeamConversationType = {
    teamId: number;
    teamName: string;
    lastMessage?: string;
    lastMessageTime?: number;
    memberCount: number;
};

/**
 * 消息类型
 * msgType: 0=文本, 1=图片, 2=系统消息
 * status: 0=未读, 1=已读, 2=已撤回
 */
export type MessageType = {
    messageId: number;
    conversationId: number;
    senderId: number;
    receiverId: number;
    content: string;
    msgType: number;
    status: number;
    createTime: number;
    senderName?: string;
    senderAvatarUrl?: string;
};

export type TeamMessageType = {
    messageId: number;
    teamId: number;
    senderId: number;
    senderName: string;
    senderAvatarUrl?: string;
    content: string;
    msgType: number;
    status: number;
    createTime: number;
};

/**
 * WebSocket 消息方向
 * SEND: 客户端 → 服务端 发送消息
 * ACK: 服务端 → 发送者 确认回执
 * NEW_MSG: 服务端 → 接收者 实时推送
 */
export type WsSendMsg = {
    type: 'SEND';
    conversationId: number | null;
    receiverId: number;
    content: string;
    msgType: number;
};

export type WsSendTeamMsg = {
    type: 'SEND_TEAM';
    teamId: number;
    content: string;
    msgType: number;
};

export type WsAckMsg = {
    type: 'ACK';
    messageId: number;
    conversationId: number;
    content: string;
    createTime: number;
};

export type WsAckTeamMsg = {
    type: 'ACK_TEAM';
    messageId: number;
    teamId: number;
    content: string;
    createTime: number;
};

export type WsNewMsg = {
    type: 'NEW_MSG';
    messageId: number;
    conversationId: number;
    senderId: number;
    content: string;
    msgType: number;
    createTime: number;
};

export type WsNewTeamMsg = {
    type: 'NEW_TEAM_MSG';
    messageId: number;
    teamId: number;
    senderId: number;
    senderName?: string;
    senderAvatarUrl?: string;
    content: string;
    msgType: number;
    createTime: number;
};

export type WsReadMsg = {
    type: 'READ';
    conversationId: number;
    readerId?: number;
    time?: number;
};

export type WsPingMsg = {
    type: 'PING';
};

export type WsPongMsg = {
    type: 'PONG';
};

export type WsErrorMsg = {
    type: 'ERROR';
    message: string;
};

/**
 * 所有 WebSocket 消息的联合类型
 */
export type WsMessage =
    | WsAckMsg
    | WsNewMsg
    | WsReadMsg
    | WsPongMsg
    | WsErrorMsg
    | WsAckTeamMsg
    | WsNewTeamMsg;

/**
 * 客户端可发送的 WS 消息类型
 */
export type WsSendPayload = WsSendMsg | WsSendTeamMsg | WsReadMsg | WsPingMsg;
