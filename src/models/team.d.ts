import { UserType } from "./user";

export type TeamStatus = 0 | 1 | 2;

export type TeamType = {
  id: number;
  name: string;
  description: string;
  expireTime?: string | Date;
  maxNum: number;
  status: TeamStatus;
  createTime: string | Date;
  updateTime: string | Date;
  userId: number;
  hasJoin: boolean;
  createUser?: UserType;
  hasJoinNum: number;
};

export type TeamForm = {
  id?: number;
  name: string;
  description: string;
  expireTime: string;
  maxNum: number;
  password?: string;
  status: TeamStatus;
};

export type TeamMember = {
  userId: number;
  username: string;
  avatarUrl?: string;
  gender: number;
  phone?: string;
  email?: string;
  profile?: string;
  joinTime: string | Date;
};
