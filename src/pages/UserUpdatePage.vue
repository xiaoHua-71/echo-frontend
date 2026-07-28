<template>
  <template v-if="user">
    <div class="page-shell">
      <section class="glass-card page-head">
        <h1 class="section-title">资料详情</h1>
        <p class="section-subtitle">查看并编辑你的账号、头像、性别和个人简介。</p>
      </section>

      <section class="glass-card info-card">
        <van-cell title="昵称" is-link :value="user.username" @click="toEdit('username', '昵称', user.username)" />
        <van-cell title="账号" :value="user.userAccount" />
        <van-cell title="头像" is-link :value="user.avatarUrl" @click="toEdit('avatarUrl', '头像', user.avatarUrl)">
          <img class="preview-avatar" :src="user.avatarUrl" alt="avatar" />
        </van-cell>
        <van-cell title="性别" is-link :value="genderLabel" @click="toEdit('gender', '性别', String(user.gender))" />
        <van-cell title="电话" is-link :value="user.phone" @click="toEdit('phone', '电话', user.phone)" />
        <van-cell title="邮箱" is-link :value="user.email" @click="toEdit('email', '邮箱', user.email)" />
        <van-cell title="个人简介" is-link :value="user.profile" @click="toEdit('profile', '个人简介', user.profile)" />
        <van-cell title="注册时间" :value="formatDateTime(user.createTime)" />
      </section>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { formatDateTime } from "../utils/date";
import { getCurrentUser } from "../services/user";

const genderOptions = [
  { name: "男", value: 1 },
  { name: "女", value: 0 },
];

const user = ref();
const router = useRouter();

const genderLabel = computed(() => {
  if (user.value) {
    return genderOptions.find((o) => o.value === user.value.gender)?.name || "";
  }
  return "";
});

onMounted(async () => {
  user.value = await getCurrentUser();
});

const toEdit = (editKey: string, editName: string, currentValue: string) => {
  router.push({
    path: "/user/edit",
    query: {
      editKey,
      editName,
      currentValue,
    },
  });
};
</script>

<style scoped>
.page-head,
.info-card {
  padding: 18px;
}

.info-card {
  overflow: hidden;
}

.info-card :deep(.van-cell) {
  background: transparent;
}

.preview-avatar {
  height: 48px;
  width: 48px;
  border-radius: 14px;
  object-fit: cover;
}
</style>
