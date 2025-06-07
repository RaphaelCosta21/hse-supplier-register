import { IServicosEspeciais } from "../../../types/IHSEFormData";

export interface IServicosEspeciaisProps {
  value: IServicosEspeciais;
  onChange: (field: keyof IServicosEspeciais, value: unknown) => void;
  errors?: { [key in keyof IServicosEspeciais]?: string };
}
