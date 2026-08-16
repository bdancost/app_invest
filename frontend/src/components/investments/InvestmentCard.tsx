import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { ICON_MAP } from "../../constants/icon-map";
import { formatCurrency } from "../../utils/currency";
import type { InvestmentSummary } from "../../types/investment.types";

interface InvestmentCardProps {
  investment: InvestmentSummary;
  highlighted?: boolean;
}

export function InvestmentCard({
  investment,
  highlighted = false,
}: InvestmentCardProps) {
  const Icon = ICON_MAP[investment.icon];

  return (
    <Card highlighted={highlighted}>
      <div className="flex items-center gap-2 mb-2.5">
        {Icon && <Icon size={18} className="text-accent" />}
        <p className="text-text-primary text-sm font-medium">
          {investment.label}
        </p>
      </div>

      <p className="text-text-secondary text-xs">valor final</p>
      <p className="text-text-primary text-lg font-medium mt-1 mb-2">
        {formatCurrency(investment.result.finalAmount)}
      </p>

      <Badge variation={investment.rateVariation} />
    </Card>
  );
}
