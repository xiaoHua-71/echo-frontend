<template>
  <div class="page-shell">
    <section class="glass-card page-head">
      <h1 class="section-title">我加入的队伍</h1>
      <p class="section-subtitle">查看你参与中的队伍，继续管理和交流。</p>
    </section>

    <section class="glass-card toolbar">
      <van-search v-model="searchText" placeholder="搜索队伍" shape="round" @search="onSearch" />
    </section>

    <team-card-list :teamList="teamList" />
    <van-empty v-if="teamList?.length < 1" description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Toast } from "vant";
import TeamCardList from "../components/TeamCardList.vue";
import myAxios from "../plugins/myAxios";

const searchText = ref("");
const teamList = ref([]);

const listTeam = async (val = "") => {
  const res = await myAxios.get("/team/list/my/join", {
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

.toolbar :deep(.van-search) {
  background: transparent;
  padding: 0;
}

.toolbar :deep(.van-search__content) {
  background: rgba(255, 255, 255, 0.72);
}
</style>
