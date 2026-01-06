// src/components/mypage/ProfileBanner.jsx
import "./ProfileBanner.css";
import { useAuth } from "../../contexts/AuthContext";

/*
  ProfileBanner
  - 로그인 사용자 정보 표시
  - AuthContext 기반
*/
const ProfileBanner = () => {
  // AuthProvider 밖에서 사용될 경우를 대비한 방어
  const auth = useAuth?.();
  const user = auth?.user;

  // 사용자 정보가 없을 때 기본 문구
  const name = user?.name || "회원";
  const subtitle = user?.email || "오늘도 맛있는 하루 보내세요!";

  return (
    <section className="profile-banner">
      {/* 프로필 아이콘 */}
      <div className="profile-avatar" aria-hidden="true">
        🙂
      </div>

      {/* 사용자 이름 / 서브텍스트 */}
      <div className="profile-text">
        <h1 className="profile-name">{name}</h1>
        <p className="profile-subtitle">{subtitle}</p>
      </div>
    </section>
  );
};

export default ProfileBanner;
