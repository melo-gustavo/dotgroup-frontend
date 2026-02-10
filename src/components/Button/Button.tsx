import type { ButtonHTMLAttributes } from "react";
import "./style.css";

type ButtonVariant = "primary" | "secondary" | "danger" | "success";
type ButtonSize = "small" | "medium" | "large";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "medium",
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`app-button app-button--${variant} app-button--${size}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? "Carregando..." : children}
    </button>
  );
}
