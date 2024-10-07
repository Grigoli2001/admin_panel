import {
  createContext,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
  useRef,
  ReactNode,
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const tokenRef = useRef(token);

  const fetchUser = useCallback(async () => {
    try {
      const fetchedUser = await getMeApi();
      setUser(fetchedUser);
      setIsSuperAdmin(fetchedUser.superAdmin);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }, []);
  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthenticated) {
        setIsLoading(true);
        try {
          await fetchUser();
        } catch (error) {
          console.error("Error fetching user:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isAuthenticated, fetchUser]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated, user, fetchUser]);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      setIsLoading(true);
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
        await fetchUser();
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUser]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutApi();
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
      setIsSuperAdmin(false);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useLayoutEffect(() => {
    const authInterceptor = api.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        if (!config._retry && tokenRef.current) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${tokenRef.current}`;
        }
        return config;
      }
    );

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
            console.log("Access token refreshed:", accessToken);
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
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            logout();
          }
        } else if (
          error.response?.status === 401 &&
          errorMessage === "No session user provided"
        ) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(authInterceptor);
      api.interceptors.response.eject(refreshInterceptor);
    };
  }, [logout]);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isSuperAdmin,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
