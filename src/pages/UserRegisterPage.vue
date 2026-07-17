<template>
  <div class="register-page">
    <!-- 2233娘 -->
    <div class="hero-area">
      <div class="char-wrapper">
        <img class="char-img" src="../assets/characters/2233.png" alt="2233娘" />
      </div>
    </div>

    <!-- 注册表单 -->
    <div class="form-area">
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
        <div style="margin: 20px 16px 16px;">
          <van-button round block type="primary" native-type="submit">
            注册
          </van-button>
        </div>
        <div style="text-align: center;">
          <van-button round block plain type="primary" @click="router.push('/user/register/email')">
            邮箱注册
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from "vue";
import myAxios from "../plugins/myAxios";
import { Toast } from "vant";

const router = useRouter();

const userAccount = ref('');
const userPassword = ref('');
const checkPassword = ref('');

const onSubmit = async () => {
  if (userPassword.value !== checkPassword.value) {
    Toast.fail('两次输入的密码不一致');
    return;
  }
  const res = await myAxios.post('/user/register', {
    registerType: 'password',
    userAccount: userAccount.value,
    userPassword: userPassword.value,
    checkPassword: checkPassword.value,
  })
  console.log(res, '用户注册');
  if (res.code === 0 && res.data) {
    Toast.success('注册成功');
    router.push('/user/login');
  } else {
    Toast.fail(res.description ?? '注册失败');
  }
};
</script>

<style scoped>
.register-page {
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

/* ====== 表单 ====== */
.form-area {
  width: 100%;
  max-width: 340px;
  padding: 0 16px 40px;
}
</style>
