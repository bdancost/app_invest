import { InvestmentType } from "../types/investment.types";
import type {
  InvestmentSummary,
  EconomicIndicator,
} from "../types/investment.types";

export const MOCK_INDICATORS: EconomicIndicator[] = [
  { label: "Selic meta", value: 14.75, suffix: "ao ano" },
  { label: "CDI anualizado", value: 14.86, suffix: "ao ano" },
  { label: "Poupança", value: 6.17, suffix: "ao ano" },
];

export const MOCK_INVESTMENTS: InvestmentSummary[] = [
  {
    type: InvestmentType.CDB,
    label: "CDB 110% CDI",
    icon: "building-bank",
    rateVariation: 0.4,
    result: {
      finalAmount: 1152.9,
      grossReturn: 152.9,
      monthlyRate: 1.19,
      annualRate: 15.29,
      isTaxExempt: false,
    },
  },
  {
    type: InvestmentType.TESOURO_SELIC,
    label: "Tesouro Selic",
    icon: "shield-check",
    rateVariation: 0.25,
    result: {
      finalAmount: 1140.0,
      grossReturn: 140.0,
      monthlyRate: 1.1,
      annualRate: 14.0,
      isTaxExempt: false,
    },
  },
  {
    type: InvestmentType.LCI,
    label: "LCI 95% CDI",
    icon: "home",
    rateVariation: -0.1,
    result: {
      finalAmount: 1148.2,
      grossReturn: 148.2,
      monthlyRate: 1.16,
      annualRate: 14.12,
      isTaxExempt: true,
    },
  },
  {
    type: InvestmentType.POUPANCA,
    label: "Poupança",
    icon: "pig-money",
    rateVariation: 0,
    result: {
      finalAmount: 1061.7,
      grossReturn: 61.7,
      monthlyRate: 0.5,
      annualRate: 6.17,
      isTaxExempt: true,
    },
  },
];
