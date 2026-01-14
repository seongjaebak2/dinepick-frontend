import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { login as loginApi, signup as signupApi } from "../api/auth";
import { fetchMe } from "../api/members";
import { attachAuthInterceptors } from "../api/api";
import { getJwtExpMs } from "../utils/jwt";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // {id,email,name,role}
  const [loading, setLoading] = useState(true);

  // ✅ auth 상태를 state로 관리 (localStorage 직접 읽기보다 즉시 반응)
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("accessToken")
  );

  const logoutTimerRef = useRef(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const logout = (reason = "manual") => {
    clearLogoutTimer();
    localStorage.removeItem("accessToken");
    setUser(null);
    setIsAuthenticated(false);

    if (reason === "expired") {
      // ✅ 토스트 추가
      toast.info("세션이 만료되었습니다. 다시 로그인해주세요.", {
        position: "top-center",
        autoClose: 3000,
      });

      // HashRouter 기준 로그인 페이지 이동
      window.location.hash = "#/login";
    }
  };

  const scheduleAutoLogout = (token) => {
    clearLogoutTimer();
    const expMs = getJwtExpMs(token);
    if (!expMs) return; // exp 없으면 401 기반으로만 처리

    const now = Date.now();
    const delay = expMs - now;

    if (delay <= 0) {
      logout("expired");
      return;
    }

    // 약간의 여유를 둬서 만료 직후 처리
    logoutTimerRef.current = setTimeout(() => {
      logout("expired");
    }, delay + 1000);
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
      // ✅ 토큰이 살아있으면 만료 타이머도 갱신
      scheduleAutoLogout(token);
    } catch (e) {
      // 토큰 만료/무효면 정리
      logout("expired");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ 401이 오면 자동 로그아웃
    attachAuthInterceptors(() => logout("expired"));

    // 앱 시작 시 사용자 로드
    loadMe();

    return () => {
      clearLogoutTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signup = async (payload) => {
    await signupApi(payload);
  };

  const login = async (payload) => {
    const { accessToken } = await loginApi(payload);
    localStorage.setItem("accessToken", accessToken);
    setIsAuthenticated(true);

    // ✅ 만료 타이머 세팅 후 me 로드
    scheduleAutoLogout(accessToken);
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
