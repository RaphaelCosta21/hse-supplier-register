import { sp } from "@pnp/sp/presets/all";
import { IItemAddResult, IItemUpdateResult } from "@pnp/sp/items";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IHSEFormData, IFormState } from "../types/IHSEFormData";

export class SharePointService {
  private context: WebPartContext;
  private listName: string;
  private siteUrl: string;

  constructor(context: WebPartContext, listName: string = "hsenewregister") {
    this.context = context;
    this.listName = listName;
    this.siteUrl = context.pageContext.web.absoluteUrl;

    // Configurar PnPjs
    sp.setup({
      spfxContext: context,
    });
  }

  /**
   * Salva um novo formulário HSE na lista SharePoint
   * @param formData Dados do formulário
   */
  public async saveForm(
    formData: IHSEFormData
  ): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      // Preparar dados para salvar na lista
      const listItem = this.prepareListItem(formData);

      // Salvar na lista SharePoint
      const result: IItemAddResult = await sp.web.lists
        .getByTitle(this.listName)
        .items.add(listItem);

      if (result.data) {
        return {
          success: true,
          id: result.data.Id,
        };
      } else {
        return {
          success: false,
          error: "Erro ao salvar: resposta inválida do SharePoint",
        };
      }
    } catch (error) {
      console.error("Erro ao salvar formulário no SharePoint:", error);
      return {
        success: false,
        error: `Erro ao salvar: ${error.message || "Erro desconhecido"}`,
      };
    }
  }

  /**
   * Atualiza um formulário existente na lista SharePoint
   * @param id ID do item na lista
   * @param formData Dados do formulário
   */
  public async updateForm(
    id: number,
    formData: IHSEFormData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Preparar dados para atualização
      const listItem = this.prepareListItem(formData);

      // Atualizar na lista SharePoint
      const result: IItemUpdateResult = await sp.web.lists
        .getByTitle(this.listName)
        .items.getById(id)
        .update(listItem);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Erro ao atualizar formulário no SharePoint:", error);
      return {
        success: false,
        error: `Erro ao atualizar: ${error.message || "Erro desconhecido"}`,
      };
    }
  }

  /**
   * Recupera um formulário específico da lista SharePoint
   * @param id ID do item na lista
   */
  public async getForm(
    id: number
  ): Promise<{ success: boolean; data?: IHSEFormData; error?: string }> {
    try {
      const item = await sp.web.lists
        .getByTitle(this.listName)
        .items.getById(id)
        .get();

      if (item) {
        const formData = this.parseListItem(item);
        return {
          success: true,
          data: formData,
        };
      } else {
        return {
          success: false,
          error: "Formulário não encontrado",
        };
      }
    } catch (error) {
      console.error("Erro ao recuperar formulário do SharePoint:", error);
      return {
        success: false,
        error: `Erro ao recuperar: ${error.message || "Erro desconhecido"}`,
      };
    }
  }

  /**
   * Lista todos os formulários do usuário atual
   */
  public async getUserForms(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const currentUser = this.context.pageContext.user.loginName;

      const items = await sp.web.lists
        .getByTitle(this.listName)
        .items.select(
          "Id",
          "Title",
          "StatusFormulario",
          "DataCriacao",
          "DataUltimaModificacao",
          "CNPJ",
          "NumeroContrato"
        )
        .filter(`UsuarioPreenchimento eq '${currentUser}'`)
        .orderBy("DataUltimaModificacao", false)
        .get();

      return {
        success: true,
        data: items,
      };
    } catch (error) {
      console.error("Erro ao listar formulários do usuário:", error);
      return {
        success: false,
        error: `Erro ao listar: ${error.message || "Erro desconhecido"}`,
      };
    }
  }

  /**
   * Verifica se já existe um formulário com o mesmo CNPJ e número de contrato
   * @param cnpj CNPJ da empresa
   * @param numeroContrato Número do contrato
   * @param excludeId ID a ser excluído da verificação (para atualizações)
   */
  public async checkDuplicate(
    cnpj: string,
    numeroContrato: string,
    excludeId?: number
  ): Promise<{ exists: boolean; id?: number }> {
    try {
      let filter = `CNPJ eq '${cnpj}' and NumeroContrato eq '${numeroContrato}'`;

      if (excludeId) {
        filter += ` and Id ne ${excludeId}`;
      }

      const items = await sp.web.lists
        .getByTitle(this.listName)
        .items.select("Id")
        .filter(filter)
        .get();

      return {
        exists: items.length > 0,
        id: items.length > 0 ? items[0].Id : undefined,
      };
    } catch (error) {
      console.error("Erro ao verificar duplicatas:", error);
      return { exists: false };
    }
  }

  /**
   * Salva um rascunho temporário (auto-save)
   * @param formData Dados do formulário
   */
  public async saveDraft(
    formData: IHSEFormData
  ): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      // Forçar status como rascunho
      formData.statusFormulario = "Rascunho";

      if (formData.id) {
        // Atualizar rascunho existente
        const result = await this.updateForm(formData.id, formData);
        return {
          success: result.success,
          id: formData.id,
          error: result.error,
        };
      } else {
        // Criar novo rascunho
        return await this.saveForm(formData);
      }
    } catch (error) {
      console.error("Erro ao salvar rascunho:", error);
      return {
        success: false,
        error: `Erro ao salvar rascunho: ${
          error.message || "Erro desconhecido"
        }`,
      };
    }
  }

  /**
   * Envia o formulário (muda status para "Enviado")
   * @param id ID do formulário
   */
  public async submitForm(
    id: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await sp.web.lists.getByTitle(this.listName).items.getById(id).update({
        StatusFormulario: "Enviado",
        DataUltimaModificacao: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      return {
        success: false,
        error: `Erro ao enviar: ${error.message || "Erro desconhecido"}`,
      };
    }
  }

  /**
   * Prepara os dados do formulário para serem salvos na lista SharePoint
   * @param formData Dados do formulário
   */
  private prepareListItem(formData: IHSEFormData): any {
    return {
      Title: formData.dadosGerais.empresa,
      StatusFormulario: formData.statusFormulario,
      UsuarioPreenchimento: this.context.pageContext.user.loginName,
      DataUltimaModificacao: new Date().toISOString(),

      // Dados Gerais
      Empresa: formData.dadosGerais.empresa,
      CNPJ: formData.dadosGerais.cnpj,
      NumeroContrato: formData.dadosGerais.numeroContrato,
      DataInicioContrato:
        formData.dadosGerais.dataInicioContrato?.toISOString(),
      DataTerminoContrato:
        formData.dadosGerais.dataTerminoContrato?.toISOString(),
      EscopoServico: formData.dadosGerais.escopoServico,
      ResponsavelTecnico: formData.dadosGerais.responsavelTecnico,
      AtividadePrincipalCNAE: formData.dadosGerais.atividadePrincipalCNAE,
      TotalEmpregados: formData.dadosGerais.totalEmpregados,
      EmpregadosParaServico: formData.dadosGerais.empregadosParaServico,
      GrauRisco: formData.dadosGerais.grauRisco,
      PossuiSESMT: formData.dadosGerais.possuiSESMT,
      NumeroComponentesSESMT: formData.dadosGerais.numeroComponentesSESMT,
      GerenteContratoMarine: formData.dadosGerais.gerenteContratoMarine,

      // Dados JSON
      ConformidadeLegalData: JSON.stringify(formData.conformidadeLegal),
      EvidenciasData: JSON.stringify(formData.evidencias),
      EmbarcacoesData: formData.servicosEspeciais.embarcacoes
        ? JSON.stringify(formData.servicosEspeciais.embarcacoes)
        : null,
      IcamentoData: formData.servicosEspeciais.icamento
        ? JSON.stringify(formData.servicosEspeciais.icamento)
        : null,

      // Serviços Especializados
      FornecedorEmbarcacoes: formData.servicosEspeciais.fornecedorEmbarcacoes,
      FornecedorIcamento: formData.servicosEspeciais.fornecedorIcamento,

      // Anexos e outros
      AnexosMetadados: JSON.stringify(formData.anexos),
      OutrasAcoes: formData.outrasAcoes,
      ComentariosFinais: formData.comentariosFinais,
      JustificativasNA: formData.justificativasNA,
    };
  }

  /**
   * Converte item da lista SharePoint para dados do formulário
   * @param item Item da lista SharePoint
   */
  private parseListItem(item: any): IHSEFormData {
    return {
      id: item.Id,
      statusFormulario: item.StatusFormulario,
      usuarioPreenchimento: item.UsuarioPreenchimento,
      dataCriacao: item.DataCriacao ? new Date(item.DataCriacao) : undefined,
      dataUltimaModificacao: item.DataUltimaModificacao
        ? new Date(item.DataUltimaModificacao)
        : undefined,

      dadosGerais: {
        empresa: item.Empresa || "",
        cnpj: item.CNPJ || "",
        numeroContrato: item.NumeroContrato || "",
        dataInicioContrato: item.DataInicioContrato
          ? new Date(item.DataInicioContrato)
          : null,
        dataTerminoContrato: item.DataTerminoContrato
          ? new Date(item.DataTerminoContrato)
          : null,
        escopoServico: item.EscopoServico || "",
        responsavelTecnico: item.ResponsavelTecnico || "",
        atividadePrincipalCNAE: item.AtividadePrincipalCNAE || "",
        totalEmpregados: item.TotalEmpregados || null,
        empregadosParaServico: item.EmpregadosParaServico || null,
        grauRisco: item.GrauRisco || "",
        possuiSESMT: item.PossuiSESMT || false,
        numeroComponentesSESMT: item.NumeroComponentesSESMT || null,
        gerenteContratoMarine: item.GerenteContratoMarine || "",
      },

      conformidadeLegal: item.ConformidadeLegalData
        ? JSON.parse(item.ConformidadeLegalData)
        : this.getDefaultConformidadeLegal(),
      evidencias: item.EvidenciasData
        ? JSON.parse(item.EvidenciasData)
        : this.getDefaultEvidencias(),

      servicosEspeciais: {
        fornecedorEmbarcacoes: item.FornecedorEmbarcacoes || false,
        embarcacoes: item.EmbarcacoesData
          ? JSON.parse(item.EmbarcacoesData)
          : undefined,
        fornecedorIcamento: item.FornecedorIcamento || false,
        icamento: item.IcamentoData ? JSON.parse(item.IcamentoData) : undefined,
      },

      outrasAcoes: item.OutrasAcoes || "",
      comentariosFinais: item.ComentariosFinais || "",
      justificativasNA: item.JustificativasNA || "",

      anexos: item.AnexosMetadados
        ? JSON.parse(item.AnexosMetadados)
        : this.getDefaultAnexos(),
    };
  }

  /**
   * Retorna estrutura padrão para conformidade legal
   */
  private getDefaultConformidadeLegal(): any {
    // Retorna estrutura vazia com todas as NRs
    return {
      nr01: {
        questao1: { resposta: "" },
        questao2: { resposta: "" },
        questao3: { resposta: "" },
        questao4: { resposta: "" },
        questao5: { resposta: "" },
      },
      nr04: { questao7: { resposta: "" }, questao8: { resposta: "" } },
      // ... adicionar demais NRs conforme necessário
    };
  }

  /**
   * Retorna estrutura padrão para evidências
   */
  private getDefaultEvidencias(): any {
    return {
      todasRespostasPossuemEvidencia: false,
      sesmt: { resposta: "" },
      cipa: { resposta: "" },
      // ... adicionar demais evidências
    };
  }

  /**
   * Retorna estrutura padrão para anexos
   */
  private getDefaultAnexos(): any {
    return {
      dadosGerais: {},
      conformidade: {},
      evidencias: {},
    };
  }

  /**
   * Verifica se a lista existe e tem as colunas necessárias
   */
  public async validateList(): Promise<{
    valid: boolean;
    missingColumns?: string[];
  }> {
    try {
      const list = await sp.web.lists.getByTitle(this.listName).get();

      if (!list) {
        return { valid: false };
      }

      // Verificar colunas essenciais
      const fields = await sp.web.lists.getByTitle(this.listName).fields.get();
      const fieldNames = fields.map((f) => f.InternalName);

      const requiredFields = [
        "StatusFormulario",
        "Empresa",
        "CNPJ",
        "NumeroContrato",
        "ConformidadeLegalData",
        "EvidenciasData",
        "AnexosMetadados",
      ];

      const missingColumns = requiredFields.filter(
        (field) => !fieldNames.includes(field)
      );

      return {
        valid: missingColumns.length === 0,
        missingColumns: missingColumns.length > 0 ? missingColumns : undefined,
      };
    } catch (error) {
      console.error("Erro ao validar lista:", error);
      return { valid: false };
    }
  }
}
