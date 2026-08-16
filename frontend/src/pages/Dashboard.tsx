import { IndicatorCard } from "../components/indicators/IndicatorCard";
import { InvestmentCard } from "../components/investments/InvestmentCard";
import { findBestInvestment } from "../utils/investment-comparison";
import { useMarketIndicators } from "../hooks/useMarketIndicators";
import { useInvestmentSimulations } from "../hooks/useInvestmentSimulations";

export function Dashboard() {
  const {
    rates,
    isLoading: ratesLoading,
    isError: ratesError,
    refetch: refetchRates,
  } = useMarketIndicators();

  const {
    investments,
    isLoading: investmentsLoading,
    isError: investmentsError,
  } = useInvestmentSimulations();

  const isLoading = ratesLoading || investmentsLoading;
  const isError = ratesError || investmentsError;

  if (isLoading) {
    return (
      <p className="text-text-secondary text-sm max-w-3xl mx-auto">
        Carregando dados de mercado...
      </p>
    );
  }

  if (isError || !rates) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-danger text-sm mb-3">
          Não foi possível carregar os dados agora.
        </p>
        <button
          onClick={() => refetchRates()}
          className="text-xs border border-border rounded-lg px-3 py-1.5 text-text-primary"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const bestInvestment = findBestInvestment(investments);

  return (
    <>
      <div className="max-w-3xl mx-auto mb-3 flex justify-end">
        <button
          onClick={() => refetchRates()}
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
        {investments.map((investment) => (
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
