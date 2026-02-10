import type { InputHTMLAttributes } from "react";
import "./style.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  hasError?: boolean;
  containerClassName?: string;
};

export function Input({
  label,
  helperText,
  errorText,
  hasError,
  id,
  className,
  containerClassName,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;
  const rootClasses = containerClassName
    ? `app-input-root ${containerClassName}`
    : "app-input-root";
  const classes = [
    "app-input-field",
    className,
    hasError && "app-input-field--error",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClasses}>
      {label ? <label htmlFor={inputId}>{label}</label> : null}
      <input id={inputId} className={classes} {...props} />
      {errorText ? (
        <small className="app-input-error">{errorText}</small>
      ) : null}
      {!errorText && helperText ? (
        <small className="app-input-helper">{helperText}</small>
      ) : null}
    </div>
  );
}
