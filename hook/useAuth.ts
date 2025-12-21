"use client";
import { useState, useEffect } from "react";
import { getProfile } from "@/lib/api";

export interface IUser {
  _id: string;
  email: string;
  password: string;
  fullName: string;
  profileImage: string;
  role: UserRoles;
  status: UserStatus;
  isResetPassword: boolean;
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DELETE = "delete",
}

export enum UserRoles {
  USER = "user",
  ADMIN = "admin",
}

interface UseAuthReturn {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAuth = async () => {
    try {
      setIsLoading(true);

      // Get access token from cookie
      const accessToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      if (!accessToken) {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        return;
      }

      // Get user profile
      const response = await getProfile(accessToken);

      if (response.code === 200) {
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.role === "admin");
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
  };
};
