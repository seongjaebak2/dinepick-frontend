import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { login as loginApi, signup as signupApi, logoutApi } from "../api/auth";
import { fetchMe } from "../api/members";
import { attachAuthInterceptors } from "../api/api";
import { getJwtExpMs } from "../utils/jwt";
import { toast } from "react-toastify";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("accessToken")
  );

  // ✅ 수동 로그아웃 진행 중이면 expired 처리(로그인 이동)를 무시하기 위한 플래그
  const manualLogoutRef = useRef(false);

  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // ✅ accessToken 자동 재발급(만료 직전)
  const scheduleAutoReissue = (accessToken) => {
    clearTimer();
    const expMs = getJwtExpMs(accessToken);
    if (!expMs) return;

    const now = Date.now();
    const fireAt = expMs - 30_000;
    const delay = fireAt - now;

    if (delay <= 0) return;

    timerRef.current = setTimeout(async () => {
      try {
        // 수동 로그아웃 중이면 아무것도 하지 않음
        if (manualLogoutRef.current) return;

        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return;

        const baseURL = "http://localhost:8080";
        const res = await axios.post(
          `${baseURL}/api/auth/reissue`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken = res.data?.accessToken;
        if (!newAccessToken) throw new Error("No accessToken");

        localStorage.setItem("accessToken", newAccessToken);
        scheduleAutoReissue(newAccessToken);
      } catch (e) {
        await logout("expired");
      }
    }, delay);
  };

  // 로컬 정리(토큰 삭제 + 상태 초기화)
  const clearClientAuth = () => {
    clearTimer();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * 로그아웃
   * - manual: 서버 logout 호출 후 (호출한 곳에서 홈으로 이동)
   * - expired: 세션만료 안내 + 로그인 화면으로 이동
   */
  const logout = async (reason = "manual") => {
    if (reason === "manual") manualLogoutRef.current = true;

    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } catch (e) {
      // 백엔드가 INVALID_TOKEN / TOKEN_NOT_FOUND를 던져도
      // 프론트는 항상 로그아웃 상태로 정리해야 함
    } finally {
      clearClientAuth();

      if (reason === "expired" && !manualLogoutRef.current) {
        toast.info("세션이 만료되었습니다. 다시 로그인해주세요.", {
          position: "top-center",
          autoClose: 3000,
        });
        window.location.hash = "#/login";
      }

      if (reason === "manual") manualLogoutRef.current = false;
    }
  };

  const loadMe = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const me = await fetchMe();
      setUser(me);
      setIsAuthenticated(true);
      scheduleAutoReissue(token);
    } catch (e) {
      // 수동 로그아웃이면 무시 (logout 직후 401 등)
      if (manualLogoutRef.current) {
        setLoading(false);
        return;
      }
      await logout("expired");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 401이면 reissue 시도(인터셉터), 실패하면 logout("expired")
    attachAuthInterceptors(() => logout("expired"));
    loadMe();

    return () => {
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signup = async (payload) => {
    await signupApi(payload);
  };

  const login = async (payload) => {
    const { accessToken, refreshToken } = await loginApi(payload);

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    setIsAuthenticated(true);

    scheduleAutoReissue(accessToken);
    await loadMe();
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
