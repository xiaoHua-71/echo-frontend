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
              @click="toggleContact(index)"
            >
              {{ expandedIndex === index ? '收起' : '联系我' }}
            </van-button>
          </div>
        </div>
        <transition name="expand">
          <div v-show="expandedIndex === index" class="contact-wrap">
            <div class="contact-info">
              <van-icon name="envelope-o" size="16" color="#1989fa" />
              <span class="email-text">email: {{ user.email }}</span>
            </div>
          </div>
        </transition>
      </div>
    </van-skeleton>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {UserType} from "../models/user";

interface UserCardListProps {
  loading: boolean;
  userList: UserType[];
}

const props = withDefaults(defineProps<UserCardListProps>(), {
  loading: true,
  // @ts-ignore
  userList: [] as UserType[],
});

const expandedIndex = ref<number | null>(null);

const toggleContact = (index: number) => {
  expandedIndex.value = expandedIndex.value === index ? null : index;
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

.contact-wrap {
  overflow: hidden;
  border-radius: 0 0 12px 12px;
  background: #f7f8fa;
  margin: 0 12px 12px;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 14px;
}

.email-text {
  font-size: 14px;
  color: #323233;
  user-select: all;
}

/* 展开/收起过渡 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 60px;
  opacity: 1;
}
</style>
