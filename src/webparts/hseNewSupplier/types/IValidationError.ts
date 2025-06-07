export interface IValidationError {
  field: string;
  message: string;
  step: number;
}

export interface IValidationResult {
  isValid: boolean;
  errors: IValidationError[];
}
