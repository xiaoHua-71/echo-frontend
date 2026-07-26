<template>
  <div class="chat-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      :title="targetUsername"
      left-arrow
      @click-left="onBack"
    >
      <template #right>
        <span class="online-dot" v-if="targetOnline"></span>
      </template>
    </van-nav-bar>

    <!-- 消息列表 -->
    <div class="msg-list" ref="msgListRef" @scroll="onScroll">
      <div v-if="loading" class="loading-wrap">
        <van-loading size="20" />
      </div>
      <div v-else-if="!hasMore && messages.length > 0" class="no-more">没有更多消息了</div>

      <van-empty v-if="!loading && messages.length === 0" description="暂无消息，发送第一条消息吧~" />

      <div v-for="msg in messages" :key="msg.messageId" class="msg-row" :class="{ self: msg.senderId === currentUserId }">
        <van-image
          v-if="msg.senderId !== currentUserId"
          round
          width="36"
          height="36"
          :src="targetAvatarUrl"
          class="avatar"
        />
        <div class="bubble-wrap">
          <div class="bubble" :class="{ self: msg.senderId === currentUserId }">
            {{ msg.content }}
          </div>
          <div class="time" :class="{ self: msg.senderId === currentUserId }">
            {{ formatMsgTime(msg.createTime) }}
          </div>
        </div>
        <van-image
          v-if="msg.senderId === currentUserId"
          round
          width="36"
          height="36"
          :src="currentUserAvatar"
          class="avatar"
        />
      </div>
    </div>

    <!-- 底部输入栏 -->
    <div class="input-bar">
      <van-field
        v-model="inputText"
        placeholder="输入消息..."
        :disabled="sending"
        @keyup.enter="doSend"
      />
      <van-button
        round
        type="primary"
        size="small"
        :loading="sending"
        @click="doSend"
      >
        发送
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Toast } from 'vant';
import {
  ChatWebSocket,
  getMessages,
  sendMessageHttp,
} from '../services/chat';
import { getCurrentUser } from '../services/user';
import type { MessageType } from '../models/chat';

const route = useRoute();
const router = useRouter();

// ---- 页面参数 ----
const conversationId = Number(route.query.conversationId);
const targetUserId = Number(route.query.targetUserId);
const targetUsername = ref(route.query.targetUsername as string || '聊天');
const targetAvatarUrl = ref(route.query.targetAvatarUrl as string || '');
const targetOnline = ref(route.query.targetOnline === 'true');

const onBack = () => {
  router.back();
};

// ---- 状态 ----
const messages = ref<MessageType[]>([]);
const inputText = ref('');
const sending = ref(false);
const loading = ref(true);
const loadingMore = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const currentUserId = ref<number>(0);
const currentUserAvatar = ref('');
const msgListRef = ref<HTMLElement>();

let ws: ChatWebSocket | null = null;

// ---- 初始化 ----
onMounted(async () => {
  // 获取当前用户信息
  const user = await getCurrentUser();
  if (user) {
    currentUserId.value = user.id;
    currentUserAvatar.value = user.avatarUrl || '';
  }

  // 设置页面标题
  document.title = targetUsername.value;

  // 加载历史消息
  await loadMessages();
  loading.value = false;
  scrollToBottom();

  // 建立 WebSocket
  ws = new ChatWebSocket();
  ws.onMessage(handleWsMessage);
  ws.connect();
});

onBeforeUnmount(() => {
  if (ws) {
    ws.disconnect();
    ws = null;
  }
  document.title = '伙伴匹配';
});

// ---- 加载消息 ----
const loadMessages = async () => {
  const data = await getMessages(conversationId, currentPage.value);
  if (data.length > 0) {
    // 后端返回最新消息在前，reverse 后 prepend
    messages.value = [...data.reverse(), ...messages.value];
    if (data.length < 20) {
      hasMore.value = false;
    }
  } else {
    hasMore.value = false;
  }
};

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return;
  loadingMore.value = true;
  currentPage.value++;
  await loadMessages();
  loadingMore.value = false;
};

// ---- 滚动处理 ----
const onScroll = () => {
  const el = msgListRef.value;
  if (!el) return;
  // 滚动到顶部时加载更多
  if (el.scrollTop === 0 && hasMore.value && !loadingMore.value) {
    const prevHeight = el.scrollHeight;
    loadMore().then(() => {
      nextTick(() => {
        // 保持滚动位置
        if (el) {
          el.scrollTop = el.scrollHeight - prevHeight;
        }
      });
    });
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    const el = msgListRef.value;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  });
};

// 乐观更新：用临时负数 ID 标记未确认的消息，FIFO 队列匹配 ACK
let tempIdCounter = -1;
const pendingAckQueue: MessageType[] = []; // 等待 ACK 的消息队列

