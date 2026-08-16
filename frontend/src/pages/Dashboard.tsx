import { IndicatorCard } from "../components/indicators/IndicatorCard";
import { InvestmentCard } from "../components/investments/InvestmentCard";
import { MOCK_INVESTMENTS } from "../constants/mock-data";
import { findBestInvestment } from "../utils/investment-comparison";
import { useMarketIndicators } from "../hooks/useMarketIndicators";

export function Dashboard() {
  const { rates, isLoading, isError, refetch } = useMarketIndicators();
  const bestInvestment = findBestInvestment(MOCK_INVESTMENTS);

  if (isLoading) {
    return (
      <p className="text-text-secondary text-sm max-w-3xl mx-auto">
        Carregando indicadores de mercado...
      </p>
    );
  }

  if (isError || !rates) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-danger text-sm mb-3">
          Não foi possível carregar os indicadores agora.
        </p>
        <button
          onClick={() => refetch()}
          className="text-xs border border-border rounded-lg px-3 py-1.5 text-text-primary"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto mb-3 flex justify-end">
        <button
          onClick={() => refetch()}
          className="text-xs border border-border rounded-lg px-3 py-1.5 text-text-primary"
        >
          Atualizar
        </button>
      </div>

      <section className="grid grid-cols-3 gap-3 max-w-3xl mx-auto mb-6">
        <IndicatorCard
          indicator={{
            label: "Selic meta",
            value: rates.selicAnnual,
            suffix: "ao ano",
          }}
        />
        <IndicatorCard
          indicator={{
            label: "CDI anualizado",
            value: rates.cdiAnnual,
            suffix: "ao ano",
          }}
        />
        <IndicatorCard
          indicator={{
            label: "Poupança",
            value: rates.poupancaAnnual,
            suffix: "ao ano",
          }}
        />
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
