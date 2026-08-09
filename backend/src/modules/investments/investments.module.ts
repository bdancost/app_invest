import { Module } from '@nestjs/common';
import { BcbIntegrationModule } from '../bcb-integration/bcb-integration.module';
import { InvestmentsController } from './investments.controller';
import { InvestmentsService } from './investments.service';

@Module({
  imports: [BcbIntegrationModule],
  controllers: [InvestmentsController],
  providers: [InvestmentsService],
})
export class InvestmentsModule {}
