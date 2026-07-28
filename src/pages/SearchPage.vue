<template>
  <div class="page-shell">
    <section class="glass-card page-head">
      <h1 class="section-title">标签搜索</h1>
      <p class="section-subtitle">按兴趣标签筛选伙伴，快速缩小匹配范围。</p>
    </section>

    <section class="glass-card search-panel">
      <van-search
        v-model="searchText"
        show-action
        placeholder="输入你想搜索的标签"
        @search="onSearch"
        @cancel="onCancel"
      />

      <div class="section-block">
        <div class="block-title">已选标签</div>
        <div v-if="activeIds.length === 0" class="empty-tip">还没有选择标签</div>
        <van-row v-else gutter="12" class="tag-row">
          <van-col v-for="tag in activeIds" :key="tag">
            <van-tag closeable class="active-tag" @close="doClose(tag)">
              {{ tag }}
            </van-tag>
          </van-col>
        </van-row>
      </div>

      <div class="section-block">
        <div class="block-title">选择标签</div>
        <van-tree-select
          v-model:active-id="activeIds"
          v-model:main-active-index="activeIndex"
          :items="tagList"
        />
      </div>
    </section>

    <van-button block type="primary" round class="search-button" @click="doSearchResult">
      开始搜索
    </van-button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import type { TagTreeNode } from "../models/tag";
import { getTagList } from "../services/tag";

const router = useRouter();
const searchText = ref("");
const originTagList = ref<TagTreeNode[]>([]);
const tagList = ref<TagTreeNode[]>([]);
const activeIds = ref([]);
const activeIndex = ref(0);

onMounted(async () => {
  const data = await getTagList();
  originTagList.value = data;
  tagList.value = data;
});

const onSearch = () => {
  tagList.value = originTagList.value.map((parentTag) => {
    const tempParentTag = { ...parentTag };
    tempParentTag.children = [...(parentTag.children || [])].filter((item) => item.text.includes(searchText.value));
    return tempParentTag;
  });
};

const onCancel = () => {
  searchText.value = "";
  tagList.value = originTagList.value;
};

const doClose = (tag: string) => {
  activeIds.value = activeIds.value.filter((item) => item !== tag);
};

const doSearchResult = () => {
  router.push({
    path: "/user/list",
    query: {
      tags: activeIds.value,
    },
  });
};
</script>

<style scoped>
.page-head {
  padding: 18px 18px 16px;
}

.search-panel {
  overflow: hidden;
}

.search-panel :deep(.van-search) {
  background: transparent;
}

.search-panel :deep(.van-search__content) {
  background: rgba(255, 255, 255, 0.72);
}

.section-block {
  padding: 0 14px 14px;
}

.block-title {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.empty-tip {
  color: var(--text-secondary);
  font-size: 13px;
}

.tag-row {
  padding-top: 4px;
}

.active-tag {
  background: rgba(224, 122, 95, 0.1);
  border-color: rgba(224, 122, 95, 0.18);
  color: var(--accent-primary-deep);
}

.search-panel :deep(.van-tree-select) {
  border-radius: 18px;
  overflow: hidden;
}

.search-panel :deep(.van-sidebar) {
  background: rgba(250, 244, 239, 0.8);
}

.search-panel :deep(.van-tree-select__content) {
  background: rgba(255, 255, 255, 0.74);
}

.search-button {
  border: none;
  background: linear-gradient(135deg, var(--accent-primary) 0%, #ef9a74 100%);
  box-shadow: 0 14px 24px rgba(224, 122, 95, 0.22);
}
</style>
