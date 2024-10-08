export interface AuthContextType {
  user: MeResponse | null;

  isAuthenticated: boolean;
  isSuperAdmin: boolean;

  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>;

  logout: () => Promise<void>;
  isLoading: boolean;
}

export interface MeResponse {
  _id: string;
  username: string;
  email: string;
  superAdmin: boolean;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface LoginResponse {
  accessToken: string;
}

export interface LogoutResponse {
  message: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}
