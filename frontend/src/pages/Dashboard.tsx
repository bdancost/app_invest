import { IndicatorCard } from "../components/indicators/IndicatorCard";
import { InvestmentCard } from "../components/investments/InvestmentCard";
import { MOCK_INDICATORS, MOCK_INVESTMENTS } from "../constants/mock-data";
import { findBestInvestment } from "../utils/investment-comparison";

export function Dashboard() {
  const bestInvestment = findBestInvestment(MOCK_INVESTMENTS);

  return (
    <>
      <section className="grid grid-cols-3 gap-3 max-w-3xl mx-auto mb-6">
        {MOCK_INDICATORS.map((indicator) => (
          <IndicatorCard key={indicator.label} indicator={indicator} />
        ))}
      </section>

      <section className="grid grid-cols-4 gap-3 max-w-3xl mx-auto">
        {MOCK_INVESTMENTS.map((investment) => (
          <InvestmentCard
            key={investment.type}
            investment={investment}
            highlighted={investment.type === bestInvestment?.type}
          />
        ))}
      </section>
    </>
  );
}
