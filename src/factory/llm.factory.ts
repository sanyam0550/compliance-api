import { ComplianceReport } from '../llm/types';

/**
 * LLMFactory interface represents the contract for any service that
 * implements a compliance check using a language model.
 *
 * Implementations of this interface should define the logic for
 * checking compliance between webpage content and a policy using an LLM.
 */
export interface LLMFactory {
  /**
   * Checks compliance between webpage content and a compliance policy.
   *
   * @param webpageContent - The content of the webpage to be checked.
   * @param policyContent - The compliance policy content to check against.
   * @returns A Promise that resolves to a ComplianceReport, summarizing the results.
   */
  checkCompliance(webpageContent: string, policyContent: string): Promise<ComplianceReport>;
}
