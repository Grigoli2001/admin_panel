import {
  createContext,
  useState,
  useLayoutEffect,
  ReactNode,
  useEffect,
} from "react";
import api from "../hooks/axios";
import { AuthContextType, MeResponse } from "../types/auth.types";
import {
  login as loginApi,
  logout as logoutApi,
  getMe as getMeApi,
  refreshToken,
} from "../api/auth";
import { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

export const AuthContext = createContext<AuthContextType | null>(null);
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("accessToken") ||
      !!sessionStorage.getItem("accessToken")
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  );
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);

  // Store the token in localStorage whenever it changes
  // useEffect(() => {
  //   if (token) {
  //     localStorage.setItem("accessToken", token);
  //   } else {
  //     localStorage.removeItem("accessToken");
  //   }
  // }, [token]);

  useEffect(() => {
    const fetchUser = async () => {
      console.log("fetchUser");
      try {
        const user = await getMeApi();
        setUser(user);
        setIsSuperAdmin(user.superAdmin);
      } catch (error) {
        console.error(error);
      }
    };

    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    console.log("login");
    try {
      const response = await loginApi(email, password);
      if (!response || !response.accessToken) {
        throw new Error("Login failed, no accessToken found");
      }
      const { accessToken } = response;

      if (rememberMe) {
        localStorage.setItem("accessToken", accessToken);
      } else {
        sessionStorage.setItem("accessToken", accessToken);
      }

      setToken(accessToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    console.log("logout");
    try {
      await logoutApi();
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    console.log("useLayoutEffect token", token);
    const authInterceptor = api.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        config.headers = config.headers || {};
        config.headers.Authorization =
          !config._retry && token
            ? `Bearer ${token}`
            : config.headers.Authorization;
        return config;
      }
    );

    return () => {
      api.interceptors.request.eject(authInterceptor);
    };
  }, [token]);

  useLayoutEffect(() => {
    console.log("useLayoutEffect refreshInterceptor");
    const refreshInterceptor = api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;
        const errorMessage = (error.response?.data as { message?: string })
          ?.message;
        if (
          error.response?.status === 401 &&
          !originalRequest?._retry &&
          errorMessage === "Invalid token"
        ) {
          originalRequest._retry = true;
          try {
            const { accessToken } = await refreshToken();
            if (!accessToken) {
              throw new Error("Access token not found");
            }
            if (localStorage.getItem("accessToken")) {
              localStorage.setItem("accessToken", accessToken);
            } else {
              sessionStorage.setItem("accessToken", accessToken);
            }
            setToken(accessToken);
            setIsAuthenticated(true);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          } catch (error) {
            logout();
            console.error(error);
            console.log("error in refresh token");
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(refreshInterceptor);
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isSuperAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
