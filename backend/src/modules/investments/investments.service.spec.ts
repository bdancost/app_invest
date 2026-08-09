import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { BcbIntegrationService } from '../bcb-integration/bcb-integration.service';
import { SeriesCode } from '../bcb-integration/constants/series-code.enum';
import { InvestmentType } from './constants/investment-type.enum';

describe('InvestmentsService', () => {
  let service: InvestmentsService;
  let bcbIntegrationService: BcbIntegrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentsService,
        {
          provide: BcbIntegrationService,
          // Mock genérico: implementamos o comportamento real dentro
          // de cada teste usando mockResolvedValueOnce, para controlar
          // exatamente qual valor cada chamada retorna.
          useValue: {
            getSeries: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InvestmentsService>(InvestmentsService);
    bcbIntegrationService = module.get<BcbIntegrationService>(
      BcbIntegrationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validation', () => {
    it('should reject initialAmount <= 0', async () => {
      await expect(
        service.simulate({
          type: InvestmentType.TESOURO_SELIC,
          initialAmount: 0,
          months: 12,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject months <= 0', async () => {
      await expect(
        service.simulate({
          type: InvestmentType.TESOURO_SELIC,
          initialAmount: 1000,
          months: 0,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject CDB simulation without cdiPercentage', async () => {
      await expect(
        service.simulate({
          type: InvestmentType.CDB,
          initialAmount: 1000,
          months: 12,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Tesouro Selic simulation', () => {
    it('should calculate compound interest using the SELIC target rate', async () => {
      // Arrange: SELIC target = 14.75% ao ano
      jest
        .spyOn(bcbIntegrationService, 'getSeries')
        .mockResolvedValueOnce([{ date: '2026-08-07', value: 14.75 }]);

      // Act
      const result = await service.simulate({
        type: InvestmentType.TESOURO_SELIC,
        initialAmount: 1000,
        months: 12,
      });

      // Assert: com 12 meses (1 ano) à taxa anual, o valor final deve
      // ser muito próximo de initialAmount * (1 + 0.1475)
      expect(result.finalAmount).toBeCloseTo(1147.5, 0);
      expect(result.annualRate).toBeCloseTo(14.75, 1);

      // Confere que buscou a série certa (SELIC_TARGET)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(bcbIntegrationService.getSeries).toHaveBeenCalledWith(
        SeriesCode.SELIC_TARGET,
        1,
      );
    });
  });

  describe('CDB simulation', () => {
    it('should correctly annualize the daily CDI rate before applying cdiPercentage', async () => {
      // Arrange: CDI diário = 0.054644% ao dia
      // Anualizado (252 dias úteis): (1.00054644)^252 - 1 ≈ 14.86% a.a.
      jest
        .spyOn(bcbIntegrationService, 'getSeries')
        .mockResolvedValueOnce([{ date: '2026-08-07', value: 0.054644 }]);

      // Act: CDB pagando 110% do CDI
      const result = await service.simulate({
        type: InvestmentType.CDB,
        initialAmount: 1000,
        months: 12,
        cdiPercentage: 110,
      });

      // Assert: 110% de ~14.86% a.a. = ~16.35% a.a.
      // Essa é a regressão que garante que nunca mais vamos confundir
      // taxa diária com taxa anual, como aconteceu antes da correção.
      expect(result.annualRate).toBeGreaterThan(15);
      expect(result.annualRate).toBeLessThan(17);
      expect(result.finalAmount).toBeGreaterThan(1150);

      // Confere que buscou a série certa (CDI_DAILY)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(bcbIntegrationService.getSeries).toHaveBeenCalledWith(
        SeriesCode.CDI_DAILY,
        1,
      );
    });
  });

  describe('LCI simulation', () => {
    it('should be tax exempt', async () => {
      jest
        .spyOn(bcbIntegrationService, 'getSeries')
        .mockResolvedValueOnce([{ date: '2026-08-07', value: 0.054644 }]);

      const result = await service.simulate({
        type: InvestmentType.LCI,
        initialAmount: 1000,
        months: 12,
        cdiPercentage: 95,
      });

      expect(result.isTaxExempt).toBe(true);
    });
  });

  describe('CDB tax status', () => {
    it('should not be tax exempt', async () => {
      jest
        .spyOn(bcbIntegrationService, 'getSeries')
        .mockResolvedValueOnce([{ date: '2026-08-07', value: 0.054644 }]);

      const result = await service.simulate({
        type: InvestmentType.CDB,
        initialAmount: 1000,
        months: 12,
        cdiPercentage: 110,
      });

      expect(result.isTaxExempt).toBe(false);
    });
  });

  describe('Poupança simulation', () => {
    it('should apply 0.5% monthly rate when SELIC is above 8.5% a.a.', async () => {
      // Arrange: SELIC = 14.75% a.a. (acima do threshold de 8.5%)
      jest
        .spyOn(bcbIntegrationService, 'getSeries')
        .mockResolvedValueOnce([{ date: '2026-08-07', value: 14.75 }]);

      // Act
      const result = await service.simulate({
        type: InvestmentType.POUPANCA,
        initialAmount: 1000,
        months: 12,
      });

      // Assert: 0.5% a.m. compostos por 12 meses ≈ 6.17% a.a.
      expect(result.monthlyRate).toBeCloseTo(0.5, 1);
    });

    it('should apply 70% of SELIC when SELIC is at or below 8.5% a.a.', async () => {
      // Arrange: SELIC = 7% a.a. (abaixo do threshold)
      jest
        .spyOn(bcbIntegrationService, 'getSeries')
        .mockResolvedValueOnce([{ date: '2026-08-07', value: 7 }]);

      // Act
      const result = await service.simulate({
        type: InvestmentType.POUPANCA,
        initialAmount: 1000,
        months: 12,
      });

      // Assert: 70% de 7% a.a. = 4.9% a.a. → ~0.408% a.m.
      expect(result.monthlyRate).toBeCloseTo(0.408, 2);
    });
  });
});
