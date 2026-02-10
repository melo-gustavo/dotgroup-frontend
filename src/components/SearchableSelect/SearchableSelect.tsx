import { useEffect, useMemo, useRef, useState } from "react";
import "./style.css";

export type SearchableSelectOption = {
  label: string;
  value: string;
};

type SearchableSelectProps = {
  label?: string;
  options: SearchableSelectOption[];
  helperText?: string;
  errorText?: string;
  id?: string;
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  containerClassName?: string;
  placeholder?: string;
  searchPlaceholder?: string;
};

export function SearchableSelect({
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
  searchPlaceholder = "Buscar...",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const selectId = id ?? name;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return options;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(lowerSearchTerm),
    );
  }, [options, searchTerm]);

  const rootClasses = containerClassName
    ? `app-searchable-select-root ${containerClassName}`
    : "app-searchable-select-root";

  return (
    <div className={rootClasses} ref={rootRef}>
      {label ? <label htmlFor={selectId}>{label}</label> : null}
      <button
        id={selectId}
        type="button"
        className={
          isOpen
            ? "app-searchable-select-trigger app-searchable-select-trigger-open"
            : "app-searchable-select-trigger"
        }
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{selectedOption?.label ?? placeholder}</span>
        <span className="app-searchable-select-chevron" aria-hidden="true">
          v
        </span>
      </button>
      {isOpen ? (
        <div className="app-searchable-select-popover">
          <input
            ref={searchInputRef}
            type="text"
            className="app-searchable-select-search"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <ul className="app-searchable-select-options" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      className={
                        isSelected
                          ? "app-searchable-select-option app-searchable-select-option-selected"
                          : "app-searchable-select-option"
                      }
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onValueChange(option.value);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="app-searchable-select-empty">
                Nenhuma opção encontrada
              </li>
            )}
          </ul>
        </div>
      ) : null}
      {errorText ? (
        <small className="app-searchable-select-error">{errorText}</small>
      ) : null}
      {!errorText && helperText ? (
        <small className="app-searchable-select-helper">{helperText}</small>
      ) : null}
    </div>
  );
}
