<template>
  <van-form @submit="onSubmit">
    <!-- 性别：选择器 -->
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
    <!-- 其他字段：文本输入 -->
    <van-field
      v-else
      v-model="editUser.currentValue"
      :name="editUser.editKey"
      :label="editUser.editName"
      :placeholder="`请输入${editUser.editName}`"
    />
    <div style="margin: 16px;">
      <van-button round block type="primary" native-type="submit">
        提交
      </van-button>
    </div>
  </van-form>

  <!-- 性别选择弹出层 -->
  <van-action-sheet
    v-model:show="showGenderPicker"
    :actions="genderOptions"
    cancel-text="取消"
    close-on-click-action
    @select="onGenderSelect"
  />
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {Toast} from "vant";
import myAxios from "../plugins/myAxios";
import {getCurrentUser} from "../services/user";

const route = useRoute();
const router = useRouter();

const editUser = ref({
  editKey: route.query.editKey as string,
  currentValue: route.query.currentValue as string,
  editName: route.query.editName as string,
})

const showGenderPicker = ref(false);

const genderOptions = [
  {name: '男', value: 1},
  {name: '女', value: 0},
];

// 性别显示文本
const genderLabel = computed(() =>
  genderOptions.find(o => String(o.value) === editUser.value.currentValue)?.name || ''
);

const onGenderSelect = (option: {name: string; value: number}) => {
  editUser.value.currentValue = String(option.value);
};

const onSubmit = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    Toast.fail('用户未登录');
    return;
  }

  console.log(currentUser, '当前用户')

  // 构建请求体，性别字段转为 number
  const postData: Record<string, any> = {
    id: currentUser.id,
    [editUser.value.editKey as string]: editUser.value.editKey === 'gender'
      ? Number(editUser.value.currentValue)
      : editUser.value.currentValue,
  };

  const res = await myAxios.post('/user/update', postData)
  console.log(res, '更新请求');
  if (res.code === 0 && res.data > 0) {
    Toast.success('修改成功');
    router.back();
  } else {
    Toast.fail('修改错误');
  }
};

</script>

<style scoped>

</style>
