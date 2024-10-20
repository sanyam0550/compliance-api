import { Body, Controller, Post, ValidationPipe, HttpCode } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { CheckComplianceDto } from './compliance.dto';

@Controller('compliance') // Define a controller that handles all requests to '/compliance' endpoint
export class ComplianceController {
  // Constructor injection of ComplianceService to handle business logic
  constructor(private readonly complianceService: ComplianceService) {}

  /**
   * POST /compliance/validate
   * This method handles POST requests to '/compliance/validate'.
   * It validates the request body using the ValidationPipe and
   * passes the validated data to the complianceService for processing.
   *
   * @param checkComplianceDto - The DTO containing the webpage URL and policy URL.
   * @returns A response from the complianceService with the compliance results.
   */
  @Post('validate')
  @HttpCode(200) // Set the status code to 200 OK instead of 201 Created
  async checkCompliance(@Body(new ValidationPipe()) checkComplianceDto: CheckComplianceDto) {
    // Destructure the webpageUrl and policyUrl from the DTO
    const { webpageUrl, policyUrl } = checkComplianceDto;

    // Pass the URLs to the service to check compliance and return the results
    return await this.complianceService.checkCompliance(webpageUrl, policyUrl);
  }
}
