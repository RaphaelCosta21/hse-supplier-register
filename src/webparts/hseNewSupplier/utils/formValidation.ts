// Interface para resultado da validação do formulário
export interface IValidationResult {
  isValid: boolean;
  missingFields: string[];
  missingAttachments: string[];
}

// Função para validar formulário completo antes de salvar
export const validateFormForSave = (
  formData: unknown,
  attachments: unknown
): IValidationResult => {
  const missingFields: string[] = [];
  const missingAttachments: string[] = [];

  // Verificar se formData tem a estrutura esperada
  const data = formData as { dadosGerais?: { [key: string]: unknown } };

  // Validar campos obrigatórios dos Dados Gerais
  if (
    !data.dadosGerais?.empresa ||
    (typeof data.dadosGerais.empresa === "string" &&
      !data.dadosGerais.empresa.trim())
  ) {
    missingFields.push("Nome da Empresa");
  }
  if (
    !data.dadosGerais?.cnpj ||
    (typeof data.dadosGerais.cnpj === "string" && !data.dadosGerais.cnpj.trim())
  ) {
    missingFields.push("CNPJ");
  }
  if (
    !data.dadosGerais?.numeroContrato ||
    (typeof data.dadosGerais.numeroContrato === "string" &&
      !data.dadosGerais.numeroContrato.trim())
  ) {
    missingFields.push("Número do Contrato");
  }
  if (!data.dadosGerais?.dataInicioContrato) {
    missingFields.push("Data de Início do Contrato");
  }
  if (!data.dadosGerais?.dataTerminoContrato) {
    missingFields.push("Data de Término do Contrato");
  }
  if (
    !data.dadosGerais?.responsavelTecnico ||
    (typeof data.dadosGerais.responsavelTecnico === "string" &&
      !data.dadosGerais.responsavelTecnico.trim())
  ) {
    missingFields.push("Responsável Técnico");
  }
  if (
    !data.dadosGerais?.atividadePrincipalCNAE ||
    (typeof data.dadosGerais.atividadePrincipalCNAE === "string" &&
      !data.dadosGerais.atividadePrincipalCNAE.trim())
  ) {
    missingFields.push("Atividade Principal (CNAE)");
  }
  if (!data.dadosGerais?.grauRisco) {
    missingFields.push("Grau de Risco (NR-4)");
  }
  if (
    !data.dadosGerais?.gerenteContratoMarine ||
    (typeof data.dadosGerais.gerenteContratoMarine === "string" &&
      !data.dadosGerais.gerenteContratoMarine.trim())
  ) {
    missingFields.push("Gerente do Contrato Marine");
  }

  // Validar anexo REM obrigatório
  const remAttachments = (attachments as Record<string, unknown[]>)?.rem || [];
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

// Função para gerar mensagem de erro detalhada
export const generateValidationMessage = (
  validationResult: IValidationResult
): string => {
  const { missingFields, missingAttachments } = validationResult;
  const messages: string[] = [];

  if (missingFields.length > 0) {
    messages.push(
      `Campos obrigatórios não preenchidos: ${missingFields.join(", ")}`
    );
  }

  if (missingAttachments.length > 0) {
    messages.push(
      `Anexos obrigatórios não enviados: ${missingAttachments.join(", ")}`
    );
  }

  return messages.join(". ");
};

// Função para mapear campos faltantes para nomes de campos do formulário
export const mapMissingFieldsToFormFields = (
  missingFields: string[]
): { [fieldName: string]: string } => {
  const fieldMapping: { [key: string]: string } = {
    "Nome da Empresa": "empresa",
    CNPJ: "cnpj",
    "Número do Contrato": "numeroContrato",
    "Data de Início do Contrato": "dataInicioContrato",
    "Data de Término do Contrato": "dataTerminoContrato",
    "Responsável Técnico": "responsavelTecnico",
    "Atividade Principal (CNAE)": "atividadePrincipalCNAE",
    "Grau de Risco (NR-4)": "grauRisco",
    "Gerente do Contrato Marine": "gerenteContratoMarine",
  };

  const fieldErrors: { [fieldName: string]: string } = {};

  missingFields.forEach((missingField) => {
    const formFieldName = fieldMapping[missingField];
    if (formFieldName) {
      fieldErrors[formFieldName] = `Campo obrigatório: ${missingField}`;
    }
  });

  return fieldErrors;
};
