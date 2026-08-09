import { InvestmentType } from '../constants/investment-type.enum';

export interface SimulateInvestmentDto {
  type: InvestmentType;
  initialAmount: number;
  months: number;
  // Required for CDB, LCI and LCA: percentage of CDI (e.g. 110 means 110% of CDI)
  cdiPercentage?: number;
}
