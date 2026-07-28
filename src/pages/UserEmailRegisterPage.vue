<template>
  <div class="auth-page">
    <div class="form-area glass-card">
      <div class="card-hero">
        <img class="char-img" src="../assets/characters/2233.png" alt="2233" />
      </div>

      <div class="form-head">
        <h1 class="form-title">邮箱注册</h1>
        <p class="form-subtitle">验证邮箱后即可创建你的账号。</p>
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱地址"
            :rules="[{ required: true, message: '请填写邮箱' }]"
          />
          <div class="code-row">
            <van-field
              v-model="code"
              name="code"
              type="digit"
              label="验证码"
              placeholder="请输入验证码"
              :rules="[{ required: true, message: '请填写验证码' }]"
            />
            <van-button
              class="send-btn"
              size="small"
              native-type="button"
              :disabled="countdown > 0"
              @click="sendCode"
            >
              {{ countdown > 0 ? countdown + "s" : "发送验证码" }}
            </van-button>
          </div>
          <van-field
            v-model="userPassword"
            type="password"
            name="userPassword"
            label="密码"
            placeholder="请设置密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
        </van-cell-group>
        <div class="submit-wrap">
          <van-button round block type="primary" native-type="submit">注册</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Toast } from "vant";
import myAxios from "../plugins/myAxios";

const router = useRouter();
const email = ref("");
const code = ref("");
const userPassword = ref("");
const countdown = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const sendCode = async () => {
  if (!email.value) {
    Toast.fail("请先输入邮箱地址");
    return;
  }
  try {
    await myAxios.post("/user/register/send-email-code", {
      email: email.value,
    });
    Toast.success("验证码已发送");
    countdown.value = 60;
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer!);
        timer = null;
      }
    }, 1000);
  } catch {
    Toast.fail("发送失败，请重试");
  }
};

const onSubmit = async () => {
  const res = await myAxios.post("/user/register", {
    registerType: "email",
    email: email.value,
    code: code.value,
    userPassword: userPassword.value,
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

.code-row {
  display: flex;
  align-items: center;
}

.code-row :deep(.van-cell) {
  flex: 1;
}

.send-btn {
  margin-right: 8px;
  flex-shrink: 0;
  color: var(--accent-primary-deep);
  border: 1px solid rgba(224, 122, 95, 0.2);
  background: rgba(255, 255, 255, 0.82);
}

.submit-wrap {
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
</style>
