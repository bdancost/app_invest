import type { InvestmentSummary } from "../types/investment.types";

export function findBestInvestment(
  investments: InvestmentSummary[],
): InvestmentSummary | null {
  if (investments.length === 0) {
    return null;
  }

  return investments.reduce((best, current) =>
    current.result.finalAmount > best.result.finalAmount ? current : best,
  );
}
