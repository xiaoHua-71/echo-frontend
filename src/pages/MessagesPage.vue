<template>
  <div class="messages-page">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <!-- 加载骨架 -->
      <van-skeleton
        title
        avatar
        :row="2"
        :loading="loading"
        v-for="i in (loading ? 5 : 0)"
        :key="'skeleton-' + i"
      />

      <!-- 空状态 -->
      <van-empty v-if="!loading && conversations.length === 0" description="暂无消息" />

      <!-- 会话列表 -->
      <div v-if="!loading && conversations.length > 0" class="conversation-list">
        <van-swipe-cell v-for="conv in conversations" :key="conv.conversationId">
          <div class="conv-card" @click="onEnterChat(conv)">
            <div class="avatar-wrap">
              <van-image
                round
                width="48"
                height="48"
                :src="conv.targetAvatarUrl"
              />
              <span v-if="conv.online" class="online-dot"></span>
            </div>
            <div class="conv-body">
              <div class="conv-top">
                <span class="conv-name">{{ conv.targetUsername }}</span>
                <span class="conv-time">{{ formatConvTime(conv.lastMessageTime) }}</span>
              </div>
              <div class="conv-bottom">
                <span class="conv-preview">{{ truncate(conv.lastMessage, 30) }}</span>
                <van-badge v-if="conv.unreadCount > 0" :content="conv.unreadCount" max="99" />
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
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Dialog, Toast } from 'vant';
import { getConversations, getUnreadCount, deleteConversation } from '../services/chat';
import { setUnreadCount } from '../states/chat';
import type { ConversationType } from '../models/chat';

const router = useRouter();

const conversations = ref<ConversationType[]>([]);
const loading = ref(true);
const refreshing = ref(false);

// ---- 加载会话列表 ----
const loadData = async () => {
  const data = await getConversations();
  conversations.value = data;

  // 同步全局未读数
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

// ---- 进入聊天 ----
const onEnterChat = (conv: ConversationType) => {
  router.push({
    path: '/chat',
    query: {
      conversationId: String(conv.conversationId),
      targetUserId: String(conv.targetUserId),
      targetUsername: conv.targetUsername,
      targetAvatarUrl: conv.targetAvatarUrl,
      targetOnline: String(conv.online),
    },
  });
};

// ---- 删除会话 ----
const onDelete = (conv: ConversationType) => {
  Dialog.confirm({
    title: '删除会话',
    message: '删除后将不再显示该会话',
  }).then(async () => {
    const ok = await deleteConversation(conv.conversationId);
    if (ok) {
      conversations.value = conversations.value.filter(c => c.conversationId !== conv.conversationId);
      Toast.success('已删除');
    } else {
      Toast.fail('删除失败');
    }
  }).catch(() => {
    // 取消
  });
};

// ---- 工具函数 ----
const truncate = (text: string | undefined, max: number): string => {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
};

const formatConvTime = (timestamp: number | undefined): string => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');

  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  if (isYesterday) {
    return '昨天';
  }
  if (d.getFullYear() === now.getFullYear()) {
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
</script>

<style scoped>
.messages-page {
  min-height: 100%;
}

/* ====== 会话列表 ====== */
.conversation-list {
  display: flex;
  flex-direction: column;
}

/* ====== 会话卡片 ====== */
.conv-card {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1px solid #f4f5f7;
  gap: 12px;
  cursor: pointer;
}

.conv-card:active {
  background: #f7f8fa;
}

/* 头像 + 在线绿点 */
.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #07c160;
  border: 2px solid #fff;
}

/* 会话主体 */
.conv-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.conv-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conv-name {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
}

.conv-time {
  font-size: 12px;
  color: #969799;
  flex-shrink: 0;
  margin-left: 12px;
}

.conv-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conv-preview {
  font-size: 13px;
  color: #969799;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ====== 滑动删除按钮 ====== */
.delete-btn {
  height: 100%;
  min-width: 64px;
}

/* ====== 下拉刷新位置调整 ====== */
.messages-page :deep(.van-pull-refresh) {
  min-height: calc(100vh - 46px - 50px - 24px);
}
</style>
