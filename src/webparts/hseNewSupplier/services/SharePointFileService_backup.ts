import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { IAttachmentMetadata } from "../types/IAttachmentMetadata";

export interface ISharePointFileResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
  metadata?: IAttachmentMetadata;
}

// Mapeamento de categorias de anexos para subpastas
export const ATTACHMENT_FOLDER_MAP: { [key: string]: string } = {
  // Dados Gerais
  rem: "REM",

  // Conformidade Legal - NR/SESMT
  sesmt: "SESMT",
  cipa: "CIPA",
  treinamento: "TREINAMENTOS",
  treinamentoEPI: "TREINAMENTOS",
  caEPI: "EPI",
  ppra: "PPRA",
  pcmso: "PCMSO",
  aso: "ASO",
  planoResiduos: "RESIDUOS",
  cat: "CAT",

  // NRs específicas - usar o nome da categoria como subpasta
  nr01: "NR01",
  nr04: "NR04",
  nr05: "NR05",
  nr06: "NR06",
  nr07: "NR07",
  nr09: "NR09",
  nr10: "NR10",
  nr11: "NR11",
  nr12: "NR12",
  nr13: "NR13",
  nr15: "NR15",
  nr16: "NR16",
  nr17: "NR17",
  nr18: "NR18",
  nr20: "NR20",
  nr23: "NR23",
  nr24: "NR24",
  nr25: "NR25",
  nr26: "NR26",
  nr33: "NR33",
  nr34: "NR34",
  nr35: "NR35",

  // Embarcações
  iopp: "EMBARCACOES",
  registroArmador: "EMBARCACOES",
  propriedadeMaritima: "EMBARCACOES",
  arqueacao: "EMBARCACOES",
  segurancaNavegacao: "EMBARCACOES",
  classificacaoCasco: "EMBARCACOES",
  classificacaoMaquinas: "EMBARCACOES",
  bordaLivre: "EMBARCACOES",
  seguroObrigatorio: "EMBARCACOES",
  autorizacaoANTAQ: "EMBARCACOES",
  tripulacaoSeguranca: "EMBARCACOES",
  compensacaoAgulha: "EMBARCACOES",
  revisaoBalsa: "EMBARCACOES",
  licencaRadio: "EMBARCACOES",

  // Içamento
  testeCarga: "ICAMENTO",
  registroCREA: "ICAMENTO",
  art: "ICAMENTO",
  planoManutencao: "ICAMENTO",
  monitoramentoFumaca: "ICAMENTO",
  certificacaoEquipamentos: "ICAMENTO",
};

export class SharePointFileService {
  private sp: ReturnType<typeof spfi>;
  private documentLibraryName: string;

  constructor(
    context: WebPartContext,
    documentLibraryName: string = "anexos-contratadas"
  ) {
    this.sp = spfi().using(SPFx(context));
    this.documentLibraryName = documentLibraryName;
  }

  /**
   * Verifica se a Document Library existe (não tenta criar)
   */
  public async checkDocumentLibraryExists(): Promise<boolean> {
    try {
      await this.sp.web.lists
        .getByTitle(this.documentLibraryName)
        .select("Id")();
      console.log(`Document Library ${this.documentLibraryName} encontrada`);
      return true;
    } catch {
      console.error(
        `Document Library ${this.documentLibraryName} não encontrada`
      );
      return false;
    }
  }

  /**
   * Cria metadata local para um arquivo (sem fazer upload)
   * Este método é usado quando o usuário seleciona arquivos
   */
  public createLocalFileMetadata(
    file: File,
    category: string,
    subcategory?: string
  ): IAttachmentMetadata {
    return {
      id: `local_${Date.now()}_${Math.random()}`,
      fileName: file.name,
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type || this.getFileTypeFromName(file.name),
      uploadDate: new Date().toISOString(),
      category: category,
      subcategory: subcategory,
      url: "", // Será preenchido após upload real
      sharepointItemId: undefined,
      fileData: file, // Arquivo real para upload posterior
    };
  }

