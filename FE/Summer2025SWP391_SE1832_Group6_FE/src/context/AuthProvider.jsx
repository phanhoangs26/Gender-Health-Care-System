import { useState, useEffect, useCallback, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";

// Storage functions
const storage = {
  // Save token to localStorage
  saveToken: (token) => {
    if (!token) {
      console.warn("No token provided to save");
      return;
    }
    localStorage.setItem("token", token);
    console.log("Token saved to localStorage");
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Clear token from localStorage
  clearToken: () => {
    localStorage.removeItem("token");
    console.log("Token cleared from localStorage");
  },
};

// Helper to get user data from token
const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // Create a normalized user object with consistent field names
    return {
      id: decoded.ID || decoded.id,
      email: decoded.Email || decoded.email,
      fullname: decoded["Full Name"] || decoded.fullname,
      role: decoded.Role || decoded.role,
      username: decoded.sub || decoded.username,
      exp: decoded.exp,
      iat: decoded.iat,
      token,  // Store the raw token separately
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check token validity (synchronously)
  const validateToken = (token) => {
    if (!token) {
      console.log("No token provided to validate");
      return false;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const isExpired = decoded.exp < currentTime;

      console.log("Token validation:", {
        tokenExp: new Date(decoded.exp * 1000).toISOString(),
        currentTime: new Date(currentTime * 1000).toISOString(),
        isExpired,
        timeRemaining: `${(decoded.exp - currentTime).toFixed(0)}s`,
      });

      return !isExpired;
    } catch (error) {
      console.error("Invalid token:", error);
      return false;
    }
  };

  // Initialize auth state on app load
  const initializeAuth = useCallback(async () => {
    console.log("Initializing auth...");
    setAuthLoading(true);

    try {
      const token = storage.getToken();
      console.log("Token from storage:", token ? "exists" : "not found");

      if (!token) {
        console.log("No token found in storage, user is not authenticated");
        setUser(null);
        return;
      }

      // Validate token
      console.log("Validating token...");
      const isValid = validateToken(token);
      console.log("Token validation result:", isValid);

      if (!isValid) {
        console.log("Token is invalid or expired");
        storage.clearToken();
        setUser(null);
        return;
      }

      // Get user data from token
      console.log("Decoding user data from token...");
      const userData = getUserFromToken(token);

      if (userData) {
        console.log("User authenticated successfully");
        console.log("User data:", {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          token: userData.token ? "exists" : "missing",
        });
        setUser(userData);
      } else {
        console.error("Failed to decode user data from token");
        storage.clearToken();
        setUser(null);
      }
    } catch (error) {
      console.error("Error during auth initialization:", error);
      storage.clearToken();
      setUser(null);
    } finally {
      console.log("Auth initialization complete, setting loading to false");
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("AuthProvider mounted, initializing auth...");
    initializeAuth();

    // Handle storage events to sync auth state across tabs
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        console.log("Token changed in storage, reinitializing auth...");
        initializeAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [initializeAuth]);

  const login = useCallback((token) => {
    console.log("Login initiated with token");

    if (!token) {
      console.error("No token provided for login");
      return false;
    }

    try {
      console.log("Validating login token...");
      const isValid = validateToken(token);

      if (!isValid) {
        console.error("Invalid or expired token provided for login");
        storage.clearToken();
        setUser(null);
        return false;
      }

      // Save token to storage
      console.log("Saving token to storage...");
      storage.saveToken(token);

      // Get user data from token
      console.log("Decoding user data from token...");
      const userData = getUserFromToken(token);

      if (!userData) {
        console.error("Failed to decode user data from token");
        storage.clearToken();
        setUser(null);
        return false;
      }

      console.log("User logged in successfully:", {
        id: userData.id,
        email: userData.email,
        role: userData.role,
      });

      setUser(userData);
      return true;
    } catch (error) {
      console.error("Error during login:", error);
      storage.clearToken();
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    console.log("Logout initiated");

    // Clear token from storage
    console.log("Clearing token from storage...");
    storage.clearToken();

    // Clear user state
    console.log("Clearing user state...");
    setUser(null);

    console.log("Logout completed successfully");

    // Optional: Redirect to home or login page
    // Note: This should be handled by the component using the context
    // to avoid direct dependency on routing in the context
  }, []);

  // Periodically check token validity (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token && !validateToken(token)) {
        window.alert("Token đã hết hạn, vui lòng đăng nhập lại");
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [logout]);

  const isAuthenticated = useMemo(() => {
    // If we're still loading, we can't determine authentication state yet
    if (authLoading) {
      console.log(
        "Auth still loading, cannot determine authentication state yet"
      );
      return false;
    }

    // Check if we have a user with a token
    const hasUserWithToken = !!user?.token;
    console.log("Auth state check - hasUserWithToken:", hasUserWithToken);

    if (!hasUserWithToken) {
      console.log("No user token available, not authenticated");
      return false;
    }

    try {
      // Check if token exists in localStorage
      const storedToken = storage.getToken();
      console.log("Stored token exists:", !!storedToken);

      if (!storedToken) {
        console.log("No token found in storage");
        return false;
      }

      // Validate the stored token
      const isValid = validateToken(storedToken);
      console.log("Token validation result:", isValid);

      if (!isValid) {
        console.log("Token is invalid or expired");
        // Clear invalid token
        storage.clearToken();
        setUser(null);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error during authentication check:", error);
      return false;
    }
  }, [user?.token, authLoading]);

  const contextValue = useMemo(
    () => ({
      user,
      login,
      logout,
      authLoading,
      isAuthenticated,
    }),
    [user, login, logout, authLoading, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
