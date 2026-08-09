import { Injectable, BadRequestException } from '@nestjs/common';
import { BcbIntegrationService } from '../bcb-integration/bcb-integration.service';
import { SeriesCode } from '../bcb-integration/constants/series-code.enum';
import { InvestmentType } from './constants/investment-type.enum';
import { SimulateInvestmentDto, InvestmentResultDto } from './dto';
import { isTaxExempt } from './constants/tax-exemption';

type CalculatorFn = (
  dto: SimulateInvestmentDto,
  annualIndexRate: number,
) => InvestmentResultDto;

@Injectable()
export class InvestmentsService {
  // Map<InvestmentType, CalculatorFn> -> O(1) lookup regardless of how
  // many investment types we add in the future (CDB, LCI, LCA, etc).
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  private readonly calculators: Map<InvestmentType, CalculatorFn> = new Map([
    [InvestmentType.CDB, this.calculateCdiPercentageProduct.bind(this)],
    [InvestmentType.LCI, this.calculateCdiPercentageProduct.bind(this)],
    [InvestmentType.LCA, this.calculateCdiPercentageProduct.bind(this)],
    [InvestmentType.TESOURO_SELIC, this.calculateTesouroSelic.bind(this)],
    [InvestmentType.POUPANCA, this.calculatePoupanca.bind(this)],
  ]);

  constructor(private readonly bcbIntegrationService: BcbIntegrationService) {}

  async simulate(dto: SimulateInvestmentDto): Promise<InvestmentResultDto> {
    this.validate(dto);

    const annualIndexRate = await this.getAnnualIndexRate(dto.type);

    const calculate = this.calculators.get(dto.type); // O(1)
    if (!calculate) {
      throw new BadRequestException(`Unsupported investment type: ${dto.type}`);
    }

    return calculate(dto, annualIndexRate);
  }

  private validate(dto: SimulateInvestmentDto): void {
    if (dto.initialAmount <= 0) {
      throw new BadRequestException('initialAmount must be greater than zero');
    }
    if (dto.months <= 0) {
      throw new BadRequestException('months must be greater than zero');
    }

    const requiresCdiPercentage =
      dto.type === InvestmentType.CDB ||
      dto.type === InvestmentType.LCI ||
      dto.type === InvestmentType.LCA;

    if (requiresCdiPercentage && !dto.cdiPercentage) {
      throw new BadRequestException(
        `cdiPercentage is required for ${dto.type} simulations`,
      );
    }
  }

  private async getAnnualIndexRate(type: InvestmentType): Promise<number> {
    const usesCdi =
      type === InvestmentType.CDB ||
      type === InvestmentType.LCI ||
      type === InvestmentType.LCA;

    if (usesCdi) {
      return this.getAnnualizedCdiRate();
    }

    const series = await this.bcbIntegrationService.getSeries(
      SeriesCode.SELIC_TARGET,
      1,
    );
    const latest = series[series.length - 1];

    if (!latest) {
      throw new BadRequestException('No index rate data available');
    }

    return latest.value / 100;
  }

  private async getAnnualizedCdiRate(): Promise<number> {
    const series = await this.bcbIntegrationService.getSeries(
      SeriesCode.CDI_DAILY,
      1,
    );
    const latest = series[series.length - 1];

    if (!latest) {
      throw new BadRequestException('No index rate data available');
    }

    // CDI_DAILY vem como taxa DIÁRIA (ex: 0.054644 = 0.054644% ao dia).
    // Precisamos anualizar compondo sobre 252 dias úteis, que é a
    // convenção padrão do mercado financeiro brasileiro.
    const dailyRate = latest.value / 100;
    const BUSINESS_DAYS_PER_YEAR = 252;

    return Math.pow(1 + dailyRate, BUSINESS_DAYS_PER_YEAR) - 1;
  }

  private calculateCdiPercentageProduct(
    dto: SimulateInvestmentDto,
    annualCdiRate: number,
  ): InvestmentResultDto {
    const effectiveAnnualRate = annualCdiRate * (dto.cdiPercentage! / 100);
    return this.compound(
      dto.initialAmount,
      effectiveAnnualRate,
      dto.months,
      undefined,
      dto.type,
    );
  }

  private calculateTesouroSelic(
    dto: SimulateInvestmentDto,
    annualSelicRate: number,
  ): InvestmentResultDto {
    return this.compound(
      dto.initialAmount,
      annualSelicRate,
      dto.months,
      undefined,
      dto.type,
    );
  }

  private calculatePoupanca(
    dto: SimulateInvestmentDto,
    annualSelicRate: number,
  ): InvestmentResultDto {
    const SELIC_THRESHOLD = 0.085;

    const monthlyRate =
      annualSelicRate > SELIC_THRESHOLD ? 0.005 : (annualSelicRate * 0.7) / 12;

    const annualRate = monthlyRate * 12;
    return this.compound(
      dto.initialAmount,
      annualRate,
      dto.months,
      monthlyRate,
      dto.type,
    );
  }

  private compound(
    initialAmount: number,
    annualRate: number,
    months: number,
    precomputedMonthlyRate: number | undefined,
    type: InvestmentType,
  ): InvestmentResultDto {
    const monthlyRate =
      precomputedMonthlyRate ?? Math.pow(1 + annualRate, 1 / 12) - 1;

    const finalAmount = initialAmount * Math.pow(1 + monthlyRate, months);

    return {
      finalAmount: this.round(finalAmount),
      grossReturn: this.round(finalAmount - initialAmount),
      monthlyRate: this.round(monthlyRate * 100),
      annualRate: this.round(annualRate * 100),
      isTaxExempt: isTaxExempt(type),
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
