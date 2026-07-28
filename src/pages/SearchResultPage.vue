<template>
  <div class="page-shell">
    <section class="glass-card page-head">
      <h1 class="section-title">搜索结果</h1>
      <p class="section-subtitle">根据你选择的标签返回匹配用户。</p>
    </section>

    <user-card-list :user-list="userList" :loading="loading" />
    <van-empty v-if="!loading && (!userList || userList.length < 1)" description="没有找到符合条件的用户" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { Toast } from "vant";
import qs from "qs";
import UserCardList from "../components/UserCardList.vue";
import myAxios from "../plugins/myAxios";

const route = useRoute();
const { tags } = route.query;
const userList = ref([]);
const loading = ref(true);

onMounted(async () => {
  const userListData = await myAxios
    .get("/user/search/tags", {
      params: {
        tagNameList: tags,
      },
      paramsSerializer: (params) => qs.stringify(params, { indices: false }),
    })
    .then((response) => response?.data)
    .catch((error) => {
      console.error("/user/search/tags error", error);
      Toast.fail("请求失败");
    });

  if (userListData) {
    userListData.forEach((user) => {
      if (user.tags) {
        user.tags = JSON.parse(user.tags);
      }
    });
    userList.value = userListData;
  }

  loading.value = false;
});
</script>

<style scoped>
.page-head {
  padding: 18px 18px 16px;
}
</style>
