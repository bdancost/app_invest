export const InvestmentType = {
  CDB: "CDB",
  LCI: "LCI",
  LCA: "LCA",
  TESOURO_SELIC: "TESOURO_SELIC",
  POUPANCA: "POUPANCA",
} as const;

export type InvestmentType =
  (typeof InvestmentType)[keyof typeof InvestmentType];

export interface InvestmentResult {
  finalAmount: number;
  grossReturn: number;
  monthlyRate: number;
  annualRate: number;
  isTaxExempt: boolean;
}

export interface InvestmentSummary {
  type: InvestmentType;
  label: string;
  icon: string;
  rateVariation: number; // variação em pontos percentuais desde a última atualização
  result: InvestmentResult;
}

export interface EconomicIndicator {
  label: string;
  value: number;
  suffix: string;
}
