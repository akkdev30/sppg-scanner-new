// context/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  sppg_zone?: string;
  phone_number?: string;
  last_login?: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
  error?: string;
}

interface VerifyResponse {
  success: boolean;
  user?: User & { is_active: boolean };
  error?: string;
}

interface ProfileResponse {
  success: boolean;
  data: User;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  getProfile: () => Promise<User>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ganti dengan URL backend Anda

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = "https://sppg-backend.vercel.app/api/auth";

  // Load token dari storage saat app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async (): Promise<void> => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Verify token masih valid
        await verifyToken(storedToken);
      }
    } catch (error) {
      console.error("Error loading auth:", error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async (authToken: string): Promise<void> => {
    try {
      const response = await axios.get<VerifyResponse>(`${API_URL}/verify`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.data.success) {
        await logout();
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      await logout();
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;

        // Save to storage
        await AsyncStorage.setItem("token", newToken);
        await AsyncStorage.setItem("user", JSON.stringify(userData));

        // Update state
        setToken(newToken);
        setUser(userData);

        return userData;
      } else {
        throw new Error(response.data.error || "Login gagal");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<LoginResponse>;
        if (axiosError.response?.data?.error) {
          throw new Error(axiosError.response.data.error);
        }
      }
      throw new Error("Gagal terhubung ke server");
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getProfile = async (): Promise<User> => {
    try {
      const response = await axios.get<ProfileResponse>(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const updatedUser = response.data.data;
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        return updatedUser;
      }
      throw new Error("Failed to get profile");
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    getProfile,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Export API_URL untuk digunakan di komponen lain
export const API_URL = "https://sppg-backend.vercel.app/api";
