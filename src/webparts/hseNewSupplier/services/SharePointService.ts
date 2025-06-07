import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import { IHSEFormData } from "../types/IHSEFormData";

export class SharePointService {
  private sp: any;
  private listName: string;

  constructor(context: WebPartContext, listName: string) {
    this.sp = spfi().using(SPFx(context));
    this.listName = listName;
  }

  public async ensureListExists(): Promise<void> {
    try {
      // Verificar se a lista existe
      await this.sp.web.lists.getByTitle(this.listName).select("Id")();
      console.log(`Lista ${this.listName} já existe`);
    } catch (error) {
      // Lista não existe, criar
      console.log(`Criando lista ${this.listName}...`);
      await this.createHSEList();
    }

    // Garantir que a Document Library também existe
    await this.ensureDocumentLibraryExists();
  }

  /**
   * Garante que a Document Library HSEAttachments existe
   */
  public async ensureDocumentLibraryExists(): Promise<void> {
    const documentLibraryName = "HSEAttachments";

    try {
      // Verificar se a biblioteca existe
      await this.sp.web.lists.getByTitle(documentLibraryName).select("Id")();
      console.log(`Document Library ${documentLibraryName} já existe`);
    } catch (error) {
      // Biblioteca não existe, criar
      console.log(`Criando Document Library ${documentLibraryName}...`);
      await this.createDocumentLibrary(documentLibraryName);
    }
  }

  /**
   * Cria a Document Library para anexos HSE
   */
  private async createDocumentLibrary(libraryName: string): Promise<void> {
    const libraryCreationInfo = {
      Title: libraryName,
      Description: "Biblioteca de documentos para anexos do formulário HSE",
      BaseTemplate: 101, // Document Library template
    };

    const library = await this.sp.web.lists.add(libraryCreationInfo);

    // Adicionar campos customizados para metadados
    await this.addDocumentLibraryFields(library);
  }

