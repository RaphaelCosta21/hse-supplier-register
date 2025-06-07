import { IConformidadeLegal } from "../../../types/IHSEFormData";

export interface IConformidadeLegalProps {
  value: IConformidadeLegal;
  onChange: (field: keyof IConformidadeLegal, value: unknown) => void;
  errors?: { [key in keyof IConformidadeLegal]?: string };
}
