import "./style.css";

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  variant?: "text" | "card";
  count?: number;
  className?: string;
};

export function Skeleton({
  width = "100%",
  height = "1rem",
  borderRadius = "4px",
  variant = "text",
  count = 1,
  className = "",
}: SkeletonProps) {
  const skeletonItems = Array.from({ length: count });

  const baseStyle = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius,
  };

  if (variant === "card") {
    return (
      <article className={`skeleton-card ${className}`}>
        <div
          className="skeleton-element skeleton-title"
          style={{ height: "1.5rem", marginBottom: "0.75rem" }}
        />
        <div
          className="skeleton-element skeleton-text"
          style={{ height: "0.9rem", marginBottom: "0.5rem" }}
        />
        <div
          className="skeleton-element skeleton-text"
          style={{ height: "0.85rem", width: "80%" }}
        />
      </article>
    );
  }

  return (
    <div className={`skeleton-wrapper ${className}`}>
      {skeletonItems.map((_, index) => (
        <div key={index} className="skeleton-element" style={baseStyle} />
      ))}
    </div>
  );
}
