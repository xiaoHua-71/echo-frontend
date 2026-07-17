<template>
  <template v-if="user">
    <!-- 用户信息卡片 -->
    <div class="profile-card">
      <van-image
        round
        width="64"
        height="64"
        :src="user.avatarUrl"
        class="avatar"
      />
      <div class="profile-name">{{ user.username }}</div>
      <div class="profile-account">@{{ user.userAccount }}</div>
    </div>

    <!-- 功能菜单卡片 -->
    <div class="menu-card">
      <van-cell title="修改信息" is-link to="/user/update" icon="edit" />
      <van-cell title="我创建的队伍" is-link to="/user/team/create" icon="flag-o" />
      <van-cell title="我加入的队伍" is-link to="/user/team/join" icon="friends-o" />
    </div>

    <!-- 退出登录 -->
    <div class="logout-wrapper">
      <van-button
        block
        round
        icon="revoke"
        type="default"
        @click="onLogout"
      >
        退出登录
      </van-button>
    </div>
  </template>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {Toast} from "vant";
import myAxios from "../plugins/myAxios";
import {getCurrentUser} from "../services/user";
import {clearCurrentUserState} from "../states/user";

const user = ref();
const router = useRouter();

onMounted(async () => {
  user.value = await getCurrentUser();
})

const onLogout = async () => {
  const res = await myAxios.post('/user/logout');
  if (res.code === 0) {
    clearCurrentUserState();
    Toast.success('已退出');
    router.replace('/user/login');
  } else {
    Toast.fail('退出失败');
  }
};

</script>

<style scoped>
.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px 24px;
  margin-bottom: 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.avatar {
  margin-bottom: 12px;
}

.profile-name {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 4px;
}

.profile-account {
  font-size: 13px;
  color: #969799;
}

.menu-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 12px;
}

.logout-wrapper {
  padding: 24px 16px;
}
</style>
