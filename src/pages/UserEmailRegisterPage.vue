<template>
  <div class="email-register-page">
    <!-- 2233娘 -->
    <div class="hero-area">
      <div class="char-wrapper">
        <img class="char-img" src="../assets/characters/2233.png" alt="2233娘" />
      </div>
    </div>

    <!-- 邮箱注册表单 -->
    <div class="form-area">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
              v-model="email"
              name="email"
              label="邮箱"
              placeholder="请输入邮箱地址"
              :rules="[{ required: true, message: '请填写邮箱' }]"
          />
          <!-- 验证码 -->
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
                type="primary"
                native-type="button"
                :disabled="countdown > 0"
                @click="sendCode"
            >
              {{ countdown > 0 ? countdown + 's' : '发送验证码' }}
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
        <div style="margin: 20px 16px 16px;">
          <van-button round block type="primary" native-type="submit">
            注册
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, onUnmounted } from "vue";
import myAxios from "../plugins/myAxios";
import { Toast } from "vant";

const router = useRouter();

const email = ref('');
const code = ref('');
const userPassword = ref('');
const countdown = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const sendCode = async () => {
  if (!email.value) {
    Toast.fail('请先输入邮箱地址');
    return;
  }
  try {
    await myAxios.post('/user/register/send-email-code', {
      email: email.value,
    });
    Toast.success('验证码已发送');
    countdown.value = 60;
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer!);
        timer = null;
      }
    }, 1000);
  } catch {
    Toast.fail('发送失败，请重试');
  }
};

const onSubmit = async () => {
  const res = await myAxios.post('/user/register', {
    registerType: 'email',
    email: email.value,
    code: code.value,
    userPassword: userPassword.value,
  })
  console.log(res, '邮箱注册');
  if (res.code === 0 && res.data) {
    Toast.success('注册成功');
    router.push('/user/login');
  } else {
    Toast.fail(res.description ?? '注册失败');
  }
};
</script>

<style scoped>
.email-register-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
}

/* ====== 角色图 ====== */
.hero-area {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 80px 0 28px;
}

.char-wrapper {
  position: relative;
  width: 230px;
}

.char-img {
  width: 100%;
  height: auto;
  display: block;
  animation: idleFloat 4s ease-in-out infinite;
}

@keyframes idleFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

/* ====== 验证码行 ====== */
.code-row {
  display: flex;
  align-items: center;
}

.code-row :deep(.van-cell) {
  flex: 1;
}

.send-btn {
  margin-right: 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ====== 表单 ====== */
.form-area {
  width: 100%;
  max-width: 340px;
  padding: 0 16px 40px;
}
</style>
