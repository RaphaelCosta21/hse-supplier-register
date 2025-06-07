// Import for type usage
import { IAttachmentMetadata } from "./IAttachmentMetadata";

// Interface principal para os dados do formulário HSE
export interface IHSEFormData {
  // Metadados do formulário
  id?: number;
  statusFormulario:
    | "Rascunho"
    | "Enviado"
    | "Em Análise"
    | "Aprovado"
    | "Rejeitado";
  usuarioPreenchimento?: string;
  dataCriacao?: Date;
  dataUltimaModificacao?: Date;

  // Bloco A - Dados Gerais da Contratada
  dadosGerais: IDadosGerais;

  // Bloco B - Conformidade Legal (NRs 1-60)
  conformidadeLegal: IConformidadeLegal;

  // Bloco C - Evidências (questões 61-73)
  evidencias: IEvidencias;

  // Bloco D - Serviços Especializados
  servicosEspeciais: IServicosEspeciais;

  // Outros dados
  outrasAcoes?: string;
  comentariosFinais?: string;
  justificativasNA?: string;

  // Anexos (metadados dos arquivos no SharePoint Document Library)
  anexos: IAnexosFormulario;
}

// Interface para dados gerais da contratada
export interface IDadosGerais {
  empresa: string;
  cnpj: string;
  numeroContrato: string;
  dataInicioContrato: Date | undefined;
  dataTerminoContrato: Date | undefined;
  escopoServico: string;
  responsavelTecnico: string;
  atividadePrincipalCNAE: string;
  totalEmpregados: number | undefined;
  empregadosParaServico: number | undefined;
  grauRisco: "1" | "2" | "3" | "4" | "";
  possuiSESMT: boolean;
  numeroComponentesSESMT: number | undefined;
  gerenteContratoMarine: string;
}

// Interface para uma questão de conformidade
export interface IQuestaoConformidade {
  resposta: "SIM" | "NÃO" | "NA" | "";
  comentarios?: string;
}

