import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  highlighted?: boolean;
  className?: string;
}

export function Card({
  children,
  highlighted = false,
  className = "",
}: CardProps) {
  const borderStyle = highlighted
    ? "border-2 border-success"
    : "border border-border";

  return (
    <div
      className={`bg-bg-secondary rounded-xl p-4 ${borderStyle} ${className}`}
    >
      {children}
    </div>
  );
}
