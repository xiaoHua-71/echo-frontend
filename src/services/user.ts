import myAxios from "../plugins/myAxios";
import { getCurrentUserState, setCurrentUserState } from "../states/user";

export const getCurrentUser = async () => {
    // 优先使用缓存，减少不必要的网络请求
    const cached = getCurrentUserState();
    if (cached) {
        return cached;
    }
    // 不存在则从远程获取
    try {
        const res = await myAxios.get('/user/current');
        if (res.code === 0) {
            setCurrentUserState(res.data);
            return res.data;
        }
        return null;
    } catch {
        return null;
    }
}

