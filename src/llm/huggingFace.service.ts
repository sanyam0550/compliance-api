import { HfInference } from '@huggingface/inference';
import { ComplianceReport, ComplianceResult, Finding, HuggingFaceResponse } from './types';
import { LLMFactory } from '../factory/llm.factory';
import { chunkArray, formatFindingsReport, splitIntoSentences } from '../utils/utils';

export class HuggingFaceService implements LLMFactory {
  private hfInference: HfInference;

  constructor() {
    this.hfInference = new HfInference(process.env.HUGGING_FACE_TOKEN);
  }

  /**
   * The main function to check compliance between the webpage content and a policy.
   * It splits the webpage content into sentences, processes them in chunks,
   * and formats the findings into a compliance report.
   *
   * @param webpageContent - The content of the webpage to be checked for compliance.
   * @param policyContent - The policy content to check the webpage against.
   * @returns A compliance report summarizing compliant, non-compliant, and inconclusive results.
   */
  async checkCompliance(webpageContent: string, policyContent: string): Promise<ComplianceReport> {
    const sentences = splitIntoSentences(webpageContent); // Split the webpage content into sentences

    /**
     * Chunk size set to 1 due to free-tier API usage limits.
     * Each sentence is processed individually to comply with the API constraints.
     */
    const chunkSize = 1;
    const chunks = chunkArray(sentences, chunkSize); // Split sentences into chunks
    const allFindings: Finding[] = [];

    // Iterate over each chunk and check compliance using Hugging Face API
    for (const chunk of chunks) {
      const findings = await this.retryHuggingFaceCall(chunk, policyContent, 3); // Retry up to 3 times if there's an error
      allFindings.push(...findings); // Collect the findings for each chunk
    }

    return formatFindingsReport(allFindings); // Format the findings into a compliance report
  }

  /**
   * Helper function to call the Hugging Face API for each chunk of sentences and retry if necessary.
   * It maps each sentence against the policy using a zero-shot classification model.
   *
   * @param chunk - A chunk of sentences from the webpage content.
   * @param policyContent - The policy content to check the sentences against.
   * @param retries - The number of retry attempts in case of an API call failure.
   * @returns An array of findings containing the compliance results for each sentence in the chunk.
   */
  private async retryHuggingFaceCall(
    chunk: string[],
    policyContent: string,
    retries: number
  ): Promise<Finding[]> {
    let attempts = 0;

    // Retry the API call up to the specified number of attempts
    while (attempts < retries) {
      try {
        // Map each sentence in the chunk to a premise-hypothesis structure
        const inputs = chunk.map(sentence => `premise: ${sentence}, hypothesis: ${policyContent}`);

        // Call Hugging Face zero-shot classification model for each input
        const response: HuggingFaceResponse[] = await this.hfInference.zeroShotClassification({
          model: 'facebook/bart-large-mnli', // Hugging Face model to be used
          inputs: inputs,
          parameters: { candidate_labels: ['entailment', 'neutral', 'contradiction'] } // Classification labels
        });

        // Process the response and return findings for each sentence
        return response.map((result, index) => {
          const label = result.labels[0]; // Get the top predicted label

          // Map the label to the corresponding compliance result
          const resultLabel =
            label === 'entailment'
              ? ComplianceResult.Compliant
              : label === 'contradiction'
                ? ComplianceResult.NonCompliant
                : ComplianceResult.Inconclusive;

          // Return the finding for the current sentence
          return {
            sentence: chunk[index],
            result: resultLabel
          };
        });
      } catch (error) {
        console.error({ message: 'Failed to call Hugging Face API', error });
        // Increment the retry attempt counter
        attempts += 1;

        // Throw an error if the maximum number of retries is reached
        if (attempts >= retries) throw error;
      }
    }
    return [];
  }
}
