import { IDropdownOption } from "@fluentui/react";

// Configurações de arquivo
export const FILE_CONFIG = {
  MAX_SIZE_MB: 50,
  ALLOWED_TYPES: [
    ".pdf",
    ".xlsx",
    ".xls",
    ".docx",
    ".doc",
    ".jpg",
    ".jpeg",
    ".png",
  ],
  MIME_TYPES: {
    ".pdf": "application/pdf",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
  },
};

// Graus de risco conforme NR-4
export const GRAU_RISCO_OPTIONS: IDropdownOption[] = [
  { key: 1, text: "Grau 1 - Risco Baixo" },
  { key: 2, text: "Grau 2 - Risco Médio" },
  { key: 3, text: "Grau 3 - Risco Alto" },
  { key: 4, text: "Grau 4 - Risco Muito Alto" },
];

// Status do formulário
export const STATUS_FORMULARIO_OPTIONS: IDropdownOption[] = [
  { key: "Rascunho", text: "Rascunho" },
  { key: "Enviado", text: "Enviado" },
  { key: "Em Análise", text: "Em Análise" },
  { key: "Aprovado", text: "Aprovado" },
  { key: "Reprovado", text: "Reprovado" },
];

// Opções de resposta para questões de conformidade
export const RESPOSTA_OPTIONS: IDropdownOption[] = [
  { key: "SIM", text: "SIM" },
  { key: "NAO", text: "NÃO" },
  { key: "NA", text: "NÃO APLICÁVEL (NA)" },
];

// Categorias de anexos
export const ATTACHMENT_CATEGORIES = {
  // Dados Gerais
  REM: "rem",

  // Evidências (questões 63-73)
  SESMT: "sesmt",
  CIPA: "cipa",
  TREINAMENTO: "treinamento",
  TREINAMENTO_EPI: "treinamentoEPI",
  CA_EPI: "caEPI",
  PPRA: "ppra",
  PCMSO: "pcmso",
  ASO: "aso",
  PLANO_RESIDUOS: "planoResiduos",
  CAT: "cat",

  // Embarcações (questões 74-87)
  IOPP: "iopp",
  REGISTRO_ARMADOR: "registroArmador",
  PROPRIEDADE_MARITIMA: "propriedadeMaritima",
  ARQUEACAO: "arqueacao",
  SEGURANCA_NAVEGACAO: "segurancaNavegacao",
  CLASSIFICACAO_CASCO: "classificacaoCasco",
  CLASSIFICACAO_MAQUINAS: "classificacaoMaquinas",
  BORDA_LIVRE: "bordaLivre",
  SEGURO_OBRIGATORIO: "seguroObrigatorio",
  AUTORIZACAO_ANTAQ: "autorizacaoANTAQ",
  TRIPULACAO_SEGURANCA: "tripulacaoSeguranca",
  COMPENSACAO_AGULHA: "compensacaoAgulha",
  REVISAO_BALSA: "revisaoBalsa",
  LICENCA_RADIO: "licencaRadio",

  // Içamento (questões 88-93)
  TESTE_CARGA: "testeCarga",
  REGISTRO_CREA: "registroCREA",
  ART: "art",
  PLANO_MANUTENCAO: "planoManutencao",
  MONITORAMENTO_FUMACA: "monitoramentoFumaca",
  CERTIFICACAO_EQUIPAMENTOS: "certificacaoEquipamentos",
};

