import * as utils from '../../utils/utils';
import { HfInference } from '@huggingface/inference';
import { HuggingFaceService } from '../huggingFace.service';
import { ComplianceReport, ComplianceResult } from '../types';

// Mock the Hugging Face API
jest.mock('@huggingface/inference');

describe('HuggingFaceService', () => {
  let huggingFaceService: HuggingFaceService;
  let mockHfInference: any;

  beforeEach(() => {
    // Mock the Hugging Face Inference API
    mockHfInference = new HfInference();
    (HfInference as jest.Mock).mockImplementation(() => mockHfInference);

    huggingFaceService = new HuggingFaceService();

    mockHfInference.zeroShotClassification = jest.fn();

    // Mock utility functions
    jest
      .spyOn(utils, 'splitIntoSentences')
      .mockImplementation((text: string) => text.split('.').filter(Boolean));
    jest.spyOn(utils, 'chunkArray').mockImplementation((array: string[], chunkSize: number) => {
      const chunks: string[][] = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        const chunk: string[] = array.slice(i, i + chunkSize);
        chunks.push(chunk);
      }
      return chunks;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a compliance report with compliant results', async () => {
    const mockResponse = [
      {
        labels: ['entailment'],
        scores: [0.9],
        sequence: 'This is a test sentence.'
      }
    ];
    mockHfInference.zeroShotClassification.mockResolvedValueOnce(mockResponse);

    const webpageContent = 'This is a test sentence.';
    const policyContent = 'This is a policy.';

    const expectedResult: ComplianceReport = {
      complianceSummary: {
        totalSentencesAnalyzed: 1,
        compliantSentences: 1,
        nonCompliantSentences: 0,
        inconclusiveSentences: 0
      },
      detailedResults: [
        {
          sentenceNumber: 1,
          sentence: 'This is a test sentence',
          result: ComplianceResult.Compliant
        }
      ]
    };

    const result = await huggingFaceService.checkCompliance(webpageContent, policyContent);

    expect(result).toEqual(expectedResult);
    expect(mockHfInference.zeroShotClassification).toHaveBeenCalledTimes(1);
  });

  it('should retry the Hugging Face API call and return results on the second attempt', async () => {
    const mockResponse = [
      {
        labels: ['entailment'],
        scores: [0.9],
        sequence: 'This is another test sentence.'
      }
    ];

    // Mock the first call to fail and the second one to succeed
    mockHfInference.zeroShotClassification
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce(mockResponse);

    const webpageContent = 'This is another test sentence.';
    const policyContent = 'This is another policy.';

    const result = await huggingFaceService.checkCompliance(webpageContent, policyContent);

    expect(result.complianceSummary.compliantSentences).toBe(1);
    expect(mockHfInference.zeroShotClassification).toHaveBeenCalledTimes(2); // First failed, second succeeded
  });

  it('should throw an error if the maximum number of retries is reached', async () => {
    // Mock the Hugging Face API to always throw an error
    mockHfInference.zeroShotClassification.mockRejectedValue(new Error('API Error'));

    const webpageContent = 'This is a test sentence.';
    const policyContent = 'This is a policy.';

    await expect(huggingFaceService.checkCompliance(webpageContent, policyContent)).rejects.toThrow(
      'API Error'
    );
    expect(mockHfInference.zeroShotClassification).toHaveBeenCalledTimes(3); // Should try 3 times
  });

  it('should return a compliance report with non-compliant results', async () => {
    const mockResponse = [
      {
        labels: ['contradiction'],
        scores: [0.9],
        sequence: 'This sentence is non-compliant.'
      }
    ];
    mockHfInference.zeroShotClassification.mockResolvedValueOnce(mockResponse);

    const webpageContent = 'This sentence is non-compliant.';
    const policyContent = 'This is a policy.';

    const expectedResult: ComplianceReport = {
      complianceSummary: {
        totalSentencesAnalyzed: 1,
        compliantSentences: 0,
        nonCompliantSentences: 1,
        inconclusiveSentences: 0
      },
      detailedResults: [
        {
          sentenceNumber: 1,
          sentence: 'This sentence is non-compliant',
          result: ComplianceResult.NonCompliant
        }
      ]
    };

    const result = await huggingFaceService.checkCompliance(webpageContent, policyContent);

    expect(result).toEqual(expectedResult);
    expect(mockHfInference.zeroShotClassification).toHaveBeenCalledTimes(1);
  });

  it('should return a compliance report with inconclusive results', async () => {
    const mockResponse = [
      {
        labels: ['neutral'],
        scores: [0.6],
        sequence: 'This sentence is inconclusive.'
      }
    ];
    mockHfInference.zeroShotClassification.mockResolvedValueOnce(mockResponse);

    const webpageContent = 'This sentence is inconclusive.';
    const policyContent = 'This is a policy.';

    const expectedResult: ComplianceReport = {
      complianceSummary: {
        totalSentencesAnalyzed: 1,
        compliantSentences: 0,
        nonCompliantSentences: 0,
        inconclusiveSentences: 1
      },
      detailedResults: [
        {
          sentenceNumber: 1,
          sentence: 'This sentence is inconclusive',
          result: ComplianceResult.Inconclusive
        }
      ]
    };

    const result = await huggingFaceService.checkCompliance(webpageContent, policyContent);

    expect(result).toEqual(expectedResult);
    expect(mockHfInference.zeroShotClassification).toHaveBeenCalledTimes(1);
  });
});
