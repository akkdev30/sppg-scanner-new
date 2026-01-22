// context/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";
import * as SplashScreen from "expo-splash-screen";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Types
interface School {
  id: string;
  school_code: string;
  name: string;
  address?: string;
  total_students?: number;
  latitude?: number;
  longitude?: number;
}

interface SPPG {
  id: string;
  sppg_code: string;
  sppg_name: string;
  address?: string;
  phone_number?: string;
  email?: string;
}

interface SchoolPIC {
  id: string;
  name: string;
  phone_number?: string;
  email?: string;
  position?: string;
  is_active: boolean;
}

interface User {
  id: string;
  username: string;
  role: "owner" | "admin" | "pic";
  full_name?: string;
  email?: string;
  phone_number?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  school_pic?: SchoolPIC;
  school?: School;
  sppg?: SPPG;
  permissions?: {
    [key: string]: boolean;
  };
  stats?: {
    total_distributions?: number;
    total_scans?: number;
  };
}

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  refreshToken: string;
  user: User;
  error?: string;
}

interface RefreshTokenResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  expires_in: number;
}

interface VerifyResponse {
  success: boolean;
  user?: {
    userId: string;
    username: string;
    role: string;
    created_at: string;
  };
  error?: string;
}

interface ProfileResponse {
  success: boolean;
  data: User;
}

interface CurrentUserResponse {
  success: boolean;
  message: string;
  data: User;
  token_info: {
    expires_in: number;
    issued_at: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<string | null>;
  getCurrentUser: () => Promise<User>;
  updateProfile: (data: {
    full_name?: string;
    email?: string;
    phone_number?: string;
  }) => Promise<User>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<void>;
  clearAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// URL API - bisa diubah melalui environment variable
const API_URL =
  "https://sppg-backend-new.vercel.app" || "http://localhost:3000";
const API_BASE_URL = `${API_URL}/api/`.includes("/api/auth/login")
  ? API_URL.replace("/api/auth/login", "/api")
  : `${API_URL}/api`;

interface AuthProviderProps {
  children: ReactNode;
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Setup axios interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Jika error 401 dan bukan dari login/refresh, coba refresh token
        if (
          error.response?.status === 401 &&
          !originalRequest.url.includes("/auth/login") &&
          !originalRequest.url.includes("/auth/refresh") &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            const newToken = await refreshAuthToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.log("Token refresh failed, logging out");
            await clearAuth();
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async (): Promise<void> => {
    try {
      const [storedToken, storedRefreshToken, storedUser] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("refreshToken"),
        AsyncStorage.getItem("user"),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));

        // Verify token masih valid
        await verifyToken(storedToken);
      }
    } catch (error) {
      console.error("Error loading auth data:", error);
      await clearAuth();
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
      await SplashScreen.hideAsync();
    }
  };

  const verifyToken = async (authToken: string): Promise<boolean> => {
    try {
      const response = await axios.post<VerifyResponse>(
        `${API_BASE_URL}/auth/verify`,
        { token: authToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000,
        },
      );

      return response.data.success;
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  };

  const login = async (
    username: string,
    password: string,
  ): Promise<LoginResponse> => {
    try {
      setIsLoading(true);

      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000, // 15 seconds timeout untuk login
        },
      );

      if (response.data.success) {
        const {
          token: newToken,
          refreshToken: newRefreshToken,
          user: userData,
        } = response.data;

        // Save to storage
        await Promise.all([
          AsyncStorage.setItem("token", newToken),
          AsyncStorage.setItem("refreshToken", newRefreshToken),
          AsyncStorage.setItem("user", JSON.stringify(userData)),
        ]);

        // Update state
        setToken(newToken);
        setRefreshToken(newRefreshToken);
        setUser(userData);

        return response.data;
      } else {
        throw new Error(response.data.error || "Login gagal");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<LoginResponse>;

        if (axiosError.response) {
          // Server responded with error
          const serverError = axiosError.response.data;
          throw new Error(
            serverError?.error ||
              `Error ${axiosError.response.status}: ${axiosError.response.statusText}`,
          );
        } else if (axiosError.request) {
          // No response received
          throw new Error(
            "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
          );
        }
      }

      throw new Error(error.message || "Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuthToken = async (): Promise<string | null> => {
    try {
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post<RefreshTokenResponse>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      if (response.data.success) {
        const { token: newToken, refreshToken: newRefreshToken } =
          response.data;

        // Save to storage
        await Promise.all([
          AsyncStorage.setItem("token", newToken),
          AsyncStorage.setItem("refreshToken", newRefreshToken),
        ]);

        // Update state
        setToken(newToken);
        setRefreshToken(newRefreshToken);

        return newToken;
      }

      throw new Error("Failed to refresh token");
    } catch (error) {
      console.error("Refresh token error:", error);
      await clearAuth();
      return null;
    }
  };

  const getCurrentUser = async (): Promise<User> => {
    try {
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await axios.get<CurrentUserResponse>(
        `${API_BASE_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        },
      );

      if (response.data.success) {
        const userData = response.data.data;

        // Update storage and state
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        return userData;
      }

      throw new Error("Failed to get current user");
    } catch (error: any) {
      console.error("Get current user error:", error);

      if (error.response?.status === 401) {
        await clearAuth();
      }

      throw error;
    }
  };

  const updateProfile = async (data: {
    full_name?: string;
    email?: string;
    phone_number?: string;
  }): Promise<User> => {
    try {
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await axios.put<ProfileResponse>(
        `${API_BASE_URL}/auth/me`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      if (response.data.success) {
        const updatedUser = response.data.data;

        // Update storage and state
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        return updatedUser;
      }

      throw new Error("Failed to update profile");
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> => {
    try {
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await axios.put(
        `${API_BASE_URL}/auth/change-password`,
        { currentPassword, newPassword, confirmPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to change password");
      }
    } catch (error: any) {
      console.error("Change password error:", error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error: string }>;
        if (axiosError.response?.data?.error) {
          throw new Error(axiosError.response.data.error);
        }
      }

      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    await clearAuth();
  };

  const clearAuth = async (): Promise<void> => {
    try {
      // Clear all auth-related storage
      await Promise.all([
        AsyncStorage.removeItem("token"),
        AsyncStorage.removeItem("refreshToken"),
        AsyncStorage.removeItem("user"),
      ]);

      // Clear state
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    } catch (error) {
      console.error("Clear auth error:", error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshAuthToken,
    getCurrentUser,
    updateProfile,
    changePassword,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {isInitialized ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Helper functions untuk role checking
export const useUserRole = () => {
  const { user } = useAuth();

  return {
    isOwner: user?.role === "owner",
    isAdmin: user?.role === "admin",
    isPic: user?.role === "pic",
    hasPermission: (permission: string): boolean => {
      return user?.permissions?.[permission] || false;
    },
    getSchoolId: (): string | undefined => user?.school?.id,
    getSppgId: (): string | undefined => user?.sppg?.id,
    getUserStats: () => user?.stats,
  };
};

// Export constants
export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  PIC: "pic",
} as const;
