<template>
  <div class="page-shell">
    <section class="glass-card page-head">
      <h1 class="section-title">编辑资料</h1>
      <p class="section-subtitle">更新当前字段并立即提交保存。</p>
    </section>

    <section class="glass-card form-shell">
      <van-form @submit="onSubmit">
        <van-field
          v-if="editUser.editKey === 'gender'"
          :model-value="genderLabel"
          :name="editUser.editKey"
          :label="editUser.editName"
          readonly
          clickable
          is-link
          placeholder="请选择性别"
          @click="showGenderPicker = true"
        />
        <van-field
          v-else
          v-model="editUser.currentValue"
          :name="editUser.editKey"
          :label="editUser.editName"
          :placeholder="`请输入${editUser.editName}`"
        />
        <div class="submit-wrap">
          <van-button round block type="primary" native-type="submit">提交</van-button>
        </div>
      </van-form>
    </section>

    <van-action-sheet
      v-model:show="showGenderPicker"
      :actions="genderOptions"
      cancel-text="取消"
      close-on-click-action
      @select="onGenderSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Toast } from "vant";
import myAxios from "../plugins/myAxios";
import { getCurrentUser } from "../services/user";

const route = useRoute();
const router = useRouter();

const editUser = ref({
  editKey: route.query.editKey as string,
  currentValue: route.query.currentValue as string,
  editName: route.query.editName as string,
});

const showGenderPicker = ref(false);

const genderOptions = [
  { name: "男", value: 1 },
  { name: "女", value: 0 },
];

const genderLabel = computed(() => genderOptions.find((o) => String(o.value) === editUser.value.currentValue)?.name || "");

const onGenderSelect = (option: { name: string; value: number }) => {
  editUser.value.currentValue = String(option.value);
};

const onSubmit = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    Toast.fail("用户未登录");
    return;
  }

  const postData: Record<string, any> = {
    id: currentUser.id,
    [editUser.value.editKey]: editUser.value.editKey === "gender"
      ? Number(editUser.value.currentValue)
      : editUser.value.currentValue,
  };

  const res = await myAxios.post("/user/update", postData);
  if (res.code === 0 && res.data > 0) {
    Toast.success("修改成功");
    router.back();
  } else {
    Toast.fail("修改失败");
  }
};
</script>

<style scoped>
.page-head,
.form-shell {
  padding: 18px;
}

.form-shell :deep(.van-field),
.form-shell :deep(.van-cell) {
  background: rgba(255, 255, 255, 0.72);
  border-radius: 18px;
}

.submit-wrap {
  margin-top: 18px;
}

.submit-wrap :deep(.van-button--primary) {
  border: none;
  background: linear-gradient(135deg, var(--accent-primary) 0%, #ef9a74 100%);
}
</style>
