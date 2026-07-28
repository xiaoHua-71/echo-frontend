<template>
  <div class="page-shell">
    <section class="hero glass-card">
      <div class="hero-copy">
        <span class="hero-kicker">{{ isMatchMode ? "Smart Match" : "Discover" }}</span>
        <h1 class="hero-title">{{ isMatchMode ? "为你优先匹配更合拍的伙伴" : "浏览新伙伴，快速找到对的人" }}</h1>
        <p class="hero-subtitle">
          {{ isMatchMode ? "系统会根据标签和兴趣优先推荐更契合的用户。" : "切换到推荐流，快速查看正在活跃的用户卡片。" }}
        </p>
      </div>
      <div class="hero-orb">
        <div class="orb-core"></div>
        <div class="orb-ring orb-ring-1"></div>
        <div class="orb-ring orb-ring-2"></div>
      </div>
    </section>

    <van-cell center title="心动模式" class="mode-switch glass-card">
      <template #label>
        <span class="switch-label">{{ isMatchMode ? "个性化优先" : "推荐流浏览" }}</span>
      </template>
      <template #right-icon>
        <van-switch v-model="isMatchMode" size="24" active-color="#e07a5f" inactive-color="#d8dee8" />
      </template>
    </van-cell>

    <section class="list-header">
      <div>
        <h2 class="section-title">推荐伙伴</h2>
        <p class="section-subtitle">卡片会展示简介、兴趣标签和快捷聊天入口。</p>
      </div>
      <div class="list-meta">{{ userList?.length || 0 }} people</div>
    </section>

    <user-card-list :user-list="userList" :loading="loading" />
    <van-empty v-if="!loading && (!userList || userList.length < 1)" description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { Toast } from "vant";
import UserCardList from "../components/UserCardList.vue";
import { UserType } from "../models/user";
import myAxios from "../plugins/myAxios";

const isMatchMode = ref<boolean>(false);
const userList = ref([]);
const loading = ref(true);

const loadData = async () => {
  let userListData;
  loading.value = true;

  if (isMatchMode.value) {
    userListData = await myAxios
      .get("/user/match", {
        params: {
          num: 10,
        },
      })
      .then((response) => response?.data)
      .catch((error) => {
        console.error("/user/match error", error);
        Toast.fail("请求失败");
      });
  } else {
    userListData = await myAxios
      .get("/user/recommend", {
        params: {
          pageSize: 8,
          pageNum: 1,
        },
      })
      .then((response) => response?.data)
      .catch((error) => {
        console.error("/user/recommend error", error);
        Toast.fail("请求失败");
      });
  }

  if (userListData) {
    userListData.forEach((user: UserType) => {
      if (user.tags) {
        user.tags = JSON.parse(user.tags);
      }
    });
    userList.value = userListData;
  }

  loading.value = false;
};

watchEffect(() => {
  loadData();
});
</script>

<style scoped>
.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 20px;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(242, 204, 143, 0.28), transparent 36%),
    linear-gradient(135deg, rgba(255, 250, 244, 0.92) 0%, rgba(255, 255, 255, 0.86) 100%);
}

.hero-copy {
  position: relative;
  z-index: 1;
  max-width: 68%;
}

.hero-kicker {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: var(--radius-pill);
  background: rgba(224, 122, 95, 0.12);
  color: var(--accent-primary-deep);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-title {
  margin: 12px 0 8px;
  font-size: 24px;
  line-height: 1.25;
  color: var(--text-primary);
}

.hero-subtitle {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--text-secondary);
}

.hero-orb {
  position: relative;
  width: 108px;
  height: 108px;
  flex-shrink: 0;
}

.orb-core,
.orb-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
}

.orb-core {
  inset: 18px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  box-shadow: 0 18px 28px rgba(224, 122, 95, 0.24);
}

.orb-ring {
  border: 1px solid rgba(224, 122, 95, 0.18);
}

.orb-ring-1 {
  animation: pulseRing 3s ease-in-out infinite;
}

.orb-ring-2 {
  inset: 10px;
  animation: pulseRing 3s ease-in-out 0.8s infinite;
}

@keyframes pulseRing {
  0%, 100% {
    transform: scale(1);
    opacity: 0.85;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.45;
  }
}

.mode-switch {
  border-radius: var(--radius-card);
}

.mode-switch:deep(.van-cell) {
  background: transparent;
}

.mode-switch:deep(.van-cell__title) {
  font-weight: 600;
  color: var(--text-primary);
}

.switch-label {
  color: var(--text-secondary);
  font-size: 12px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 12px;
  padding: 2px 4px;
}

.list-meta {
  padding: 7px 10px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.72);
  color: var(--text-secondary);
  font-size: 12px;
  box-shadow: var(--shadow-soft);
}
</style>
