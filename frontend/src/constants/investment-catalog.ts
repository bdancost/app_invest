import { InvestmentType } from "../types/investment.types";

export interface InvestmentCatalogEntry {
  type: InvestmentType;
  label: string;
  icon: string;
  cdiPercentage?: number; // usado apenas para CDB, LCI e LCA
}

export const INVESTMENT_CATALOG: InvestmentCatalogEntry[] = [
  {
    type: InvestmentType.CDB,
    label: "CDB 110% CDI",
    icon: "building-bank",
    cdiPercentage: 110,
  },
  {
    type: InvestmentType.TESOURO_SELIC,
    label: "Tesouro Selic",
    icon: "shield-check",
  },
  {
    type: InvestmentType.LCI,
    label: "LCI 95% CDI",
    icon: "home",
    cdiPercentage: 95,
  },
  { type: InvestmentType.POUPANCA, label: "Poupança", icon: "pig-money" },
];

export const DEFAULT_SIMULATION_AMOUNT = 1000;
export const DEFAULT_SIMULATION_MONTHS = 12;
