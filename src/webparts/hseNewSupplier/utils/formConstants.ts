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
