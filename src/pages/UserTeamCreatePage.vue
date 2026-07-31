<template>
  <div class="page-shell">
    <section class="glass-card page-head">
      <h1 class="section-title">我创建的队伍</h1>
      <p class="section-subtitle">管理已发布的队伍，并继续创建新的招募。</p>
    </section>
    <section class="glass-card toolbar">
      <van-search v-model="searchText" placeholder="搜索队伍" shape="round" @search="onSearch" />
      <van-button type="primary" round class="create-button" @click="toAddTeam">创建队伍</van-button>
    </section>
    <team-card-list :team-list="teamList" @changed="reload" />
    <van-empty v-if="teamList.length < 1" description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Toast } from "vant";
import TeamCardList from "../components/TeamCardList.vue";
import type { TeamType } from "../models/team";
import { getMyCreatedTeams } from "../services/team";

const router = useRouter();
const searchText = ref("");
const teamList = ref<TeamType[]>([]);

const listTeam = async (search = "") => {
  try {
    teamList.value = await getMyCreatedTeams(search);
  } catch (error) {
    Toast.fail(error instanceof Error ? error.message : "加载队伍失败，请稍后重试");
  }
};

const toAddTeam = () => router.push("/team/add");
const onSearch = (value: string) => listTeam(value);
const reload = () => listTeam(searchText.value);

onMounted(() => listTeam());
</script>

<style scoped>
.page-head, .toolbar { padding: 18px; }
.toolbar { display: flex; flex-direction: column; gap: 12px; }
.toolbar :deep(.van-search) { background: transparent; padding: 0; }
.toolbar :deep(.van-search__content) { background: rgba(255, 255, 255, 0.72); }
.create-button { border: none; background: linear-gradient(135deg, var(--accent-primary) 0%, #ef9a74 100%); }
</style>
