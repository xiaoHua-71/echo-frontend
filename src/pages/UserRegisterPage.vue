<template>
  <div class="auth-page">
    <div class="form-area glass-card">
      <div class="card-hero">
        <img class="char-img" src="../assets/characters/2233.png" alt="2233" />
      </div>

      <div class="form-head">
        <h1 class="form-title">注册</h1>
        <p class="form-subtitle">创建账号后即可开始使用 ECHO。</p>
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="userAccount"
            name="userAccount"
            label="账号"
            placeholder="请输入账号"
            :rules="[{ required: true, message: '请填写账号' }]"
          />
          <van-field
            v-model="userPassword"
            type="password"
            name="userPassword"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
          <van-field
            v-model="checkPassword"
            type="password"
            name="checkPassword"
            label="确认密码"
            placeholder="请再次输入密码"
            :rules="[{ required: true, message: '请确认密码' }]"
          />
        </van-cell-group>
        <div class="submit-wrap">
          <van-button round block type="primary" native-type="submit">注册</van-button>
        </div>
        <div class="secondary-wrap">
          <van-button round block plain class="secondary-button" @click="router.push('/user/register/email')">
            邮箱注册
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Toast } from "vant";
import myAxios from "../plugins/myAxios";

const router = useRouter();
const userAccount = ref("");
const userPassword = ref("");
const checkPassword = ref("");

const onSubmit = async () => {
  if (userPassword.value !== checkPassword.value) {
    Toast.fail("两次输入的密码不一致");
    return;
  }

  const res = await myAxios.post("/user/register", {
    registerType: "password",
    userAccount: userAccount.value,
    userPassword: userPassword.value,
    checkPassword: checkPassword.value,
  });

  if (res.code === 0 && res.data) {
    Toast.success("注册成功");
    router.push("/user/login");
  } else {
    Toast.fail(res.description ?? "注册失败");
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 18px 32px;
  background: linear-gradient(180deg, #f6efe4 0%, #f4f7fb 100%);
}

.form-area {
  width: 100%;
  max-width: 380px;
  padding: 22px 18px 26px;
}

.card-hero {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.char-img {
  width: 180px;
  display: block;
}

.form-head {
  margin-bottom: 14px;
  text-align: center;
}

.form-title {
  margin: 0;
  font-size: 24px;
  color: var(--text-primary);
}

.form-subtitle {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.submit-wrap,
.secondary-wrap {
  margin: 20px 16px 0;
}

.form-area :deep(.van-cell-group),
.form-area :deep(.van-field),
.form-area :deep(.van-cell) {
  background: rgba(255, 255, 255, 0.76);
}

.form-area :deep(.van-cell-group) {
  border-radius: 18px;
}

.form-area :deep(.van-field__label) {
  color: var(--text-secondary);
}

.form-area :deep(.van-button--primary) {
  border: none;
  background: linear-gradient(135deg, var(--accent-primary) 0%, #ef9a74 100%);
  box-shadow: 0 14px 24px rgba(224, 122, 95, 0.2);
}

.secondary-button {
  color: var(--accent-primary-deep);
  border-color: rgba(224, 122, 95, 0.2);
  background: rgba(255, 255, 255, 0.78);
}
</style>
