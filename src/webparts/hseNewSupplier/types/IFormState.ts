import { IHSEFormData } from "./IHSEFormData";
export interface IFormState {
  currentStep: number;
  formData: IHSEFormData;
  isLoading: boolean;
  errors: { [key: string]: string };
  isDirty: boolean;
  lastSaved?: Date;
}
