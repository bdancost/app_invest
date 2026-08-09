import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { BcbIntegrationModule } from './modules/bcb-integration/bcb-integration.module';

@Module({
  imports: [HealthModule, BcbIntegrationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
