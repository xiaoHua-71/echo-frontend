<template>
  <div class="user-list">
    <van-skeleton
      title
      avatar
      :row="3"
      :loading="props.loading"
      v-for="(user, index) in props.userList"
      :key="index"
    >
      <div class="user-card">
        <div class="card-body">
          <van-card
            :desc="user.profile"
            :title="user.username"
            :thumb="user.avatarUrl"
          >
            <template #tags>
              <van-tag
                plain
                type="danger"
                v-for="tag in user.tags"
                :key="tag"
                style="margin-right: 8px; margin-top: 8px"
              >
                {{ tag }}
              </van-tag>
            </template>
          </van-card>
          <div class="card-action">
            <van-button
              type="primary"
              size="small"
              round
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Toast } from 'vant';
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
  if (chattingUserId.value) return; // 防止重复点击

  chattingUserId.value = user.id;
  const conv = await startConversation(user.id);
  chattingUserId.value = null;

  if (conv) {
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
  } else {
    Toast.fail('发起会话失败，请稍后重试');
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
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-body {
  display: flex;
  align-items: center;
}

/* 让 van-card 占据剩余空间 */
.user-card :deep(.van-card) {
  background: transparent;
  flex: 1;
}

.card-action {
  flex-shrink: 0;
  padding-right: 16px;
  padding-left: 8px;
}
</style>
