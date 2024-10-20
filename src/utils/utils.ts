// Helper methods for sentence splitting, chunking, and retry logic...
import { ComplianceReport, ComplianceResult, Finding } from '../llm/types';

/**
 * Splits a given text into sentences using a regular expression.
 * It matches sequences of characters that end with '.', '!', or '?'.
 *
 * @param text - The text to be split into sentences.
 * @returns An array of sentences extracted from the text.
 */
export function splitIntoSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g) || [text];
}

/**
 * Chunks an array into smaller arrays of a specified size.
 *
 * @param array - The array to be chunked.
 * @param chunkSize - The maximum size of each chunk.
 * @returns An array of chunked arrays.
 */
export function chunkArray(array: string[], chunkSize: number): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Formats an array of findings into a compliance report.
 * The report includes a summary of the total number of sentences analyzed,
 * as well as counts of compliant, non-compliant, and inconclusive sentences.
 * Additionally, it provides detailed results for each sentence.
 *
 * @param findings - The findings array containing results for each sentence.
 * @returns A formatted compliance report containing both summary and detailed results.
 */
export function formatFindingsReport(findings: Finding[]): ComplianceReport {
  const compliant = findings.filter(f => f.result === ComplianceResult.Compliant).length;
  const nonCompliant = findings.filter(f => f.result === ComplianceResult.NonCompliant).length;
  const inconclusive = findings.filter(f => f.result === ComplianceResult.Inconclusive).length;

  return {
    complianceSummary: {
      totalSentencesAnalyzed: findings.length,
      compliantSentences: compliant,
      nonCompliantSentences: nonCompliant,
      inconclusiveSentences: inconclusive
    },
    detailedResults: findings.map((f, index) => ({
      sentenceNumber: index + 1,
      sentence: f.sentence.trim(),
      result: f.result
    }))
  };
}
