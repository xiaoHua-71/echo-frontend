import myAxios from "../plugins/myAxios";
import type { TagType, TagTreeNode } from "../models/tag";

/**
 * 将扁平的标签列表组装成树形结构
 * 规则：
 *   - isParent === 1 是父节点（顶层）
 *   - parentId 不为 null 且不为空的是子节点
 *
 * @param tags 后端返回的原始标签列表
 * @returns 树形结构标签列表，供 van-tree-select 使用
 */
function buildTagTree(tags: TagType[]): TagTreeNode[] {
    // 父节点映射表：parentId -> 子节点列表
    const childrenMap = new Map<string, TagTreeNode[]>();

    // 父节点列表
    const parents: TagTreeNode[] = [];

    for (const tag of tags) {
        const node: TagTreeNode = {
            text: tag.tagName,
            id: tag.tagName, // 使用 tagName 作为 id，与现有选中逻辑保持一致
        };

        if (tag.isParent === 1) {
            parents.push(node);
            // 为这个父节点初始化子节点数组
            if (!childrenMap.has(tag.id)) {
                childrenMap.set(tag.id, []);
            }
        }

        // 如果有 parentId，说明是子节点
        if (tag.parentId != null && tag.parentId !== '') {
            const siblings = childrenMap.get(tag.parentId) || [];
            siblings.push(node);
            childrenMap.set(tag.parentId, siblings);
        }
    }

    // 将子节点挂载到对应的父节点上
    for (const parentTag of tags) {
        if (parentTag.isParent === 1) {
            const parentNode = parents.find(p => p.text === parentTag.tagName);
            if (parentNode) {
                const children = childrenMap.get(parentTag.id);
                if (children && children.length > 0) {
                    parentNode.children = children;
                }
            }
        }
    }

    return parents;
}

/**
 * 获取标签列表（树形结构）
 */
export const getTagList = async (): Promise<TagTreeNode[]> => {
    const res = await myAxios.get<TagType[]>('/tag/list');
    if (res.code === 0 && res.data) {
        return buildTagTree(res.data);
    }
    return [];
};
