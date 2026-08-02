import myAxios from "../plugins/myAxios";
import type { ConversationType, MessageType, TeamConversationType, TeamMessageType, WsMessage, WsSendPayload } from "../models/chat";

// ==================== REST API ====================

/**
 * 开始会话（点击"进入聊天"）
 */
export const startConversation = async (targetId: number): Promise<ConversationType | null> => {
    const res = await myAxios.post<ConversationType>(`/chat/conversation/start?targetId=${targetId}`);
    if (res.code === 0 && res.data) {
        return res.data;
    }
    return null;
};

/**
 * 获取我的会话列表
 */
export const getConversations = async (): Promise<ConversationType[]> => {
    const res = await myAxios.get<ConversationType[]>('/chat/conversations');
    if (res.code === 0 && res.data) {
        return res.data;
    }
    return [];
};

export const getTeamConversations = async (): Promise<TeamConversationType[]> => {
    const res = await myAxios.get<TeamConversationType[]>('/team/chat/conversations');
    if (res.code === 0 && res.data) return res.data;
    return [];
};

/**
 * 获取消息历史（分页，最新消息在前）
 */
export const getMessages = async (
    conversationId: number,
    pageNum: number = 1,
    pageSize: number = 20,
): Promise<MessageType[]> => {
    const res = await myAxios.get<MessageType[]>(
        `/chat/messages/${conversationId}?pageNum=${pageNum}&pageSize=${pageSize}`,
    );
    if (res.code === 0 && res.data) {
        return res.data;
    }
    return [];
};

export const getTeamMessages = async (
    teamId: number,
    pageNum: number = 1,
    pageSize: number = 20,
): Promise<TeamMessageType[]> => {
    const res = await myAxios.get<TeamMessageType[]>(
        `/team/chat/messages/${teamId}?pageNum=${pageNum}&pageSize=${pageSize}`,
    );
    if (res.code === 0 && res.data) return res.data;
    return [];
};

/**
 * 发送消息（HTTP 降级兜底）
 */
export const sendMessageHttp = async (
    conversationId: number | null,
    receiverId: number,
    content: string,
    msgType: number = 0,
): Promise<MessageType | null> => {
    const res = await myAxios.post<MessageType>('/chat/send', {
        conversationId,
        receiverId,
        content,
        msgType,
    });
    if (res.code === 0 && res.data) {
        return res.data;
    }
    return null;
};

export const sendTeamMessageHttp = async (
    teamId: number,
    content: string,
    msgType: number = 0,
): Promise<TeamMessageType | null> => {
    const res = await myAxios.post<TeamMessageType>('/team/chat/send', { teamId, content, msgType });
    if (res.code === 0 && res.data) return res.data;
    return null;
};

/**
 * 标记已读
 */
export const markRead = async (conversationId: number): Promise<boolean> => {
    const res = await myAxios.put<boolean>(`/chat/read/${conversationId}`);
    return res.code === 0;
};

/**
 * 删除/隐藏会话
 */
export const deleteConversation = async (conversationId: number): Promise<boolean> => {
    const res = await myAxios.delete<boolean>(`/chat/conversation/${conversationId}`);
    return res.code === 0;
};

/**
 * 获取未读消息总数
 */
export const getUnreadCount = async (): Promise<number> => {
    const res = await myAxios.get<number>('/chat/unread');
    if (res.code === 0) {
        return res.data ?? 0;
    }
    return 0;
};

// ==================== WebSocket ====================

type MessageHandler = (msg: WsMessage) => void;

export class ChatWebSocket {
    private ws: WebSocket | null = null;
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private reconnectDelay: number = 5000;
    private maxReconnectDelay: number = 30000;
    private messageHandler: MessageHandler | null = null;

    /**
     * 建立 WebSocket 连接
     */
    connect(): void {
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        // 开发环境直连后端 8101，生产环境同源
        const isDev = process.env.NODE_ENV === 'development';
        const wsUrl = isDev
            ? 'ws://localhost:8101/api/ws/chat'
            : `${protocol}//${location.host}/api/ws/chat`;

        try {
            this.ws = new WebSocket(wsUrl);
        } catch {
            console.error('[ChatWS] Failed to create WebSocket');
            this.scheduleReconnect();
            return;
        }

        this.ws.onopen = () => {
            console.log('[ChatWS] Connected');
            this.reconnectDelay = 5000; // 重置重连延迟
            this.startHeartbeat();
        };

        this.ws.onmessage = (event: MessageEvent) => {
            try {
                const msg: WsMessage = JSON.parse(event.data);
                if (msg.type !== 'PONG') {
                    console.log('[ChatWS] Received:', msg.type);
                }
                if (this.messageHandler) {
                    this.messageHandler(msg);
                }
            } catch {
                console.error('[ChatWS] Failed to parse message:', event.data);
            }
        };

        this.ws.onerror = () => {
            console.error('[ChatWS] Error');
        };

        this.ws.onclose = () => {
            console.log('[ChatWS] Disconnected');
            this.clearHeartbeat();
            this.scheduleReconnect();
        };
    }

    /**
     * 发送消息（JSON 序列化后发送）
     */
    send(payload: WsSendPayload): boolean {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('[ChatWS] Cannot send — socket not open');
            return false;
        }
        try {
            this.ws.send(JSON.stringify(payload));
            return true;
        } catch {
            console.error('[ChatWS] Send failed');
            return false;
        }
    }

    /**
     * 注册消息处理回调
     */
    onMessage(handler: MessageHandler): void {
        this.messageHandler = handler;
    }

    /**
     * 断开连接（页面离开时调用，不重连）
     */
    disconnect(): void {
        this.clearHeartbeat();
        this.clearReconnect();
        this.messageHandler = null;
        if (this.ws) {
            this.ws.onclose = null; // 阻止重连
            this.ws.close();
            this.ws = null;
        }
    }

    /**
     * 连接是否已打开
     */
    get isOpen(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    // ---- 内部 ----

    private startHeartbeat(): void {
        this.clearHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            this.send({ type: 'PING' });
        }, 30000);
    }

    private clearHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    private scheduleReconnect(): void {
        this.clearReconnect();
        console.log(`[ChatWS] Reconnecting in ${this.reconnectDelay}ms`);
        this.reconnectTimer = setTimeout(() => {
            this.connect();
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
        }, this.reconnectDelay);
    }

    private clearReconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }
}
