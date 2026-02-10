import type { ChangeEvent } from "react";
import "./file-input-style.css";

type FileInputProps = {
  name: string;
  label: string;
  accept?: string;
  onChange: (file: File | null) => void;
  previewUrl?: string | null;
  previewAlt?: string;
  maxFileSizeBytes?: number;
  hasError?: boolean;
  errorMessage?: string;
};

export function FileInput({
  name,
  label,
  accept = "*/*",
  onChange,
  previewUrl,
  previewAlt = "Preview",
  maxFileSizeBytes,
  hasError = false,
  errorMessage,
}: FileInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      onChange(null);
      return;
    }

    if (maxFileSizeBytes && file.size > maxFileSizeBytes) {
      onChange(null);
      return;
    }

    onChange(file);
  };

  return (
    <div className="file-input-wrapper">
      <label htmlFor={name} className="file-input-label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        onChange={handleChange}
        className={`file-input ${hasError ? "file-input--error" : ""}`}
      />
      {hasError && errorMessage && (
        <span className="file-input-error">{errorMessage}</span>
      )}
      {previewUrl && (
        <div className="file-input-preview">
          <img src={previewUrl} alt={previewAlt} className="file-input-image" />
        </div>
      )}
    </div>
  );
}
