import "./ConfirmModal.css";

/*
  ConfirmModal
  - open: boolean
  - title: string
  - message: string (줄바꿈 포함 가능)
  - confirmText / cancelText: 버튼 텍스트
  - onConfirm / onClose: 콜백
  - loading: 확인 버튼 로딩/비활성화
*/
export default function ConfirmModal({
  open,
  title = "확인",
  message = "",
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onClose,
  loading = false,
}) {
  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose?.();
  };

  return (
    <div className="cm-backdrop" onMouseDown={handleBackdropClick}>
      <div
        className="cm-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="cm-header">
          <h3 className="cm-title">{title}</h3>
        </div>

        <div className="cm-body">
          {/* 줄바꿈 유지 */}
          <pre className="cm-message">{message}</pre>
        </div>

        <div className="cm-actions">
          <button
            type="button"
            className="cm-btn cm-cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="cm-btn cm-confirm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "처리 중..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
