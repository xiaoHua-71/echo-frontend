<template>
  <div class="page-shell">
    <section class="glass-card page-head">
      <h1 class="section-title">创建队伍</h1>
      <p class="section-subtitle">设置队伍名称、人数、状态和过期时间，发布新的招募信息。</p>
    </section>

    <section class="glass-card form-shell">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="addTeamData.name"
            name="name"
            label="队伍名"
            placeholder="请输入队伍名称"
            :rules="[{ required: true, message: '请输入队伍名称' }]"
          />
          <van-field
            v-model="addTeamData.description"
            rows="4"
            autosize
            label="队伍描述"
            type="textarea"
            placeholder="请输入队伍描述"
          />
          <van-field
            is-link
            readonly
            name="datetimePicker"
            label="过期时间"
            :placeholder="displayExpireTime"
            @click="showPicker = true"
          />
          <van-popup v-model:show="showPicker" position="bottom">
            <van-datetime-picker
              v-model="pickerDate"
              type="datetime"
              title="请选择过期时间"
              :min-date="minDate"
              @confirm="onConfirmDate"
              @cancel="showPicker = false"
            />
          </van-popup>
          <van-field name="stepper" label="最大人数">
            <template #input>
              <van-stepper v-model="addTeamData.maxNum" max="10" min="3" />
            </template>
          </van-field>
          <van-field name="radio" label="队伍状态">
            <template #input>
              <van-radio-group v-model="addTeamData.status" direction="horizontal">
                <van-radio :name="0">公开</van-radio>
                <van-radio :name="1">私有</van-radio>
                <van-radio :name="2">加密</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field
            v-if="Number(addTeamData.status) === 2"
            v-model="addTeamData.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入队伍密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
        </van-cell-group>
        <div class="submit-wrap">
          <van-button round block type="primary" native-type="submit">提交</van-button>
        </div>
      </van-form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { Toast } from "vant";
import myAxios from "../plugins/myAxios";

const router = useRouter();
const showPicker = ref(false);
const minDate = new Date();
const pickerDate = ref(new Date());

const initFormData = {
  name: "",
  description: "",
  expireTime: "",
  maxNum: 3,
  password: "",
  status: 0,
};

const addTeamData = ref({ ...initFormData });

const formatDate = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const displayExpireTime = computed(() => addTeamData.value.expireTime || "点击选择过期时间");

const onConfirmDate = (value: Date) => {
  pickerDate.value = value;
  addTeamData.value.expireTime = formatDate(value);
  showPicker.value = false;
};

const onSubmit = async () => {
  const postData = {
    ...addTeamData.value,
    status: Number(addTeamData.value.status),
  };
  const res = await myAxios.post("/team/add", postData);
  if (res?.code === 0 && res.data) {
    Toast.success("添加成功");
    router.push({
      path: "/team",
      replace: true,
    });
  } else {
    Toast.fail("添加失败");
  }
};
</script>

<style scoped>
.page-head,
.form-shell {
  padding: 18px;
}

.form-shell :deep(.van-cell-group),
.form-shell :deep(.van-field),
.form-shell :deep(.van-cell) {
  background: rgba(255, 255, 255, 0.72);
}

.form-shell :deep(.van-cell-group) {
  border-radius: 18px;
}

.submit-wrap {
  margin: 18px 0 0;
}

.submit-wrap :deep(.van-button--primary) {
  border: none;
  background: linear-gradient(135deg, var(--accent-primary) 0%, #ef9a74 100%);
}
</style>
