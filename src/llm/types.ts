export interface ComplianceReport {
  complianceSummary: {
    totalSentencesAnalyzed: number;
    compliantSentences: number;
    nonCompliantSentences: number;
    inconclusiveSentences: number;
  };
  detailedResults: Array<{
    sentenceNumber: number;
    sentence: string;
    result: 'Compliant' | 'Non-compliant' | 'Inconclusive';
  }>;
}

export interface HuggingFaceResponse {
  labels: string[];
  scores: number[];
  sequence: string;
}

export interface Finding {
  sentence: string;
  result: 'Compliant' | 'Non-compliant' | 'Inconclusive';
}

export enum ComplianceResult {
  Compliant = 'Compliant',
  NonCompliant = 'Non-compliant',
  Inconclusive = 'Inconclusive'
}