// Mapeamento de questões de NR para categorias
export const NR_QUESTIONS_MAP = {
  // NR 01 - Disposições Gerais
  1: {
    category: "NR01",
    text: "A CONTRATADA tem conhecimento, cumpre e faz cumprir as disposições legais e regulamentares sobre segurança e medicina do trabalho?",
  },
  2: {
    category: "NR01",
    text: "Elabora ordens de serviços sobre segurança e saúde, conscientizando empregados quanto aos riscos?",
  },
  3: {
    category: "NR01",
    text: "Elabora ordens de serviços sobre obrigações e condições exigíveis nas leis sobre acidentes de trabalho?",
  },
  4: {
    category: "NR01",
    text: "Elabora ordens de serviços sobre resultados de exames médicos e avaliações ambientais?",
  },
  5: {
    category: "NR01",
    text: "A CONTRATADA mantém o Livro de Inspeção exigido pela legislação do trabalho (MTE)?",
  },

  // NR 04 - SESMT
  7: {
    category: "NR04",
    text: "A CONTRATADA possui SESMT registrado no órgão regional do MTE?",
    attachment: ATTACHMENT_CATEGORIES.SESMT,
  },
  8: {
    category: "NR04",
    text: "O SESMT está dimensionado para quadro atual de empregados?",
  },

  // NR 05 - CIPA
  10: {
    category: "NR05",
    text: "A CONTRATADA possui CIPA registrada no órgão regional do MTE?",
    attachment: ATTACHMENT_CATEGORIES.CIPA,
  },
  11: {
    category: "NR05",
    text: "A CIPA está dimensionada para quadro atual de empregados?",
  },

  // NR 06 - EPI
  13: {
    category: "NR06",
    text: "A CONTRATADA fornece EPI adequado ao risco conforme NR-6?",
    attachment: ATTACHMENT_CATEGORIES.CA_EPI,
  },
  14: {
    category: "NR06",
    text: "A CONTRATADA orienta empregados quanto à obrigatoriedade do uso, guarda e manutenção do EPI?",
  },

  // NR 07 - PCMSO
  16: {
    category: "NR07",
    text: "A CONTRATADA elabora e implementa PCMSO?",
    attachment: ATTACHMENT_CATEGORIES.PCMSO,
  },
  17: {
    category: "NR07",
    text: "A CONTRATADA realiza os exames médicos previstos na NR 7?",
    attachment: ATTACHMENT_CATEGORIES.ASO,
  },
  18: {
    category: "NR07",
    text: "A CONTRATADA tem arquivo comprovando que realizou e custeou os exames previstos na NR 7?",
  },

  // NR 09 - PPRA
  20: {
    category: "NR09",
    text: "A CONTRATADA tem o PPRA atualizado?",
    attachment: ATTACHMENT_CATEGORIES.PPRA,
  },
  21: {
    category: "NR09",
    text: "O PPRA da CONTRATADA está adequado aos riscos apresentados por suas atividades?",
  },
  22: {
    category: "NR09",
    text: "Os trabalhadores foram informados sobre os riscos ambientais?",
  },

  // Continuar com todas as outras questões...
};

// Validações de campos
export const FIELD_VALIDATIONS = {
  CNPJ: {
    pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/,
    errorMessage: "CNPJ deve estar no formato 00.000.000/0000-00",
  },
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: "Email deve ter um formato válido",
  },
  TELEFONE: {
    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    errorMessage:
      "Telefone deve estar no formato (00) 0000-0000 ou (00) 00000-0000",
  },
};

// Mensagens de validação
export const VALIDATION_MESSAGES = {
  REQUIRED: "Este campo é obrigatório",
  INVALID_FORMAT: "Formato inválido",
  FILE_TOO_LARGE: "Arquivo muito grande. Tamanho máximo: 50MB",
  INVALID_FILE_TYPE: "Tipo de arquivo não permitido",
  MIN_LENGTH: "Mínimo de caracteres: ",
  MAX_LENGTH: "Máximo de caracteres: ",
  INVALID_DATE: "Data inválida",
  DATE_BEFORE_TODAY: "Data deve ser posterior a hoje",
  END_DATE_BEFORE_START: "Data de término deve ser posterior à data de início",
};

