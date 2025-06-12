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

// Interface para callback de progresso
export interface IProgressCallback {
  onProgress: (step: string, percent: number) => void;
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
    formularioId?: number,
    progressCallback?: IProgressCallback
  ): Promise<{ [category: string]: IAttachmentMetadata[] }> {
    try {
      console.log("=== SALVANDO ANEXOS DO FORMULÁRIO ===");
      console.log("CNPJ:", cnpj);
      console.log("Empresa:", nomeEmpresa);
      console.log("Anexos recebidos:", Object.keys(attachments));

      progressCallback?.onProgress(
        "Verificando biblioteca de documentos...",
        5
      );

      // Verificar se a biblioteca existe
      const libraryExists = await this.checkDocumentLibraryExists();
      if (!libraryExists) {
        throw new Error(
          `Document Library '${this.documentLibraryName}' não encontrada`
        );
      }

      progressCallback?.onProgress("Criando estrutura de pastas...", 10);

      // Criar nome da pasta principal (remover pontos e barras do CNPJ)
      const cleanCNPJ = cnpj.replace(/[.\-/]/g, "");
      const mainFolderName = `${cleanCNPJ}-${this.sanitizeFolderName(
        nomeEmpresa
      )}`;
      console.log("Pasta principal:", mainFolderName);

      // Garantir que a pasta principal existe
      await this.ensureMainFolder(mainFolderName);
      progressCallback?.onProgress("Pasta principal criada...", 15);

      const savedAttachments: { [category: string]: IAttachmentMetadata[] } =
        {}; // Calcular progresso baseado no número de categorias e arquivos
      const totalCategories = Object.keys(attachments).filter(
        (key) => attachments[key].length > 0
      ).length;
      const totalFiles = Object.values(attachments).reduce(
        (acc, files) => acc + files.length,
        0
      );
      let processedCategories = 0;
      let processedFiles = 0;

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
        const subFolderName =
          ATTACHMENT_FOLDER_MAP[category] || category.toUpperCase();
        console.log(
          `Criando subpasta: ${subFolderName} para categoria: ${category}`
        );

        const folderProgress =
          20 + (processedCategories / totalCategories) * 30;
        progressCallback?.onProgress(
          `Criando pasta ${subFolderName}...`,
          folderProgress
        );

        const targetFolderPath = await this.ensureSubFolder(
          mainFolderName,
          subFolderName
        );
        console.log("✅ Pasta de destino confirmada:", targetFolderPath);

        // TIMING FIX: Aguardar mais 2 segundos após confirmar subpasta antes de salvar arquivos
        console.log(
          "⏳ Aguardando 2 segundos antes de iniciar upload dos arquivos..."
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Salvar cada arquivo na subpasta
        for (const fileMetadata of files) {
          if (fileMetadata.fileData && fileMetadata.fileData instanceof File) {
            console.log(
              `📁 Salvando arquivo: ${fileMetadata.originalName} na pasta: ${targetFolderPath}`
            );

            const fileProgress = 50 + (processedFiles / totalFiles) * 45;
            progressCallback?.onProgress(
              `Salvando ${fileMetadata.originalName}...`,
              fileProgress
            );

            const savedMetadata = await this.saveFileToFolder(
              fileMetadata.fileData,
              targetFolderPath,
              fileMetadata.originalName,
              cnpj,
              nomeEmpresa,
              category,
              formularioId
            );

            savedAttachments[category].push(savedMetadata);
            console.log(
              `✅ Arquivo ${fileMetadata.originalName} salvo com sucesso na subpasta ${subFolderName}`
            );

            processedFiles++;
          } else {
            console.warn("Arquivo não encontrado no metadata:", fileMetadata);
            processedFiles++;
          }
        }

        processedCategories++;
      }

      progressCallback?.onProgress("Finalizando processo...", 95);
      console.log("=== PROCESSO DE SALVAMENTO CONCLUÍDO ===");
      console.log("Categorias processadas:", Object.keys(savedAttachments));

      progressCallback?.onProgress("Upload concluído!", 100);

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
    console.log(
      `=== CRIANDO SUBPASTA: ${subFolderName} DENTRO DE ${mainFolderName} ===`
    );

    // Primeiro, garantir que a pasta principal existe
    await this.ensureMainFolder(mainFolderName);

    const subFolderPath = `${mainFolderName}/${subFolderName}`;
    console.log("📁 Caminho completo da subpasta:", subFolderPath);

    try {
      // Tentar acessar a subpasta para ver se já existe
      await this.sp.web.lists
        .getByTitle(this.documentLibraryName)
        .rootFolder.folders.getByUrl(subFolderPath)();

      console.log("✅ Subpasta já existe:", subFolderPath);
      return subFolderPath;
    } catch {
      // Se não existe, criar a subpasta usando método que funciona (via pasta pai)
      console.log("🔄 Subpasta não existe, criando via pasta pai...");

      try {
        const parentFolder = await this.sp.web.lists
          .getByTitle(this.documentLibraryName)
          .rootFolder.folders.getByUrl(mainFolderName);
        const newSubFolder = await parentFolder.folders.addUsingPath(
          subFolderName
        );
        console.log("✅ Subpasta criada via pasta pai:", newSubFolder.Name);

        // TIMING FIX: Aguardar 3 segundos para SharePoint processar completamente
        console.log("⏳ Aguardando 3 segundos para SharePoint processar...");
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Confirmar que a pasta existe e está acessível usando método mais robusto
        try {
          await this.sp.web.lists
            .getByTitle(this.documentLibraryName)
            .rootFolder.folders.getByUrl(subFolderPath)();

          console.log(
            "✅ Subpasta confirmada e pronta para uso:",
            subFolderPath
          );
        } catch (confirmError) {
          console.warn(
            "⚠️ Não foi possível confirmar subpasta, mas ela foi criada:",
            confirmError.message
          );
          console.log("🔄 Tentando confirmar via pasta pai...");

          // Tentar confirmar via pasta pai como alternativa
          try {
            const confirmedFolder = await parentFolder.folders.getByUrl(
              subFolderName
            )();
            console.log(
              "✅ Subpasta confirmada via pasta pai:",
              confirmedFolder.Name
            );
          } catch (confirmError2) {
            console.warn(
              "⚠️ Confirmação alternativa falhou, mas prosseguindo:",
              confirmError2.message
            );
          }
        }

        return subFolderPath;
      } catch (createError) {
        console.error(
          "❌ FALHA CRÍTICA: Não foi possível criar subpasta",
          subFolderName
        );
        console.error("Erro:", createError);

        throw new Error(
          `Falha crítica ao criar subpasta ${subFolderName}. ` +
            `Erro: ${createError.message}`
        );
      }
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
      console.log("📁 Pasta de destino:", folderPath);

      // Verificar se temos permissão na biblioteca primeiro
      try {
        const libraryInfo = await this.sp.web.lists
          .getByTitle(this.documentLibraryName)
          .select("Id", "Title", "BasePermissions")();
        console.log("📚 Informações da biblioteca:", libraryInfo);
      } catch (permError) {
        console.error(
          "❌ Erro ao verificar permissões da biblioteca:",
          permError
        );
      }

      // Ler o arquivo como ArrayBuffer
      const fileBuffer = await file.arrayBuffer();
      console.log("📄 Arquivo lido, tamanho:", fileBuffer.byteLength, "bytes");

      // AGUARDAR ADICIONAL: Garantir que pasta está pronta para receber arquivos
      console.log(
        "⏳ Aguardando 2 segundos para garantir que pasta está pronta..."
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Upload via pasta pai (sem checar via .select() ou getByUrl antes)
      console.log("🔄 Upload via pasta pai (método único e confiável)...");
      try {
        // Obter referência da pasta principal
        const mainFolderName = folderPath.split("/")[0];
        const subFolderName = folderPath.split("/")[1];
        const parentFolder = await this.sp.web.lists
          .getByTitle(this.documentLibraryName)
          .rootFolder.folders.getByUrl(mainFolderName);
        const targetFolder = parentFolder.folders.getByUrl(subFolderName);

        // Upload via pasta pai
        await targetFolder.files.addUsingPath(fileName, fileBuffer, {
          Overwrite: true,
        });
        console.log("✅ Upload via pasta pai bem-sucedido");
      } catch (uploadError) {
        console.error("❌ Falha no upload via pasta pai:", uploadError);
        throw new Error(
          `Falha ao fazer upload do arquivo ${fileName} na pasta ${folderPath}. ` +
            `Erro: ${uploadError.message}`
        );
      }

      // Obter informações detalhadas do arquivo salvo via pasta pai
      const mainFolderName = folderPath.split("/")[0];
      const subFolderName = folderPath.split("/")[1];
      const parentFolder = await this.sp.web.lists
        .getByTitle(this.documentLibraryName)
        .rootFolder.folders.getByUrl(mainFolderName);
      const targetFolder = parentFolder.folders.getByUrl(subFolderName);
      const fileInfo = await targetFolder.files
        .getByUrl(fileName)
        .select("Name", "ServerRelativeUrl", "UniqueId", "Length")();

      console.log("✅ Arquivo salvo com sucesso:", fileInfo.Name);
      console.log("📍 Localização final:", fileInfo.ServerRelativeUrl);

      // Retornar metadata do arquivo salvo
      const metadata: IAttachmentMetadata = {
        id: fileInfo.UniqueId,
        fileName: fileName,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type || this.getFileTypeFromName(file.name),
        url: fileInfo.ServerRelativeUrl,
        uploadDate: new Date().toISOString(),
        category: category,
        sharepointItemId: undefined,
      };

      return metadata;
    } catch (error) {
      console.error(
        `❌ Erro ao salvar arquivo ${fileName} na pasta ${folderPath}:`,
        error
      );
      throw new Error(`Falha ao salvar arquivo ${fileName}: ${error.message}`);
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
      .replace(/[<>:"/\\|?*]/g, "") // Removes invalid characters
      .replace(/\s+/g, "_") // Replaces spaces with underscores
      .substring(0, 30) // Limits the length for the file name
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
