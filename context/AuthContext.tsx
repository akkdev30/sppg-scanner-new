// context/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, isAxiosError } from "axios";
import * as SplashScreen from "expo-splash-screen";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Types - Update sesuai response dari backend
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
  school_pic?: SchoolPIC | null;
  school?: School | null;
  sppg?: SPPG | null;
  // Optional fields yang mungkin tidak selalu ada di response
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
  token_info?: {
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
  getToken: () => Promise<string | null>;
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

// URL API
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://sppg-backend-new.vercel.app";
const API_BASE_URL = `${API_URL}/api`;

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

  // Helper function untuk memformat user data
  const formatUserData = (userData: any): User => {
    return {
      id: userData.id || userData.userId,
      username: userData.username,
      role: userData.role,
      full_name: userData.full_name || userData.fullName || undefined,
      email: userData.email || undefined,
      phone_number: userData.phone_number || userData.phoneNumber || undefined,
      is_active: userData.is_active !== false, // default true
      last_login_at:
        userData.last_login_at || userData.lastLoginAt || undefined,
      created_at:
        userData.created_at || userData.createdAt || new Date().toISOString(),
      updated_at:
        userData.updated_at || userData.updatedAt || new Date().toISOString(),
      school_pic: userData.school_pic || userData.schoolPic || null,
      school: userData.school || null,
      sppg: userData.sppg || null,
      // Set default values untuk fields yang optional
      permissions: userData.permissions || {},
      stats: userData.stats || {},
    };
  };

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

      console.log("Stored token exists:", !!storedToken);
      console.log("Stored refresh token exists:", !!storedRefreshToken);
      console.log("Stored user exists:", !!storedUser);

      if (storedToken) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            const formattedUser = formatUserData(parsedUser);
            setUser(formattedUser);

            // Verify token dengan method simplified
            const isValid = await verifyToken(storedToken);
            console.log("Token is valid:", isValid);

            if (!isValid) {
              // Jika token tidak valid, coba refresh
              console.log("Token invalid, attempting refresh...");
              await refreshAuthToken();
            }
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            await clearAuth();
          }
        }
      } else {
        console.log("No token found in storage");
        await clearAuth();
      }
    } catch (error) {
      console.error("Error loading auth data:", error);
      await clearAuth();
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
      await SplashScreen.hideAsync().catch(() => {
        console.log("Splash screen already hidden");
      });
    }
  };

  const verifyToken = async (authToken: string): Promise<boolean> => {
    try {
      // Method 1: Decode token tanpa verify ke server
      if (!authToken) return false;

      // Cek apakah token ada dan formatnya benar
      const tokenParts = authToken.split(".");
      if (tokenParts.length !== 3) return false;

      try {
        // Decode token payload
        const payload = JSON.parse(atob(tokenParts[1]));

        // Cek expiration
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          console.log("Token expired");
          return false;
        }

        return true;
      } catch (decodeError) {
        console.error("Token decode error:", decodeError);
        return false;
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  };

  const getToken = async (): Promise<string | null> => {
    try {
      // Coba ambil dari state dulu
      if (token) {
        return token;
      }

      // Jika tidak ada di state, coba ambil dari storage
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        return storedToken;
      }

      return null;
    } catch (error) {
      console.error("Get token error:", error);
      return null;
    }
  };

  const login = async (
    username: string,
    password: string,
  ): Promise<LoginResponse> => {
    try {
      setIsLoading(true);

      console.log("Attempting login for user:", username);

      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000,
        },
      );

      const responseData = response.data;

      if (responseData.success) {
        const {
          token: newToken,
          refreshToken: newRefreshToken,
          user: userData,
        } = responseData;

        console.log("Login successful, token received");

        // Format user data sebelum disimpan
        const formattedUser = formatUserData(userData);

        // Save to storage
        await Promise.all([
          AsyncStorage.setItem("token", newToken),
          AsyncStorage.setItem("refreshToken", newRefreshToken || ""), // Handle jika refreshToken kosong
          AsyncStorage.setItem("user", JSON.stringify(formattedUser)),
        ]);

        console.log("Auth data saved to storage");

        // Update state
        setToken(newToken);
        setRefreshToken(newRefreshToken);
        setUser(formattedUser);

        return {
          ...responseData,
          user: formattedUser,
        };
      } else {
        throw new Error(responseData.error || "Login gagal");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Log detail error
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error(
            "Server error:",
            error.response.status,
            error.response.data,
          );
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Error setting up request:", error.message);
        }
      }

      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<LoginResponse>;

        if (axiosError.response) {
          const serverError = axiosError.response.data;
          throw new Error(
            serverError?.error ||
              `Error ${axiosError.response.status}: ${axiosError.response.statusText}`,
          );
        } else if (axiosError.request) {
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
      const currentRefreshToken =
        refreshToken || (await AsyncStorage.getItem("refreshToken"));

      if (!currentRefreshToken) {
        console.error("No refresh token available");
        throw new Error("No refresh token available");
      }

      // Coba refresh token ke server
      try {
        const response = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: currentRefreshToken },
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
        } else {
          throw new Error(response.data.error || "Failed to refresh token");
        }
      } catch (serverError: any) {
        // Jika endpoint /auth/refresh tidak tersedia (404/401)
        if (
          serverError.response?.status === 404 ||
          serverError.response?.status === 401 ||
          serverError.response?.status === 400
        ) {
          console.log(
            "Refresh endpoint not available or token invalid, clearing auth",
          );
          await clearAuth();
          return null;
        }
        throw serverError;
      }
    } catch (error) {
      console.error("Refresh token error:", error);
      await clearAuth();
      return null;
    }
  };

  const getCurrentUser = async (): Promise<User> => {
    try {
      const currentToken = await getToken();
      if (!currentToken) {
        throw new Error("Not authenticated");
      }

      const response = await axios.get<CurrentUserResponse>(
        `${API_BASE_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
          timeout: 10000,
        },
      );

      if (response.data.success) {
        // PERBAIKAN DI SINI: Ambil dari response.data.data
        const userData = response.data.data;
        const formattedUser = formatUserData(userData);

        // Update storage and state
        await AsyncStorage.setItem("user", JSON.stringify(formattedUser));
        setUser(formattedUser);

        return formattedUser;
      }

      throw new Error("Failed to get current user");
    } catch (error: any) {
      console.error("Get current user error:", error);

      // Debug: log response jika ada
      if (error.response) {
        console.log("Error response:", error.response.data);
        console.log("Error status:", error.response.status);
      }

      if (error.response?.status === 401) {
        await clearAuth();
      }

      // Jika endpoint /auth/me tidak tersedia, return user dari storage
      if (error.response?.status === 404 || error.code === "ERR_BAD_REQUEST") {
        console.log("Endpoint /auth/me not available, using stored user");
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          return parsedUser;
        }
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
      const currentToken = await getToken();
      if (!currentToken) {
        throw new Error("Not authenticated");
      }

      const response = await axios.put<ProfileResponse>(
        `${API_BASE_URL}/auth/me`,
        data,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      if (response.data.success) {
        const userData = response.data.data;
        const formattedUser = formatUserData(userData);

        // Update storage and state
        await AsyncStorage.setItem("user", JSON.stringify(formattedUser));
        setUser(formattedUser);

        return formattedUser;
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
      const currentToken = await getToken();
      if (!currentToken) {
        throw new Error("Not authenticated");
      }

      const response = await axios.put(
        `${API_BASE_URL}/auth/change-password`,
        { currentPassword, newPassword, confirmPassword },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
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
    try {
      // Panggil endpoint logout jika tersedia
      const currentToken = await getToken();
      if (currentToken) {
        await axios
          .post(
            `${API_BASE_URL}/auth/logout`,
            {},
            {
              headers: {
                Authorization: `Bearer ${currentToken}`,
              },
              timeout: 5000,
            },
          )
          .catch(() => {
            // Ignore logout errors
          });
      }
    } finally {
      await clearAuth();
    }
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
    getToken,
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

// Helper functions untuk role checking - Update untuk handle null values
export const useUserRole = () => {
  const { user } = useAuth();

  return {
    isOwner: user?.role === "owner",
    isAdmin: user?.role === "admin",
    isPic: user?.role === "pic",
    hasPermission: (permission: string): boolean => {
      return user?.permissions?.[permission] || false;
    },
    getSchoolId: (): string | undefined => user?.school?.id || undefined,
    getSppgId: (): string | undefined => user?.sppg?.id || undefined,
    getUserStats: () => user?.stats || {},
  };
};

// Export constants
export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  PIC: "pic",
} as const;
