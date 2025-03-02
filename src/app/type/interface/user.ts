export interface AuthUser {
  id: number;
  name: string;
  exp: number;
}

export interface UpdateUserRequest {
  // 密码
  password: string;
  // 旧密码
  old_password: string;
}
