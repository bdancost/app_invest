import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BcbIntegrationController } from './bcb-integration.controller';
import { BcbIntegrationService } from './bcb-integration.service';

@Module({
  imports: [HttpModule],
  controllers: [BcbIntegrationController],
  providers: [BcbIntegrationService],
  exports: [BcbIntegrationService],
})
export class BcbIntegrationModule {}
