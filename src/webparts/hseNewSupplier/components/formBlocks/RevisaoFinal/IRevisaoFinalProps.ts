import { IHSEFormData } from "../../../types/IHSEFormData";

export interface IRevisaoFinalProps {
  value: IHSEFormData;
  onSubmit: () => void;
  errors?: { [key: string]: string };
}
