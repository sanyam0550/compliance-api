import { Injectable, Inject } from '@nestjs/common';
import { LLMFactory } from '../factory/llm.factory';

@Injectable()
export class LLMService {
  constructor(@Inject('LLMFactory') private readonly llmFactory: LLMFactory) {}

  async checkCompliance(webpageContent: string, policyContent: string) {
    return this.llmFactory.checkCompliance(webpageContent, policyContent);
  }
}
