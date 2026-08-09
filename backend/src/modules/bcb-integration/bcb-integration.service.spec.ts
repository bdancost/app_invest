/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { BcbIntegrationService } from './bcb-integration.service';
import { SeriesCode } from './constants/series-code.enum';

describe('BcbIntegrationService', () => {
  let service: BcbIntegrationService;
  let httpService: HttpService;

  // Simula uma resposta real da API do Bacen, no formato bruto deles
  const mockBcbResponse: AxiosResponse = {
    data: [{ data: '07/08/2026', valor: '0.054644' }],
    status: 200,
    statusText: 'OK',
    headers: {},
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    config: {} as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BcbIntegrationService,
        {
          provide: HttpService,
          // Mock: em vez do HttpService real (que faz chamada HTTP),
          // fornecemos um objeto falso com o método `get` simulado.
          useValue: {
            get: jest.fn(() => of(mockBcbResponse)),
          },
        },
      ],
    }).compile();

    service = module.get<BcbIntegrationService>(BcbIntegrationService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSeries', () => {
    it('should fetch data from BCB and convert to internal format', async () => {
      // Act
      const result = await service.getSeries(SeriesCode.SELIC_DAILY);

      // Assert
      expect(result).toEqual([{ date: '2026-08-07', value: 0.054644 }]);
    });

    it('should call the BCB API with the correct URL', async () => {
      // Act
      await service.getSeries(SeriesCode.SELIC_DAILY, 10);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('bcdata.sgs.11/dados/ultimos/10'),
      );
    });

    it('should use cached data on second call instead of hitting the API again', async () => {
      // Arrange: primeira chamada, popula o cache
      await service.getSeries(SeriesCode.SELIC_DAILY);

      // Act: segunda chamada, mesmo código de série
      await service.getSeries(SeriesCode.SELIC_DAILY);

      // Assert: o HttpService.get só deve ter sido chamado UMA vez,
      // mesmo com duas chamadas ao service — prova que o cache O(1)
      // está funcionando e evitando a segunda requisição HTTP.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(httpService.get).toHaveBeenCalledTimes(1);
    });

    it('should fetch fresh data for different series codes independently', async () => {
      // Act
      await service.getSeries(SeriesCode.SELIC_DAILY);
      await service.getSeries(SeriesCode.CDI_DAILY);

      // Assert: séries diferentes não compartilham cache entre si
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(httpService.get).toHaveBeenCalledTimes(2);
    });
  });
});