// Etapas do formulário
export const FORM_STEPS = [
  {
    id: 1,
    title: "Dados Gerais",
    description: "Informações básicas da empresa e contrato",
    icon: "ContactInfo",
    requiredFields: [
      "empresa",
      "cnpj",
      "numeroContrato",
      "dataInicioContrato",
      "dataTerminoContrato",
      "responsavelTecnico",
    ],
    requiredAttachments: [ATTACHMENT_CATEGORIES.REM],
  },
  {
    id: 2,
    title: "Conformidade Legal",
    description: "Cumprimento das Normas Regulamentadoras",
    icon: "ComplianceAudit",
    requiredFields: [], // Dinâmico baseado nas respostas
    requiredAttachments: [], // Dinâmico baseado nas respostas "SIM"
  },
  {
    id: 3,
    title: "Evidências",
    description: "Documentos comprobatórios obrigatórios",
    icon: "Documentation",
    requiredFields: [],
    requiredAttachments: [
      ATTACHMENT_CATEGORIES.SESMT,
      ATTACHMENT_CATEGORIES.CIPA,
      ATTACHMENT_CATEGORIES.TREINAMENTO,
      ATTACHMENT_CATEGORIES.TREINAMENTO_EPI,
      ATTACHMENT_CATEGORIES.CA_EPI,
      ATTACHMENT_CATEGORIES.PPRA,
      ATTACHMENT_CATEGORIES.PCMSO,
      ATTACHMENT_CATEGORIES.ASO,
      ATTACHMENT_CATEGORIES.PLANO_RESIDUOS,
    ],
  },
  {
    id: 4,
    title: "Serviços Especializados",
    description: "Embarcações e içamento de carga",
    icon: "Settings",
    requiredFields: [],
    requiredAttachments: [], // Condicional
  },
  {
    id: 5,
    title: "Revisão Final",
    description: "Validação e envio do formulário",
    icon: "ReviewSolid",
    requiredFields: [],
    requiredAttachments: [],
  },
];

// URLs do SharePoint (configuráveis)
export const SHAREPOINT_CONFIG = {
  LIST_NAME: "hsenewregister",
  LIBRARY_NAME: "HSEAttachments",
  CONTENT_TYPES: {
    FORM_DATA: "HSEFormData",
    ATTACHMENT: "HSEAttachment",
  },
};

// Configurações de auto-salvamento
export const AUTOSAVE_CONFIG = {
  INTERVAL_SECONDS: 120, // 2 minutos
  LOCAL_STORAGE_KEY: "hse_form_draft",
  MAX_DRAFTS: 5,
};

// Temas de cores
export const HSE_THEME_COLORS = {
  PRIMARY: "#0078d4", // Azul Oceaneering
  SECONDARY: "#106ebe",
  SUCCESS: "#107c10",
  WARNING: "#ff8c00",
  ERROR: "#d13438",
  INFO: "#0078d4",
  NEUTRAL: "#605e5c",
};

// Breakpoints para responsividade
export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1440,
};

// Configurações de exportação
export const EXPORT_CONFIG = {
  PDF: {
    FILENAME_PREFIX: "HSE_Formulario_",
    MARGIN: 20,
    FORMAT: "A4",
  },
  EXCEL: {
    FILENAME_PREFIX: "HSE_Dados_",
    SHEET_NAME: "Formulário HSE",
  },
};

// Evidências obrigatórias
export const REQUIRED_EVIDENCES = [
  {
    id: 61,
    name: "SESMT",
    category: "sesmt",
    isRequired: true,
    description: "Documento do SESMT",
  },
  {
    id: 62,
    name: "CIPA",
    category: "cipa",
    isRequired: true,
    description: "Documento da CIPA",
  },
  {
    id: 63,
    name: "Cronograma de Treinamento",
    category: "cronogramaTreinamento",
    isRequired: true,
    description: "Cronograma atualizado de treinamentos",
  },
  {
    id: 64,
    name: "Treinamento EPI",
    category: "treinamentoEPI",
    isRequired: true,
    description: "Comprovação de treinamento de EPI",
  },
  {
    id: 65,
    name: "CA dos EPIs",
    category: "caEPIs",
    isRequired: true,
    description: "Certificados de Aprovação dos EPIs",
  },
  {
    id: 66,
    name: "PPRA",
    category: "ppra",
    isRequired: true,
    description: "Programa de Prevenção de Riscos Ambientais",
  },
  {
    id: 67,
    name: "PCMSO",
    category: "pcmso",
    isRequired: true,
    description: "Programa de Controle Médico de Saúde Ocupacional",
  },
  {
    id: 68,
    name: "ASO",
    category: "aso",
    isRequired: true,
    description: "Atestados de Saúde Ocupacional",
  },
  {
    id: 69,
    name: "Plano de Resíduos",
    category: "planoResiduos",
    isRequired: true,
    description: "Plano de Gerenciamento de Resíduos",
  },
  {
    id: 70,
    name: "REM",
    category: "rem",
    isRequired: true,
    description: "Relatório de Exposição a Material",
  },
  {
    id: 71,
    name: "CAT Acidentes",
    category: "catAcidentes",
    isRequired: true,
    description: "Comunicação de Acidente de Trabalho",
  },
];

