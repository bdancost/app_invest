import { apiClient } from "./client";

export interface RawEconomicIndexPoint {
  date: string;
  value: number;
}

export async function fetchSelicSeries(): Promise<RawEconomicIndexPoint[]> {
  const response = await apiClient.get<RawEconomicIndexPoint[]>(
    "/bcb-integration/selic",
  );
  return response.data;
}

export async function fetchCdiSeries(): Promise<RawEconomicIndexPoint[]> {
  const response = await apiClient.get<RawEconomicIndexPoint[]>(
    "/bcb-integration/cdi",
  );
  return response.data;
}
