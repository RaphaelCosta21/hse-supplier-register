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
  SEGURO_OBRIGATORIO: "seguroDepem",
  AUTORIZACAO_ANTAQ: "autorizacaoAntaq",
  TRIPULACAO_SEGURANCA: "tripulacaoSeguranca",
  COMPENSACAO_AGULHA: "agulhaMagnetica",
  REVISAO_BALSA: "balsaInflavel",
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
    text: "A CONTRATADA tem conhecimento, cumpre e faz cumprir as disposições legais e regulamentares sobre segurança e medicina do trabalho determinadas na legislação federal, estadual e/ou municipal?",
  },
  2: {
    category: "NR01",
    text: "Elabora ordens de serviços sobre segurança e saúde, conscientizando seus empregados quanto aos riscos existentes e os seus mecanismos de prevenção e controle?",
  },
  3: {
    category: "NR01",
    text: "Elabora ordens de serviços sobre segurança e saúde, conscientizando seus empregados quanto às obrigações e condições exigíveis nas leis e regulamentos dos acidentes de trabalho (empregado tem 24h para comunicar um acidente) e aos procedimentos a serem adotados em caso de acidente e doença do trabalho?",
  },
  4: {
    category: "NR01",
    text: "Elabora ordens de serviços sobre segurança e saúde, conscientizando seus empregados quanto aos resultados dos exames médicos e avaliações ambientais nos locais de trabalho?",
  },
  5: {
    category: "NR01",
    text: "A CONTRATADA mantém o Livro de Inspeção exigido pela legislação do trabalho (MTE) no local de trabalho?",
  },

  // NR 04 - SESMT
  6: {
    category: "NR04",
    text: "A CONTRATADA possui SESMT registrado no órgão regional do MTE?",
    attachment: ATTACHMENT_CATEGORIES.SESMT,
  },
  7: {
    category: "NR04",
    text: "O SESMT está dimensionado para quadro atual de empregados?",
  },

  // NR 05 - CIPA
  8: {
    category: "NR05",
    text: "A CONTRATADA possui CIPA registrada no órgão regional do MTE?",
    attachment: ATTACHMENT_CATEGORIES.CIPA,
  },
  9: {
    category: "NR05",
    text: "A CIPA está dimensionada para quadro atual de empregados?",
  },

  // NR 06 - EPI
  10: {
    category: "NR06",
    text: "A CONTRATADA fornece EPI adequado ao risco, em perfeito estado de conservação e funcionamento, com preenchimento de cautela e gratuitamente a seus empregados conforme disposições contidas na NR-6?",
    attachment: ATTACHMENT_CATEGORIES.CA_EPI,
  },
  11: {
    category: "NR06",
    text: "A CONTRATADA orienta os empregados quanto à obrigatoriedade do uso, guarda, manutenção e substituição do EPI?",
  },

  // NR 07 - PCMSO
  12: {
    category: "NR07",
    text: "A CONTRATADA elabora e implementa PCMSO?",
    attachment: ATTACHMENT_CATEGORIES.PCMSO,
  },
  13: {
    category: "NR07",
    text: "A CONTRATADA realiza os exames médicos previstos na NR 7? Controle de ASO.",
    attachment: ATTACHMENT_CATEGORIES.ASO,
  },
  14: {
    category: "NR07",
    text: "A CONTRATADA tem arquivo comprovando que realizou e custeou os exames previstos na NR 7?",
  },

  // NR 09 - PPRA
  15: {
    category: "NR09",
    text: "A CONTRATADA tem o PPRA atualizado?",
    attachment: ATTACHMENT_CATEGORIES.PPRA,
  },
  16: {
    category: "NR09",
    text: "O PPRA da CONTRATADA está adequado aos riscos apresentados por suas atividades?",
  },
  17: {
    category: "NR09",
    text: "Os trabalhadores foram informados sobre os riscos ambientais?",
  },

  // NR 10 - Instalações e Serviços em Eletricidade
  18: {
    category: "NR10",
    text: "As instalações elétricas estão de acordo com a norma regulamentadora?",
  },
  19: {
    category: "NR10",
    text: "As instalações elétricas foram projetadas de acordo com as normas técnicas brasileiras e/ou internacionais vigentes?",
  },
  20: {
    category: "NR10",
    text: "Os profissionais são habilitados para trabalhos com eletricidade?",
  },

  // NR 11 - Transporte, Movimentação, Armazenagem e Manuseio de Materiais
  21: {
    category: "NR11",
    text: "Os equipamentos utilizados na movimentação de materiais e /ou pessoal estão dentro das condições especiais de segurança?",
  },
  22: {
    category: "NR11",
    text: "Os operadores de transporte possuem habilitação, sendo submetidos a treinamento específico?",
  },

  // NR 12 - Máquinas e Equipamentos
  23: {
    category: "NR12",
    text: "A CONTRATADA possui um plano de Inspeção/Manutenção para as máquinas e equipamentos?",
  },
  24: {
    category: "NR12",
    text: "Os dispositivos de acionamento, partida e parada estão em conformidade com a NR?",
  },

  // NR 13 - Caldeiras e Vasos de Pressão
  25: {
    category: "NR13",
    text: "A CONTRATADA possui uma sistemática de calibração e manutenção dos Equipamentos Críticos e instrumentos contemplados nesta NR?",
  },

  // NR 15 - Atividades e Operações Insalubres
  26: {
    category: "NR15",
    text: "A CONTRATADA atende aos requisitos estabelecidos na NR 15 e em seus anexos, no que se refere às atividades e operações insalubres?",
  },

  // NR 23 - Proteção Contra Incêndios
  27: {
    category: "NR23",
    text: "Os equipamentos de Combate a Incêndios encontram-se devidamente identificados e com a manutenção em dia?",
  },
  28: {
    category: "NR23",
    text: "Os equipamentos de Combate a Incêndios encontram-se distribuídos e em quantidade de acordo com o que é estabelecido na NR?",
  },
  29: {
    category: "NR23",
    text: "O Extintor de incêncio possui a certificação do INMETRO?",
  },

  // Licenças Ambientais
  30: {
    category: "LICENCAS_AMBIENTAIS",
    text: "A CONTRATADA possui licença de operação emitida pelo órgão ambiental competente?",
  },

  // Legislação Marítima
  31: {
    category: "LEGISLACAO_MARITIMA",
    text: "A CONTRATADA está em conformidade com os regulamentos do MODU CODE?",
  },
  32: {
    category: "LEGISLACAO_MARITIMA",
    text: "A CONTRATADA está em conformidade com os regulamentos da NORMAN?",
  },
  33: {
    category: "LEGISLACAO_MARITIMA",
    text: "A CONTRATADAestá em conformidade com os regulamentos da MARPOL?",
  },
  34: {
    category: "LEGISLACAO_MARITIMA",
    text: "A CONTRATADA está em conformidade com os regulamentos da STCW?",
  },
  35: {
    category: "LEGISLACAO_MARITIMA",
    text: "A CONTRATADA está em conformidade com os regulamentos do ISM CODE?",
  },
  36: {
    category: "LEGISLACAO_MARITIMA",
    text: "A CONTRATADA está em conformidade com os regulamentos do SOLAS?",
  },

  // Treinamentos Obrigatórios
  37: {
    category: "TREINAMENTOS_OBRIGATORIOS",
    text: "A CONTRATADA tem Programa Educativo contemplando a temática de Prevenção de Acidentes, Meio Ambiente e Doenças do Trabalho?",
  },
  38: {
    category: "TREINAMENTOS_OBRIGATORIOS",
    text: "Todos os empregados recebem treinamento admissional e periódico, visando executar suas funções com segurança?",
  },
  39: {
    category: "TREINAMENTOS_OBRIGATORIOS",
    text: "Nos treinamentos os empregados recebem cópias ou têm os procedimentos em local acessível, para que as operações sejam realizadas com segurança e ambientalmente corretas?",
  },

  // Gestão de SMS (Saúde, Meio Ambiente e Segurança)
  40: {
    category: "GESTAO_SMS",
    text: "A CONTRATADA tem procedimento para análise e registro de acidentes?",
  },
  41: {
    category: "GESTAO_SMS",
    text: "A CONTRATADA realiza inspeções de SMS programadas ?",
  },
  42: {
    category: "GESTAO_SMS",
    text: "A CONTRATADA tem procedimento para minimização e disposição de resíduos?",
  },
  43: {
    category: "GESTAO_SMS",
    text: "A CONTRATADA divulga as Metas e Programa de Segurança, Meio Ambiente e Saúde?",
  },
  44: {
    category: "GESTAO_SMS",
    text: "A CONTRATADA tem um Programa das Atividades de Segurança Meio Ambiente e Saúde para o ano em curso?",
  },
};

// Validações de campos
export const FIELD_VALIDATIONS = {
  CNPJ: {
    pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
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
      "dadosGerais.empresa",
      "dadosGerais.cnpj",
      "dadosGerais.numeroContrato",
      "dadosGerais.dataInicioContrato",
      "dadosGerais.dataTerminoContrato",
      "dadosGerais.responsavelTecnico",
      "dadosGerais.atividadePrincipalCNAE",
      "dadosGerais.grauRisco",
      "dadosGerais.gerenteContratoMarine",
    ],
    requiredAttachments: [], // REM é opcional para testes
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
    title: "Serviços Especializados",
    description: "Embarcações e içamento de carga",
    icon: "Repair",
    requiredFields: [],
    requiredAttachments: [], // Condicional
  },
  {
    id: 4,
    title: "Revisão Final",
    description: "Validação e envio do formulário",
    icon: "ReviewSolid",
    requiredFields: [],
    requiredAttachments: [],
  },
];

// URLs do SharePoint (configuráveis)
export const SHAREPOINT_CONFIG = {
  LIST_NAME: "hse-new-register",
  LIBRARY_NAME: "anexos-contratadas",
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
    category: "registroCREA",
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
    category: "monitoramentoFumaca",
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
