import * as yup from "yup";
import { validators } from "../utils/validators";

export const dadosGeraisSchema = yup.object({
  empresa: yup
    .string()
    .required("Nome da empresa é obrigatório")
    .min(2, "Mínimo 2 caracteres"),
  cnpj: yup
    .string()
    .required("CNPJ é obrigatório")
    .test("cnpj-valid", "CNPJ inválido", (value) =>
      value ? validators.cnpj(value) : false
    ),
  numeroContrato: yup.string().required("Número do contrato é obrigatório"),
  dataInicioContrato: yup.date().required("Data de início é obrigatória"),
  dataTerminoContrato: yup
    .date()
    .required("Data de término é obrigatória")
    .min(
      yup.ref("dataInicioContrato"),
      "Data de término deve ser posterior à data de início"
    ),
  responsavelTecnico: yup
    .string()
    .required("Responsável técnico é obrigatório"),
  totalEmpregados: yup.number().min(1, "Deve ter pelo menos 1 empregado"),
  empregadosParaServico: yup.number().min(0, "Não pode ser negativo"),
  grauRisco: yup.number().min(1).max(4).required("Grau de risco é obrigatório"),
});

export const conformidadeLegalSchema = yup.object({
  conformidadeLegal: yup
    .object()
    .test(
      "has-responses",
      "Pelo menos uma resposta é necessária",
      (value) => Object.keys(value || {}).length > 0
    ),
});

export const evidenciasSchema = yup.object({
  // Esquema para validar evidências baseado nos anexos
});

export const completeFormSchema = yup.object({
  ...dadosGeraisSchema.fields,
  ...conformidadeLegalSchema.fields,
  ...evidenciasSchema.fields,
});
