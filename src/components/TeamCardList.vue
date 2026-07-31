<template>
  <div id="teamCardList">
    <div v-for="team in props.teamList" :key="team.id" class="team-card glass-card">
      <van-card :thumb="ikun" :desc="team.description" :title="team.name">
        <template #tags>
          <van-tag plain class="status-tag">{{ teamStatusEnum[team.status] }}</van-tag>
        </template>
        <template #bottom>
          <div class="team-meta">
            <div>队伍人数: {{ team.hasJoinNum }}/{{ team.maxNum }}</div>
            <div v-if="team.expireTime">过期时间: {{ formatDateTime(team.expireTime) }}</div>
            <div>创建时间: {{ formatDateTime(team.createTime) }}</div>
          </div>
        </template>
        <template #footer>
          <div class="team-actions">
            <van-button v-if="canJoin(team)" size="small" type="primary" round class="primary-action" @click="preJoinTeam(team)">加入队伍</van-button>
            <template v-if="isOwner(team)">
              <van-button size="small" round class="ghost-action" @click="doUpdateTeam(team.id)">更新队伍</van-button>
              <van-button size="small" round class="ghost-action" @click="openMembers(team)">成员</van-button>
              <van-button size="small" round class="ghost-action" @click="createInviteCode(team.id)">邀请码</van-button>
              <van-button size="small" round type="danger" plain @click="doDeleteTeam(team.id)">解散队伍</van-button>
            </template>
            <van-button v-else-if="team.hasJoin" size="small" round class="ghost-action" @click="doQuitTeam(team.id)">退出队伍</van-button>
          </div>
        </template>
      </van-card>
    </div>

    <van-dialog v-model:show="showJoinDialog" :title="joinDialogTitle" show-cancel-button @confirm="doJoinTeam" @cancel="resetJoin">
      <van-field v-model="joinCredential" :type="joiningTeam?.status === 2 ? 'password' : 'text'" :placeholder="joinCredentialPlaceholder" />
    </van-dialog>

    <van-dialog v-model:show="showMembersDialog" title="队伍成员" :show-confirm-button="false" closeable>
      <div class="member-list">
        <van-loading v-if="membersLoading" size="20px">加载中</van-loading>
        <template v-else-if="members.length">
          <div v-for="member in members" :key="member.userId" class="member-row">
            <van-image round width="36" height="36" :src="member.avatarUrl" />
            <div class="member-info">
              <div class="member-name">{{ member.username }}</div>
              <div class="member-time">加入于 {{ formatDateTime(member.joinTime) }}</div>
            </div>
            <van-button v-if="member.userId !== currentUser?.id" size="mini" plain class="transfer-button" @click="confirmTransfer(member.userId, member.username)">转让</van-button>
          </div>
        </template>
        <van-empty v-else-if="!membersLoading" description="暂无成员" image-size="80" />
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Dialog, Toast } from "vant";
import type { UserType } from "../models/user";
import type { TeamMember, TeamType } from "../models/team";
import { teamStatusEnum } from "../constants/team";
import ikun from "../assets/ikun.png";
import { getCurrentUser } from "../services/user";
import { deleteTeam, generateInviteCode, getTeamMembers, joinTeam, quitTeam, transferTeam } from "../services/team";
import { formatDateTime } from "../utils/date";

interface TeamCardListProps {
  teamList: TeamType[];
}

const props = withDefaults(defineProps<TeamCardListProps>(), { teamList: () => [] });
const emit = defineEmits<{ (event: "changed"): void }>();
const router = useRouter();
const currentUser = ref<UserType | null>(null);
const joiningTeam = ref<TeamType | null>(null);
const joinCredential = ref("");
const showJoinDialog = ref(false);
const showMembersDialog = ref(false);
const membersLoading = ref(false);
const members = ref<TeamMember[]>([]);
const membersTeamId = ref<number | null>(null);

const joinDialogTitle = computed(() => joiningTeam.value?.status === 1 ? "输入邀请码" : "输入队伍密码");
const joinCredentialPlaceholder = computed(() => joiningTeam.value?.status === 1 ? "请输入 8 位邀请码" : "请输入队伍密码");

onMounted(async () => {
  currentUser.value = await getCurrentUser();
});

const isOwner = (team: TeamType) => team.userId === currentUser.value?.id;
const canJoin = (team: TeamType) => !isOwner(team) && !team.hasJoin;

