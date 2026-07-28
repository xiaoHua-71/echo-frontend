<template>
  <template v-if="user">
    <div class="page-shell">
      <div class="profile-card glass-card">
        <div class="profile-banner"></div>
        <van-image
          round
          width="72"
          height="72"
          :src="user.avatarUrl"
          class="avatar"
        />
        <div class="profile-name">{{ user.username }}</div>
        <div class="profile-account">@{{ user.userAccount }}</div>
      </div>

      <div class="menu-card glass-card">
        <van-cell title="修改信息" is-link to="/user/update" icon="edit" />
        <van-cell title="我创建的队伍" is-link to="/user/team/create" icon="flag-o" />
        <van-cell title="我加入的队伍" is-link to="/user/team/join" icon="friends-o" />
      </div>

      <div class="logout-wrapper">
        <van-button
          block
          round
          icon="revoke"
          type="default"
          class="logout-button"
          @click="onLogout"
        >
          退出登录
        </van-button>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Toast } from "vant";
import myAxios from "../plugins/myAxios";
import { getCurrentUser } from "../services/user";
import { clearCurrentUserState } from "../states/user";

const user = ref();
const router = useRouter();

onMounted(async () => {
  user.value = await getCurrentUser();
});

const onLogout = async () => {
  const res = await myAxios.post("/user/logout");
  if (res.code === 0) {
    clearCurrentUserState();
    Toast.success("已退出");
    router.replace("/user/login");
  } else {
    Toast.fail("退出失败");
  }
};
</script>

<style scoped>
.profile-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 16px 24px;
  overflow: hidden;
}

.profile-banner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 88px;
  background: linear-gradient(135deg, rgba(224, 122, 95, 0.92) 0%, rgba(242, 204, 143, 0.92) 100%);
}

.avatar {
  position: relative;
  z-index: 1;
  margin-bottom: 12px;
  box-shadow: 0 12px 24px rgba(31, 41, 55, 0.18);
}

.profile-name {
  position: relative;
  z-index: 1;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.profile-account {
  position: relative;
  z-index: 1;
  font-size: 13px;
  color: var(--text-secondary);
}

.menu-card {
  overflow: hidden;
}

.menu-card :deep(.van-cell) {
  background: transparent;
}

.logout-wrapper {
  padding: 6px 16px 0;
}

.logout-button {
  border-color: rgba(95, 107, 122, 0.18);
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.72);
}
</style>
