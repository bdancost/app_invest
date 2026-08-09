import { Controller, Get } from '@nestjs/common';
import { BcbIntegrationService } from './bcb-integration.service';
import { SeriesCode } from './constants/series-code.enum';
import { EconomicIndexPointDto } from './dto';

@Controller('bcb-integration')
export class BcbIntegrationController {
  constructor(private readonly bcbIntegrationService: BcbIntegrationService) {}

  @Get('selic')
  getSelic(): Promise<EconomicIndexPointDto[]> {
    return this.bcbIntegrationService.getSeries(SeriesCode.SELIC_DAILY);
  }

  @Get('cdi')
  getCdi(): Promise<EconomicIndexPointDto[]> {
    return this.bcbIntegrationService.getSeries(SeriesCode.CDI_DAILY);
  }
}
