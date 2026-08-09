import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { SeriesCode } from './constants/series-code.enum';
import { BcbSeriesItemDto, EconomicIndexPointDto } from './dto';

interface CacheEntry {
  data: EconomicIndexPointDto[];
  expiresAt: number;
}

@Injectable()
export class BcbIntegrationService {
  private readonly logger = new Logger(BcbIntegrationService.name);
  private readonly baseUrl = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';

  // Cache TTL: 1 hour. SELIC/CDI don't change intraday in a way that
  // justifies hitting the external API on every single request.
  private readonly cacheTtlMs = 60 * 60 * 1000;

  // Map<seriesCode, CacheEntry> -> O(1) lookup and O(1) insertion.
  // A array aqui exigiria O(n) para encontrar a série certa a cada chamada.
  private readonly cache = new Map<SeriesCode, CacheEntry>();

  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetches an economic index series from the Brazilian Central Bank (BCB).
   *
   * @param seriesCode - The BCB series code (see SeriesCode enum)
   * @param lastN - Number of most recent data points to fetch.
   *   IMPORTANT: the BCB API enforces a hard limit of 20 for this parameter;
   *   requesting more results in a 400 Bad Request from their side.
   */
  async getSeries(
    seriesCode: SeriesCode,
    lastN = 20,
  ): Promise<EconomicIndexPointDto[]> {
    const cached = this.getFromCache(seriesCode);
    if (cached) {
      this.logger.debug(`Cache hit for series ${seriesCode}`);
      return cached;
    }

    this.logger.debug(`Cache miss for series ${seriesCode}, fetching from BCB`);
    const freshData = await this.fetchFromBcb(seriesCode, lastN);
    this.saveToCache(seriesCode, freshData);
    return freshData;
  }

  private getFromCache(seriesCode: SeriesCode): EconomicIndexPointDto[] | null {
    const entry = this.cache.get(seriesCode); // O(1)

    if (!entry) {
      return null;
    }

    const isExpired = Date.now() > entry.expiresAt;
    if (isExpired) {
      this.cache.delete(seriesCode); // O(1)
      return null;
    }

    return entry.data;
  }

  private saveToCache(
    seriesCode: SeriesCode,
    data: EconomicIndexPointDto[],
  ): void {
    this.cache.set(seriesCode, {
      // O(1)
      data,
      expiresAt: Date.now() + this.cacheTtlMs,
    });
  }

  private async fetchFromBcb(
    seriesCode: SeriesCode,
    lastN: number,
  ): Promise<EconomicIndexPointDto[]> {
    const url = `${this.baseUrl}.${seriesCode}/dados/ultimos/${lastN}?formato=json`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<BcbSeriesItemDto[]>(url),
      );

      return response.data.map((item) => this.toEconomicIndexPoint(item));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to fetch series ${seriesCode} from BCB: ${errorMessage}`,
      );
      throw new ServiceUnavailableException(
        'Unable to retrieve economic index data at this time. Please try again shortly.',
      );
    }
  }

  private toEconomicIndexPoint(item: BcbSeriesItemDto): EconomicIndexPointDto {
    return {
      date: this.convertBrazilianDateToIso(item.data),
      value: parseFloat(item.valor),
    };
  }

  private convertBrazilianDateToIso(brazilianDate: string): string {
    // Bacen retorna DD/MM/YYYY, convertemos para YYYY-MM-DD
    const [day, month, year] = brazilianDate.split('/');
    return `${year}-${month}-${day}`;
  }
}
