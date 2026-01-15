import { createPortal } from "react-dom";
import "./ConfirmModal.css";

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

  const handleBackdropMouseDown = (e) => {
    if (e.target === e.currentTarget && !loading) onClose?.();
  };

  const node = (
    <div className="cm-backdrop" onMouseDown={handleBackdropMouseDown}>
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

  // ✅ body로 직접 렌더 (부모 transform/filter 영향 완전 차단)
  return createPortal(node, document.body);
}
