import { useState, useCallback } from "react";
import { IValidationError, IValidationResult } from "../types/IValidationError";
import {
  IHSEFormData,
  IAnexosFormulario,
  IConformidadeLegal,
} from "../types/IHSEFormData";
import { validators } from "../utils/validators";

export const useFormValidation = (): {
  errors: IValidationError[];
  validateStep1: (formData: IHSEFormData) => IValidationResult;
  validateStep2: (formData: IHSEFormData) => IValidationResult;
  validateCompleteForm: (
    formData: IHSEFormData,
    attachments: IAnexosFormulario
  ) => IValidationResult;
  clearErrors: () => void;
} => {
  const [errors, setErrors] = useState<IValidationError[]>([]);

  const validateStep1 = useCallback(
    (formData: IHSEFormData): IValidationResult => {
      const stepErrors: IValidationError[] = [];
      const dados = formData.dadosGerais;

      // Validações obrigatórias do Bloco A
      if (!validators.required(dados.empresa)) {
        stepErrors.push({
          field: "empresa",
          message: "Nome da empresa é obrigatório",
          step: 1,
        });
      }

      if (!validators.required(dados.cnpj)) {
        stepErrors.push({
          field: "cnpj",
          message: "CNPJ é obrigatório",
          step: 1,
        });
      } else if (!validators.cnpj(dados.cnpj)) {
        stepErrors.push({ field: "cnpj", message: "CNPJ inválido", step: 1 });
      }

      if (!validators.required(dados.numeroContrato)) {
        stepErrors.push({
          field: "numeroContrato",
          message: "Número do contrato é obrigatório",
          step: 1,
        });
      }

      if (!dados.dataInicioContrato) {
        stepErrors.push({
          field: "dataInicioContrato",
          message: "Data de início é obrigatória",
          step: 1,
        });
      }

      if (!dados.dataTerminoContrato) {
        stepErrors.push({
          field: "dataTerminoContrato",
          message: "Data de término é obrigatória",
          step: 1,
        });
      }

      if (dados.dataInicioContrato && dados.dataTerminoContrato) {
        if (
          !validators.dateRange(
            dados.dataInicioContrato as unknown as string,
            dados.dataTerminoContrato as unknown as string
          )
        ) {
          stepErrors.push({
            field: "dataTerminoContrato",
            message: "Data de término deve ser posterior à data de início",
            step: 1,
          });
        }
      }

      if (!validators.required(dados.responsavelTecnico)) {
        stepErrors.push({
          field: "responsavelTecnico",
          message: "Responsável técnico é obrigatório",
          step: 1,
        });
      }

      if (
        !dados.grauRisco ||
        Number(dados.grauRisco) < 1 ||
        Number(dados.grauRisco) > 4
      ) {
        stepErrors.push({
          field: "grauRisco",
          message: "Grau de risco deve ser entre 1 e 4",
          step: 1,
        });
      }

      if (!validators.required(dados.gerenteContratoMarine)) {
        stepErrors.push({
          field: "gerenteContratoMarine",
          message: "Gerente do contrato é obrigatório",
          step: 1,
        });
      }

      return {
        isValid: stepErrors.length === 0,
        errors: stepErrors,
      };
    },
    []
  );

  const validateStep2 = useCallback(
    (formData: IHSEFormData): IValidationResult => {
      const stepErrors: IValidationError[] = [];
      const conformidade: IConformidadeLegal = formData.conformidadeLegal;

      // Exemplo: validar se pelo menos uma NR foi respondida
      const nrKeys = Object.keys(conformidade);
      if (nrKeys.length < 1) {
        stepErrors.push({
          field: "conformidadeLegal",
          message: "É necessário responder pelo menos uma NR",
          step: 2,
        });
      }

      // Adicione validações específicas conforme necessário

      return {
        isValid: stepErrors.length === 0,
        errors: stepErrors,
      };
    },
    []
  );
  const validateCompleteForm = useCallback(
    (
      formData: IHSEFormData,
      attachments: IAnexosFormulario
    ): IValidationResult => {
      const allErrors: IValidationError[] = [];
      const step1 = validateStep1(formData);
      const step2 = validateStep2(formData);

      allErrors.push(...step1.errors, ...step2.errors);

      setErrors(allErrors);

      return {
        isValid: allErrors.length === 0,
        errors: allErrors,
      };
    },
    [validateStep1, validateStep2]
  );

  return {
    errors,
    validateStep1,
    validateStep2,
    validateCompleteForm,
    clearErrors: () => setErrors([]),
  };
};
