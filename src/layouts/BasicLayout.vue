<template>
  <van-nav-bar
      :title="title"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onClickRight"
  >
    <template #right>
      <van-icon name="search" size="18"/>
    </template>
  </van-nav-bar>
  <div id="content">
    <router-view/>
  </div>
  <!-- 这里是Vant文档中的路由方式 -->
  <van-tabbar route >
    <van-tabbar-item to="/" icon="home-o" name="index">主页</van-tabbar-item>
    <van-tabbar-item to="/team" icon="search" name="team">队伍</van-tabbar-item>
    <van-tabbar-item to="/message" icon="chat-o" name="message" :badge="unreadBadge">消息</van-tabbar-item>
    <van-tabbar-item to="/user" icon="friends-o" name="user">个人</van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import routes from "../config/route";
import { getUnreadCount as fetchUnreadCount } from "../services/chat";
import { getUnreadCount, setUnreadCount } from "../states/chat";

const router = useRouter();
const DEFAULT_TITLE = '伙伴匹配';
const title = ref(DEFAULT_TITLE);

/**
 * 根据路由切换标题
 */
router.beforeEach((to, from) => {
  const toPath = to.path;
  const route = routes.find((route) => {
    return toPath == route.path;
  })
  title.value = route?.title ?? DEFAULT_TITLE;
})

const onClickLeft = () => {
  router.back();
};

const onClickRight = () => {
  router.push('/search')
};

// 未读消息角标（响应式）
const unreadBadge = computed(() => {
  const n = getUnreadCount().value;
  if (n <= 0) return undefined;
  return n > 99 ? '99+' : String(n);
});

// 同步未读数
const syncUnread = async () => {
  const count = await fetchUnreadCount();
  setUnreadCount(count);
};

onMounted(() => {
  syncUnread();
});

// 路由切换时同步未读数
router.afterEach(() => {
  syncUnread();
});

</script>

<style scoped>
#content {
  padding: 12px;
  padding-bottom: 62px;
  background: #f4f5f7;
  min-height: 100vh;
}
</style>
