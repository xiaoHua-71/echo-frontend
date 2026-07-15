<template>
  <form action="/">
    <van-search
        v-model="searchText"
        show-action
        placeholder="请输入要搜索的标签"
        @search="onSearch"
        @cancel="onCancel"
    />
  </form>
  <van-divider content-position="left">已选标签</van-divider>
  <div v-if="activeIds.length === 0">请选择标签</div>
  <!-- 已选择标签间距离 -->
  <van-row gutter="16" style="padding: 0 16px">
    <van-col v-for="tag in activeIds">
      <van-tag closeable size="small" type="primary" @close="doClose(tag)">
        {{ tag }}
      </van-tag>
    </van-col>
  </van-row>
  <van-divider content-position="left">选择标签</van-divider>
  <van-tree-select
      v-model:active-id="activeIds"
      v-model:main-active-index="activeIndex"
      :items="tagList"
  />
  <div style="padding: 12px">
    <van-button block type="primary" @click="doSearchResult">搜索</van-button>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {useRouter} from "vue-router";
import {getTagList} from "../services/tag";
import type { TagTreeNode } from "../models/tag";

const router = useRouter()

const searchText = ref('');

// 从后端获取的原始标签树
const originTagList = ref<TagTreeNode[]>([]);

// 标签列表（用于搜索过滤后的展示）
const tagList = ref<TagTreeNode[]>([]);

// 页面加载时从后端获取标签列表
onMounted(async () => {
  const data = await getTagList();
  originTagList.value = data;
  tagList.value = data;
});

/**
 * 搜索过滤
 * @param val
 */
const onSearch = (val) => {
  tagList.value = originTagList.value.map(parentTag => {
    const tempChildren = [...(parentTag.children || [])];// 浅拷贝，不改变原有的数组
    const tempParentTag = {...parentTag};
    tempParentTag.children = tempChildren.filter(item => item.text.includes(searchText.value));
    return tempParentTag;
  });

}
const onCancel = () => {
  searchText.value = '';
  tagList.value = originTagList.value;
};

// 已选中的标签
const activeIds = ref([]);
const activeIndex = ref(0);

// 移除标签
const doClose = (tag) => {
  activeIds.value = activeIds.value.filter(item => {
    return item !== tag;
  })
}

/**
 * 执行搜索
 */
const doSearchResult = () => {
  router.push({
    path: '/user/list',
    query: {
      tags: activeIds.value
    }
  })
}

</script>

<style scoped>

</style>
