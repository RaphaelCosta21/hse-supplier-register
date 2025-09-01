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
    ".txt",
    ".zip",
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
    ".txt": "text/plain",
    ".zip": "application/zip",
  },
};

// Graus de risco conforme NR-4
export const GRAU_RISCO_OPTIONS: IDropdownOption[] = [
  { key: 1, text: "Grau 1" },
  { key: 2, text: "Grau 2" },
  { key: 3, text: "Grau 3" },
  { key: 4, text: "Grau 4" },
];

// Status do formulário
export const STATUS_FORMULARIO_OPTIONS: IDropdownOption[] = [
  { key: "Em Andamento", text: "Em Andamento" },
  { key: "Enviado", text: "Enviado" },
  { key: "Em Análise", text: "Em Análise" },
  { key: "Aprovado", text: "Aprovado" },
  { key: "Rejeitado", text: "Rejeitado" },
  { key: "Pendente Info.", text: "Pendente Info." },
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
  PCMSO: "pcmso",
  ASO: "aso",
  PLANO_RESIDUOS: "planoResiduos",
  CAT: "cat",

  // NR10 - Novos anexos para questões 13 e 14
  NR10_PROJETO_INSTALACOES: "nr10ProjetoInstalacoes",
  NR10_CERTIFICACAO_PROFISSIONAIS: "nr10CertificacaoProfissionais",

  // NR11 - Novo anexo para questão 16
  NR11_CERTIFICADO_TREINAMENTO: "nr11CertificadoTreinamento",

  // NR12 - Novos anexos para questões 17 e 18
  NR12_PLANO_INSPECAO: "nr12PlanoInspecao",
  NR12_EVIDENCIA_DISPOSITIVO: "nr12EvidenciaDispositivo",

  // NR13 - Novo anexo para questão 19
  NR13_EVIDENCIA_SISTEMATICA: "nr13EvidenciaSistematica",

  // NR15 - Novo anexo para questão 20
  NR15_LAUDO_INSALUBRIDADE: "nr15LaudoInsalubridade",

  // NR16 - Novo anexo para questão 21
  NR16_LAUDO_PERICULOSIDADE: "nr16LaudoPericulosidade",

  // NR23 - Novo anexo para questão 22
  NR23_LAUDO_MANUTENCAO: "nr23LaudoManutencao",

  // Licenças Ambientais - Novo anexo para questão 24
  LICENCA_OPERACAO: "licencaOperacao",

  // Treinamentos Obrigatórios - Novos anexos para questões 31 e 32
  CERTIFICADO_PROGRAMA_TREINAMENTO: "certificadoProgramaTreinamento",
  EVIDENCIA_TREINAMENTO: "evidenciaTreinamento",

  // Gestão de SMS - Novos anexos para questões 34, 35, 36, 37 e 38
  SMS_PROCEDIMENTO_ACIDENTES: "smsProcedimentoAcidentes",
  SMS_CALENDARIO_INSPECOES: "smsCalendarioInspecoes",
  SMS_PROCEDIMENTO_RESIDUOS: "smsProcedimentoResiduos",
  SMS_METAS_OBJETIVOS: "smsMetasObjetivos",
  SMS_PROGRAMA_ANUAL: "smsProgramaAnual",

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

  // NR 04 - SESMT
  3: {
    category: "NR04",
    text: "A CONTRATADA possui SESMT registrado no órgão regional do MTE?",
    attachment: ATTACHMENT_CATEGORIES.SESMT,
  },
  4: {
    category: "NR04",
    text: "O SESMT está dimensionado para quadro atual de empregados?",
  },

  // NR 05 - CIPA
  5: {
    category: "NR05",
    text: "A CONTRATADA possui CIPA registrada no órgão regional do MTE?",
    attachment: ATTACHMENT_CATEGORIES.CIPA,
  },
  6: {
    category: "NR05",
    text: "A CIPA está dimensionada para quadro atual de empregados?",
  },

  // NR 06 - EPI
  7: {
    category: "NR06",
    text: "A CONTRATADA fornece EPI adequado ao risco, em perfeito estado de conservação e funcionamento, com preenchimento de cautela e gratuitamente a seus empregados conforme disposições contidas na NR-6?",
    attachment: ATTACHMENT_CATEGORIES.CA_EPI,
  },
  8: {
    category: "NR06",
    text: "A CONTRATADA orienta os empregados quanto à obrigatoriedade do uso, guarda, manutenção e substituição do EPI?",
  },

  // NR 07 - PCMSO
  9: {
    category: "NR07",
    text: "A CONTRATADA elabora e implementa PCMSO?",
    attachment: ATTACHMENT_CATEGORIES.PCMSO,
  },
  10: {
    category: "NR07",
    text: "A CONTRATADA realiza os exames médicos previstos na NR 7? Controle de ASO.",
    attachment: ATTACHMENT_CATEGORIES.ASO,
  },
  11: {
    category: "NR07",
    text: "A CONTRATADA tem arquivo comprovando que realizou e custeou os exames previstos na NR 7?",
  },

  // NR 10 - Instalações e Serviços em Eletricidade
  12: {
    category: "NR10",
    text: "As instalações elétricas estão de acordo com a norma regulamentadora?",
  },
  13: {
    category: "NR10",
    text: "As instalações elétricas foram projetadas de acordo com as normas técnicas brasileiras e/ou internacionais vigentes?",
    attachment: ATTACHMENT_CATEGORIES.NR10_PROJETO_INSTALACOES,
  },
  14: {
    category: "NR10",
    text: "Os profissionais são habilitados para trabalhos com eletricidade?",
    attachment: ATTACHMENT_CATEGORIES.NR10_CERTIFICACAO_PROFISSIONAIS,
  },

  // NR 11 - Transporte, Movimentação, Armazenagem e Manuseio de Materiais
  15: {
    category: "NR11",
    text: "Os equipamentos utilizados na movimentação de materiais estão dentro das condições especiais de segurança?",
  },
  16: {
    category: "NR11",
    text: "Os operadores de transporte possuem habilitação, sendo submetidos a treinamento específico?",
    attachment: ATTACHMENT_CATEGORIES.NR11_CERTIFICADO_TREINAMENTO,
  },

  // NR 12 - Máquinas e Equipamentos
  17: {
    category: "NR12",
    text: "A CONTRATADA possui um plano de Inspeção/Manutenção para as máquinas e equipamentos?",
    attachment: ATTACHMENT_CATEGORIES.NR12_PLANO_INSPECAO,
  },
  18: {
    category: "NR12",
    text: "Os dispositivos de acionamento, partida e parada estão em conformidade com a NR?",
    attachment: ATTACHMENT_CATEGORIES.NR12_EVIDENCIA_DISPOSITIVO,
  },

  // NR 13 - Caldeiras e Vasos de Pressão
  19: {
    category: "NR13",
    text: "A CONTRATADA possui uma sistemática de calibração e manutenção dos Equipamentos Críticos e instrumentos contemplados nesta NR?",
    attachment: ATTACHMENT_CATEGORIES.NR13_EVIDENCIA_SISTEMATICA,
  },

  // NR 15 - Atividades e Operações Insalubres
  20: {
    category: "NR15",
    text: "A CONTRATADA atende aos requisitos estabelecidos na NR 15 e em seus anexos, no que se refere às atividades e operações insalubres?",
    attachment: ATTACHMENT_CATEGORIES.NR15_LAUDO_INSALUBRIDADE,
  },

  // NR 16 - Atividades e Operações Periculosas
  21: {
    category: "NR16",
    text: "A CONTRATADA atende aos requisitos estabelecidos na NR 16 e em seus anexos, no que se refere às atividades e operações periculosas?",
    attachment: ATTACHMENT_CATEGORIES.NR16_LAUDO_PERICULOSIDADE,
  },

  // NR 23 - Proteção Contra Incêndios
  22: {
    category: "NR23",
    text: "Os equipamentos de Combate a Incêndios encontram-se devidamente identificados e com a manutenção em dia?",
    attachment: ATTACHMENT_CATEGORIES.NR23_LAUDO_MANUTENCAO,
  },
  23: {
    category: "NR23",
    text: "Os equipamentos de Combate a Incêndios encontram-se distribuídos e em quantidade de acordo com o que é estabelecido na NR? Favor inserir quantitativo no campo de comentários deste bloco",
  },
  24: {
    category: "NR23",
    text: "O Extintor de incêndio possui a certificação do INMETRO?",
  },

  // Licenças Ambientais
  25: {
    category: "LICENCAS_AMBIENTAIS",
    text: "A CONTRATADA possui licença de operação emitida pelo órgão ambiental competente?",
    attachment: ATTACHMENT_CATEGORIES.LICENCA_OPERACAO,
  },

  // Legislação Marítima
  26: {
    category: "LEGISLACAO_MARITIMA",
    text: "A CONTRATADA está em conformidade com os regulamentos do MODU CODE?",
  },
  27: {
    category: "LEGISLACAO_MARITIMA",
    text: "A CONTRATADA está em conformidade com os regulamentos da NORMAN?",
  },
  28: {
    category: "LEGISLACAO_MARITIMA",
    text: "A CONTRATADAestá em conformidade com os regulamentos da MARPOL?",
  },
  29: {
    category: "LEGISLACAO_MARITIMA",
    text: "A CONTRATADA está em conformidade com os regulamentos da STCW?",
  },
  30: {
    category: "LEGISLACAO_MARITIMA",
    text: "A CONTRATADA está em conformidade com os regulamentos do ISM CODE?",
  },
  31: {
    category: "LEGISLACAO_MARITIMA",
    text: "A CONTRATADA está em conformidade com os regulamentos do SOLAS?",
  },

  // Treinamentos Obrigatórios
  32: {
    category: "TREINAMENTOS_OBRIGATORIOS",
    text: "A CONTRATADA tem Programa Educativo contemplando a temática de Prevenção de Acidentes, Meio Ambiente e Doenças do Trabalho?",
    attachment: ATTACHMENT_CATEGORIES.CERTIFICADO_PROGRAMA_TREINAMENTO,
  },
  33: {
    category: "TREINAMENTOS_OBRIGATORIOS",
    text: "Todos os empregados recebem treinamento admissional e periódico, visando executar suas funções com segurança?",
    attachment: ATTACHMENT_CATEGORIES.EVIDENCIA_TREINAMENTO,
  },
  34: {
    category: "TREINAMENTOS_OBRIGATORIOS",
    text: "Nos treinamentos os empregados recebem cópias ou têm os procedimentos em local acessível, para que as operações sejam realizadas com segurança e ambientalmente corretas?",
  },

  // Gestão de SMS (Saúde, Meio Ambiente e Segurança)
  35: {
    category: "GESTAO_SMS",
    text: "A CONTRATADA tem procedimento para análise e registro de acidentes?",
    attachment: ATTACHMENT_CATEGORIES.SMS_PROCEDIMENTO_ACIDENTES,
  },
  36: {
    category: "GESTAO_SMS",
    text: "A CONTRATADA realiza inspeções de SMS programadas ?",
    attachment: ATTACHMENT_CATEGORIES.SMS_CALENDARIO_INSPECOES,
  },
  37: {
    category: "GESTAO_SMS",
    text: "A CONTRATADA tem procedimento para minimização e disposição de resíduos?",
    attachment: ATTACHMENT_CATEGORIES.SMS_PROCEDIMENTO_RESIDUOS,
  },
  38: {
    category: "GESTAO_SMS",
    text: "A CONTRATADA divulga as Metas e Programa de Segurança, Meio Ambiente e Saúde?",
    attachment: ATTACHMENT_CATEGORIES.SMS_METAS_OBJETIVOS,
  },
  39: {
    category: "GESTAO_SMS",
    text: "A CONTRATADA tem um Programa das Atividades de Segurança Meio Ambiente e Saúde para o ano em curso?",
    attachment: ATTACHMENT_CATEGORIES.SMS_PROGRAMA_ANUAL,
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
      "dadosGerais.responsavelTecnico",
      "dadosGerais.atividadePrincipalCNAE",
      "dadosGerais.grauRisco",
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

// Mapeamento de labels amigáveis para categorias de anexos
export const ATTACHMENT_CATEGORY_LABELS: { [key: string]: string } = {
  // Dados Gerais
  rem: "Resumo Estatístico Mensal",

  // Evidências
  sesmt: "SESMT",
  cipa: "CIPA",
  treinamento: "Treinamentos",
  treinamentoEPI: "Treinamento EPI",
  caEPI: "CA EPI",
  pcmso: "PCMSO",
  aso: "ASO",
  planoResiduos: "Plano de Resíduos",
  cat: "CAT",

  // NR10 - Labels amigáveis para os novos anexos
  nr10ProjetoInstalacoes: "Projeto das Instalações Elétricas",
  nr10CertificacaoProfissionais:
    "Evidência da Qualificação do Profissional para Trabalhos com Eletricidade",

  // NR11 - Label amigável para o novo anexo
  nr11CertificadoTreinamento: "Certificado de Treinamento",

  // NR12 - Labels amigáveis para os novos anexos
  nr12PlanoInspecao: "Plano de Inspeção",
  nr12EvidenciaDispositivo: "Evidência do Dispositivo",

  // NR13 - Label amigável para o novo anexo
  nr13EvidenciaSistematica:
    "Evidência da Sistemática e da Manutenção Realizada",

  // NR15 - Label amigável para o novo anexo
  nr15LaudoInsalubridade: "Laudo de Insalubridade",

  // NR16 - Label amigável para o novo anexo
  nr16LaudoPericulosidade: "Laudo de Periculosidade",

  // NR23 - Label amigável para o novo anexo
  nr23LaudoManutencao: "Laudo da Manutenção",

  // Licenças Ambientais - Label amigável para o novo anexo
  licencaOperacao: "Licença de Operação - LO",

  // Treinamentos Obrigatórios - Labels amigáveis para os novos anexos
  certificadoProgramaTreinamento: "Certificado ou Programa de Treinamento",
  evidenciaTreinamento: "Evidência de Treinamento",

  // Gestão de SMS - Labels amigáveis para os novos anexos
  smsProcedimentoAcidentes: "Procedimento de Análise e Registro de Acidentes",
  smsCalendarioInspecoes: "Calendário de Inspeções de SMS",
  smsProcedimentoResiduos: "Procedimento de Gerenciamento de Resíduos",
  smsMetasObjetivos: "Metas e Objetivos de SMS",
  smsProgramaAnual: "Programa de SMS para o Ano em Curso",

  // Embarcações
  iopp: "IOPP",
  registroArmador: "Registro de Armador",
  propriedadeMaritima: "Propriedade Marítima",
  arqueacao: "Arqueação",
  segurancaNavegacao: "Segurança de Navegação",
  classificacaoCasco: "Classificação do Casco",
  classificacaoMaquinas: "Classificação de Máquinas",
  bordaLivre: "Borda Livre",
  seguroDepem: "Seguro DEPEM",
  autorizacaoAntaq: "Autorização ANTAQ",
  tripulacaoSeguranca: "Tripulação de Segurança",
  agulhaMagnetica: "Agulha Magnética",
  balsaInflavel: "Balsa Inflável",
  licencaRadio: "Licença de Rádio",

  // Içamento
  testeCarga: "Teste de Carga",
  registroCREA: "CREA do Engenheiro",
  art: "ART",
  planoManutencao: "Plano de Manutenção",
  monitoramentoFumaca: "Fumaça Preta",
  certificacaoEquipamentos: "Certificação de Equipamentos",
};
