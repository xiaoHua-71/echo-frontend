<template>
  <div class="page-shell">
    <section class="glass-card page-head">
      <h1 class="section-title">更新队伍</h1>
      <p class="section-subtitle">修改队伍信息、状态和密码，保持招募信息最新。</p>
    </section>
    <section class="glass-card form-shell">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field v-model="form.name" name="name" label="队伍名称" placeholder="请输入队伍名称" :rules="[{ required: true, message: '请输入队伍名称' }]" />
          <van-field v-model="form.description" rows="4" autosize label="队伍描述" type="textarea" placeholder="请输入队伍描述" />
          <van-field is-link readonly name="datetimePicker" label="过期时间" :placeholder="displayExpireTime" @click="showPicker = true" />
          <van-popup v-model:show="showPicker" position="bottom">
            <van-datetime-picker v-model="pickerDate" type="datetime" title="请选择过期时间" :min-date="minDate" @confirm="onConfirmDate" @cancel="showPicker = false" />
          </van-popup>
          <van-field name="stepper" label="最大人数">
            <template #input><van-stepper v-model="form.maxNum" :max="100" :min="1" /></template>
          </van-field>
          <van-field name="radio" label="队伍状态">
            <template #input>
              <van-radio-group v-model="form.status" direction="horizontal">
                <van-radio :name="0">公开</van-radio><van-radio :name="1">私有</van-radio><van-radio :name="2">加密</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field v-if="form.status === 2" v-model="form.password" type="password" name="password" label="密码" placeholder="留空则保持原密码" />
        </van-cell-group>
        <div class="submit-wrap"><van-button round block type="primary" native-type="submit">保存更新</van-button></div>
      </van-form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Toast } from "vant";
import type { TeamForm, TeamType } from "../models/team";
import { getTeam, updateTeam } from "../services/team";

const router = useRouter();
const route = useRoute();
const id = Number(route.query.id);
const showPicker = ref(false);
const minDate = new Date();
const pickerDate = ref(new Date());
const form = ref<TeamForm>({ name: "", description: "", expireTime: "", maxNum: 3, password: "", status: 0 });

const formatDate = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const displayExpireTime = computed(() => form.value.expireTime || "点击选择过期时间");

const onConfirmDate = (value: Date) => {
  pickerDate.value = value;
  form.value.expireTime = formatDate(value);
  showPicker.value = false;
};

const applyTeam = (team: TeamType) => {
  const expireDate = team.expireTime ? new Date(team.expireTime) : new Date();
  pickerDate.value = expireDate;
  form.value = {
    id: team.id,
    name: team.name,
    description: team.description || "",
    expireTime: team.expireTime ? formatDate(expireDate) : "",
    maxNum: team.maxNum,
    password: "",
    status: team.status,
  };
};

onMounted(async () => {
  if (!Number.isInteger(id) || id <= 0) {
    Toast.fail("队伍信息无效");
    router.back();
    return;
  }
  try {
    applyTeam(await getTeam(id));
  } catch (error) {
    Toast.fail(error instanceof Error ? error.message : "加载队伍失败");
  }
});

const onSubmit = async () => {
  try {
    await updateTeam({ ...form.value, password: form.value.status === 2 ? form.value.password || undefined : undefined });
    Toast.success("更新成功");
    router.replace("/team");
  } catch (error) {
    Toast.fail(error instanceof Error ? error.message : "更新失败");
  }
};
</script>

<style scoped>
.page-head, .form-shell { padding: 18px; }
.form-shell :deep(.van-cell-group), .form-shell :deep(.van-field), .form-shell :deep(.van-cell) { background: rgba(255, 255, 255, 0.72); }
.form-shell :deep(.van-cell-group) { border-radius: 18px; }
.submit-wrap { margin-top: 18px; }
.submit-wrap :deep(.van-button--primary) { border: none; background: linear-gradient(135deg, var(--accent-primary) 0%, #ef9a74 100%); }
</style>
