import { useQuery } from "@tanstack/react-query";
import { fetchReferenceRates } from "../api/indicators.api";

export function useMarketIndicators() {
  const query = useQuery({
    queryKey: ["indicators", "reference-rates"],
    queryFn: fetchReferenceRates,
    staleTime: 60 * 60 * 1000,
  });

  return {
    rates: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
