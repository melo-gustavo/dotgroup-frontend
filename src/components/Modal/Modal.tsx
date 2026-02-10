import type { ReactNode } from "react";
import "./style.css";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {actions && <div className="modal-footer">{actions}</div>}
      </div>
    </div>
  );
}
