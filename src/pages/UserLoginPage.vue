<template>
  <div class="auth-page">
    <div class="form-area glass-card">
      <div class="card-hero">
        <img class="char-img" src="../assets/characters/2233.png" alt="2233" />
      </div>

      <div class="form-head">
        <h1 class="form-title">登录</h1>
        <p class="form-subtitle">登录后继续查看匹配、队伍和消息。</p>
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
        </van-cell-group>
        <div class="submit-wrap">
          <van-button round block type="primary" native-type="submit">
            登录
          </van-button>
        </div>
        <div class="register-tip">
          还没有账号？
          <router-link to="/user/register">注册新账号</router-link>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { Toast } from "vant";
import myAxios from "../plugins/myAxios";

const route = useRoute();
const userAccount = ref("");
const userPassword = ref("");

const onSubmit = async () => {
  try {
    const res = await myAxios.post("/user/login", {
      userAccount: userAccount.value,
      userPassword: userPassword.value,
    });

    if (res.code === 0 && res.data) {
      Toast.success("登录成功");
      setTimeout(() => {
        const redirectUrl = (route.query?.redirect as string) ?? "/";
        window.location.href = redirectUrl;
      }, 300);
    } else {
      Toast.fail("登录失败");
    }
  } catch {
    Toast.fail("登录失败");
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

.submit-wrap {
  margin: 20px 16px 16px;
}

.register-tip {
  text-align: center;
  color: var(--text-secondary);
}

.register-tip a {
  color: var(--accent-primary-deep);
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
</style>
