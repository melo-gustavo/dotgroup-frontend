import type { InputHTMLAttributes } from "react";
import "./style.css";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  count?: number;
};

export function Checkbox({ id, name, label, count, className, ...props }: CheckboxProps) {
  const checkboxId = id ?? name ?? label;
  const classes = className ? `app-checkbox-input ${className}` : "app-checkbox-input";

  return (
    <label htmlFor={checkboxId} className="app-checkbox-root">
      <input id={checkboxId} name={name} type="checkbox" className={classes} {...props} />
      <span className="app-checkbox-custom" />
      <span className="app-checkbox-label">{label}</span>
      {typeof count === "number" ? <span className="app-checkbox-count">{count}</span> : null}
    </label>
  );
}
