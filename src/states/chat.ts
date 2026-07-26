import { ref } from "vue";

/**
 * 全局未读消息总数（响应式，供导航栏角标使用）
 */
const unreadCount = ref(0);

export const getUnreadCount = () => unreadCount;

export const setUnreadCount = (n: number) => {
    unreadCount.value = n;
};

export const incrementUnread = (n: number = 1) => {
    unreadCount.value += n;
};
