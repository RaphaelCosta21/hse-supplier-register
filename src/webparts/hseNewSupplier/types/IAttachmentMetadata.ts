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

  // Campos legados para compatibilidade
  nomeOriginal?: string;
  tamanho?: number;
  dataUpload?: string;
}
