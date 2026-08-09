import { Injectable, BadRequestException } from '@nestjs/common';
import { BcbIntegrationService } from '../bcb-integration/bcb-integration.service';
import { SeriesCode } from '../bcb-integration/constants/series-code.enum';
import { InvestmentType } from './constants/investment-type.enum';
import { SimulateInvestmentDto, InvestmentResultDto } from './dto';

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
    [InvestmentType.CDB, this.calculateCdb.bind(this)],
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
    if (dto.type === InvestmentType.CDB && !dto.cdiPercentage) {
      throw new BadRequestException(
        'cdiPercentage is required for CDB simulations',
      );
    }
  }

  private async getAnnualIndexRate(type: InvestmentType): Promise<number> {
    if (type === InvestmentType.CDB) {
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

    // SELIC_TARGET já vem como taxa anual (ex: 14.75 = 14.75% a.a.)
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

  private calculateCdb(
    dto: SimulateInvestmentDto,
    annualCdiRate: number,
  ): InvestmentResultDto {
    const effectiveAnnualRate = annualCdiRate * (dto.cdiPercentage! / 100);
    return this.compound(dto.initialAmount, effectiveAnnualRate, dto.months);
  }

  private calculateTesouroSelic(
    dto: SimulateInvestmentDto,
    annualSelicRate: number,
  ): InvestmentResultDto {
    return this.compound(dto.initialAmount, annualSelicRate, dto.months);
  }

  private calculatePoupanca(
    dto: SimulateInvestmentDto,
    annualSelicRate: number,
  ): InvestmentResultDto {
    // Regra simplificada: SELIC > 8.5% a.a. -> poupança rende 0.5% a.m.
    // Senão, rende 70% da SELIC.
    const SELIC_THRESHOLD = 0.085;

    const monthlyRate =
      annualSelicRate > SELIC_THRESHOLD ? 0.005 : (annualSelicRate * 0.7) / 12;

    const annualRate = monthlyRate * 12;
    return this.compound(
      dto.initialAmount,
      annualRate,
      dto.months,
      monthlyRate,
    );
  }

  private compound(
    initialAmount: number,
    annualRate: number,
    months: number,
    precomputedMonthlyRate?: number,
  ): InvestmentResultDto {
    const monthlyRate =
      precomputedMonthlyRate ?? Math.pow(1 + annualRate, 1 / 12) - 1;

    const finalAmount = initialAmount * Math.pow(1 + monthlyRate, months);

    return {
      finalAmount: this.round(finalAmount),
      grossReturn: this.round(finalAmount - initialAmount),
      monthlyRate: this.round(monthlyRate * 100),
      annualRate: this.round(annualRate * 100),
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