  /**
   * Salva todos os anexos do formulário no SharePoint com estrutura de pastas
   * Este método só deve ser chamado no momento da submissão do formulário
   */
  public async saveFormAttachments(
    cnpj: string,
    nomeEmpresa: string,
    attachments: { [category: string]: IAttachmentMetadata[] },
    formularioId?: number
  ): Promise<{ [category: string]: IAttachmentMetadata[] }> {
    try {
      console.log("=== SALVANDO ANEXOS DO FORMULÁRIO ===");
      console.log("CNPJ:", cnpj);
      console.log("Empresa:", nomeEmpresa);
      console.log("Anexos recebidos:", Object.keys(attachments));

      // Verificar se a biblioteca existe
      const libraryExists = await this.checkDocumentLibraryExists();
      if (!libraryExists) {
        throw new Error(
          `Document Library '${this.documentLibraryName}' não encontrada`
        );
      }

      // Criar nome da pasta principal (remover pontos e barras do CNPJ)
      const cleanCNPJ = cnpj.replace(/[.\/-]/g, "");
      const mainFolderName = `${cleanCNPJ}-${this.sanitizeFolderName(
        nomeEmpresa
      )}`;
      console.log("Pasta principal:", mainFolderName);

      // Garantir que a pasta principal existe
      await this.ensureMainFolder(mainFolderName);

      const savedAttachments: { [category: string]: IAttachmentMetadata[] } =
        {};

      // Processar cada categoria de anexos
      for (const [category, files] of Object.entries(attachments)) {
        console.log(`=== PROCESSANDO CATEGORIA: ${category} ===`);
        console.log("Arquivos na categoria:", files.length);

        if (files.length === 0) {
          console.log("Nenhum arquivo na categoria, pulando...");
          continue;
        }

        savedAttachments[category] = [];

        // Criar subpasta para a categoria usando o mapeamento correto
        let targetFolderPath: string;
        try {
          const subFolderName =
            ATTACHMENT_FOLDER_MAP[category] || category.toUpperCase();
          targetFolderPath = await this.ensureSubFolder(
            mainFolderName,
            subFolderName
          );
          console.log("Pasta de destino definida:", targetFolderPath);
        } catch (subFolderError) {
          console.warn(
            "Erro ao criar subpasta, usando pasta principal:",
            subFolderError
          );
          targetFolderPath = mainFolderName;
        }

        // Salvar cada arquivo na pasta/subpasta
        for (const fileMetadata of files) {
          if (fileMetadata.fileData && fileMetadata.fileData instanceof File) {
            try {
              console.log(`Salvando arquivo: ${fileMetadata.originalName}`);

              // Manter o nome original do arquivo
              const fileName = fileMetadata.originalName;
              const savedMetadata = await this.saveFileToFolder(
                fileMetadata.fileData,
                targetFolderPath,
                fileName,
                cnpj,
                nomeEmpresa,
                category,
                formularioId
              );

              savedAttachments[category].push(savedMetadata);
              console.log(`✅ Arquivo ${fileName} salvo com sucesso`);
            } catch (fileError) {
              console.error(
                `❌ Erro ao salvar arquivo ${fileMetadata.originalName}:`,
                fileError
              );

              // Tentar salvar na pasta principal como fallback
              try {
                console.log("Tentando fallback na pasta principal...");
                // Manter nome original também no fallback
                const fallbackFileName = fileMetadata.originalName;
                const fallbackMetadata = await this.saveFileToFolder(
                  fileMetadata.fileData as File,
                  mainFolderName,
                  fallbackFileName,
                  cnpj,
                  nomeEmpresa,
                  category,
                  formularioId
                );

                savedAttachments[category].push(fallbackMetadata);
                console.log(
                  `✅ Arquivo salvo com fallback: ${fallbackFileName}`
                );
              } catch (fallbackError) {
                console.error("❌ Fallback também falhou:", fallbackError);
                // Continuar com outros arquivos
              }
            }
          } else {
            console.warn("Arquivo não encontrado no metadata:", fileMetadata);
          }
        }
      }

      console.log("=== PROCESSO DE SALVAMENTO CONCLUÍDO ===");
      console.log("Categorias processadas:", Object.keys(savedAttachments));

      return savedAttachments;
    } catch (error) {
      console.error("=== ERRO GERAL AO SALVAR ANEXOS ===");
      console.error("Erro:", error);
      throw new Error(`Falha ao salvar anexos: ${error.message}`);
    }
  }

  /**
   * Garante que a pasta principal existe
   */
  private async ensureMainFolder(mainFolderName: string): Promise<void> {
    try {
      console.log(`=== VERIFICANDO PASTA PRINCIPAL: ${mainFolderName} ===`);

      try {
        // Tentar acessar a pasta para ver se já existe
        const existingFolder = await this.sp.web.lists
          .getByTitle(this.documentLibraryName)
          .rootFolder.folders.getByUrl(mainFolderName)();

        console.log("Pasta principal já existe:", existingFolder.Name);
      } catch {
        // Se não existe, criar a pasta principal
        console.log("Pasta principal não existe, criando...");

        const newFolder = await this.sp.web.lists
          .getByTitle(this.documentLibraryName)
          .rootFolder.folders.addUsingPath(mainFolderName);

        console.log("Pasta principal criada com sucesso:", newFolder.Name);
      }
    } catch (error) {
      console.error("Erro ao criar pasta principal:", error);
      throw new Error(`Falha ao criar pasta principal: ${error.message}`);
    }
  }

