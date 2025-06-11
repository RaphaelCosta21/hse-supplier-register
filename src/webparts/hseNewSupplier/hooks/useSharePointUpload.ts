import { useState, useCallback } from "react";
import { SharePointFileService } from "../services/SharePointFileService";
import { IAttachmentMetadata } from "../types/IAttachmentMetadata";

interface IUploadState {
  isUploading: boolean;
  progress: number;
  uploadedFiles: IAttachmentMetadata[];
  errors: string[];
}

interface IUseSharePointUploadProps {
  sharePointFileService: SharePointFileService;
  cnpj: string;
  empresa: string;
  onUploadComplete?: (metadata: IAttachmentMetadata) => void;
  onUploadError?: (error: string) => void;
}

export const useSharePointUpload = ({
  sharePointFileService,
  cnpj,
  empresa,
  onUploadComplete,
  onUploadError,
}: IUseSharePointUploadProps) => {
  const [uploadState, setUploadState] = useState<IUploadState>({
    isUploading: false,
    progress: 0,
    uploadedFiles: [],
    errors: [],
  });

  const validateFile = useCallback(
    (file: File, maxSizeInMB: number = 50): string | null => {
      // Validar tamanho do arquivo
      const maxSizeBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `Arquivo muito grande. Tamanho máximo permitido: ${maxSizeInMB}MB`;
      }

      // Validar tipo do arquivo
      const allowedTypes = [
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];

      if (!allowedTypes.includes(file.type)) {
        return "Tipo de arquivo não permitido. Apenas PDF, Excel, Word e imagens são aceitos.";
      }

      return null;
    },
    []
  );

  const uploadFile = useCallback(
    async (
      file: File,
      category: string,
      subcategory?: string,
      maxSizeInMB: number = 50
    ): Promise<IAttachmentMetadata | null> => {
      // Validar arquivo
      const validationError = validateFile(file, maxSizeInMB);
      if (validationError) {
        const errorMessage = `${file.name}: ${validationError}`;
        setUploadState((prev) => ({
          ...prev,
          errors: [...prev.errors, errorMessage],
        }));
        if (onUploadError) {
          onUploadError(errorMessage);
        }
        return null;
      }

      try {
        setUploadState((prev) => ({
          ...prev,
          isUploading: true,
          progress: 0,
          errors: prev.errors.filter((e) => !e.includes(file.name)),
        })); // Simular progresso (SharePoint não fornece progresso real)
        const progressInterval = setInterval(() => {
          setUploadState((prev) => ({
            ...prev,
            progress: Math.min(prev.progress + 20, 90),
          }));
        }, 200);

        // Criar metadata local (não fazer upload para SharePoint ainda)
        const metadata = sharePointFileService.createLocalFileMetadata(
          file,
          category,
          subcategory
        );

        clearInterval(progressInterval);

        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          progress: 100,
          uploadedFiles: [...prev.uploadedFiles, metadata],
        }));

        if (onUploadComplete) {
          onUploadComplete(metadata);
        }

        // Reset progress after a short delay
        setTimeout(() => {
          setUploadState((prev) => ({
            ...prev,
            progress: 0,
          }));
        }, 1000);

        return metadata;
      } catch (error) {
        const errorMessage = `Erro ao enviar ${file.name}: ${
          error.message || "Erro desconhecido"
        }`;

        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          progress: 0,
          errors: [...prev.errors, errorMessage],
        }));

        if (onUploadError) {
          onUploadError(errorMessage);
        }

        console.error("Erro no upload:", error);
        return null;
      }
    },
    [
      sharePointFileService,
      cnpj,
      empresa,
      validateFile,
      onUploadComplete,
      onUploadError,
    ]
  );

  const uploadMultipleFiles = useCallback(
    async (
      files: File[],
      category: string,
      subcategory?: string,
      maxSizeInMB: number = 50
    ): Promise<IAttachmentMetadata[]> => {
      const results: IAttachmentMetadata[] = [];

      for (const file of files) {
        const result = await uploadFile(
          file,
          category,
          subcategory,
          maxSizeInMB
        );
        if (result) {
          results.push(result);
        }
      }

      return results;
    },
    [uploadFile]
  );

  const removeFile = useCallback(
    async (fileId: string): Promise<boolean> => {
      try {
        const fileToRemove = uploadState.uploadedFiles.find(
          (f) => f.id === fileId
        );

        if (!fileToRemove || !fileToRemove.sharepointItemId) {
          return false;
        }

        await sharePointFileService.deleteFile(fileToRemove.sharepointItemId);

        setUploadState((prev) => ({
          ...prev,
          uploadedFiles: prev.uploadedFiles.filter((f) => f.id !== fileId),
        }));

        return true;
      } catch (error) {
        const errorMessage = `Erro ao remover arquivo: ${
          error.message || "Erro desconhecido"
        }`;

        setUploadState((prev) => ({
          ...prev,
          errors: [...prev.errors, errorMessage],
        }));

        if (onUploadError) {
          onUploadError(errorMessage);
        }

        console.error("Erro ao remover arquivo:", error);
        return false;
      }
    },
    [sharePointFileService, uploadState.uploadedFiles, onUploadError]
  );

  const clearErrors = useCallback(() => {
    setUploadState((prev) => ({
      ...prev,
      errors: [],
    }));
  }, []);

  const clearAllFiles = useCallback(() => {
    setUploadState((prev) => ({
      ...prev,
      uploadedFiles: [],
      errors: [],
    }));
  }, []);

  return {
    ...uploadState,
    uploadFile,
    uploadMultipleFiles,
    removeFile,
    clearErrors,
    clearAllFiles,
    validateFile,
  };
};
