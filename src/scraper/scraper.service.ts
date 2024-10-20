import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';

@Injectable()
export class ScraperService {
  private browser: Browser; // Keep the browser instance open for reuse

  constructor() {
    this.init(); // Initialize the browser when the service is created
  }

  /**
   * Initialize the Puppeteer browser instance.
   * The browser is launched in headless mode with additional flags for better performance and resource management.
   * This function is automatically called when the service is created.
   * If Puppeteer fails to launch, an error is logged, and an HTTP exception is thrown.
   */
  async init() {
    try {
      this.browser = await puppeteer.launch({
        headless: true, // Run the browser in headless mode for better performance
        executablePath: '/usr/bin/chromium', // Specify the path to the system-installed Chromium
        args: [
          '--no-sandbox', // Disable the sandbox for environments where sandboxing is not possible
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // Reduce memory usage to prevent crashes
          '--disable-accelerated-2d-canvas',
          '--disable-gpu' // Disable GPU acceleration for headless mode
        ]
      });
    } catch (error) {
      console.error('Failed to initialize Puppeteer:', error.message);
      throw new HttpException('Failed to initialize browser', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Scrapes the content from a given webpage URL by loading the page and extracting visible content.
   * The page is optimized by blocking unnecessary resources (e.g., images, fonts) for faster load times.
   * If no content is found or an error occurs, an HTTP exception is thrown.
   *
   * @param url - The webpage URL to scrape.
   * @returns The text content of the webpage as a trimmed string.
   */
  async getContent(url: string): Promise<string> {
    try {
      // Reinitialize the browser if it has not been initialized
      if (!this.browser) {
        await this.init();
      }

      const page = await this.browser.newPage(); // Open a new page in the browser

      // Block unnecessary resources (images, stylesheets, fonts, etc.) to improve performance
      await page.setRequestInterception(true);
      page.on('request', req => {
        const blockedResources = ['image', 'stylesheet', 'font', 'media', 'other'];
        if (blockedResources.includes(req.resourceType())) {
          req.abort(); // Abort requests for resources we don't need
        } else {
          req.continue(); // Allow necessary requests (e.g., HTML, scripts)
        }
      });

      // Load the page and wait until the DOM content is fully loaded
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Extract the visible text content from the page's body
      const content = await page.evaluate(() => document.body.innerText);

      // Close the page after extraction to free memory
      await page.close();

      // Throw an error if no content was extracted from the page
      if (!content) {
        throw new HttpException(`No relevant content found at URL: ${url}`, HttpStatus.BAD_REQUEST);
      }

      // Return the trimmed content
      return content.trim();
    } catch (error) {
      // Log the error and throw an HTTP exception with a generic message
      console.error('Error fetching or processing the webpage:', error.message);
      if (error instanceof HttpException) {
        // Rethrow known HttpException, like empty content case
        throw error;
      }
      throw new HttpException('Failed to fetch webpage content', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Close the Puppeteer browser instance.
   * This method should be called when the service or application is shutting down
   * to ensure the browser is closed and resources are freed.
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close(); // Close the browser if it's currently running
    }
  }
}
