import {
  BlobServiceClient,
  ContainerClient,
  BlobUploadCommonResponse,
} from "@azure/storage-blob";
import {
  IAzureBlobConfig,
  IFileUploadResult,
  AZURE_CONFIG,
  generateUniqueFileName,
  isValidFileExtension,
  getMimeType,
} from "../utils/azureConfig";

export class AzureBlobService {
  private containerClient: ContainerClient;
  private config: IAzureBlobConfig;

  constructor(config: IAzureBlobConfig) {
    this.config = config;

    // Criar cliente do Azure Blob Service
    const blobServiceClient = new BlobServiceClient(
      `https://${config.accountName}.blob.core.windows.net?${config.sasToken}`
    );

    this.containerClient = blobServiceClient.getContainerClient(
      config.containerName
    );
  }

  /**
   * Faz upload de um arquivo para o Azure Blob Storage
   * @param file Arquivo a ser carregado
   * @param category Categoria do arquivo (dadosGerais, evidencias, etc.)
   * @param subcategory Subcategoria do arquivo (rem, sesmt, etc.)
   * @param cnpj CNPJ da empresa para gerar nome único
   * @param onProgress Callback para progresso do upload
   */
  public async uploadFile(
    file: File,
    category: string,
    subcategory: string,
    cnpj: string,
    onProgress?: (progress: number) => void
  ): Promise<IFileUploadResult> {
    try {
      // Validar arquivo
      const validationResult = this.validateFile(file);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error,
        };
      }

      // Gerar nome único para o arquivo
      const uniqueFileName = generateUniqueFileName(file.name, cnpj);
      const blobName = `${category}/${subcategory}/${uniqueFileName}`;

      // Obter referência do blob
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      // Configurar opções de upload
      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: getMimeType(file.name),
        },
        metadata: {
          originalName: file.name,
          category: category,
          subcategory: subcategory,
          cnpj: cnpj,
          uploadDate: new Date().toISOString(),
        },
        onProgress: onProgress
          ? (ev) => {
              if (ev.loadedBytes && file.size) {
                const progress = Math.round((ev.loadedBytes / file.size) * 100);
                onProgress(progress);
              }
            }
          : undefined,
      };

      // Fazer upload do arquivo
      const uploadResponse: BlobUploadCommonResponse =
        await blockBlobClient.uploadData(file, uploadOptions);

      if (uploadResponse.errorCode) {
        return {
          success: false,
          error: `Erro no upload: ${uploadResponse.errorCode}`,
        };
      }

      // Construir URL do arquivo
      const fileUrl = `https://${this.config.accountName}.blob.core.windows.net/${this.config.containerName}/${blobName}`;

      return {
        success: true,
        url: fileUrl,
        fileName: uniqueFileName,
        fileSize: file.size,
      };
    } catch (error) {
      console.error("Erro no upload para Azure Blob Storage:", error);
      return {
        success: false,
        error: `Erro no upload: ${error.message || "Erro desconhecido"}`,
      };
    }
  }

  /**
   * Valida se o arquivo atende aos critérios
   * @param file Arquivo a ser validado
   */
  private validateFile(file: File): { isValid: boolean; error?: string } {
    // Verificar se o arquivo existe
    if (!file) {
      return { isValid: false, error: "Nenhum arquivo selecionado" };
    }

    // Verificar tamanho do arquivo
    if (file.size > AZURE_CONFIG.MAX_FILE_SIZE) {
      const maxSizeMB = AZURE_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
      return {
        isValid: false,
        error: `Arquivo muito grande. Tamanho máximo permitido: ${maxSizeMB}MB`,
      };
    }

    // Verificar extensão do arquivo
    if (!isValidFileExtension(file.name)) {
      return {
        isValid: false,
        error: `Extensão de arquivo não permitida. Extensões permitidas: ${AZURE_CONFIG.ALLOWED_EXTENSIONS.join(
          ", "
        )}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Remove um arquivo do Azure Blob Storage
   * @param blobName Nome do blob a ser removido
   */
  public async deleteFile(blobName: string): Promise<boolean> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      const deleteResponse = await blockBlobClient.delete();

      return !deleteResponse.errorCode;
    } catch (error) {
      console.error("Erro ao deletar arquivo do Azure Blob Storage:", error);
      return false;
    }
  }

  /**
   * Lista arquivos de uma categoria específica
   * @param category Categoria dos arquivos
   * @param cnpj CNPJ da empresa para filtrar
   */
  public async listFiles(category: string, cnpj?: string): Promise<string[]> {
    try {
      const files: string[] = [];
      const prefix = cnpj ? `${category}/${cnpj}` : category;

      for await (const blob of this.containerClient.listBlobsFlat({ prefix })) {
        files.push(blob.name);
      }

      return files;
    } catch (error) {
      console.error("Erro ao listar arquivos do Azure Blob Storage:", error);
      return [];
    }
  }

  /**
   * Gera URL com SAS token para download de arquivo
   * @param blobName Nome do blob
   * @param expiryMinutes Minutos até expirar (padrão: 60)
   */
  public async generateDownloadUrl(
    blobName: string,
    expiryMinutes: number = 60
  ): Promise<string | null> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      // Verificar se o blob existe
      const exists = await blockBlobClient.exists();
      if (!exists) {
        return null;
      }

      // Gerar URL com SAS token (se necessário)
      // Para simplificar, retornamos a URL direta
      // Em produção, você pode querer gerar um SAS token específico para o blob
      return blockBlobClient.url;
    } catch (error) {
      console.error("Erro ao gerar URL de download:", error);
      return null;
    }
  }

  /**
   * Obtém metadados de um arquivo
   * @param blobName Nome do blob
   */
  public async getFileMetadata(blobName: string): Promise<any> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      const properties = await blockBlobClient.getProperties();

      return {
        size: properties.contentLength,
        contentType: properties.contentType,
        lastModified: properties.lastModified,
        metadata: properties.metadata,
      };
    } catch (error) {
      console.error("Erro ao obter metadados do arquivo:", error);
      return null;
    }
  }

  /**
   * Verifica a conectividade com o Azure Blob Storage
   */
  public async testConnection(): Promise<boolean> {
    try {
      const properties = await this.containerClient.getProperties();
      return !!properties;
    } catch (error) {
      console.error("Erro na conexão com Azure Blob Storage:", error);
      return false;
    }
  }

  /**
   * Upload múltiplos arquivos
   * @param files Array de arquivos
   * @param category Categoria dos arquivos
   * @param cnpj CNPJ da empresa
   * @param onProgress Callback para progresso total
   */
  public async uploadMultipleFiles(
    files: { file: File; subcategory: string }[],
    category: string,
    cnpj: string,
    onProgress?: (completed: number, total: number) => void
  ): Promise<IFileUploadResult[]> {
    const results: IFileUploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const { file, subcategory } = files[i];

      const result = await this.uploadFile(file, category, subcategory, cnpj);
      results.push(result);

      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    }

    return results;
  }
}
