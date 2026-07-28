<template>
  <div class="page-shell">
    <section class="glass-card page-head">
      <h1 class="section-title">队伍广场</h1>
      <p class="section-subtitle">搜索公开或私密队伍，快速加入当前活跃的小组。</p>
    </section>

    <div class="toolbox glass-card">
      <van-search
        v-model="searchText"
        placeholder="搜索队伍"
        shape="round"
        @search="onSearch"
      />
      <van-tabs v-model:active="active" animated @change="onTabChange">
        <van-tab title="公开" name="public" />
        <van-tab title="私密" name="private" />
      </van-tabs>
    </div>

    <van-button class="add-button" type="primary" icon="plus" @click="toAddTeam" />
    <team-card-list :teamList="teamList" />
    <van-empty v-if="teamList?.length < 1" description="暂无队伍" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Toast } from "vant";
import TeamCardList from "../components/TeamCardList.vue";
import myAxios from "../plugins/myAxios";

const active = ref("public");
const router = useRouter();
const searchText = ref("");
const teamList = ref([]);

const onTabChange = (name: string) => {
  if (name === "public") {
    listTeam(searchText.value, 0);
  } else {
    listTeam(searchText.value, 2);
  }
};

const toAddTeam = () => {
  router.push({
    path: "/team/add",
  });
};

const listTeam = async (val = "", status = 0) => {
  const res = await myAxios.get("/team/list", {
    params: {
      searchText: val,
      pageNum: 1,
      status,
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
  listTeam(val, active.value === "public" ? 0 : 2);
};
</script>

<style scoped>
.page-head {
  padding: 18px 18px 16px;
}

.toolbox {
  overflow: hidden;
}

.toolbox :deep(.van-search) {
  background: transparent;
  padding: 12px 12px 0;
}

.toolbox :deep(.van-search__content) {
  background: rgba(255, 255, 255, 0.72);
}

.toolbox :deep(.van-tabs__nav) {
  background: transparent;
}

.toolbox :deep(.van-tab--active) {
  color: var(--accent-primary);
  font-weight: 700;
}

.toolbox :deep(.van-tabs__line) {
  background: var(--accent-primary);
}
</style>
