export const validators = {
  required: (value: any): boolean => {
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "number") return !isNaN(value);
    return value !== null && value !== undefined;
  },

  cnpj: (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    if (cleanCNPJ.length !== 14) return false;

    // Verificar sequências inválidas
    const invalidSequences = [
      "00000000000000",
      "11111111111111",
      "22222222222222",
      "33333333333333",
      "44444444444444",
      "55555555555555",
      "66666666666666",
      "77777777777777",
      "88888888888888",
      "99999999999999",
    ];

    if (invalidSequences.includes(cleanCNPJ)) return false;

    // Calcular dígitos verificadores
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

    const digit1 = calculateDigit(cleanCNPJ.substr(0, 12), weights1);
    const digit2 = calculateDigit(cleanCNPJ.substr(0, 13), weights2);

    return (
      cleanCNPJ[12] === digit1.toString() && cleanCNPJ[13] === digit2.toString()
    );
  },

  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  dateRange: (startDate: string | null, endDate: string | null): boolean => {
    if (!startDate || !endDate) return false;
    return new Date(endDate) > new Date(startDate);
  },

  fileSize: (file: File, maxSizeMB: number): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },
  fileType: (file: File, allowedTypes: string[]): boolean => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    return allowedTypes.some(
      (type) => type.toLowerCase().replace(".", "") === fileExtension
    );
  },
};

// Interface para resultado da validação do formulário
export interface IValidationResult {
  isValid: boolean;
  missingFields: string[];
  missingAttachments: string[];
}

// Função para validar formulário completo
export const validateFormForSave = (
  formData: any,
  attachments: any
): IValidationResult => {
  const missingFields: string[] = [];
  const missingAttachments: string[] = [];

  // Validar campos obrigatórios dos Dados Gerais
  if (!formData.dadosGerais?.empresa?.trim()) {
    missingFields.push("Nome da Empresa");
  }
  if (!formData.dadosGerais?.cnpj?.trim()) {
    missingFields.push("CNPJ");
  }
  if (!formData.dadosGerais?.numeroContrato?.trim()) {
    missingFields.push("Número do Contrato");
  }
  if (!formData.dadosGerais?.dataInicioContrato) {
    missingFields.push("Data de Início do Contrato");
  }
  if (!formData.dadosGerais?.dataTerminoContrato) {
    missingFields.push("Data de Término do Contrato");
  }
  if (!formData.dadosGerais?.responsavelTecnico?.trim()) {
    missingFields.push("Responsável Técnico");
  }
  if (!formData.dadosGerais?.atividadePrincipalCNAE?.trim()) {
    missingFields.push("Atividade Principal (CNAE)");
  }
  if (!formData.dadosGerais?.grauRisco) {
    missingFields.push("Grau de Risco (NR-4)");
  }
  if (!formData.dadosGerais?.gerenteContratoMarine?.trim()) {
    missingFields.push("Gerente do Contrato Marine");
  }

  // Validar anexo REM obrigatório
  const remAttachments = attachments?.rem || [];
  if (remAttachments.length === 0) {
    missingAttachments.push("REM - Resumo Estatístico Mensal");
  }

  const isValid = missingFields.length === 0 && missingAttachments.length === 0;

  return {
    isValid,
    missingFields,
    missingAttachments,
  };
};
