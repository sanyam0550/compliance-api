import * as puppeteer from 'puppeteer';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ScraperService } from '../scraper.service';

jest.mock('puppeteer');

describe('ScraperService', () => {
  let scraperService: ScraperService;
  let browserMock: any;
  let pageMock: any;

  beforeEach(async () => {
    // Create mock instances for Puppeteer browser and page
    browserMock = {
      newPage: jest.fn(),
      close: jest.fn()
    };

    pageMock = {
      goto: jest.fn(),
      evaluate: jest.fn(),
      setRequestInterception: jest.fn(),
      on: jest.fn(),
      close: jest.fn()
    };

    // Mock Puppeteer functions to return the mock browser and page instances
    (puppeteer.launch as jest.Mock).mockResolvedValue(browserMock);
    browserMock.newPage.mockResolvedValue(pageMock);

    // Create an instance of ScraperService
    scraperService = new ScraperService();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear all mock data between tests
  });

  it('should extract content from a valid webpage', async () => {
    // Mock page interactions for a successful page load and content extraction
    pageMock.goto.mockResolvedValueOnce(null); // Simulate successful navigation
    pageMock.evaluate.mockResolvedValueOnce('Mock page content'); // Simulate content extraction

    const url = 'https://example.com';
    const content = await scraperService.getContent(url);

    expect(pageMock.goto).toHaveBeenCalledWith(url, { waitUntil: 'domcontentloaded' });
    expect(pageMock.evaluate).toHaveBeenCalled();
    expect(content).toBe('Mock page content');
    expect(pageMock.close).toHaveBeenCalled(); // Ensure the page was closed
  });

  it('should block unnecessary resources during page load', async () => {
    pageMock.goto.mockResolvedValueOnce(null);
    pageMock.evaluate.mockResolvedValueOnce('Mock page content');

    const resourceTypesBlocked = ['image', 'stylesheet', 'font', 'media', 'other'];

    // Simulate request interception
    pageMock.setRequestInterception.mockImplementationOnce(() => {});
    pageMock.on.mockImplementationOnce((event, callback) => {
      if (event === 'request') {
        const requestMock = {
          resourceType: jest.fn(() => 'image'),
          abort: jest.fn(),
          continue: jest.fn()
        };
        callback(requestMock);
        expect(requestMock.abort).toHaveBeenCalled(); // Ensure 'image' resources were aborted
      }
    });

    const url = 'https://example.com';
    await scraperService.getContent(url);

    expect(pageMock.setRequestInterception).toHaveBeenCalledWith(true);
    expect(pageMock.on).toHaveBeenCalledWith('request', expect.any(Function));
  });

  it('should throw an error if no content is found', async () => {
    // Simulate a scenario where no content is found on the page
    pageMock.goto.mockResolvedValueOnce(null);
    pageMock.evaluate.mockResolvedValueOnce('');

    const url = 'https://example.com';

    await expect(scraperService.getContent(url)).rejects.toThrowError(
      new HttpException(
        'No relevant content found at URL: https://example.com',
        HttpStatus.BAD_REQUEST
      )
    );

    expect(pageMock.close).toHaveBeenCalled(); // Ensure the page was closed even in case of an error
  });

  it('should handle errors during page load', async () => {
    // Simulate an error during page navigation
    pageMock.goto.mockRejectedValueOnce(new Error('Failed to fetch webpage content'));

    const url = 'https://invalid-url.com';

    await expect(scraperService.getContent(url)).rejects.toThrowError(
      new HttpException('Failed to fetch webpage content', HttpStatus.BAD_REQUEST)
    );
  });

  it('should close the browser instance when closeBrowser is called', async () => {
    await scraperService.closeBrowser();
    expect(browserMock.close).toHaveBeenCalled(); // Ensure the browser is closed
  });
});
