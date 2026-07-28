<template>
  <div class="user-list">
    <van-skeleton
      v-for="(user, index) in props.userList"
      :key="index"
      title
      avatar
      :row="3"
      :loading="props.loading"
    >
      <div class="user-card glass-card">
        <div class="card-accent"></div>
        <div class="card-body">
          <van-card :desc="user.profile" :title="user.username" :thumb="user.avatarUrl">
            <template #tags>
              <van-tag
                v-for="tag in user.tags"
                :key="tag"
                plain
                class="user-tag"
              >
                {{ tag }}
              </van-tag>
            </template>
          </van-card>
          <div class="card-action">
            <div class="action-copy">Start chat</div>
            <van-button
              type="primary"
              size="small"
              round
              class="chat-button"
              :loading="chattingUserId === user.id"
              @click="onEnterChat(user)"
            >
              进入聊天
            </van-button>
          </div>
        </div>
      </div>
    </van-skeleton>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Toast } from "vant";
import { UserType } from "../models/user";
import { startConversation } from "../services/chat";

interface UserCardListProps {
  loading: boolean;
  userList: UserType[];
}

const props = withDefaults(defineProps<UserCardListProps>(), {
  loading: true,
  // @ts-ignore
  userList: [] as UserType[],
});

const router = useRouter();
const chattingUserId = ref<number | null>(null);

const onEnterChat = async (user: UserType) => {
  if (chattingUserId.value) return;

  chattingUserId.value = user.id;
  const conv = await startConversation(user.id);
  chattingUserId.value = null;

  if (conv) {
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
  } else {
    Toast.fail("发起会话失败，请稍后重试");
  }
};
</script>

<style scoped>
.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  position: relative;
  overflow: hidden;
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
}

.card-body {
  display: flex;
  align-items: center;
}

.user-card :deep(.van-card) {
  background: transparent;
  flex: 1;
  padding: 18px 14px 18px 16px;
}

.user-card :deep(.van-card__title) {
  margin-bottom: 6px;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
}

.user-card :deep(.van-card__desc) {
  color: var(--text-secondary);
  line-height: 1.55;
}

.user-card :deep(.van-card__thumb img) {
  object-fit: cover;
  border-radius: 16px;
}

.user-tag {
  margin-right: 8px;
  margin-top: 8px;
  color: var(--accent-primary-deep);
  border-color: rgba(224, 122, 95, 0.22);
  background: rgba(224, 122, 95, 0.08);
}

.card-action {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-right: 16px;
  padding-left: 8px;
}

.action-copy {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.chat-button {
  min-width: 92px;
  border: none;
  background: linear-gradient(135deg, var(--accent-primary) 0%, #ef9a74 100%);
  box-shadow: 0 10px 18px rgba(224, 122, 95, 0.22);
}
</style>
