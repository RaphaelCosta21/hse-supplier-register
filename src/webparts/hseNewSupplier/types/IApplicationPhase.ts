export interface IFormFieldChange {
  campo: string;
  tipo: "adicionado" | "alterado" | "removido";
  valorAnterior?: string | number | boolean | Date | undefined;
  valorNovo?: string | number | boolean | Date | undefined;
}

export interface IRevisionEntry {
  numeroRevisao: number;
  data: string;
  usuario: string;
  email: string;
  tipoOperacao: string;
  alteracoes: IFormFieldChange[];
  totalAlteracoes: number;
  resumo: string;
}

export interface IApplicationPhase {
  phase: "ENTRADA" | "FORMULARIO";
  cnpj?: string;
  existingItemId?: number;
  isOverwrite?: boolean;
  requiresApproval?: boolean;
}

export interface ICNPJVerificationResult {
  exists: boolean;
  cnpj: string;
  itemId?: number;
  status?: string;
  formData?: unknown;
  allowEdit?: boolean;
  requiresApproval?: boolean;
  isOverwrite?: boolean;
  userEmail?: string; // Email do usuário que preencheu
  userName?: string; // Nome do usuário que preencheu
  isOwner?: boolean; // Se o usuário atual é o dono do formulário
}

export interface IUserInfo {
  displayName: string;
  email: string;
  loginName: string;
}

export interface IUserFormSummary {
  id: number;
  cnpj: string;
  empresa: string;
  status: string;
  dataModificacao: string;
  dataModificacaoCompleta: string; // Data formatada completa para exibição
  userEmail: string;
  userName: string;
  isOwner: boolean;
  numeroRevisoes: number; // Número total de revisões do formulário
  metadata?: IFormMetadata; // Metadados completos incluindo avaliação
}

// Interface para restrições aplicadas na avaliação
export interface ICampoRestricao {
  id: number;
  secao: string;
  campo: string;
  nomeExibicao: string;
  motivo: string;
}

// Interface para avaliação do formulário
export interface IFormAvaliacao {
  HSEResponsavel: string;
  DataInicio: string;
  DataFim: string;
  Comentarios: string;
  StatusAvaliacao: string;
  Restricao: "Sim" | "Nao";
  CamposRestricao?: ICampoRestricao[];
}

// Interface para metadata do formulário (inclui avaliação)
export interface IFormMetadata {
  id?: number;
  dataCriacao?: string;
  dataUltimaModificacao?: string;
  usuario?: string;
  email?: string;
  temAnexos?: boolean;
  totalAnexos?: number;
  historicoStatusChange?: IStatusChangeEntry[];
  historicoRevisoes?: IRevisionEntry[];
  numeroRevisao?: number;
  tipoOperacao?: string;
  Avaliacao?: { [key: string]: IFormAvaliacao };
  QuantidadeAvaliacao?: number;
  MotivoPendencia?: string; // Para formulários com status "Pendente Info."
}

// Interface para histórico de mudanças de status
export interface IStatusChangeEntry {
  status: string;
  dataAlteracao: string;
  usuario: string;
  email: string;
}

export interface IOverwriteConfirmation {
  show: boolean;
  cnpj: string;
  existingData?: unknown;
  onConfirm: () => void;
  onCancel: () => void;
}
