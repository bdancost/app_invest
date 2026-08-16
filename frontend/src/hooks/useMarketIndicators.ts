import { useQuery } from "@tanstack/react-query";
import { fetchSelicSeries, fetchCdiSeries } from "../api/indicators.api";

export function useMarketIndicators() {
  const selicQuery = useQuery({
    queryKey: ["indicators", "selic"],
    queryFn: fetchSelicSeries,
    staleTime: 60 * 60 * 1000, // 1h, alinhado com o cache do backend
  });

  const cdiQuery = useQuery({
    queryKey: ["indicators", "cdi"],
    queryFn: fetchCdiSeries,
    staleTime: 60 * 60 * 1000,
  });

  return {
    selic: selicQuery.data?.at(-1),
    cdi: cdiQuery.data?.at(-1),
    isLoading: selicQuery.isLoading || cdiQuery.isLoading,
    isError: selicQuery.isError || cdiQuery.isError,
    refetch: () => {
      selicQuery.refetch();
      cdiQuery.refetch();
    },
  };
}
