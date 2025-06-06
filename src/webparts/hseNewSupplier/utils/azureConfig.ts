// Interface para configuração do Azure Blob Storage
export interface IAzureBlobConfig {
  accountName: string;
  containerName: string;
  sasToken: string;
}

// Interface para resultado de upload
export interface IFileUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
  fileSize?: number;
}

// Interface para metadados de anexo
export interface IAttachmentMetadata {
  url: string;
  nomeOriginal: string;
  tamanho: number;
  dataUpload: string;
  categoria: string;
  subcategoria: string;
  obrigatorio: boolean;
}

// Configurações do Azure Blob Storage
export const AZURE_CONFIG = {
  CONTAINER_NAME: "hse-attachments",
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_EXTENSIONS: [
    ".pdf",
    ".xlsx",
    ".xls",
    ".docx",
    ".doc",
    ".jpg",
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

// URL base para o Azure Storage (será configurada via properties do WebPart)
export const getAzureStorageUrl = (accountName: string): string => {
  return `https://${accountName}.blob.core.windows.net`;
};

// Função para validar extensão de arquivo
export const isValidFileExtension = (fileName: string): boolean => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  return AZURE_CONFIG.ALLOWED_EXTENSIONS.includes(extension);
};

// Função para obter MIME type
export const getMimeType = (fileName: string): string => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  return AZURE_CONFIG.MIME_TYPES[extension] || "application/octet-stream";
};

// Função para formatar tamanho de arquivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Função para gerar nome único de arquivo
export const generateUniqueFileName = (
  originalName: string,
  cnpj: string
): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const extension = originalName.substring(originalName.lastIndexOf("."));
  const nameWithoutExtension = originalName.substring(
    0,
    originalName.lastIndexOf(".")
  );
  const cleanCnpj = cnpj.replace(/[^\d]/g, ""); // Remove caracteres especiais do CNPJ

  return `${cleanCnpj}_${nameWithoutExtension}_${timestamp}${extension}`;
};
