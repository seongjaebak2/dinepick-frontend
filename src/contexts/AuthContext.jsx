import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginApi, signup as signupApi } from "../api/auth";
import { fetchMe } from "../api/members";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // {id,email,name,role}
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!localStorage.getItem("accessToken");

  const loadMe = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await fetchMe();
      setUser(me);
    } catch (e) {
      // 토큰이 만료/무효면 정리
      localStorage.removeItem("accessToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
    // 컴포넌트 최초 렌더링 시 사용자 정보를 한 번만 불러오기 위해 ESLint 경고를 무시함
  }, []);

  const signup = async (payload) => {
    await signupApi(payload);
  };

  const login = async (payload) => {
    const { accessToken } = await loginApi(payload);
    localStorage.setItem("accessToken", accessToken);
    await loadMe();
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      signup,
      login,
      logout,
      reloadMe: loadMe,
    }),
    [user, loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