// Interface para NRs específicas
export interface INR01 {
  questao1: IQuestaoConformidade;
  questao2: IQuestaoConformidade;
  questao3: IQuestaoConformidade;
  questao4: IQuestaoConformidade;
  questao5: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR04 {
  questao7: IQuestaoConformidade;
  questao8: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR05 {
  questao10: IQuestaoConformidade;
  questao11: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR06 {
  questao13: IQuestaoConformidade;
  questao14: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR07 {
  questao16: IQuestaoConformidade;
  questao17: IQuestaoConformidade;
  questao18: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR09 {
  questao20: IQuestaoConformidade;
  questao21: IQuestaoConformidade;
  questao22: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR10 {
  questao24: IQuestaoConformidade;
  questao25: IQuestaoConformidade;
  questao26: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR11 {
  questao28: IQuestaoConformidade;
  questao29: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR12 {
  questao31: IQuestaoConformidade;
  questao32: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR13 {
  questao34: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR15 {
  questao36: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR23 {
  questao38: IQuestaoConformidade;
  questao39: IQuestaoConformidade;
  questao40: IQuestaoConformidade;
  comentarios?: string;
}

export interface ILicencasAmbientais {
  questao42: IQuestaoConformidade;
  comentarios?: string;
}

export interface ILegislacaoMaritima {
  questao44: IQuestaoConformidade; // MODU CODE
  questao45: IQuestaoConformidade; // NORMAN
  questao46: IQuestaoConformidade; // MARPOL
  questao47: IQuestaoConformidade; // STCW
  questao48: IQuestaoConformidade; // ISM CODE
  questao49: IQuestaoConformidade; // SOLAS
  comentarios?: string;
}

export interface ITreinamentos {
  questao51: IQuestaoConformidade;
  questao52: IQuestaoConformidade;
  questao53: IQuestaoConformidade;
  comentarios?: string;
}

export interface IGestaoSMS {
  questao55: IQuestaoConformidade;
  questao56: IQuestaoConformidade;
  questao57: IQuestaoConformidade;
  questao58: IQuestaoConformidade;
  questao59: IQuestaoConformidade;
  comentarios?: string;
}

// Interface principal para conformidade legal
export interface IConformidadeLegal {
  nr01: INR01;
  nr04: INR04;
  nr05: INR05;
  nr06: INR06;
  nr07: INR07;
  nr09: INR09;
  nr10: INR10;
  nr11: INR11;
  nr12: INR12;
  nr13: INR13;
  nr15: INR15;
  nr23: INR23;
  licencasAmbientais: ILicencasAmbientais;
  legislacaoMaritima: ILegislacaoMaritima;
  treinamentos: ITreinamentos;
  gestaoSMS: IGestaoSMS;
}

// Interface para evidências (questões 61-73)
export interface IEvidencias {
  todasRespostasPossuemEvidencia: boolean;
  perguntasSemEvidencia?: string;

  // Documentos evidenciados
  sesmt: IQuestaoConformidade;
  cipa: IQuestaoConformidade;
  cronogramaTreinamento: IQuestaoConformidade;
  treinamentoEPI: IQuestaoConformidade;
  caEPIs: IQuestaoConformidade;
  ppra: IQuestaoConformidade;
  pcmso: IQuestaoConformidade;
  aso: IQuestaoConformidade;
  planoResiduos: IQuestaoConformidade;
  rem: IQuestaoConformidade;
  catAcidentes: IQuestaoConformidade;
}

// Interface para serviços especializados
export interface IServicosEspeciais {
  fornecedorEmbarcacoes: boolean;
  embarcacoes?: IEmbarcacoes;

  fornecedorIcamento: boolean;
  icamento?: IIcamento;
}

// Interface para certificados de embarcações (questões 74-87)
export interface IEmbarcacoes {
  iopp: IQuestaoConformidade; // Questão 74
  registroArmador: IQuestaoConformidade; // Questão 75
  propriedadeMaritima: IQuestaoConformidade; // Questão 76
  arqueacao: IQuestaoConformidade; // Questão 77
  segurancaNavegacao: IQuestaoConformidade; // Questão 78
  classificacaoCasco: IQuestaoConformidade; // Questão 79
  classificacaoMaquinas: IQuestaoConformidade; // Questão 80
  bordaLivre: IQuestaoConformidade; // Questão 81
  seguroDepem: IQuestaoConformidade; // Questão 82
  autorizacaoAntaq: IQuestaoConformidade; // Questão 83
  tripulacaoSeguranca: IQuestaoConformidade; // Questão 84
  agulhaMagnetica: IQuestaoConformidade; // Questão 85
  balsaInflavel: IQuestaoConformidade; // Questão 86
  licencaRadio: IQuestaoConformidade; // Questão 87
}

// Interface para documentos de içamento (questões 88-93)
export interface IIcamento {
  testeCarga: IQuestaoConformidade; // Questão 88
  creaEngenheiro: IQuestaoConformidade; // Questão 89
  art: IQuestaoConformidade; // Questão 90
  planoManutencao: IQuestaoConformidade; // Questão 91
  fumacaPreta: IQuestaoConformidade; // Questão 92
  certificacaoEquipamentos: IQuestaoConformidade; // Questão 93
}

// Interface para anexos do formulário
export interface IAnexosFormulario {
  dadosGerais: {
    rem?: IAttachmentMetadata;
  };
  conformidade: {
    sesmt?: IAttachmentMetadata;
    cipa?: IAttachmentMetadata;
    epiCA?: IAttachmentMetadata;
  };
  evidencias: {
    sesmt?: IAttachmentMetadata;
    cipa?: IAttachmentMetadata;
    cronogramaTreinamento?: IAttachmentMetadata;
    treinamentoEPI?: IAttachmentMetadata;
    caEPIs?: IAttachmentMetadata;
    ppra?: IAttachmentMetadata;
    pcmso?: IAttachmentMetadata;
    aso?: IAttachmentMetadata;
    planoResiduos?: IAttachmentMetadata;
    rem?: IAttachmentMetadata;
    catAcidentes?: IAttachmentMetadata;
  };
  embarcacoes?: {
    iopp?: IAttachmentMetadata;
    registroArmador?: IAttachmentMetadata;
    propriedadeMaritima?: IAttachmentMetadata;
    arqueacao?: IAttachmentMetadata;
    segurancaNavegacao?: IAttachmentMetadata;
    classificacaoCasco?: IAttachmentMetadata;
    classificacaoMaquinas?: IAttachmentMetadata;
    bordaLivre?: IAttachmentMetadata;
    seguroDepem?: IAttachmentMetadata;
    autorizacaoAntaq?: IAttachmentMetadata;
    tripulacaoSeguranca?: IAttachmentMetadata;
    agulhaMagnetica?: IAttachmentMetadata;
    balsaInflavel?: IAttachmentMetadata;
    licencaRadio?: IAttachmentMetadata;
  };
  icamento?: {
    testeCarga?: IAttachmentMetadata;
    creaEngenheiro?: IAttachmentMetadata;
    art?: IAttachmentMetadata;
    planoManutencao?: IAttachmentMetadata;
    fumacaPreta?: IAttachmentMetadata;
    certificacaoEquipamentos?: IAttachmentMetadata;
  };
}

// Interface para estado do formulário
export interface IFormState {
  currentStep: number;
  formData: IHSEFormData;
  attachments: { [category: string]: IAttachmentMetadata[] };
  validationErrors: IValidationError[];
  isSubmitting: boolean;
  isLoading: boolean;
  lastSaved?: Date;
  errors: { [key: string]: string };
  isDirty: boolean;
}

// Interface para validação de erros
export interface IValidationError {
  field: string;
  message: string;
  section: string;
}

// Interface para progresso do formulário
export interface IFormProgress {
  dadosGerais: number;
  conformidadeLegal: number;
  evidencias: number;
  servicosEspeciais: number;
  total: number;
}

// Import IAttachmentMetadata from dedicated file
export { IAttachmentMetadata } from "./IAttachmentMetadata";
