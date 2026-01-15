import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RestaurantsPage from "./pages/RestaurantsPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./contexts/AuthContext";
import AuthRedirect from "./routes/AuthRedirect";
import MyPage from "./pages/MyPage";
import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* 홈페이지 */}
        <Route path="/" element={<HomePage />} />
        {/* 레스토랑 페이지 */}
        <Route path="/restaurants" element={<RestaurantsPage />} />
        {/* 레스토랑 상세 페이지 */}
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        {/* 마이페이지(인증된 유저만 접근 가능) */}
        <Route
          path="/me"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
        {/* 로그인 & 회원가입 페이지 (인증된 유저는 접근 불가) */}
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <LoginPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRedirect>
              <SignupPage />
            </AuthRedirect>
          }
        />
        {/* 존재하지 않는 경로로 접근 시 홈으로 이동 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* 3초 유지 토스트박스 */}
      <ToastContainer position="top-center" autoClose={3000} theme="light" />
    </AuthProvider>
  );
};

export default App;