// Certificados marítimos obrigatórios
export const MARITIME_CERTIFICATES = [
  {
    id: 74,
    name: "IOPP",
    category: "iopp",
    isRequired: true,
    description: "Certificado Internacional de Prevenção à Poluição por Óleo",
  },
  {
    id: 75,
    name: "Registro de Armador",
    category: "registroArmador",
    isRequired: true,
    description: "Registro do Armador",
  },
  {
    id: 76,
    name: "Propriedade Marítima",
    category: "propriedadeMaritima",
    isRequired: true,
    description: "Propriedade Marítima",
  },
  {
    id: 77,
    name: "Arqueação",
    category: "arqueacao",
    isRequired: true,
    description: "Certificado de Arqueação",
  },
  {
    id: 78,
    name: "Segurança de Navegação",
    category: "segurancaNavegacao",
    isRequired: true,
    description: "Certificado de Segurança de Navegação",
  },
  {
    id: 79,
    name: "Classificação do Casco",
    category: "classificacaoCasco",
    isRequired: true,
    description: "Certificado de Classificação do Casco",
  },
  {
    id: 80,
    name: "Classificação de Máquinas",
    category: "classificacaoMaquinas",
    isRequired: true,
    description: "Certificado de Classificação de Máquinas",
  },
  {
    id: 81,
    name: "Borda Livre",
    category: "bordaLivre",
    isRequired: true,
    description: "Certificado de Borda Livre",
  },
  {
    id: 82,
    name: "Seguro DEPEM",
    category: "seguroDepem",
    isRequired: true,
    description: "Seguro Obrigatório DEPEM",
  },
  {
    id: 83,
    name: "Autorização ANTAQ",
    category: "autorizacaoAntaq",
    isRequired: true,
    description: "Autorização da ANTAQ",
  },
  {
    id: 84,
    name: "Tripulação de Segurança",
    category: "tripulacaoSeguranca",
    isRequired: true,
    description: "Certificado de Tripulação de Segurança",
  },
  {
    id: 85,
    name: "Agulha Magnética",
    category: "agulhaMagnetica",
    isRequired: true,
    description: "Certificado de Agulha Magnética",
  },
  {
    id: 86,
    name: "Balsa Inflável",
    category: "balsaInflavel",
    isRequired: true,
    description: "Certificado de Balsa Inflável",
  },
  {
    id: 87,
    name: "Licença de Rádio",
    category: "licencaRadio",
    isRequired: true,
    description: "Licença de Rádio",
  },
];

// Documentos obrigatórios de içamento
export const LIFTING_DOCUMENTS = [
  {
    id: 88,
    name: "Teste de Carga",
    category: "testeCarga",
    isRequired: true,
    description: "Teste de Carga dos Equipamentos",
  },
  {
    id: 89,
    name: "CREA do Engenheiro",
    category: "creaEngenheiro",
    isRequired: true,
    description: "Registro CREA do Engenheiro",
  },
  {
    id: 90,
    name: "ART",
    category: "art",
    isRequired: true,
    description: "Anotação de Responsabilidade Técnica",
  },
  {
    id: 91,
    name: "Plano de Manutenção",
    category: "planoManutencao",
    isRequired: true,
    description: "Plano de Manutenção dos Equipamentos",
  },
  {
    id: 92,
    name: "Fumaça Preta",
    category: "fumacaPreta",
    isRequired: true,
    description: "Controle de Emissão de Fumaça Preta",
  },
  {
    id: 93,
    name: "Certificação de Equipamentos",
    category: "certificacaoEquipamentos",
    isRequired: true,
    description: "Certificação dos Equipamentos de Içamento",
  },
];
