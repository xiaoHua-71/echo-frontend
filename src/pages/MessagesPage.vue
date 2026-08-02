<template>
  <div class="messages-page page-shell">
    <section class="glass-card page-head">
      <h1 class="section-title">消息中心</h1>
      <p class="section-subtitle">集中查看最近会话、未读消息和在线状态。</p>
    </section>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-skeleton
        v-for="i in loading ? 5 : 0"
        :key="'skeleton-' + i"
        title
        avatar
        :row="2"
        :loading="loading"
      />

      <van-empty v-if="!loading && conversations.length === 0" description="暂无消息" />

      <div v-if="!loading && conversations.length > 0" class="conversation-list">
        <van-swipe-cell v-for="conv in conversations" :key="conv.key" :disabled="conv.kind === 'team'">
          <div class="conv-card glass-card" @click="onEnterChat(conv)">
            <div class="avatar-wrap">
              <van-image v-if="conv.kind === 'private'" round width="52" height="52" :src="conv.targetAvatarUrl" />
              <div v-if="conv.kind === 'team'" class="team-avatar">群</div>
              <span v-if="conv.kind === 'private' && conv.online" class="online-dot"></span>
            </div>
            <div class="conv-body">
              <div class="conv-top">
                <span class="conv-name">{{ conv.kind === 'team' ? conv.teamName : conv.targetUsername }}</span>
                <span class="conv-time">{{ formatConvTime(conv.lastMessageTime) }}</span>
              </div>
              <div class="conv-bottom">
                <span class="conv-preview">{{ truncate(conv.lastMessage, 30) }}</span>
                <van-badge v-if="conv.kind === 'private' && conv.unreadCount > 0" :content="conv.unreadCount" max="99" />
              </div>
            </div>
          </div>
          <template #right>
            <van-button
              type="danger"
              square
              text="删除"
              class="delete-btn"
              @click="onDelete(conv)"
            />
          </template>
        </van-swipe-cell>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Dialog, Toast } from "vant";
import type { ConversationType, TeamConversationType } from "../models/chat";
import { deleteConversation, getConversations, getTeamConversations, getUnreadCount } from "../services/chat";
import { setUnreadCount } from "../states/chat";

const router = useRouter();
type DisplayConversation =
  | (ConversationType & { kind: "private"; key: string })
  | (TeamConversationType & { kind: "team"; key: string });
const conversations = ref<DisplayConversation[]>([]);
const loading = ref(true);
const refreshing = ref(false);

const loadData = async () => {
  const [privateConversations, teamConversations] = await Promise.all([
    getConversations(),
    getTeamConversations(),
  ]);
  conversations.value = [
    ...privateConversations.map((conversation) => ({ ...conversation, kind: "private" as const, key: `private-${conversation.conversationId}` })),
    ...teamConversations.map((conversation) => ({ ...conversation, kind: "team" as const, key: `team-${conversation.teamId}` })),
  ].sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));

  const count = await getUnreadCount();
  setUnreadCount(count);
};

onMounted(async () => {
  await loadData();
  loading.value = false;
});

const onRefresh = async () => {
  refreshing.value = true;
  await loadData();
  refreshing.value = false;
};

const onEnterChat = (conv: DisplayConversation) => {
  if (conv.kind === "team") {
    router.push({ path: "/chat", query: { teamId: String(conv.teamId), teamName: conv.teamName } });
    return;
  }
  router.push({
    path: "/chat",
    query: {
      conversationId: String(conv.conversationId),
      targetUserId: String(conv.targetUserId),
      targetUsername: conv.targetUsername,
      targetAvatarUrl: conv.targetAvatarUrl,
      targetOnline: String(conv.online),
    },
  });
};

const onDelete = (conv: DisplayConversation) => {
  if (conv.kind === "team") return;
  Dialog.confirm({
    title: "删除会话",
    message: "删除后将不再显示该会话。",
  })
    .then(async () => {
      const ok = await deleteConversation(conv.conversationId);
      if (ok) {
        conversations.value = conversations.value.filter((c) => c.key !== conv.key);
        Toast.success("已删除");
      } else {
        Toast.fail("删除失败");
      }
    })
    .catch(() => undefined);
};

const truncate = (text: string | undefined, max: number): string => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

const formatConvTime = (timestamp: number | undefined): string => {
  if (!timestamp) return "";

  const d = new Date(timestamp);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");

  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  if (isYesterday) {
    return "昨天";
  }
  if (d.getFullYear() === now.getFullYear()) {
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
</script>

<style scoped>
.page-head {
  padding: 18px 18px 16px;
}

.messages-page {
  min-height: 100%;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.conv-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
}

.conv-card:active {
  transform: scale(0.995);
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.online-dot {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #07c160;
  border: 2px solid #fff;
}

.team-avatar {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--accent-primary);
  color: #fff;
  font-weight: 700;
}

.conv-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.conv-top,
.conv-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.conv-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.conv-time,
.conv-preview {
  color: var(--text-secondary);
  font-size: 12px;
}

.conv-preview {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  height: 100%;
  min-width: 68px;
}

.messages-page :deep(.van-pull-refresh) {
  min-height: calc(100vh - 46px - 50px - 24px);
}

.messages-page :deep(.van-badge) {
  background: var(--accent-primary);
}
</style>
