import ChatPage from "../pages/ChatPage.vue";
import Index from "../pages/Index.vue";
import MessagesPage from "../pages/MessagesPage.vue";
import SearchPage from "../pages/SearchPage.vue";
import SearchResultPage from "../pages/SearchResultPage.vue";
import TeamAddPage from "../pages/TeamAddPage.vue";
import TeamPage from "../pages/TeamPage.vue";
import TeamUpdatePage from "../pages/TeamUpdatePage.vue";
import UserEditPage from "../pages/UserEditPage.vue";
import UserEmailRegisterPage from "../pages/UserEmailRegisterPage.vue";
import UserLoginPage from "../pages/UserLoginPage.vue";
import UserPage from "../pages/UserPage.vue";
import UserRegisterPage from "../pages/UserRegisterPage.vue";
import UserTeamCreatePage from "../pages/UserTeamCreatePage.vue";
import UserTeamJoinPage from "../pages/UserTeamJoinPage.vue";
import UserUpdatePage from "../pages/UserUpdatePage.vue";

const routes = [
  { path: "/", component: Index, title: "首页", meta: { requiresAuth: true } },
  { path: "/team", title: "找队伍", component: TeamPage, meta: { requiresAuth: true } },
  { path: "/team/add", title: "创建队伍", component: TeamAddPage, meta: { requiresAuth: true } },
  { path: "/team/update", title: "更新队伍", component: TeamUpdatePage, meta: { requiresAuth: true } },
  { path: "/user", title: "个人信息", component: UserPage, meta: { requiresAuth: true } },
  { path: "/search", title: "找伙伴", component: SearchPage, meta: { requiresAuth: true } },
  { path: "/user/list", title: "用户列表", component: SearchResultPage, meta: { requiresAuth: true } },
  { path: "/user/edit", title: "编辑信息", component: UserEditPage, meta: { requiresAuth: true } },
  { path: "/user/update", title: "更新信息", component: UserUpdatePage, meta: { requiresAuth: true } },
  { path: "/user/team/join", title: "加入的队伍", component: UserTeamJoinPage, meta: { requiresAuth: true } },
  { path: "/user/team/create", title: "创建的队伍", component: UserTeamCreatePage, meta: { requiresAuth: true } },
  { path: "/user/register", title: "注册", component: UserRegisterPage },
  { path: "/user/register/email", title: "邮箱注册", component: UserEmailRegisterPage },
  { path: "/user/login", title: "登录", component: UserLoginPage },
  { path: "/message", title: "消息", component: MessagesPage, meta: { requiresAuth: true } },
  { path: "/chat", title: "聊天", component: ChatPage, meta: { requiresAuth: true } },
];

export default routes;
