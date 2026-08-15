import { InvestmentType } from './investment-type.enum';

const TAX_EXEMPT_TYPES: ReadonlySet<InvestmentType> = new Set([
  InvestmentType.LCI,
  InvestmentType.LCA,
  InvestmentType.POUPANCA,
]);

export function isTaxExempt(type: InvestmentType): boolean {
  return TAX_EXEMPT_TYPES.has(type); // O(1) lookup via Set
}