const preJoinTeam = async (team: TeamType) => {
  joiningTeam.value = team;
  joinCredential.value = "";
  if (team.status === 0) {
    await doJoinTeam();
    return;
  }
  showJoinDialog.value = true;
};

const resetJoin = () => {
  joiningTeam.value = null;
  joinCredential.value = "";
  showJoinDialog.value = false;
};

const doJoinTeam = async () => {
  const team = joiningTeam.value;
  if (!team) return;
  if (team.status !== 0 && !joinCredential.value.trim()) {
    Toast.fail(team.status === 1 ? "请输入邀请码" : "请输入队伍密码");
    return;
  }

  try {
    await joinTeam(team.id, team.status === 1 ? { inviteCode: joinCredential.value.trim() } : { password: joinCredential.value });
    Toast.success("加入成功");
    resetJoin();
    emit("changed");
  } catch (error) {
    Toast.fail(error instanceof Error ? error.message : "加入失败");
  }
};

const doUpdateTeam = (id: number) => router.push({ path: "/team/update", query: { id } });

const doQuitTeam = async (id: number) => {
  try {
    await quitTeam(id);
    Toast.success("已退出队伍");
    emit("changed");
  } catch (error) {
    Toast.fail(error instanceof Error ? error.message : "退出失败");
  }
};

const doDeleteTeam = async (id: number) => {
  try {
    await Dialog.confirm({ title: "解散队伍", message: "解散后成员关系将一并失效，无法恢复。" });
    await deleteTeam(id);
    Toast.success("队伍已解散");
    emit("changed");
  } catch (error) {
    if (error instanceof Error) Toast.fail(error.message);
  }
};

const createInviteCode = async (teamId: number) => {
  try {
    const inviteCode = await generateInviteCode(teamId);
    await Dialog.alert({ title: "邀请码", message: `${inviteCode}\n有效期 24 小时` });
  } catch (error) {
    Toast.fail(error instanceof Error ? error.message : "生成失败");
  }
};

const openMembers = async (team: TeamType) => {
  membersTeamId.value = team.id;
  members.value = [];
  showMembersDialog.value = true;
  membersLoading.value = true;
  try {
    members.value = await getTeamMembers(team.id);
  } catch (error) {
    Toast.fail(error instanceof Error ? error.message : "加载成员失败");
  } finally {
    membersLoading.value = false;
  }
};

const confirmTransfer = async (userId: number, username: string) => {
  if (!membersTeamId.value) return;
  try {
    await Dialog.confirm({ title: "转让队长", message: `确认将队长转让给 ${username}？转让后你会自动退出队伍。` });
    await transferTeam(membersTeamId.value, userId);
    Toast.success("转让成功");
    showMembersDialog.value = false;
    emit("changed");
  } catch (error) {
    if (error instanceof Error) Toast.fail(error.message);
  }
};
</script>

<style scoped>
#teamCardList { display: flex; flex-direction: column; gap: 12px; }
.team-card { overflow: hidden; }
#teamCardList :deep(.van-card) { background: transparent; padding: 16px; }
#teamCardList :deep(.van-card__title) { font-size: 17px; font-weight: 700; color: var(--text-primary); }
#teamCardList :deep(.van-card__desc) { color: var(--text-secondary); line-height: 1.55; }
#teamCardList :deep(.van-image__img) { height: 128px; object-fit: cover; border-radius: 16px; }
.status-tag { margin-right: 8px; margin-top: 8px; color: var(--accent-primary-deep); border-color: rgba(224, 122, 95, 0.22); background: rgba(224, 122, 95, 0.08); }
.team-meta { display: flex; flex-direction: column; gap: 4px; color: var(--text-secondary); }
.team-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.primary-action { border: none; background: linear-gradient(135deg, var(--accent-primary) 0%, #ef9a74 100%); }
.ghost-action { color: var(--text-primary); border-color: rgba(95, 107, 122, 0.18); background: rgba(255, 255, 255, 0.72); }
.member-list { min-height: 120px; max-height: 52vh; overflow-y: auto; padding: 12px 16px 16px; }
.member-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(95, 107, 122, 0.1); }
.member-info { flex: 1; min-width: 0; }
.member-name { color: var(--text-primary); font-size: 14px; font-weight: 600; }
.member-time { margin-top: 3px; color: var(--text-muted); font-size: 11px; }
.transfer-button { color: var(--accent-primary-deep); border-color: rgba(224, 122, 95, 0.26); }
</style>
