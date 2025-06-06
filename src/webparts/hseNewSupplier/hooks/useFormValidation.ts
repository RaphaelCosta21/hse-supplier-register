import { useState, useCallback } from "react";
import { IValidationError, IValidationResult } from "../types/IValidationError";
import { IHSEFormData } from "../types/IHSEFormData";

export const useFormValidation = () => {
  const [errors, setErrors] = useState<IValidationError[]>([]);

  const validateCNPJ = useCallback((cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    if (cleanCNPJ.length !== 14) return false;

    // Validação básica de dígitos verificadores
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const calculateDigit = (digits: string, weights: number[]): number => {
      const sum = digits
        .split("")
        .reduce(
          (acc, digit, index) => acc + parseInt(digit) * weights[index],
          0
        );
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    const firstDigit = calculateDigit(cleanCNPJ.substr(0, 12), weights1);
    const secondDigit = calculateDigit(cleanCNPJ.substr(0, 13), weights2);

    return (
      cleanCNPJ[12] === firstDigit.toString() &&
      cleanCNPJ[13] === secondDigit.toString()
    );
  }, []);

  const validateStep1 = useCallback(
    (formData: IHSEFormData): IValidationResult => {
      const stepErrors: IValidationError[] = [];

      if (!formData.empresa?.trim()) {
        stepErrors.push({
          field: "empresa",
          message: "Nome da empresa é obrigatório",
          step: 1,
        });
      }

      if (!formData.cnpj?.trim()) {
        stepErrors.push({
          field: "cnpj",
          message: "CNPJ é obrigatório",
          step: 1,
        });
      } else if (!validateCNPJ(formData.cnpj)) {
        stepErrors.push({ field: "cnpj", message: "CNPJ inválido", step: 1 });
      }

      if (!formData.numeroContrato?.trim()) {
        stepErrors.push({
          field: "numeroContrato",
          message: "Número do contrato é obrigatório",
          step: 1,
        });
      }

      if (!formData.dataInicioContrato) {
        stepErrors.push({
          field: "dataInicioContrato",
          message: "Data de início é obrigatória",
          step: 1,
        });
      }

      if (!formData.dataTerminoContrato) {
        stepErrors.push({
          field: "dataTerminoContrato",
          message: "Data de término é obrigatória",
          step: 1,
        });
      }

      if (formData.dataInicioContrato && formData.dataTerminoContrato) {
        const startDate = new Date(formData.dataInicioContrato);
        const endDate = new Date(formData.dataTerminoContrato);
        if (endDate <= startDate) {
          stepErrors.push({
            field: "dataTerminoContrato",
            message: "Data de término deve ser posterior à data de início",
            step: 1,
          });
        }
      }

      return {
        isValid: stepErrors.length === 0,
        errors: stepErrors,
      };
    },
    [validateCNPJ]
  );

  const validateCompleteForm = useCallback(
    (formData: IHSEFormData, attachments: any): IValidationResult => {
      const allErrors: IValidationError[] = [];

      // Validar etapa 1
      const step1Result = validateStep1(formData);
      allErrors.push(...step1Result.errors);

      // Validar anexo REM obrigatório
      const remAttachments = attachments["rem"] || [];
      if (remAttachments.length === 0) {
        allErrors.push({
          field: "rem",
          message: "REM (Resumo Estatístico Mensal) é obrigatório",
          step: 1,
        });
      }

      // Validar evidências obrigatórias
      const requiredEvidences = ["sesmt", "cipa", "ppra", "pcmso", "aso"];
      requiredEvidences.forEach((evidence) => {
        const evidenceAttachments = attachments[evidence] || [];
        if (evidenceAttachments.length === 0) {
          allErrors.push({
            field: evidence,
            message: `Documento ${evidence.toUpperCase()} é obrigatório`,
            step: 3,
          });
        }
      });

      setErrors(allErrors);

      return {
        isValid: allErrors.length === 0,
        errors: allErrors,
      };
    },
    [validateStep1]
  );

  return {
    errors,
    validateStep1,
    validateCompleteForm,
    clearErrors: () => setErrors([]),
  };
};
