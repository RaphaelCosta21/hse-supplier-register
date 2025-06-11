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
  userEmail: string;
  userName: string;
  isOwner: boolean;
}

export interface IOverwriteConfirmation {
  show: boolean;
  cnpj: string;
  existingData?: unknown;
  onConfirm: () => void;
  onCancel: () => void;
}
