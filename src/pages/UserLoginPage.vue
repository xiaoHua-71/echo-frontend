<template>
  <div class="login-page">
    <!-- 2233娘 -->
    <div class="hero-area">
      <div class="char-wrapper" :class="loginState">
        <img class="char-img" src="../assets/characters/2233.png" alt="2233娘" />
        <div class="glow-ring"></div>
      </div>
    </div>

    <!-- 登录表单 -->
    <div class="form-area">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
              v-model="userAccount"
              name="userAccount"
              label="账号"
              placeholder="请输入账号"
              :rules="[{ required: true, message: '请填写用户名' }]"
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
        <div style="margin: 20px 16px 16px;">
          <van-button round block type="primary" native-type="submit">
            登录
          </van-button>
        </div>
        <div style="text-align: center;">
          还没有账号？
          <router-link to="/user/register" style="color: #1989fa;">注册新账号</router-link>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {ref} from "vue";
import myAxios from "../plugins/myAxios";
import {Toast} from "vant";

const router = useRouter();
const route = useRoute();

const userAccount = ref('');
const userPassword = ref('');
const loginState = ref<'idle' | 'loading' | 'success' | 'fail'>('idle');

const onSubmit = async () => {
  loginState.value = 'loading';
  try {
    const res = await myAxios.post('/user/login', {
      userAccount: userAccount.value,
      userPassword: userPassword.value,
    })
    console.log(res, '用户登录');
    if (res.code === 0 && res.data) {
      loginState.value = 'success';
      setTimeout(() => {
        const redirectUrl = route.query?.redirect as string ?? '/';
        window.location.href = redirectUrl;
      }, 600);
    } else {
      loginState.value = 'fail';
      Toast.fail('登录失败');
      setTimeout(() => {
        loginState.value = 'idle';
      }, 1000);
    }
  } catch {
    loginState.value = 'fail';
    Toast.fail('登录失败');
    setTimeout(() => {
      loginState.value = 'idle';
    }, 1000);
  }
};

</script>

<style scoped>
.login-page {
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
  transition: transform 0.5s ease, filter 0.5s ease;
}

.char-img {
  width: 100%;
  height: auto;
  display: block;
  position: relative;
  z-index: 1;
  animation: idleFloat 4s ease-in-out infinite;
}

@keyframes idleFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

/* 旋转光晕 */
.glow-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: transparent;
  z-index: 0;
  transition: all 0.3s ease;
}

/* loading */
.char-wrapper.loading .glow-ring {
  width: 120%;
  padding-bottom: 120%;
  background: conic-gradient(from 0deg, transparent, rgba(161,196,253,0.2), rgba(255,154,158,0.2), transparent);
  animation: spinGlow 1s linear infinite;
}
.char-wrapper.loading .char-img {
  animation: breatheScale 0.8s ease-in-out infinite;
}

@keyframes spinGlow {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes breatheScale {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
}

/* success */
.char-wrapper.success {
  animation: celebrate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes celebrate {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.12) translateY(-8px); }
  50%  { transform: scale(0.95) translateY(-3px); }
  70%  { transform: scale(1.05) translateY(-1px); }
  100% { transform: scale(1) translateY(0); }
}

/* fail */
.char-wrapper.fail {
  animation: droop 1s ease-in-out;
}
@keyframes droop {
  0%   { transform: translateY(0) scale(1); filter: brightness(1); }
  25%  { transform: translateY(14px) scale(0.93); filter: brightness(0.7); }
  60%  { transform: translateY(16px) scale(0.9); filter: brightness(0.6); }
  80%  { transform: translateY(4px) scale(0.97); filter: brightness(0.9); }
  100% { transform: translateY(0) scale(1); filter: brightness(1); }
}

/* ====== 表单 ====== */
.form-area {
  width: 100%;
  max-width: 340px;
  padding: 0 16px 40px;
}
</style>
