import "./ProfileBanner.css";
import { useAuth } from "../../contexts/AuthContext";

/*
  ProfileBanner
  - 로그인한 회원 이름 표시
  - CtaSection과 동일한 AuthContext 사용
*/
const ProfileBanner = () => {
  const { user } = useAuth();

  const name = user?.name ?? "회원";
  const subtitle = user?.email ?? "오늘도 맛있는 하루 보내세요!";

  return (
    <section className="profile-banner">
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
