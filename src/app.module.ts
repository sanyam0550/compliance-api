import { Module } from '@nestjs/common';
import { ScraperModule } from './scraper/scraper.module';
import { LlmModule } from './llm/llm.module';
import { ComplianceModule } from './compliance/compliance.module';

@Module({
  imports: [ScraperModule, LlmModule, ComplianceModule]
})
export class AppModule {}
