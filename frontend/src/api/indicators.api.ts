import { apiClient } from "./client";

export interface ReferenceRates {
  selicAnnual: number;
  cdiAnnual: number;
  poupancaAnnual: number;
  updatedAt: string;
}

export async function fetchReferenceRates(): Promise<ReferenceRates> {
  const response = await apiClient.get<ReferenceRates>(
    "/investments/reference-rates",
  );
  return response.data;
}
