<template>
  <div class="chat-page">
    <div class="chat-shell">
      <van-nav-bar :title="targetUsername" left-arrow class="chat-nav" @click-left="onBack">
        <template #right>
          <div class="chat-status" :class="{ online: targetOnline }">
            <span class="online-dot"></span>
            <span>{{ targetOnline ? "在线" : "离线" }}</span>
          </div>
        </template>
      </van-nav-bar>

      <div class="msg-list" ref="msgListRef" @scroll="onScroll">
        <div v-if="loading" class="loading-wrap">
          <van-loading size="20" />
        </div>

        <div v-else-if="!hasMore && messages.length > 0" class="no-more">
          没有更多消息了
        </div>

        <van-empty
          v-if="!loading && messages.length === 0"
          description="暂无消息，发出第一条问候吧"
        />

        <div
          v-for="msg in messages"
          :key="msg.messageId"
          class="msg-row"
          :class="{ self: msg.senderId === currentUserId }"
        >
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
          class="send-button"
          :loading="sending"
          @click="doSend"
        >
          发送
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Toast } from "vant";
import type { MessageType } from "../models/chat";
import { ChatWebSocket, getMessages, sendMessageHttp } from "../services/chat";
import { getCurrentUser } from "../services/user";

const route = useRoute();
const router = useRouter();

const conversationId = Number(route.query.conversationId);
const targetUserId = Number(route.query.targetUserId);
const targetUsername = ref((route.query.targetUsername as string) || "聊天");
const targetAvatarUrl = ref((route.query.targetAvatarUrl as string) || "");
const targetOnline = ref(route.query.targetOnline === "true");

const messages = ref<MessageType[]>([]);
const inputText = ref("");
const sending = ref(false);
const loading = ref(true);
const loadingMore = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const currentUserId = ref<number>(0);
const currentUserAvatar = ref("");
const msgListRef = ref<HTMLElement>();

let ws: ChatWebSocket | null = null;
let tempIdCounter = -1;
const pendingAckQueue: MessageType[] = [];

const updateViewportHeight = () => {
  const height = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--chat-viewport-height", `${height}px`);
};

const onViewportResize = () => {
  const el = msgListRef.value;
  const wasNearBottom = el
    ? el.scrollHeight - el.scrollTop - el.clientHeight < 100
    : false;

  updateViewportHeight();
  if (wasNearBottom) scrollToBottom();
};

const onBack = () => {
  router.back();
};

onMounted(async () => {
  updateViewportHeight();
  window.visualViewport?.addEventListener("resize", onViewportResize);

  const user = await getCurrentUser();
  if (user) {
    currentUserId.value = user.id;
    currentUserAvatar.value = user.avatarUrl || "";
  }

  document.title = `ECHO · ${targetUsername.value}`;
  await loadMessages();
  loading.value = false;
  scrollToBottom();

  ws = new ChatWebSocket();
  ws.onMessage(handleWsMessage);
  ws.connect();
});

onBeforeUnmount(() => {
  window.visualViewport?.removeEventListener("resize", onViewportResize);
  document.documentElement.style.removeProperty("--chat-viewport-height");

  if (ws) {
    ws.disconnect();
    ws = null;
  }
  document.title = "ECHO";
});

