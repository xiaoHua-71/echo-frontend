<template>
  <div class="page-shell">
    <section class="glass-card page-head">
      <h1 class="section-title">我创建的队伍</h1>
      <p class="section-subtitle">管理你已经发布的队伍，并继续创建新的招募。</p>
    </section>

    <section class="glass-card toolbar">
      <van-search v-model="searchText" placeholder="搜索队伍" shape="round" @search="onSearch" />
      <van-button type="primary" round class="create-button" @click="doJoinTeam">创建队伍</van-button>
    </section>

    <team-card-list :teamList="teamList" />
    <van-empty v-if="teamList?.length < 1" description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Toast } from "vant";
import TeamCardList from "../components/TeamCardList.vue";
import myAxios from "../plugins/myAxios";

const router = useRouter();
const searchText = ref("");
const teamList = ref([]);

const doJoinTeam = () => {
  router.push({
    path: "/team/add",
  });
};

const listTeam = async (val = "") => {
  const res = await myAxios.get("/team/list/my/create", {
    params: {
      searchText: val,
      pageNum: 1,
    },
  });
  if (res?.code === 0) {
    teamList.value = res.data;
  } else {
    Toast.fail("加载队伍失败，请刷新重试");
  }
};

onMounted(() => {
  listTeam();
});

const onSearch = (val: string) => {
  listTeam(val);
};
</script>

<style scoped>
.page-head,
.toolbar {
  padding: 18px;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar :deep(.van-search) {
  background: transparent;
  padding: 0;
}

.toolbar :deep(.van-search__content) {
  background: rgba(255, 255, 255, 0.72);
}

.create-button {
  border: none;
  background: linear-gradient(135deg, var(--accent-primary) 0%, #ef9a74 100%);
}
</style>
