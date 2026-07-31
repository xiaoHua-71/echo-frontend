<template>
  <div class="page-shell">
    <section class="glass-card page-head">
      <h1 class="section-title">创建队伍</h1>
      <p class="section-subtitle">设置队伍名称、人数、状态和过期时间，发布新的招募信息。</p>
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
          <van-field v-if="form.status === 2" v-model="form.password" type="password" name="password" label="密码" placeholder="请输入队伍密码" :rules="[{ required: true, message: '请填写密码' }]" />
        </van-cell-group>
        <div class="submit-wrap"><van-button round block type="primary" native-type="submit">提交</van-button></div>
      </van-form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { Toast } from "vant";
import type { TeamForm } from "../models/team";
import { addTeam } from "../services/team";

const router = useRouter();
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

const onSubmit = async () => {
  const payload: TeamForm = { ...form.value, password: form.value.status === 2 ? form.value.password : undefined };
  try {
    await addTeam(payload);
    Toast.success("创建成功");
    router.replace("/team");
  } catch (error) {
    Toast.fail(error instanceof Error ? error.message : "创建失败");
  }
};
</script>

<style scoped>
.page-head, .form-shell { padding: 18px; }
.form-shell :deep(.van-cell-group), .form-shell :deep(.van-field), .form-shell :deep(.van-cell) { background: rgba(255, 255, 255, 0.72); }
.form-shell :deep(.van-cell-group) { border-radius: 18px; }
.submit-wrap { margin: 18px 0 0; }
.submit-wrap :deep(.van-button--primary) { border: none; background: linear-gradient(135deg, var(--accent-primary) 0%, #ef9a74 100%); }
</style>
