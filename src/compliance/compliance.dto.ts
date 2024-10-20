import { IsUrl, IsNotEmpty } from 'class-validator';

export class CheckComplianceDto {
  /**
   * The webpage URL to be checked for compliance.
   *
   * @IsUrl - Ensures the value is a valid URL.
   * @IsNotEmpty - Ensures that the field is not empty.
   * The error message is customized for both cases.
   */
  @IsUrl({}, { message: 'The provided webpage URL is not valid' })
  @IsNotEmpty({ message: 'Webpage URL is required' })
  webpageUrl: string;

  /**
   * The policy URL against which the webpage will be validated.
   *
   * @IsUrl - Ensures the value is a valid URL.
   * @IsNotEmpty - Ensures that the field is not empty.
   * The error message is customized for both cases.
   */
  @IsUrl({}, { message: 'The provided policy URL is not valid' })
  @IsNotEmpty({ message: 'Policy URL is required' })
  policyUrl: string;
}