  /**
   * Adiciona campos customizados à Document Library
   */
  private async addDocumentLibraryFields(library: any): Promise<void> {
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
        console.error(`Erro ao criar campo ${field.name} na Document Library:`, error);
      }
    }
  }

  private async createHSEList(): Promise<void> {
    // Criar lista
    const listCreationInfo = {
      Title: this.listName,
      Description:
        "Lista para armazenar dados do formulário HSE de fornecedores",
      BaseTemplate: 100, // Lista customizada
    };

    const list = await this.sp.web.lists.add(listCreationInfo);

    // Adicionar campos customizados
    await this.addListFields(list);
  }

  private async addListFields(list: any): Promise<void> {
    const fields = [
      // Dados Gerais
      { name: "Empresa", type: "Text", required: true },
      { name: "CNPJ", type: "Text", required: true },
      { name: "NumeroContrato", type: "Text", required: true },
      { name: "DataInicioContrato", type: "DateTime", required: true },
      { name: "DataTerminoContrato", type: "DateTime", required: true },
      { name: "EscopoServico", type: "Note", required: false },
      { name: "ResponsavelTecnico", type: "Text", required: true },
      { name: "AtividadePrincipalCNAE", type: "Text", required: false },
      { name: "TotalEmpregados", type: "Number", required: false },
      { name: "EmpregadosParaServico", type: "Number", required: false },
      { name: "GrauRisco", type: "Number", required: true },
      { name: "PossuiSESMT", type: "Boolean", required: false },
      { name: "NumeroComponentesSESMT", type: "Number", required: false },
      { name: "GerenteContratoMarine", type: "Text", required: true },

      // Status e Metadados
      {
        name: "StatusFormulario",
        type: "Choice",
        choices: [
          "Rascunho",
          "Submetido",
          "Em Análise",
          "Aprovado",
          "Rejeitado",
        ],
      },
      { name: "DataCriacao", type: "DateTime", required: false },
      { name: "DataUltimaModificacao", type: "DateTime", required: false },
      { name: "UsuarioPreenchimento", type: "User", required: false },

      // Dados JSON
      { name: "ConformidadeLegalData", type: "Note", required: false },
      { name: "EvidenciasData", type: "Note", required: false },
      { name: "EmbarcacoesData", type: "Note", required: false },
      { name: "IcamentoData", type: "Note", required: false },

      // Serviços Especializados
      { name: "FornecedorEmbarcacoes", type: "Boolean", required: false },
      { name: "FornecedorIcamento", type: "Boolean", required: false },
    ];

    for (const field of fields) {
      try {
        if (field.type === "Choice") {
          await list.fields.addChoice(field.name, {
            Choices: (field as any).choices,
            Required: (field as any).required || false,
          });
        } else if (field.type === "User") {
          await list.fields.addUser(field.name, {
            Required: (field as any).required || false,
          });
        } else {
          await list.fields.add(field.name, field.type, {
            Required: (field as any).required || false,
          });
        }
      } catch (error) {
        console.error(`Erro ao criar campo ${field.name}:`, error);
      }
    }
  }

  public async saveFormData(
    formData: IHSEFormData,
    attachments: any
  ): Promise<number> {
    await this.ensureListExists();

    const dados = formData.dadosGerais;
    const servicos = formData.servicosEspeciais;

    const itemData = {
      Title: `${dados.empresa} - ${dados.numeroContrato}`,
      Empresa: dados.empresa,
      CNPJ: dados.cnpj,
      NumeroContrato: dados.numeroContrato,
      DataInicioContrato: dados.dataInicioContrato,
      DataTerminoContrato: dados.dataTerminoContrato,
      EscopoServico: dados.escopoServico,
      ResponsavelTecnico: dados.responsavelTecnico,
      AtividadePrincipalCNAE: dados.atividadePrincipalCNAE,
      TotalEmpregados: dados.totalEmpregados,
      EmpregadosParaServico: dados.empregadosParaServico,
      GrauRisco: dados.grauRisco,
      PossuiSESMT: dados.possuiSESMT,
      NumeroComponentesSESMT: dados.numeroComponentesSESMT,
      GerenteContratoMarine: dados.gerenteContratoMarine,
      StatusFormulario: "Submetido",
      DataCriacao: new Date().toISOString(),
      DataUltimaModificacao: new Date().toISOString(),
      ConformidadeLegalData: JSON.stringify(formData.conformidadeLegal),
      EvidenciasData: JSON.stringify(attachments),
      EmbarcacoesData: JSON.stringify(servicos.embarcacoes),
      IcamentoData: JSON.stringify(servicos.icamento),
      FornecedorEmbarcacoes: servicos.fornecedorEmbarcacoes,
      FornecedorIcamento: servicos.fornecedorIcamento,
    };

    const result = await this.sp.web.lists
      .getByTitle(this.listName)
      .items.add(itemData);
    return result.data.Id;
  }

  public async updateFormData(
    itemId: number,
    formData: Partial<IHSEFormData>
  ): Promise<void> {
    const updateData = {
      ...formData,
      DataUltimaModificacao: new Date().toISOString(),
    };

    await this.sp.web.lists
      .getByTitle(this.listName)
      .items.getById(itemId)
      .update(updateData);
  }

  public async getFormData(itemId: number): Promise<any> {
    return await this.sp.web.lists
      .getByTitle(this.listName)
      .items.getById(itemId)
      .get();
  }

  public async getFormById(id: number): Promise<IHSEFormData | null> {
    try {
      const item = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.getById(id)
        .get();

      return this.mapSharePointItemToFormData(item);
    } catch (error) {
      console.error(`Erro ao buscar formulário com ID ${id}:`, error);
      return null;
    }
  }
  public async submitFormData(
    formData: IHSEFormData,
    attachments: { [category: string]: any[] }
  ): Promise<number> {
    try {
      // Primeiro, salvar os dados do formulário
      const itemId = await this.saveFormData(formData, attachments);

      // Atualizar status para "Enviado"
      await this.updateFormData(itemId, {
        statusFormulario: "Enviado",
        dataUltimaModificacao: new Date(),
      });

      return itemId;
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      throw error;
    }
  }

  private mapSharePointItemToFormData(item: any): IHSEFormData {
    // Mapear item do SharePoint para interface IHSEFormData
    return {
      id: item.Id,
      statusFormulario: item.StatusFormulario || "Rascunho",
      usuarioPreenchimento: item.UsuarioPreenchimento,
      dataCriacao: item.Created ? new Date(item.Created) : undefined,
      dataUltimaModificacao: item.Modified ? new Date(item.Modified) : undefined,
      dadosGerais: {
        empresa: item.Empresa || "",
        cnpj: item.CNPJ || "",
        numeroContrato: item.NumeroContrato || "",
        dataInicioContrato: item.DataInicioContrato ? new Date(item.DataInicioContrato) : undefined,
        dataTerminoContrato: item.DataTerminoContrato ? new Date(item.DataTerminoContrato) : undefined,
        escopoServico: item.EscopoServico || "",
        responsavelTecnico: item.ResponsavelTecnico || "",
        atividadePrincipalCNAE: item.AtividadePrincipalCNAE || "",
        totalEmpregados: item.TotalEmpregados,
        empregadosParaServico: item.EmpregadosParaServico,
        grauRisco: item.GrauRisco || "1",
        possuiSESMT: item.PossuiSESMT || false,
        numeroComponentesSESMT: item.NumeroComponentesSESMT,
        gerenteContratoMarine: item.GerenteContratoMarine || "",
      },
      conformidadeLegal: JSON.parse(item.ConformidadeLegal || "{}"),
      evidencias: JSON.parse(item.Evidencias || "{}"),
      servicosEspeciais: JSON.parse(item.ServicosEspeciais || "{}"),
      outrasAcoes: item.OutrasAcoes,
      comentariosFinais: item.ComentariosFinais,
      justificativasNA: item.JustificativasNA,
      anexos: JSON.parse(item.Anexos || "{}"),
    };
  }
}
