import { Module } from '@nestjs/common';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { ScraperService } from '../scraper/scraper.service';
import { LLMService } from '../llm/llm.service';
import { HuggingFaceService } from '../llm/huggingFace.service';

@Module({
  controllers: [ComplianceController],
  providers: [
    ComplianceService,
    ScraperService,
    LLMService,
    {
      provide: 'LLMFactory', // Register the LLMFactory token
      useClass: HuggingFaceService // Use the concrete implementation for LLMFactory
    }
  ],
  exports: [ComplianceService]
})
export class ComplianceModule {}
