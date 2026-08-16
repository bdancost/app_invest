import { Body, Controller, Get, Post } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import type {
  SimulateInvestmentDto,
  InvestmentResultDto,
  ReferenceRatesDto,
} from './dto';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post('simulate')
  simulate(@Body() dto: SimulateInvestmentDto): Promise<InvestmentResultDto> {
    return this.investmentsService.simulate(dto);
  }

  @Get('reference-rates')
  getReferenceRates(): Promise<ReferenceRatesDto> {
    return this.investmentsService.getReferenceRates();
  }
}
