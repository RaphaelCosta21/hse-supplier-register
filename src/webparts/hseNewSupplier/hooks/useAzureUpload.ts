import { useState, useCallback } from "react";
import { AzureBlobService } from "../services/AzureBlobService";
import {
  IFileUploadResult,
  IAzureBlobConfig,
  IAttachmentMetadata,
} from "../utils/azureConfig";

interface IUploadState {
  isUploading: boolean;
  progress: number;
  uploadedFiles: IAttachmentMetadata[];
  errors: string[];
}

interface IUseAzureUploadProps {
  azureConfig: IAzureBlobConfig;
  cnpj: string;
  onUploadComplete?: (metadata: IAttachmentMetadata) => void;
  onUploadError?: (error: string) => void;
}

export const useAzureUpload = ({
  azureConfig,
  cnpj,
  onUploadComplete,
  onUploadError,
}: IUseAzureUploadProps) => {
  const [uploadState, setUploadState] = useState<IUploadState>({
    isUploading: false,
    progress: 0,
    uploadedFiles: [],
    errors: [],
  });

  const [blobService] = useState(() => new AzureBlobService(azureConfig));

  /**
   * Faz upload de um único arquivo
   */
  const uploadFile = useCallback(
    async (
      file: File,
      category: string,
      subcategory: string
    ): Promise<IFileUploadResult> => {
      setUploadState((prev) => ({
        ...prev,
        isUploading: true,
        progress: 0,
        errors: prev.errors.filter((error) => !error.includes(file.name)),
      }));

      try {
        const result = await blobService.uploadFile(
          file,
          category,
          subcategory,
          cnpj,
          (progress) => {
            setUploadState((prev) => ({
              ...prev,
              progress,
            }));
          }
        );

        if (result.success && result.url) {
          // Criar metadados do arquivo
          const metadata: IAttachmentMetadata = {
            url: result.url,
            nomeOriginal: file.name,
            tamanho: file.size,
            dataUpload: new Date().toISOString(),
            categoria: category,
            subcategoria: subcategory,
            obrigatorio: false, // Será definido pelo componente pai
          };

          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            progress: 100,
            uploadedFiles: [...prev.uploadedFiles, metadata],
          }));

          // Chamar callback de sucesso
          if (onUploadComplete) {
            onUploadComplete(metadata);
          }

          return result;
        } else {
          const errorMessage = result.error || "Erro desconhecido no upload";

          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            progress: 0,
            errors: [...prev.errors, `${file.name}: ${errorMessage}`],
          }));

          if (onUploadError) {
            onUploadError(errorMessage);
          }

          return result;
        }
      } catch (error) {
        const errorMessage = `Erro no upload de ${file.name}: ${
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

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [blobService, cnpj, onUploadComplete, onUploadError]
  );

  /**
   * Faz upload de múltiplos arquivos
   */
  const uploadMultipleFiles = useCallback(
    async (
      files: { file: File; category: string; subcategory: string }[]
    ): Promise<IFileUploadResult[]> => {
      setUploadState((prev) => ({
        ...prev,
        isUploading: true,
        progress: 0,
        errors: [],
      }));

      const results: IFileUploadResult[] = [];

      for (let i = 0; i < files.length; i++) {
        const { file, category, subcategory } = files[i];

        try {
          const result = await blobService.uploadFile(
            file,
            category,
            subcategory,
            cnpj,
            (fileProgress) => {
              const totalProgress = (i * 100 + fileProgress) / files.length;
              setUploadState((prev) => ({
                ...prev,
                progress: Math.round(totalProgress),
              }));
            }
          );

          results.push(result);

          if (result.success && result.url) {
            const metadata: IAttachmentMetadata = {
              url: result.url,
              nomeOriginal: file.name,
              tamanho: file.size,
              dataUpload: new Date().toISOString(),
              categoria: category,
              subcategoria: subcategory,
              obrigatorio: false,
            };

            setUploadState((prev) => ({
              ...prev,
              uploadedFiles: [...prev.uploadedFiles, metadata],
            }));

            if (onUploadComplete) {
              onUploadComplete(metadata);
            }
          } else {
            const errorMessage = result.error || "Erro desconhecido no upload";
            setUploadState((prev) => ({
              ...prev,
              errors: [...prev.errors, `${file.name}: ${errorMessage}`],
            }));

            if (onUploadError) {
              onUploadError(errorMessage);
            }
          }
        } catch (error) {
          const errorMessage = `Erro no upload de ${file.name}: ${
            error.message || "Erro desconhecido"
          }`;

          setUploadState((prev) => ({
            ...prev,
            errors: [...prev.errors, errorMessage],
          }));

          if (onUploadError) {
            onUploadError(errorMessage);
          }

          results.push({
            success: false,
            error: errorMessage,
          });
        }
      }

      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        progress: 100,
      }));

      return results;
    },
    [blobService, cnpj, onUploadComplete, onUploadError]
  );

  /**
   * Remove um arquivo do Azure Blob Storage
   */
  const deleteFile = useCallback(
    async (metadata: IAttachmentMetadata): Promise<boolean> => {
      try {
        // Extrair nome do blob da URL
        const blobName = metadata.url.split("/").slice(-3).join("/"); // category/subcategory/filename

        const success = await blobService.deleteFile(blobName);

        if (success) {
          setUploadState((prev) => ({
            ...prev,
            uploadedFiles: prev.uploadedFiles.filter(
              (file) => file.url !== metadata.url
            ),
          }));
        }

        return success;
      } catch (error) {
        console.error("Erro ao deletar arquivo:", error);
        return false;
      }
    },
    [blobService]
  );

  /**
   * Limpa erros específicos ou todos
   */
  const clearErrors = useCallback((fileName?: string) => {
    setUploadState((prev) => ({
      ...prev,
      errors: fileName
        ? prev.errors.filter((error) => !error.includes(fileName))
        : [],
    }));
  }, []);

  /**
   * Reseta o estado do upload
   */
  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      uploadedFiles: [],
      errors: [],
    });
  }, []);

  /**
   * Testa a conectividade com o Azure Blob Storage
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      return await blobService.testConnection();
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
      return false;
    }
  }, [blobService]);

  /**
   * Obtém URL de download para um arquivo
   */
  const getDownloadUrl = useCallback(
    async (
      metadata: IAttachmentMetadata,
      expiryMinutes: number = 60
    ): Promise<string | null> => {
      try {
        const blobName = metadata.url.split("/").slice(-3).join("/");
        return await blobService.generateDownloadUrl(blobName, expiryMinutes);
      } catch (error) {
        console.error("Erro ao gerar URL de download:", error);
        return null;
      }
    },
    [blobService]
  );

  /**
   * Valida se um arquivo pode ser carregado
   */
  const validateFile = useCallback(
    (file: File): { isValid: boolean; error?: string } => {
      // Verificar se o arquivo existe
      if (!file) {
        return { isValid: false, error: "Nenhum arquivo selecionado" };
      }

      // Verificar tamanho do arquivo (100MB)
      const MAX_SIZE = 100 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return {
          isValid: false,
          error: `Arquivo muito grande. Tamanho máximo: 100MB`,
        };
      }

      // Verificar extensão
      const allowedExtensions = [
        ".pdf",
        ".xlsx",
        ".xls",
        ".docx",
        ".doc",
        ".jpg",
        ".png",
      ];
      const extension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));

      if (!allowedExtensions.includes(extension)) {
        return {
          isValid: false,
          error: `Extensão não permitida. Permitidas: ${allowedExtensions.join(
            ", "
          )}`,
        };
      }

      return { isValid: true };
    },
    []
  );

  return {
    // Estado
    isUploading: uploadState.isUploading,
    progress: uploadState.progress,
    uploadedFiles: uploadState.uploadedFiles,
    errors: uploadState.errors,
    hasErrors: uploadState.errors.length > 0,

    // Funções
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    clearErrors,
    resetUploadState,
    testConnection,
    getDownloadUrl,
    validateFile,

    // Utilitários
    formatFileSize: (bytes: number): string => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },

    getTotalUploadedSize: (): number => {
      return uploadState.uploadedFiles.reduce(
        (total, file) => total + file.tamanho,
        0
      );
    },

    getUploadedFilesByCategory: (category: string): IAttachmentMetadata[] => {
      return uploadState.uploadedFiles.filter(
        (file) => file.categoria === category
      );
    },
  };
};
