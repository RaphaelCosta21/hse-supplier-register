export interface IAttachmentMetadata {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  category: string;
  subcategory?: string;
  url: string;
  sharepointItemId?: number;

  // Dados do arquivo para salvamento posterior
  fileData?: File | string; // File object ou base64 string

  // Campos legados para compatibilidade
  nomeOriginal?: string;
  tamanho?: number;
  dataUpload?: string;
}
