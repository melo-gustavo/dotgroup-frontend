import { useEffect, useMemo, useRef, useState } from "react";
import "./style.css";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  errorText?: string;
  id?: string;
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  containerClassName?: string;
  placeholder?: string;
};

export function Select({
  label,
  options,
  helperText,
  errorText,
  id,
  name,
  value,
  onValueChange,
  containerClassName,
  placeholder = "Selecione",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectId = id ?? name;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const rootClasses = containerClassName
    ? `app-select-root ${containerClassName}`
    : "app-select-root";

  return (
    <div className={rootClasses} ref={rootRef}>
      {label ? <label htmlFor={selectId}>{label}</label> : null}
      <button
        id={selectId}
        type="button"
        className={
          isOpen
            ? "app-select-trigger app-select-trigger-open"
            : "app-select-trigger"
        }
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{selectedOption?.label ?? placeholder}</span>
        <span className="app-select-chevron" aria-hidden="true">
          v
        </span>
      </button>
      {isOpen ? (
        <ul className="app-select-options" role="listbox">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  className={
                    isSelected
                      ? "app-select-option app-select-option-selected"
                      : "app-select-option"
                  }
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onValueChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {errorText ? (
        <small className="app-select-error">{errorText}</small>
      ) : null}
      {!errorText && helperText ? (
        <small className="app-select-helper">{helperText}</small>
      ) : null}
    </div>
  );
}