  /**
   * Garante que uma subpasta existe dentro da pasta principal
   */
  private async ensureSubFolder(
    mainFolderName: string,
    subFolderName: string
  ): Promise<string> {
    try {
      console.log(
        `=== CRIANDO SUBPASTA: ${subFolderName} DENTRO DE ${mainFolderName} ===`
      );

      // Primeiro, garantir que a pasta principal existe
      await this.ensureMainFolder(mainFolderName);

      const subFolderPath = `${mainFolderName}/${subFolderName}`;
      console.log("Caminho completo da subpasta:", subFolderPath);

      try {
        // Tentar acessar a subpasta para ver se já existe
        const existingFolder = await this.sp.web.lists
          .getByTitle(this.documentLibraryName)
          .rootFolder.folders.getByUrl(subFolderPath)();

        console.log("Subpasta já existe:", existingFolder.Name);
        return subFolderPath;
      } catch {
        // Se não existe, criar a subpasta
        console.log("Subpasta não existe, criando...");

        const newSubFolder = await this.sp.web.lists
          .getByTitle(this.documentLibraryName)
          .rootFolder.folders.addUsingPath(subFolderPath);

        console.log("Subpasta criada com sucesso:", newSubFolder.Name);
        return subFolderPath;
      }
    } catch (error) {
      console.error("Erro ao criar subpasta:", error);
      console.log("Fallback: usando apenas pasta principal");
      return mainFolderName;
    }
  }

  /**
   * Salva um arquivo em uma pasta específica
   */
  private async saveFileToFolder(
    file: File,
    folderPath: string,
    fileName: string,
    cnpj: string,
    nomeEmpresa: string,
    category: string,
    formularioId?: number
  ): Promise<IAttachmentMetadata> {
    try {
      console.log(`=== SALVANDO ARQUIVO: ${fileName} ===`);
      console.log("Pasta de destino:", folderPath);

      // Ler o arquivo como ArrayBuffer
      const fileBuffer = await file.arrayBuffer();
      console.log("Arquivo lido, tamanho:", fileBuffer.byteLength, "bytes");

      // Fazer upload do arquivo usando addUsingPath
      const fileAddResult = await this.sp.web.lists
        .getByTitle(this.documentLibraryName)
        .rootFolder.folders.getByUrl(folderPath)
        .files.addUsingPath(fileName, fileBuffer, { Overwrite: true });

      console.log("Arquivo salvo com sucesso:", fileAddResult.Name);
      // Retornar metadata do arquivo salvo
      const metadata: IAttachmentMetadata = {
        id: fileAddResult.UniqueId,
        fileName: fileName,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        url: fileAddResult.ServerRelativeUrl,
        uploadDate: new Date().toISOString(),
        category: category,
        sharepointItemId: undefined, // Será definido quando necessário
      };

      return metadata;
    } catch (error) {
      console.error(`Erro ao salvar arquivo ${fileName}:`, error);
      throw new Error(`Falha ao salvar arquivo: ${error.message}`);
    }
  }

  /**
   * Remove um arquivo da Document Library pelo ID do item
   */
  public async deleteFile(itemId: number): Promise<boolean> {
    try {
      await this.sp.web.lists
        .getByTitle(this.documentLibraryName)
        .items.getById(itemId)
        .delete();
      return true;
    } catch (error) {
      console.error("Erro ao deletar arquivo:", error);
      return false;
    }
  }

  /**
   * Lista todos os arquivos de um fornecedor
   */
  public async getFilesBySupplier(
    cnpj: string,
    nomeEmpresa: string
  ): Promise<IAttachmentMetadata[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle(this.documentLibraryName)
        .items.filter(`CNPJFornecedor eq '${cnpj}'`)
        .select(
          "Id",
          "FileLeafRef",
          "File/Name",
          "File/ServerRelativeUrl",
          "File/Length",
          "CNPJFornecedor",
          "NomeFornecedor",
          "CategoriaAnexo",
          "SubcategoriaAnexo",
          "DataUpload",
          "Created"
        )
        .expand("File")();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return items.map((item: any) => ({
        id: item.Id.toString(),
        fileName: item.FileLeafRef,
        originalName: item.File.Name,
        fileSize: item.File.Length,
        fileType: this.getFileTypeFromName(item.FileLeafRef),
        uploadDate: item.DataUpload || item.Created,
        category: item.CategoriaAnexo,
        subcategory: item.SubcategoriaAnexo,
        url: item.File.ServerRelativeUrl,
        sharepointItemId: item.Id,
      }));
    } catch (error) {
      console.error("Erro ao buscar arquivos do fornecedor:", error);
      return [];
    }
  }

  /**
   * Obter URL de download público para um arquivo
   */
  public async getFileDownloadUrl(fileUrl: string): Promise<string> {
    try {
      // Para SharePoint, a URL relativa já serve como download
      const siteUrl = (await this.sp.web.select("Url")()).Url;
      return `${siteUrl}${fileUrl}`;
    } catch (error) {
      console.error("Erro ao obter URL de download:", error);
      return fileUrl;
    }
  }

  /**
   * Limpa nome da empresa para usar como nome de pasta
   */
  private sanitizeFolderName(name: string): string {
    return name
      .replace(/[<>:"/\\|?*]/g, "") // Remove caracteres inválidos
      .replace(/\s+/g, "_") // Substitui espaços por underscore
      .substring(0, 30) // Limita tamanho para o nome do arquivo
      .toLowerCase();
  }

  /**
   * Determina tipo de arquivo baseado no nome
   */
  private getFileTypeFromName(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      txt: "text/plain",
    };

    return mimeTypes[extension || ""] || "application/octet-stream";
  }
}
