import { apiClient } from "./client";
import type {
  InvestmentType,
  InvestmentResult,
} from "../types/investment.types";

export interface SimulateInvestmentPayload {
  type: InvestmentType;
  initialAmount: number;
  months: number;
  cdiPercentage?: number;
}

export async function simulateInvestment(
  payload: SimulateInvestmentPayload,
): Promise<InvestmentResult> {
  const response = await apiClient.post<InvestmentResult>(
    "/investments/simulate",
    payload,
  );
  return response.data;
}
