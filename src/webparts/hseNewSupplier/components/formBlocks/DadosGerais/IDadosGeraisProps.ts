import { IDadosGerais } from "../../../types/IHSEFormData";

export interface IDadosGeraisProps {
  value: IDadosGerais;
  onChange: (
    field: keyof IDadosGerais,
    value: string | number | boolean | Date | undefined
  ) => void;
  errors?: { [key in keyof IDadosGerais]?: string };
}
