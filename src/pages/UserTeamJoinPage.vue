<template>
  <div class="page-shell">
    <section class="glass-card page-head">
      <h1 class="section-title">我加入的队伍</h1>
      <p class="section-subtitle">查看你参与中的队伍，继续管理和交流。</p>
    </section>
    <section class="glass-card toolbar">
      <van-search v-model="searchText" placeholder="搜索队伍" shape="round" @search="onSearch" />
    </section>
    <team-card-list :team-list="teamList" @changed="reload" />
    <van-empty v-if="teamList.length < 1" description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Toast } from "vant";
import TeamCardList from "../components/TeamCardList.vue";
import type { TeamType } from "../models/team";
import { getMyJoinedTeams } from "../services/team";

const searchText = ref("");
const teamList = ref<TeamType[]>([]);

const listTeam = async (search = "") => {
  try {
    teamList.value = await getMyJoinedTeams(search);
  } catch (error) {
    Toast.fail(error instanceof Error ? error.message : "加载队伍失败，请稍后重试");
  }
};

const onSearch = (value: string) => listTeam(value);
const reload = () => listTeam(searchText.value);

onMounted(() => listTeam());
</script>

<style scoped>
.page-head, .toolbar { padding: 18px; }
.toolbar :deep(.van-search) { background: transparent; padding: 0; }
.toolbar :deep(.van-search__content) { background: rgba(255, 255, 255, 0.72); }
</style>
