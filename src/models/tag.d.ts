/**
 * 后端返回的原始标签数据结构
 */
export type TagType = {
    id: string;
    tagName: string;
    userId: string;
    parentId: string | null;
    isParent: number;
    createTime: string;
    updateTime: string;
    isDelete: number;
};

/**
 * 树形选择器使用的标签节点（支持多级嵌套）
 */
export type TagTreeNode = {
    text: string;
    id: string;
    children?: TagTreeNode[];
};
