import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface BadgeProps {
  variation: number;
}

export function Badge({ variation }: BadgeProps) {
  const isPositive = variation > 0;
  const isNegative = variation < 0;
  const isStable = variation === 0;

  const styles = isPositive
    ? "bg-success-bg text-success"
    : isNegative
      ? "bg-danger-bg text-danger"
      : "bg-[#1c1c1c] text-text-secondary";

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${styles}`}
    >
      <Icon size={13} />
      <span>
        {isStable
          ? "estável"
          : `${isPositive ? "+" : ""}${variation.toFixed(2)} p.p.`}
      </span>
    </div>
  );
}
