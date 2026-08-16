import { Card } from "../ui/Card";
import type { EconomicIndicator } from "../../types/investment.types";

interface IndicatorCardProps {
  indicator: EconomicIndicator;
}

export function IndicatorCard({ indicator }: IndicatorCardProps) {
  return (
    <Card>
      <p className="text-text-secondary text-xs mb-1.5">{indicator.label}</p>
      <p className="text-text-primary text-2xl font-medium">
        {indicator.value.toFixed(2)}%
      </p>
      <p className="text-success text-xs mt-1.5">{indicator.suffix}</p>
    </Card>
  );
}
