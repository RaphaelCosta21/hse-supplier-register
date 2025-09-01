// Import for type usage
import { IAttachmentMetadata } from "./IAttachmentMetadata";

// Interface principal para os dados do formulário HSE
export interface IHSEFormData {
  // Metadados do formulário
  id?: number;
  statusFormulario:
    | "Em Andamento"
    | "Enviado"
    | "Em Análise"
    | "Aprovado"
    | "Rejeitado"
    | "Pendente Info.";
  usuarioPreenchimento?: string;
  dataCriacao?: Date;
  dataUltimaModificacao?: Date;

  // Bloco A - Dados Gerais da Contratada
  dadosGerais: IDadosGerais;
  // Bloco B - Conformidade Legal (NRs 1-60)
  conformidadeLegal: IConformidadeLegal;

  // Bloco C - Serviços Especializados
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
  escopoServico: string;
  responsavelTecnico: string;
  atividadePrincipalCNAE: string;
  totalEmpregados: number | undefined;
  empregadosParaServico: number | undefined;
  grauRisco: "1" | "2" | "3" | "4" | "";
  possuiSESMT: boolean;
  numeroComponentesSESMT: number | undefined;
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
  comentarios?: string;
}

export interface INR04 {
  questao1: IQuestaoConformidade;
  questao2: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR05 {
  questao1: IQuestaoConformidade;
  questao2: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR06 {
  questao1: IQuestaoConformidade;
  questao2: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR07 {
  questao1: IQuestaoConformidade;
  questao2: IQuestaoConformidade;
  questao3: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR10 {
  questao1: IQuestaoConformidade;
  questao2: IQuestaoConformidade;
  questao3: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR11 {
  questao1: IQuestaoConformidade;
  questao2: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR12 {
  questao1: IQuestaoConformidade;
  questao2: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR13 {
  questao1: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR15 {
  questao1: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR16 {
  questao1: IQuestaoConformidade;
  comentarios?: string;
}

export interface INR23 {
  questao1: IQuestaoConformidade;
  questao2: IQuestaoConformidade;
  questao3: IQuestaoConformidade;
  comentarios?: string;
}

export interface ILicencasAmbientais {
  questao1: IQuestaoConformidade;
  comentarios?: string;
}

export interface ILegislacaoMaritima {
  questao1: IQuestaoConformidade; // MODU CODE
  questao2: IQuestaoConformidade; // NORMAN
  questao3: IQuestaoConformidade; // MARPOL
  questao4: IQuestaoConformidade; // STCW
  questao5: IQuestaoConformidade; // ISM CODE
  questao6: IQuestaoConformidade; // SOLAS
  comentarios?: string;
}

export interface ITreinamentos {
  questao1: IQuestaoConformidade;
  questao2: IQuestaoConformidade;
  questao3: IQuestaoConformidade;
  comentarios?: string;
}

export interface IGestaoSMS {
  questao1: IQuestaoConformidade;
  questao2: IQuestaoConformidade;
  questao3: IQuestaoConformidade;
  questao4: IQuestaoConformidade;
  questao5: IQuestaoConformidade;
  comentarios?: string;
}

// Interface principal para conformidade legal
export interface IConformidadeLegal {
  nr01: INR01;
  nr04: INR04;
  nr05: INR05;
  nr06: INR06;
  nr07: INR07;
  nr10: INR10;
  nr11: INR11;
  nr12: INR12;
  nr13: INR13;
  nr15: INR15;
  nr16: INR16;
  nr23: INR23;
  licencasAmbientais: ILicencasAmbientais;
  legislacaoMaritima: ILegislacaoMaritima;
  treinamentos: ITreinamentos;
  gestaoSMS: IGestaoSMS;
}

// Interface para serviços especializados
export interface IServicosEspeciais {
  fornecedorEmbarcacoes: boolean;
  embarcacoes?: IEmbarcacoes;

  fornecedorIcamento: boolean;
  icamento?: IIcamento;

  naoFornecedorServicos: boolean; // Novo campo: empresa não fornece nenhum serviço especializado
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
  registroCREA: IQuestaoConformidade; // Questão 89
  art: IQuestaoConformidade; // Questão 90
  planoManutencao: IQuestaoConformidade; // Questão 91
  monitoramentoFumaca: IQuestaoConformidade; // Questão 92
  certificacaoEquipamentos: IQuestaoConformidade; // Questão 93
}

// Interface para anexos do formulário
export interface IAnexosFormulario {
  dadosGerais: {
    rem?: IAttachmentMetadata;
  };
  conformidade: {
    // NR04
    sesmt?: IAttachmentMetadata;

    // NR05
    cipa?: IAttachmentMetadata;

    // NR06
    caEPI?: IAttachmentMetadata;

    // NR07
    pcmso?: IAttachmentMetadata;
    aso?: IAttachmentMetadata;

    // NR10
    nr10ProjetoInstalacoes?: IAttachmentMetadata;
    nr10CertificacaoProfissionais?: IAttachmentMetadata;

    // NR11
    nr11CertificadoTreinamento?: IAttachmentMetadata;

    // NR12
    nr12PlanoInspecao?: IAttachmentMetadata;
    nr12EvidenciaDispositivo?: IAttachmentMetadata;

    // NR13
    nr13EvidenciaSistematica?: IAttachmentMetadata;

    // NR15
    nr15LaudoInsalubridade?: IAttachmentMetadata;

    // NR16
    nr16LaudoPericulosidade?: IAttachmentMetadata;

    // NR23
    nr23LaudoManutencao?: IAttachmentMetadata;

    // Licenças Ambientais
    licencaOperacao?: IAttachmentMetadata;

    // Treinamentos Obrigatórios
    certificadoProgramaTreinamento?: IAttachmentMetadata;
    evidenciaTreinamento?: IAttachmentMetadata;

    // Gestão de SMS
    smsProcedimentoAcidentes?: IAttachmentMetadata;
    smsCalendarioInspecoes?: IAttachmentMetadata;
    smsProcedimentoResiduos?: IAttachmentMetadata;
    smsMetasObjetivos?: IAttachmentMetadata;
    smsProgramaAnual?: IAttachmentMetadata;
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
    registroCREA?: IAttachmentMetadata;
    art?: IAttachmentMetadata;
    planoManutencao?: IAttachmentMetadata;
    monitoramentoFumaca?: IAttachmentMetadata;
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
  submissionAttempted: boolean;
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
  servicosEspeciais: number;
  total: number;
}

// Import IAttachmentMetadata from dedicated file
export { IAttachmentMetadata } from "./IAttachmentMetadata";
