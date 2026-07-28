<template>
  <div class="layout-shell">
    <div class="layout-glow layout-glow-top"></div>
    <div class="layout-glow layout-glow-bottom"></div>
    <van-nav-bar
      :title="title"
      left-arrow
      class="app-nav"
      @click-left="onClickLeft"
      @click-right="onClickRight"
    >
      <template #right>
        <div class="nav-action">
          <van-icon name="search" size="18" />
        </div>
      </template>
    </van-nav-bar>
    <div id="content">
      <router-view />
    </div>
    <van-tabbar route class="app-tabbar">
      <van-tabbar-item to="/" icon="home-o" name="index">首页</van-tabbar-item>
      <van-tabbar-item to="/team" icon="search" name="team">队伍</van-tabbar-item>
      <van-tabbar-item to="/message" icon="chat-o" name="message" :badge="unreadBadge">消息</van-tabbar-item>
      <van-tabbar-item to="/user" icon="friends-o" name="user">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import routes from "../config/route";
import { getUnreadCount as fetchUnreadCount } from "../services/chat";
import { getUnreadCount, setUnreadCount } from "../states/chat";

const router = useRouter();
const DEFAULT_TITLE = "ECHO";
const title = ref(DEFAULT_TITLE);

router.beforeEach((to) => {
  const route = routes.find((item) => item.path === to.path);
  title.value = route?.title ?? DEFAULT_TITLE;
});

const onClickLeft = () => {
  router.back();
};

const onClickRight = () => {
  router.push("/search");
};

const unreadBadge = computed(() => {
  const n = getUnreadCount().value;
  if (n <= 0) return undefined;
  return n > 99 ? "99+" : String(n);
});

const syncUnread = async () => {
  const count = await fetchUnreadCount();
  setUnreadCount(count);
};

onMounted(() => {
  syncUnread();
});

router.afterEach(() => {
  syncUnread();
});
</script>

<style scoped>
.layout-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.layout-glow {
  position: fixed;
  z-index: 0;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(8px);
}

.layout-glow-top {
  top: -120px;
  right: -80px;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(242, 204, 143, 0.34) 0%, rgba(242, 204, 143, 0) 72%);
}

.layout-glow-bottom {
  left: -110px;
  bottom: 120px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(129, 178, 154, 0.22) 0%, rgba(129, 178, 154, 0) 72%);
}

.app-nav {
  position: sticky;
  top: 0;
  z-index: 5;
  background: rgba(255, 250, 244, 0.86);
  backdrop-filter: blur(16px);
}

.app-nav:deep(.van-nav-bar) {
  background: transparent;
}

.app-nav:deep(.van-nav-bar__content) {
  padding: 6px 8px;
}

.app-nav:deep(.van-nav-bar__title) {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.04em;
}

.app-nav:deep(.van-icon),
.app-nav:deep(.van-nav-bar__arrow) {
  color: var(--text-primary);
}

.nav-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: var(--shadow-soft);
}

#content {
  position: relative;
  z-index: 1;
  padding: 14px 14px 86px;
  min-height: 100vh;
}

.app-tabbar {
  left: 12px;
  right: 12px;
  bottom: 10px;
  width: auto;
  border-radius: 22px;
  overflow: hidden;
  background: rgba(255, 252, 248, 0.88);
  backdrop-filter: blur(18px);
  box-shadow: 0 16px 32px rgba(31, 41, 55, 0.12);
}

.app-tabbar:deep(.van-tabbar-item) {
  color: var(--text-muted);
}

.app-tabbar:deep(.van-tabbar-item--active) {
  color: var(--accent-primary);
  background: transparent;
}

.app-tabbar:deep(.van-badge) {
  background: var(--accent-primary);
  border-color: transparent;
}
</style>
