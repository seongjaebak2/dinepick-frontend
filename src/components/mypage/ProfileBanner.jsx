// src/components/mypage/ProfileBanner.jsx
import "./ProfileBanner.css";

/*
  ProfileBanner
  - 사용자 정보 표시 (user를 props로 받는 방식)
  - AuthContext 의존 제거 → 재사용/안정성 ↑
*/
const ProfileBanner = ({ user }) => {
  const name = user?.name?.trim?.() ? user.name : "회원";
  const subtitle = user?.email?.trim?.()
    ? user.email
    : "오늘도 맛있는 하루 보내세요!";

  return (
    <section className="profile-banner" aria-label="프로필 배너">
      <div className="profile-avatar" aria-hidden="true">
        🙂
      </div>

      <div className="profile-text">
        <h1 className="profile-name">{name}</h1>
        <p className="profile-subtitle">{subtitle}</p>
      </div>
    </section>
  );
};

export default ProfileBanner;
