import myAxios from "../plugins/myAxios";
import type { TeamForm, TeamMember, TeamStatus, TeamType } from "../models/team";

const PAGE_SIZE = 10;

const unwrap = async <T>(request: Promise<{ code: number; data: T; description?: string }>): Promise<T> => {
  const response = await request;
  if (response.code !== 0) {
    throw new Error(response.description || "操作失败");
  }
  return response.data;
};

export const getTeamList = (searchText = "", status: TeamStatus = 0, pageNum = 1) =>
  unwrap(myAxios.get<TeamType[]>("/team/list", { params: { searchText, status, pageNum, pageSize: PAGE_SIZE } }));

export const getMyCreatedTeams = (searchText = "", pageNum = 1) =>
  unwrap(myAxios.get<TeamType[]>("/team/list/my/create", { params: { searchText, pageNum, pageSize: PAGE_SIZE } }));

export const getMyJoinedTeams = (searchText = "", pageNum = 1) =>
  unwrap(myAxios.get<TeamType[]>("/team/list/my/join", { params: { searchText, pageNum, pageSize: PAGE_SIZE } }));

export const getTeam = (id: number) => unwrap(myAxios.get<TeamType>("/team/get", { params: { id } }));

export const addTeam = (team: TeamForm) => unwrap(myAxios.post<number>("/team/add", team));

export const updateTeam = (team: TeamForm) => unwrap(myAxios.post<boolean>("/team/update", team));

export const joinTeam = (teamId: number, options: { password?: string; inviteCode?: string } = {}) =>
  unwrap(myAxios.post<boolean>("/team/join", { teamId, ...options }));

export const quitTeam = (teamId: number) => unwrap(myAxios.post<boolean>("/team/quit", { teamId }));

export const deleteTeam = (id: number) => unwrap(myAxios.post<boolean>("/team/delete", { id }));

export const generateInviteCode = (teamId: number) => unwrap(myAxios.post<string>("/team/invite/generate", { teamId }));

export const getTeamMembers = (teamId: number) =>
  unwrap(myAxios.get<TeamMember[]>("/team/members", { params: { teamId } }));

export const transferTeam = (teamId: number, userId: number) =>
  unwrap(myAxios.post<boolean>("/team/transfer", { teamId, userId }));