// ---- WebSocket 消息处理 ----
const handleWsMessage = (msg: any) => {
  switch (msg.type) {
    case 'NEW_MSG': {
      // 排除自己发的消息（已通过乐观更新添加）
      if (msg.senderId === currentUserId.value) break;

      const newMsg: MessageType = {
        messageId: msg.messageId,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        receiverId: currentUserId.value,
        content: msg.content,
        msgType: msg.msgType ?? 0,
        status: 0,
        createTime: msg.createTime,
      };
      messages.value.push(newMsg);
      scrollToBottom();
      // 自动标记已读
      ws?.send({ type: 'READ', conversationId });
      break;
    }
    case 'ACK': {
      // WebSocket 有序：取队首的乐观消息，用服务端返回的 messageId 更新
      const optimistic = pendingAckQueue.shift();
      if (optimistic) {
        optimistic.messageId = msg.messageId;
        optimistic.createTime = msg.createTime;
        // 首次发送时 conversationId 可能为 0/null，用服务端返回的更新
        if (!optimistic.conversationId && msg.conversationId) {
          optimistic.conversationId = msg.conversationId;
          // 更新页面 URL 中的 conversationId
          window.history.replaceState(null, '', `?conversationId=${msg.conversationId}&targetUserId=${targetUserId}&targetUsername=${targetUsername.value}&targetAvatarUrl=${targetAvatarUrl.value}&targetOnline=${targetOnline.value}`);
        }
      }
      break;
    }
    case 'READ': {
      // 对方已读
      break;
    }
    case 'ERROR': {
      Toast.fail(msg.message || '发送失败');
      break;
    }
  }
};

// ---- 发送消息 ----
const doSend = async () => {
  const text = inputText.value.trim();
  if (!text || sending.value) return;

  sending.value = true;
  inputText.value = '';

  // 生成临时 ID 用于乐观更新 + ACK 匹配
  const tempId = tempIdCounter--;

  // 乐观消息占位（立即显示在本地）
  const optimisticMsg: MessageType = {
    messageId: tempId,
    conversationId: conversationId,
    senderId: currentUserId.value,
    receiverId: targetUserId,
    content: text,
    msgType: 0,
    status: 0,
    createTime: Date.now(),
  };

  // 先尝试 WebSocket
  const wsOk = ws?.send({
    type: 'SEND',
    conversationId,
    receiverId: targetUserId,
    content: text,
    msgType: 0,
  } as any);

  if (wsOk) {
    // WebSocket 发送成功 → 乐观添加到列表
    messages.value.push(optimisticMsg);
    pendingAckQueue.push(optimisticMsg);
    scrollToBottom();
  } else {
    // WebSocket 不可用，走 HTTP 降级
    const result = await sendMessageHttp(conversationId, targetUserId, text, 0);
    if (result) {
      messages.value.push(result);
      // 首次发送时更新 conversationId
      if (!conversationId && result.conversationId) {
        window.history.replaceState(null, '', `?conversationId=${result.conversationId}&targetUserId=${targetUserId}&targetUsername=${targetUsername.value}&targetAvatarUrl=${targetAvatarUrl.value}&targetOnline=${targetOnline.value}`);
      }
      scrollToBottom();
    } else {
      Toast.fail('发送失败，请重试');
      inputText.value = text; // 恢复输入
    }
  }

  sending.value = false;
};

// ---- 时间格式化 ----
const formatMsgTime = (timestamp: number): string => {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
</script>

<style scoped>
.chat-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: #f4f5f7;
}

/* ====== 在线状态点 ====== */
.online-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #07c160;
}

/* ====== 消息列表 ====== */
.msg-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 12px;
}

.no-more {
  text-align: center;
  font-size: 12px;
  color: #969799;
  padding: 12px;
}

/* ====== 消息行 ====== */
.msg-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.msg-row.self {
  justify-content: flex-end;
}

.avatar {
  flex-shrink: 0;
  margin-top: 2px;
}

.msg-row.self .avatar {
  margin-left: 8px;
}

.msg-row:not(.self) .avatar {
  margin-right: 8px;
}

/* ====== 气泡外容器 ====== */
.bubble-wrap {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

/* ====== 气泡 ====== */
.bubble {
  padding: 10px 14px;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
  border-radius: 12px 4px 12px 12px;
  background: #fff;
  color: #323233;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.bubble.self {
  border-radius: 4px 12px 12px 12px;
  background: #95ec69;
  color: #000;
}

/* ====== 时间 ====== */
.time {
  font-size: 11px;
  color: #969799;
  margin-top: 4px;
  padding: 0 4px;
}

.time.self {
  text-align: right;
}

/* ====== 底部输入栏 ====== */
.input-bar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  border-top: 1px solid #ebedf0;
  gap: 8px;
}

.input-bar :deep(.van-field) {
  flex: 1;
  background: #f4f5f7;
  border-radius: 20px;
  padding: 6px 16px;
}

.input-bar :deep(.van-field__control) {
  font-size: 14px;
}
</style>
