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
  private context: WebPartContext;

  constructor(context: WebPartContext, listName: string) {
    this.sp = spfi().using(SPFx(context));
    this.listName = listName;
    this.context = context;
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
        console.error(
          `Erro ao criar campo ${field.name} na Document Library:`,
          error
        );
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
      { name: "UsuarioPreenchimento", type: "User", required: false }, // Dados JSON
      { name: "ConformidadeLegalData", type: "Note", required: false },
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

    // Calcular percentual de conclusão
    const calculateCompletionPercentage = (): number => {
      let completed = 0;
      const totalSections = 4;

      // Verificar Dados Gerais
      if (dados.empresa && dados.cnpj && dados.numeroContrato) completed++;

      // Verificar Conformidade Legal
      if (
        formData.conformidadeLegal &&
        Object.keys(formData.conformidadeLegal).length > 0
      )
        completed++;

      // Verificar Serviços Especializados
      if (formData.servicosEspeciais) completed++;

      // Revisão Final não é considerada completa no salvamento (só na submissão)

      return Math.round((completed / totalSections) * 100);
    };

    // Contar anexos
    const countAttachments = (): number => {
      if (!attachments) return 0;
      return Object.keys(attachments).reduce((count, category) => {
        return count + (attachments[category]?.length || 0);
      }, 0);
    };

    // Capturar informações do usuário atual
    const userContext = (this as any).context?.pageContext?.user;

    // Criar JSON completo com todos os dados
    const dadosFormularioJSON = {
      versaoFormulario: "1.0",
      dataPreenchimento: new Date().toISOString(),
      usuarioInfo: {
        email: userContext?.email || "N/A",
        nome: userContext?.displayName || "Usuário Anônimo",
        loginName: userContext?.loginName || "N/A",
        isExternal: userContext?.isExternalGuestUser || false,
      },
      dadosGerais: formData.dadosGerais,
      conformidadeLegal: formData.conformidadeLegal,
      servicosEspeciais: formData.servicosEspeciais,
      anexos: formData.anexos || {},
      attachments: attachments || {},
      metadados: {
        totalAnexos: countAttachments(),
        percentualConclusao: calculateCompletionPercentage(),
        dataUltimaSalvamento: new Date().toISOString(),
        statusFormulario: "Em Andamento",
      },
    };

    // Mapear dados para as colunas da lista SharePoint (salvamento)
    const itemData = {
      // Campos principais
      Title: dados.empresa || "Formulário em Andamento",
      CNPJ: dados.cnpj || "",
      NumeroContrato: dados.numeroContrato || "",
      StatusAvaliacao: "Em Andamento", // Status indica que ainda está sendo preenchido
      DataCriacao: new Date().toISOString(),
      ResponsavelTecnico: dados.responsavelTecnico || "",
      GrauRisco: dados.grauRisco || "1",
      PercentualConclusao: calculateCompletionPercentage(),

      // JSON com todos os dados
      DadosFormulario: JSON.stringify(dadosFormularioJSON),

      // Informações do usuário
      UltimaModificacao: new Date().toISOString(),
      EmailPreenchimento: userContext?.email || "N/A",
      NomePreenchimento: userContext?.displayName || "Usuário Anônimo",

      // Observações iniciais vazias
      Observacoes: "",

      // Contagem de anexos
      AnexosCount: countAttachments(),
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
    // Se dados foram fornecidos, criar JSON atualizado
    let updateData: any = {
      UltimaModificacao: new Date().toISOString(),
    };

    if (formData) {
      const dados = formData.dadosGerais;

      // Calcular percentual de conclusão atualizado
      const calculateCompletionPercentage = (): number => {
        let completed = 0;
        const totalSections = 4;

        if (dados?.empresa && dados?.cnpj && dados?.numeroContrato) completed++;
        if (
          formData.conformidadeLegal &&
          Object.keys(formData.conformidadeLegal).length > 0
        )
          completed++;
        if (formData.servicosEspeciais) completed++;

        return Math.round((completed / totalSections) * 100);
      };

      // Capturar informações do usuário atual
      const userContext = this.context?.pageContext?.user;

      // Criar JSON atualizado
      const dadosFormularioJSON = {
        versaoFormulario: "1.0",
        dataUltimaAtualizacao: new Date().toISOString(),
        usuarioInfo: {
          email: userContext?.email || "N/A",
          nome: userContext?.displayName || "Usuário Anônimo",
          loginName: userContext?.loginName || "N/A",
          isExternal: userContext?.isExternalGuestUser || false,
        },
        dadosGerais: formData.dadosGerais || {},
        conformidadeLegal: formData.conformidadeLegal || {},
        servicosEspeciais: formData.servicosEspeciais || {},
        anexos: formData.anexos || {},
        metadados: {
          percentualConclusao: calculateCompletionPercentage(),
          dataUltimaAtualizacao: new Date().toISOString(),
          statusFormulario: "Em Andamento",
        },
      };

      // Atualizar campos específicos se fornecidos
      if (dados) {
        if (dados.empresa) updateData.Title = dados.empresa;
        if (dados.cnpj) updateData.CNPJ = dados.cnpj;
        if (dados.numeroContrato)
          updateData.NumeroContrato = dados.numeroContrato;
        if (dados.responsavelTecnico)
          updateData.ResponsavelTecnico = dados.responsavelTecnico;
        if (dados.grauRisco) updateData.GrauRisco = dados.grauRisco;
      }

      updateData.PercentualConclusao = calculateCompletionPercentage();
      updateData.DadosFormulario = JSON.stringify(dadosFormularioJSON);
    }

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
    await this.ensureListExists();

    const dados = formData.dadosGerais;

    // Calcular percentual de conclusão
    const calculateCompletionPercentage = (): number => {
      let completed = 0;
      const totalSections = 4;

      // Verificar Dados Gerais
      if (dados.empresa && dados.cnpj && dados.numeroContrato) completed++;

      // Verificar Conformidade Legal
      if (
        formData.conformidadeLegal &&
        Object.keys(formData.conformidadeLegal).length > 0
      )
        completed++;

      // Verificar Serviços Especializados
      if (formData.servicosEspeciais) completed++;

      // Revisão Final é considerada completa no momento da submissão
      completed++;

      return Math.round((completed / totalSections) * 100);
    };

    // Contar anexos
    const countAttachments = (): number => {
      if (!attachments) return 0;
      return Object.keys(attachments).reduce((count, category) => {
        return count + (attachments[category]?.length || 0);
      }, 0);
    };

    // Capturar informações do usuário atual
    const userContext = (this as any).context?.pageContext?.user;

    // Criar JSON completo com todos os dados
    const dadosFormularioJSON = {
      versaoFormulario: "1.0",
      dataPreenchimento: new Date().toISOString(),
      usuarioInfo: {
        email: userContext?.email || "N/A",
        nome: userContext?.displayName || "Usuário Anônimo",
        loginName: userContext?.loginName || "N/A",
        isExternal: userContext?.isExternalGuestUser || false,
      },
      dadosGerais: formData.dadosGerais,
      conformidadeLegal: formData.conformidadeLegal,
      servicosEspeciais: formData.servicosEspeciais,
      anexos: formData.anexos || {},
      attachments: attachments || {},
      metadados: {
        totalAnexos: countAttachments(),
        percentualConclusao: calculateCompletionPercentage(),
        dataSubmissao: new Date().toISOString(),
        statusFormulario: "Enviado",
      },
    };

    // Mapear dados para as colunas da lista SharePoint
    const itemData = {
      // Campos principais (baseados nas colunas que você criou)
      Title: dados.empresa, // Nome da empresa
      CNPJ: dados.cnpj,
      NumeroContrato: dados.numeroContrato,
      StatusAvaliacao: "Enviado", // Status da avaliação
      DataEnvio: new Date().toISOString(),
      DataCriacao: new Date().toISOString(),
      ResponsavelTecnico: dados.responsavelTecnico,
      GrauRisco: dados.grauRisco,
      PercentualConclusao: calculateCompletionPercentage(),

      // JSON com todos os dados
      DadosFormulario: JSON.stringify(dadosFormularioJSON),

      // Informações do usuário
      UltimaModificacao: new Date().toISOString(),
      EmailPreenchimento: userContext?.email || "N/A",
      NomePreenchimento: userContext?.displayName || "Usuário Anônimo",

      // Observações iniciais vazias (para a Oceaneering preencher depois)
      Observacoes: "",

      // Contagem de anexos
      AnexosCount: countAttachments(),

      // Campos de auditoria automáticos do SharePoint
      Modificado: new Date().toISOString(),
      Criado: new Date().toISOString(),
    };

    try {
      const result = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.add(itemData);

      console.log("Formulário HSE enviado com sucesso! ID:", result.data.Id);
      return result.data.Id;
    } catch (error) {
      console.error("Erro ao enviar formulário HSE:", error);
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
      dataUltimaModificacao: item.Modified
        ? new Date(item.Modified)
        : undefined,
      dadosGerais: {
        empresa: item.Empresa || "",
        cnpj: item.CNPJ || "",
        numeroContrato: item.NumeroContrato || "",
        dataInicioContrato: item.DataInicioContrato
          ? new Date(item.DataInicioContrato)
          : undefined,
        dataTerminoContrato: item.DataTerminoContrato
          ? new Date(item.DataTerminoContrato)
          : undefined,
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
      servicosEspeciais: JSON.parse(item.ServicosEspeciais || "{}"),
      outrasAcoes: item.OutrasAcoes,
      comentariosFinais: item.ComentariosFinais,
      justificativasNA: item.JustificativasNA,
      anexos: JSON.parse(item.Anexos || "{}"),
    };
  }
}
