import { IEvidencias } from "../../../types/IHSEFormData";

export interface IEvidenciasProps {
  value: IEvidencias;
  onChange: (field: keyof IEvidencias, value: unknown) => void;
  errors?: { [key in keyof IEvidencias]?: string };
}
