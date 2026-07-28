<template>
  <div id="teamCardList">
    <div v-for="team in props.teamList" :key="team.id" class="team-card glass-card">
      <van-card
        :thumb="ikun"
        :desc="team.description"
        :title="`${team.name}`"
      >
        <template #tags>
          <van-tag plain class="status-tag">
            {{ teamStatusEnum[team.status] }}
          </van-tag>
        </template>
        <template #bottom>
          <div class="team-meta">
            <div>{{ `队伍人数: ${team.hasJoinNum}/${team.maxNum}` }}</div>
            <div v-if="team.expireTime">
              {{ "过期时间: " + formatDateTime(team.expireTime) }}
            </div>
            <div>
              {{ "创建时间: " + formatDateTime(team.createTime) }}
            </div>
          </div>
        </template>
        <template #footer>
          <div class="team-actions">
            <van-button
              v-if="team.userId !== currentUser?.id && !team.hasJoin"
              size="small"
              type="primary"
              round
              class="primary-action"
              @click="preJoinTeam(team)"
            >
              加入队伍
            </van-button>
            <van-button
              v-if="team.userId === currentUser?.id"
              size="small"
              round
              class="ghost-action"
              @click="doUpdateTeam(team.id)"
            >
              更新队伍
            </van-button>
            <van-button
              v-if="team.userId !== currentUser?.id && team.hasJoin"
              size="small"
              round
              class="ghost-action"
              @click="doQuitTeam(team.id)"
            >
              退出队伍
            </van-button>
            <van-button
              v-if="team.userId === currentUser?.id"
              size="small"
              round
              type="danger"
              plain
              @click="doDeleteTeam(team.id)"
            >
              解散队伍
            </van-button>
          </div>
        </template>
      </van-card>
    </div>

    <van-dialog
      v-model:show="showPasswordDialog"
      title="请输入密码"
      show-cancel-button
      @confirm="doJoinTeam"
      @cancel="doJoinCancel"
    >
      <van-field v-model="password" placeholder="请输入密码" />
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Toast } from "vant";
import { teamStatusEnum } from "../constants/team";
import ikun from "../assets/ikun.png";
import { TeamType } from "../models/team";
import myAxios from "../plugins/myAxios";
import { getCurrentUser } from "../services/user";
import { formatDateTime } from "../utils/date";

interface TeamCardListProps {
  teamList: TeamType[];
}

const props = withDefaults(defineProps<TeamCardListProps>(), {
  // @ts-ignore
  teamList: [] as TeamType[],
});

const showPasswordDialog = ref(false);
const password = ref("");
const joinTeamId = ref(0);
const currentUser = ref();
const router = useRouter();

onMounted(async () => {
  currentUser.value = await getCurrentUser();
});

const preJoinTeam = (team: TeamType) => {
  joinTeamId.value = team.id;
  if (team.status === 0) {
    doJoinTeam();
  } else {
    showPasswordDialog.value = true;
  }
};

const doJoinCancel = () => {
  joinTeamId.value = 0;
  password.value = "";
};

const doJoinTeam = async () => {
  if (!joinTeamId.value) {
    return;
  }

  const res = await myAxios.post("/team/join", {
    teamId: joinTeamId.value,
    password: password.value,
  });

  if (res?.code === 0) {
    Toast.success("加入成功");
    doJoinCancel();
  } else {
    Toast.fail("加入失败" + (res.description ? `: ${res.description}` : ""));
  }
};

const doUpdateTeam = (id: number) => {
  router.push({
    path: "/team/update",
    query: {
      id,
    },
  });
};

const doQuitTeam = async (id: number) => {
  const res = await myAxios.post("/team/quit", {
    teamId: id,
  });

  if (res?.code === 0) {
    Toast.success("操作成功");
  } else {
    Toast.fail("操作失败" + (res.description ? `: ${res.description}` : ""));
  }
};

const doDeleteTeam = async (id: number) => {
  const res = await myAxios.post("/team/delete", {
    id,
  });

  if (res?.code === 0) {
    Toast.success("操作成功");
  } else {
    Toast.fail("操作失败" + (res.description ? `: ${res.description}` : ""));
  }
};
</script>

<style scoped>
#teamCardList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.team-card {
  overflow: hidden;
}

#teamCardList :deep(.van-card) {
  background: transparent;
  padding: 16px;
}

#teamCardList :deep(.van-card__title) {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
}

#teamCardList :deep(.van-card__desc) {
  color: var(--text-secondary);
  line-height: 1.55;
}

#teamCardList :deep(.van-image__img) {
  height: 128px;
  object-fit: cover;
  border-radius: 16px;
}

.status-tag {
  margin-right: 8px;
  margin-top: 8px;
  color: var(--accent-primary-deep);
  border-color: rgba(224, 122, 95, 0.22);
  background: rgba(224, 122, 95, 0.08);
}

.team-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--text-secondary);
}

.team-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.primary-action {
  border: none;
  background: linear-gradient(135deg, var(--accent-primary) 0%, #ef9a74 100%);
}

.ghost-action {
  color: var(--text-primary);
  border-color: rgba(95, 107, 122, 0.18);
  background: rgba(255, 255, 255, 0.72);
}
</style>
