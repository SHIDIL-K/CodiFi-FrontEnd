import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const BASE_URL = "https://codifi-backendend-new.onrender.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [tokens, setTokens] = useState(() => {
    try {
      const raw = localStorage.getItem("tokens");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const saveTokensAndUser = (tokensObj, userObj) => {
    setTokens(tokensObj);
    setUser(userObj);
    localStorage.setItem("tokens", JSON.stringify(tokensObj));
    localStorage.setItem("user", JSON.stringify(userObj));
  };

  // 🔐 LOGIN FUNCTION
  const login = async ({ username, password }) => {
    try {
      const tokenRes = await fetch(`${BASE_URL}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!tokenRes.ok) {
        const data = await tokenRes.json();
        throw new Error(data.detail || "Invalid credentials");
      }

      const tokensObj = await tokenRes.json(); // { access, refresh }

      // Fetch profile info
      const profileRes = await fetch(`${BASE_URL}/api/profile/`, {
        headers: { Authorization: `Bearer ${tokensObj.access}` },
      });

      if (!profileRes.ok) throw new Error("Failed to fetch profile");

      const userObj = await profileRes.json();

      // save user + tokens
      saveTokensAndUser(tokensObj, userObj);

      // ✅ RETURN BOTH user & tokens
      return { user: userObj, tokens: tokensObj };

    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };


  // 🚪 LOGOUT FUNCTION
  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem("tokens");
    localStorage.removeItem("user");
  };

  // 🔄 REFRESH ACCESS TOKEN
  const refreshAccessToken = async () => {
    if (!tokens?.refresh) return;
    try {
      const res = await fetch(`${BASE_URL}/api/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });
      if (res.ok) {
        const newTokens = await res.json();
        const updatedTokens = { ...tokens, access: newTokens.access };
        setTokens(updatedTokens);
        localStorage.setItem("tokens", JSON.stringify(updatedTokens));
        return updatedTokens.access;
      } else {
        logout();
      }
    } catch (err) {
      console.error("Token refresh error:", err);
      logout();
    }
  };

  // 👤 LOAD USER PROFILE (on page refresh or re-login)
  const loadUser = async () => {
    const rawTokens = localStorage.getItem("tokens");
    if (!rawTokens) return;
    try {
      const parsed = JSON.parse(rawTokens);
      const profileRes = await fetch(`${BASE_URL}/api/profile/`, {
        headers: { Authorization: `Bearer ${parsed.access}` },
      });

      if (profileRes.ok) {
        const u = await profileRes.json();
        setUser(u);
        setTokens(parsed);
        localStorage.setItem("user", JSON.stringify(u));
      } else if (profileRes.status === 401) {
        // Try refreshing the token if expired
        const newAccess = await refreshAccessToken();
        if (newAccess) {
          const retryRes = await fetch(`${BASE_URL}/api/profile/`, {
            headers: { Authorization: `Bearer ${newAccess}` },
          });
          if (retryRes.ok) {
            const u = await retryRes.json();
            setUser(u);
            setTokens({ ...parsed, access: newAccess });
            localStorage.setItem("user", JSON.stringify(u));
          } else {
            logout();
          }
        }
      } else {
        logout();
      }
    } catch (err) {
      console.error("loadUser error:", err);
      logout();
    }
  };

  // ⚙️ AUTO LOAD USER ON MOUNT
  useEffect(() => {
    if (!user && tokens) {
      loadUser();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        login,
        logout,
        loadUser,
        refreshAccessToken,
        saveTokensAndUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