const loadMessages = async () => {
  const data = await getMessages(conversationId, currentPage.value);
  if (data.length > 0) {
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

const onScroll = () => {
  const el = msgListRef.value;
  if (!el) return;

  if (el.scrollTop === 0 && hasMore.value && !loadingMore.value) {
    const prevHeight = el.scrollHeight;
    loadMore().then(() => {
      nextTick(() => {
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

const handleWsMessage = (msg: any) => {
  switch (msg.type) {
    case "NEW_MSG": {
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
      ws?.send({ type: "READ", conversationId });
      break;
    }
    case "ACK": {
      const optimistic = pendingAckQueue.shift();
      if (optimistic) {
        optimistic.messageId = msg.messageId;
        optimistic.createTime = msg.createTime;
        if (!optimistic.conversationId && msg.conversationId) {
          optimistic.conversationId = msg.conversationId;
          window.history.replaceState(
            null,
            "",
            `?conversationId=${msg.conversationId}&targetUserId=${targetUserId}&targetUsername=${targetUsername.value}&targetAvatarUrl=${targetAvatarUrl.value}&targetOnline=${targetOnline.value}`,
          );
        }
      }
      break;
    }
    case "ERROR": {
      Toast.fail(msg.message || "发送失败");
      break;
    }
  }
};

const doSend = async () => {
  const text = inputText.value.trim();
  if (!text || sending.value) return;

  sending.value = true;
  inputText.value = "";
  const tempId = tempIdCounter--;

  const optimisticMsg: MessageType = {
    messageId: tempId,
    conversationId,
    senderId: currentUserId.value,
    receiverId: targetUserId,
    content: text,
    msgType: 0,
    status: 0,
    createTime: Date.now(),
  };

  const wsOk = ws?.send({
    type: "SEND",
    conversationId,
    receiverId: targetUserId,
    content: text,
    msgType: 0,
  } as any);

  if (wsOk) {
    messages.value.push(optimisticMsg);
    pendingAckQueue.push(optimisticMsg);
    scrollToBottom();
  } else {
    const result = await sendMessageHttp(conversationId, targetUserId, text, 0);
    if (result) {
      messages.value.push(result);
      if (!conversationId && result.conversationId) {
        window.history.replaceState(
          null,
          "",
          `?conversationId=${result.conversationId}&targetUserId=${targetUserId}&targetUsername=${targetUsername.value}&targetAvatarUrl=${targetAvatarUrl.value}&targetOnline=${targetOnline.value}`,
        );
      }
      scrollToBottom();
    } else {
      Toast.fail("发送失败，请重试");
      inputText.value = text;
    }
  }

  sending.value = false;
};

const formatMsgTime = (timestamp: number): string => {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
</script>

<style scoped>
.chat-page {
  position: fixed;
  inset: 0;
  z-index: 100;
  height: var(--chat-viewport-height, 100dvh);
  background:
    radial-gradient(circle at top right, rgba(242, 204, 143, 0.18), transparent 26%),
    linear-gradient(180deg, #f7efe4 0%, #eef2f8 100%);
}

.chat-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(18px);
}

.chat-nav {
  flex-shrink: 0;
  padding-top: env(safe-area-inset-top, 0px);
  background: rgba(255, 250, 244, 0.88);
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.chat-status.online {
  color: var(--accent-highlight);
}

.online-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.msg-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
}

.loading-wrap,
.no-more {
  display: flex;
  justify-content: center;
  padding: 12px;
  color: var(--text-secondary);
}

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

.bubble-wrap {
  display: flex;
  flex-direction: column;
  max-width: 72%;
}

.bubble {
  padding: 11px 14px;
  border-radius: 16px 16px 16px 6px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--text-primary);
  line-height: 1.55;
  box-shadow: var(--shadow-soft);
  word-break: break-word;
}

.bubble.self {
  border-radius: 16px 16px 6px 16px;
  background: linear-gradient(135deg, rgba(224, 122, 95, 0.92) 0%, rgba(242, 204, 143, 0.94) 100%);
  color: #fff;
}

.time {
  margin-top: 4px;
  padding: 0 4px;
  font-size: 11px;
  color: var(--text-muted);
}

.time.self {
  text-align: right;
}

.input-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px calc(12px + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 250, 244, 0.94);
  border-top: 1px solid rgba(224, 122, 95, 0.1);
}

.input-bar :deep(.van-cell),
.input-bar :deep(.van-field) {
  flex: 1;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 20px;
}

.input-bar :deep(.van-field__body) {
  min-height: 36px;
}

.input-bar :deep(.van-field__control) {
  font-size: 14px;
}

.send-button {
  flex-shrink: 0;
  min-width: 68px;
  border: none;
  background: linear-gradient(135deg, var(--accent-primary) 0%, #ef9a74 100%);
}
</style>
