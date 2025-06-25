import { NR_QUESTIONS_MAP } from "./formConstants";

// Interface para resultado da validação do formulário
export interface IValidationResult {
  isValid: boolean;
  missingFields: string[];
  missingAttachments: string[];
  incompleteConformidadeSections: string[];
}

// Função para validar formulário completo antes de salvar
export const validateFormForSave = (
  formData: unknown,
  attachments: unknown
): IValidationResult => {
  const missingFields: string[] = [];
  const missingAttachments: string[] = [];
  const incompleteConformidadeSections: string[] = [];
  // Verificar se formData tem a estrutura esperada
  const data = formData as {
    dadosGerais?: { [key: string]: unknown };
    conformidadeLegal?: { [key: string]: unknown };
    servicosEspeciais?: { [key: string]: unknown };
  };

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

  // NOVA VALIDAÇÃO: Conformidade Legal
  if (data.conformidadeLegal) {
    const conformidade = data.conformidadeLegal; // Estrutura de questões por bloco (incluindo índices para buscar attachment info)
    const blockQuestions: Record<
      string,
      Array<{ key: string; idx: number; title: string }>
    > = {
      nr01: [
        { key: "questao1", idx: 1, title: "NR 01 - Disposições Gerais" },
        { key: "questao2", idx: 2, title: "NR 01 - Disposições Gerais" },
        { key: "questao3", idx: 3, title: "NR 01 - Disposições Gerais" },
        { key: "questao4", idx: 4, title: "NR 01 - Disposições Gerais" },
        { key: "questao5", idx: 5, title: "NR 01 - Disposições Gerais" },
      ],
      nr04: [
        { key: "questao1", idx: 6, title: "NR 04 - SESMT" },
        { key: "questao2", idx: 7, title: "NR 04 - SESMT" },
      ],
      nr05: [
        { key: "questao1", idx: 8, title: "NR 05 - CIPA" },
        { key: "questao2", idx: 9, title: "NR 05 - CIPA" },
      ],
      nr06: [
        { key: "questao1", idx: 10, title: "NR 06 - EPI" },
        { key: "questao2", idx: 11, title: "NR 06 - EPI" },
      ],
      nr07: [
        { key: "questao1", idx: 12, title: "NR 07 - PCMSO" },
        { key: "questao2", idx: 13, title: "NR 07 - PCMSO" },
        { key: "questao3", idx: 14, title: "NR 07 - PCMSO" },
      ],
      nr09: [
        { key: "questao1", idx: 15, title: "NR 09 - PPRA" },
        { key: "questao2", idx: 16, title: "NR 09 - PPRA" },
        { key: "questao3", idx: 17, title: "NR 09 - PPRA" },
      ],
      nr10: [
        {
          key: "questao1",
          idx: 18,
          title: "NR 10 - Segurança em Instalações Elétricas",
        },
        {
          key: "questao2",
          idx: 19,
          title: "NR 10 - Segurança em Instalações Elétricas",
        },
        {
          key: "questao3",
          idx: 20,
          title: "NR 10 - Segurança em Instalações Elétricas",
        },
      ],
      nr11: [
        {
          key: "questao1",
          idx: 21,
          title: "NR 11 - Transporte e Movimentação de Materiais",
        },
        {
          key: "questao2",
          idx: 22,
          title: "NR 11 - Transporte e Movimentação de Materiais",
        },
      ],
      nr12: [
        { key: "questao1", idx: 23, title: "NR 12 - Máquinas e Equipamentos" },
        { key: "questao2", idx: 24, title: "NR 12 - Máquinas e Equipamentos" },
      ],
      nr13: [
        {
          key: "questao1",
          idx: 25,
          title: "NR 13 - Caldeiras e Vasos de Pressão",
        },
      ],
      nr15: [
        { key: "questao1", idx: 26, title: "NR 15 - Atividades Insalubres" },
      ],
      nr23: [
        {
          key: "questao1",
          idx: 27,
          title: "NR 23 - Proteção Contra Incêndios",
        },
        {
          key: "questao2",
          idx: 28,
          title: "NR 23 - Proteção Contra Incêndios",
        },
        {
          key: "questao3",
          idx: 29,
          title: "NR 23 - Proteção Contra Incêndios",
        },
      ],
      licencasAmbientais: [
        { key: "questao1", idx: 30, title: "Licenças Ambientais" },
      ],
      legislacaoMaritima: [
        { key: "questao1", idx: 31, title: "Legislação Marítima" },
        { key: "questao2", idx: 32, title: "Legislação Marítima" },
        { key: "questao3", idx: 33, title: "Legislação Marítima" },
        { key: "questao4", idx: 34, title: "Legislação Marítima" },
        { key: "questao5", idx: 35, title: "Legislação Marítima" },
        { key: "questao6", idx: 36, title: "Legislação Marítima" },
      ],
      treinamentos: [
        { key: "questao1", idx: 37, title: "Treinamentos Obrigatórios" },
        { key: "questao2", idx: 38, title: "Treinamentos Obrigatórios" },
        { key: "questao3", idx: 39, title: "Treinamentos Obrigatórios" },
      ],
      gestaoSMS: [
        { key: "questao1", idx: 40, title: "Gestão de SMS" },
        { key: "questao2", idx: 41, title: "Gestão de SMS" },
        { key: "questao3", idx: 42, title: "Gestão de SMS" },
        { key: "questao4", idx: 43, title: "Gestão de SMS" },
        { key: "questao5", idx: 44, title: "Gestão de SMS" },
      ],
    };

    // Verificar cada bloco aplicável
    Object.keys(conformidade).forEach((blockKey) => {
      const bloco = conformidade[blockKey as keyof typeof conformidade];
      if (!bloco || typeof bloco !== "object") return;

      const blockObj = bloco as unknown as {
        aplicavel?: boolean;
        [key: string]: unknown;
      };

      // Se o bloco está marcado como aplicável, deve estar completo
      if (blockObj.aplicavel === true) {
        const questions = blockQuestions[blockKey] || [];
        const isBlockComplete = questions.every((q) => {
          const questionObj = blockObj[q.key] as
            | { resposta?: string }
            | undefined;

          // Verificar se a pergunta tem resposta
          if (
            !questionObj ||
            !questionObj.resposta ||
            questionObj.resposta === ""
          ) {
            return false;
          }

          // Se a resposta é "SIM", verificar se há anexo obrigatório
          if (questionObj.resposta === "SIM") {
            const questionMeta = (
              NR_QUESTIONS_MAP as Record<
                string,
                { text: string; attachment?: string }
              >
            )[String(q.idx)];

            // Se a pergunta requer anexo e a resposta é SIM
            if (questionMeta && questionMeta.attachment) {
              const categoryFiles =
                (attachments as Record<string, unknown[]>)[
                  questionMeta.attachment
                ] || [];
              return categoryFiles.length > 0;
            }
          }

          return true;
        });

        // Se o bloco não está completo, adicionar à lista de incompletos
        if (!isBlockComplete && questions.length > 0) {
          incompleteConformidadeSections.push(questions[0].title);
        }
      }
    });
  }

  // VALIDAÇÃO: Serviços Especializados
  if (data.servicosEspeciais) {
    const servicosEspeciais = data.servicosEspeciais as {
      fornecedorEmbarcacoes?: boolean;
      fornecedorIcamento?: boolean;
    };

    // Se marcou Fornecedor de Embarcações, validar todos os certificados obrigatórios
    if (servicosEspeciais.fornecedorEmbarcacoes === true) {
      const embarcacoesRequiredAttachments = [
        {
          category: "iopp",
          name: "IOPP - Certificado de Prevenção de Poluição por Óleo",
        },
        { category: "registroArmador", name: "Registro de Armador" },
        {
          category: "propriedadeMaritima",
          name: "Título de Propriedade Marítima",
        },
        { category: "arqueacao", name: "Certificado de Arqueação" },
        {
          category: "segurancaNavegacao",
          name: "Certificado de Segurança da Navegação",
        },
        {
          category: "classificacaoCasco",
          name: "Certificado de Classificação do Casco",
        },
        {
          category: "classificacaoMaquinas",
          name: "Certificado de Classificação das Máquinas",
        },
        { category: "bordaLivre", name: "Certificado de Borda Livre" },
        { category: "seguroDepem", name: "Seguro DEPEM" },
        { category: "autorizacaoAntaq", name: "Autorização ANTAQ" },
        {
          category: "tripulacaoSeguranca",
          name: "Certificado de Tripulação de Segurança",
        },
        {
          category: "agulhaMagnetica",
          name: "Certificado de Agulha Magnética",
        },
        { category: "balsaInflavel", name: "Certificado de Balsa Inflável" },
        { category: "licencaRadio", name: "Licença de Rádio" },
      ];

      embarcacoesRequiredAttachments.forEach((req) => {
        const categoryFiles =
          (attachments as Record<string, unknown[]>)[req.category] || [];
        if (categoryFiles.length === 0) {
          missingAttachments.push(req.name);
        }
      });
    }

    // Se marcou Fornecedor de Içamento, validar todos os documentos obrigatórios
    if (servicosEspeciais.fornecedorIcamento === true) {
      const icamentoRequiredAttachments = [
        { category: "testeCarga", name: "Teste de Carga" },
        { category: "registroCREA", name: "CREA do Engenheiro Responsável" },
        { category: "art", name: "ART - Anotação de Responsabilidade Técnica" },
        { category: "planoManutencao", name: "Plano de Manutenção" },
        {
          category: "monitoramentoFumaca",
          name: "Certificado de Fumaça Preta",
        },
        {
          category: "certificacaoEquipamentos",
          name: "Certificação de Equipamentos",
        },
      ];

      icamentoRequiredAttachments.forEach((req) => {
        const categoryFiles =
          (attachments as Record<string, unknown[]>)[req.category] || [];
        if (categoryFiles.length === 0) {
          missingAttachments.push(req.name);
        }
      });
    }
  }

  const isValid =
    missingFields.length === 0 &&
    missingAttachments.length === 0 &&
    incompleteConformidadeSections.length === 0;

  return {
    isValid,
    missingFields,
    missingAttachments,
    incompleteConformidadeSections,
  };
};

// Função para gerar mensagem de erro detalhada
export const generateValidationMessage = (
  validationResult: IValidationResult
): string => {
  const { missingFields, missingAttachments, incompleteConformidadeSections } =
    validationResult;
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

  if (incompleteConformidadeSections.length > 0) {
    messages.push(
      `Seções de Conformidade Legal incompletas: ${incompleteConformidadeSections.join(
        ", "
      )}`
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
