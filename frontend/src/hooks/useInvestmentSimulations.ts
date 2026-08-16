import { useQueries } from "@tanstack/react-query";
import { simulateInvestment } from "../api/investments.api";
import {
  INVESTMENT_CATALOG,
  DEFAULT_SIMULATION_AMOUNT,
  DEFAULT_SIMULATION_MONTHS,
} from "../constants/investment-catalog";
import type { InvestmentSummary } from "../types/investment.types";

export function useInvestmentSimulations() {
  const results = useQueries({
    queries: INVESTMENT_CATALOG.map((entry) => ({
      queryKey: [
        "investments",
        "simulate",
        entry.type,
        DEFAULT_SIMULATION_AMOUNT,
        DEFAULT_SIMULATION_MONTHS,
      ],
      queryFn: () =>
        simulateInvestment({
          type: entry.type,
          initialAmount: DEFAULT_SIMULATION_AMOUNT,
          months: DEFAULT_SIMULATION_MONTHS,
          cdiPercentage: entry.cdiPercentage,
        }),
      staleTime: 60 * 60 * 1000,
    })),
  });

  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);

  const investments: InvestmentSummary[] = results
    .map((result, index) => {
      const entry = INVESTMENT_CATALOG[index];
      if (!result.data) return null;

      return {
        type: entry.type,
        label: entry.label,
        icon: entry.icon,
        rateVariation: 0, // placeholder: histórico comparativo ainda não implementado
        result: result.data,
      };
    })
    .filter((item): item is InvestmentSummary => item !== null);

  return { investments, isLoading, isError };
}
