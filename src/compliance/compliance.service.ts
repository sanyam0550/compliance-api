import { Injectable } from '@nestjs/common';
import { ScraperService } from '../scraper/scraper.service';
import { LLMService } from '../llm/llm.service';
import { ComplianceReport } from '../llm/types'; // Assuming ComplianceReport is a type that represents the output

@Injectable()
export class ComplianceService {
  // Inject the ScraperService and LLMService via the constructor
  constructor(
    private readonly scraperService: ScraperService, // ScraperService is responsible for retrieving webpage content
    private readonly llmService: LLMService // LLMService handles the compliance check logic using an LLM
  ) {}

  /**
   * Main method to check compliance between the content of a webpage and a compliance policy.
   * It fetches the content from both URLs using the ScraperService and passes the content to LLMService for compliance checks.
   *
   * @param webpageUrl - The URL of the webpage to check compliance for.
   * @param policyUrl - The URL of the compliance policy to check the webpage content against.
   * @returns A promise that resolves to a ComplianceReport.
   */
  async checkCompliance(webpageUrl: string, policyUrl: string): Promise<ComplianceReport> {
    const webpageContent: string = await this.scraperService.getContent(webpageUrl);
    const policyContent: string = await this.scraperService.getContent(policyUrl);
    return this.llmService.checkCompliance(webpageContent, policyContent);
  }
}
