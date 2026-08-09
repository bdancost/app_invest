import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { BcbIntegrationModule } from './modules/bcb-integration/bcb-integration.module';
import { InvestmentsModule } from './modules/investments/investments.module';

@Module({
  imports: [HealthModule, BcbIntegrationModule, InvestmentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
