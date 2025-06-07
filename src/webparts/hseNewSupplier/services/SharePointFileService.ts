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

export class SharePointFileService {
  private sp: any;
  private documentLibraryName: string;

  constructor(context: WebPartContext, documentLibraryName: string = "HSEAttachments") {
    this.sp = spfi().using(SPFx(context));
    this.documentLibraryName = documentLibraryName;
  }

  /**
   * Garante que a Document Library existe
   */
  public async ensureDocumentLibraryExists(): Promise<void> {
    try {
      // Verificar se a biblioteca existe
      await this.sp.web.lists.getByTitle(this.documentLibraryName).select("Id")();
      console.log(`Document Library ${this.documentLibraryName} já existe`);
    } catch (error) {
      // Biblioteca não existe, criar
      console.log(`Criando Document Library ${this.documentLibraryName}...`);
      await this.createDocumentLibrary();
    }
  }

  /**
   * Cria a Document Library para anexos HSE
   */
  private async createDocumentLibrary(): Promise<void> {
    const libraryCreationInfo = {
      Title: this.documentLibraryName,
      Description: "Biblioteca de documentos para anexos do formulário HSE",
      BaseTemplate: 101, // Document Library template
    };

    const library = await this.sp.web.lists.add(libraryCreationInfo);
    
    // Adicionar campos customizados para metadados
    await this.addCustomFields(library);
  }

  /**
   * Adiciona campos customizados à Document Library
   */
  private async addCustomFields(library: any): Promise<void> {
    const fields = [
      { name: "CNPJFornecedor", type: "Text", required: false },
      { name: "NomeFornecedor", type: "Text", required: false },
      { name: "NumeroContrato", type: "Text", required: false },
      { name: "CategoriaAnexo", type: "Text", required: false },
      { name: "SubcategoriaAnexo", type: "Text", required: false },
      { name: "FormularioID", type: "Number", required: false },
      { name: "TamanhoArquivo", type: "Number", required: false },
      { name: "DataUpload", type: "DateTime", required: false },
    ];

    for (const field of fields) {
      try {
        await library.fields.add(field.name, field.type, {
          Required: field.required || false,
        });
      } catch (error) {
        console.error(`Erro ao criar campo ${field.name}:`, error);
      }
    }
  }

  /**
   * Cria ou garante que existe uma pasta para o fornecedor
   */
  public async ensureFolderExists(cnpj: string, nomeEmpresa: string): Promise<string> {
    await this.ensureDocumentLibraryExists();

    // Limpar nome da empresa para usar como nome de pasta
    const nomeLimpo = this.sanitizeFolderName(nomeEmpresa);
    const folderName = `${cnpj}_${nomeLimpo}`;

    try {
      // Verificar se a pasta já existe
      await this.sp.web.lists
        .getByTitle(this.documentLibraryName)
        .rootFolder
        .folders
        .getByName(folderName)
        .select("Name")();
      
      console.log(`Pasta ${folderName} já existe`);
      return folderName;
    } catch (error) {
      // Pasta não existe, criar
      console.log(`Criando pasta ${folderName}...`);
      
      await this.sp.web.lists
        .getByTitle(this.documentLibraryName)
        .rootFolder
        .folders
        .add(folderName);
      
      return folderName;
    }
  }
  /**
   * Faz upload de um arquivo para a pasta do fornecedor
   */
  public async uploadFile(
    file: File,
    cnpj: string,
    nomeEmpresa: string,
    categoria: string,
    subcategoria?: string,
    formularioId?: number
  ): Promise<IAttachmentMetadata> {
    try {
      // Garantir que a pasta existe
      const folderName = await this.ensureFolderExists(cnpj, nomeEmpresa);
      
      // Gerar nome único para o arquivo
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${categoria}_${subcategoria || 'default'}_${timestamp}.${fileExtension}`;
      
      // Converter arquivo para ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
        // Fazer upload do arquivo
      const uploadResult: any = await this.sp.web.lists
        .getByTitle(this.documentLibraryName)
        .rootFolder
        .folders
        .getByName(folderName)
        .files
        .add(fileName, arrayBuffer, true);

      // Atualizar metadados do arquivo
      await uploadResult.file.listItemAllFields.update({
        CNPJFornecedor: cnpj,
        NomeFornecedor: nomeEmpresa,
        CategoriaAnexo: categoria,
        SubcategoriaAnexo: subcategoria || '',
        FormularioID: formularioId,
        TamanhoArquivo: file.size,
        DataUpload: new Date().toISOString(),
      });

      // Obter URL do arquivo
      const fileUrl = uploadResult.data.ServerRelativeUrl;
      
      // Criar metadata do anexo
      const metadata: IAttachmentMetadata = {
        id: uploadResult.data.UniqueId,
        fileName: fileName,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadDate: new Date().toISOString(),
        category: categoria,
        subcategory: subcategoria,
        url: fileUrl,
        sharepointItemId: uploadResult.data.ListItemAllFields?.Id,
      };

      return metadata;

    } catch (error) {
      console.error("Erro ao fazer upload do arquivo:", error);
      throw new Error(error.message || "Erro desconhecido ao fazer upload");
    }
  }
  /**
   * Remove um arquivo da Document Library pelo ID do item
   */
  public async deleteFile(itemId: number): Promise<boolean> {
    try {
      await this.sp.web.lists
        .getByTitle(this.documentLibraryName)
        .items
        .getById(itemId)
        .delete();
      return true;
    } catch (error) {
      console.error("Erro ao deletar arquivo:", error);
      return false;
    }
  }

  /**
   * Lista todos os arquivos de um fornecedor
   */  public async getFilesBySupplier(cnpj: string, nomeEmpresa: string): Promise<IAttachmentMetadata[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle(this.documentLibraryName)
        .items
        .filter(`CNPJFornecedor eq '${cnpj}'`)
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
      .replace(/[<>:"/\\|?*]/g, '') // Remove caracteres inválidos
      .replace(/\s+/g, '_') // Substitui espaços por underscore
      .substring(0, 50) // Limita tamanho
      .toLowerCase();
  }

  /**
   * Determina tipo de arquivo baseado no nome
   */
  private getFileTypeFromName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }
}
