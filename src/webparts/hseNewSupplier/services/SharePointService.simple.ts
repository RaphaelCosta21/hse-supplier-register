import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
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

  public async saveFormData(
    formData: IHSEFormData,
    attachments: any
  ): Promise<number> {
    const dados = formData.dadosGerais;

    // Calcular percentual de conclusão
    const calculateCompletionPercentage = (): number => {
      let completed = 0;
      const totalSections = 3; // Não contar revisão final no salvamento

      if (dados.empresa && dados.cnpj && dados.numeroContrato) completed++;
      if (
        formData.conformidadeLegal &&
        Object.keys(formData.conformidadeLegal).length > 0
      )
        completed++;
      if (formData.servicosEspeciais) completed++;

      return Math.round((completed / totalSections) * 100);
    };

    // Contar anexos
    const countAttachments = (): number => {
      if (!attachments) return 0;
      return Object.keys(attachments).reduce((count, category) => {
        return count + (attachments[category]?.length || 0);
      }, 0);
    };

    // Capturar informações do usuário
    const userContext = this.context?.pageContext?.user;

    // Mapear dados para as colunas exatas da lista SharePoint
    const itemData = {
      Title: dados.empresa || "Formulário em Andamento",
      CNPJ: dados.cnpj || "",
      NumeroContrato: dados.numeroContrato || "",
      StatusAvaliacao: "Em Andamento", // Choice field
      DataEnvio: new Date(),
      DataCriacao: new Date(),
      ResponsavelTecnico: dados.responsavelTecnico || "",
      GrauRisco: dados.grauRisco || "1", // Choice field
      PercentualConclusao: calculateCompletionPercentage(),
      DadosFormulario: JSON.stringify({
        dadosGerais: formData.dadosGerais,
        conformidadeLegal: formData.conformidadeLegal,
        servicosEspeciais: formData.servicosEspeciais,
        anexos: attachments,
        metadata: {
          dataSalvamento: new Date().toISOString(),
          usuario: userContext?.displayName || "Usuário Externo",
          email: userContext?.email || "usuario@externo.com",
        },
      }),
      UltimaModificacao: new Date(),
      EmailPreenchimento: userContext?.email || "usuario@externo.com",
      NomePreenchimento: userContext?.displayName || "Usuário Externo",
      AnexosCount: countAttachments(),
      Observacoes: "",
    };

    try {
      console.log("Salvando dados no SharePoint:", itemData);

      const result = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.add(itemData);

      console.log("Formulário salvo com sucesso! ID:", result.data.Id);
      return result.data.Id;
    } catch (error) {
      console.error("Erro ao salvar formulário:", error);
      throw new Error(`Falha ao salvar formulário: ${error.message}`);
    }
  }

  public async submitFormData(
    formData: IHSEFormData,
    attachments: { [category: string]: any[] }
  ): Promise<number> {
    const dados = formData.dadosGerais;

    // Contar anexos de forma segura
    const countAttachments = (): number => {
      if (!attachments) return 0;
      return Object.keys(attachments).reduce((count, category) => {
        return count + (attachments[category]?.length || 0);
      }, 0);
    };

    // Capturar informações do usuário atual
    const userContext = this.context?.pageContext?.user;

    // Mapear dados para as colunas exatas da lista SharePoint
    const itemData = {
      Title: dados.empresa || "Formulário HSE",
      CNPJ: dados.cnpj || "",
      NumeroContrato: dados.numeroContrato || "",
      StatusAvaliacao: "Submetido", // Choice field
      DataEnvio: new Date(),
      DataCriacao: new Date(),
      ResponsavelTecnico: dados.responsavelTecnico || "",
      GrauRisco: dados.grauRisco || "1", // Choice field
      PercentualConclusao: 100,
      DadosFormulario: JSON.stringify({
        dadosGerais: formData.dadosGerais,
        conformidadeLegal: formData.conformidadeLegal,
        servicosEspeciais: formData.servicosEspeciais,
        anexos: attachments,
        metadata: {
          dataSubmissao: new Date().toISOString(),
          usuario: userContext?.displayName || "Usuário Externo",
          email: userContext?.email || "usuario@externo.com",
        },
      }),
      UltimaModificacao: new Date(),
      EmailPreenchimento: userContext?.email || "usuario@externo.com",
      NomePreenchimento: userContext?.displayName || "Usuário Externo",
      AnexosCount: countAttachments(),
      Observacoes: "",
    };

    try {
      console.log("Enviando dados para SharePoint:", itemData);

      const result = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.add(itemData);

      console.log("Formulário HSE enviado com sucesso! ID:", result.data.Id);
      return result.data.Id;
    } catch (error) {
      console.error("Erro ao enviar formulário HSE:", error);
      throw new Error(`Falha ao enviar formulário: ${error.message}`);
    }
  }

  public async updateFormData(
    itemId: number,
    formData: Partial<IHSEFormData>
  ): Promise<void> {
    // Implementação simplificada para atualização
    const updateData = {
      Title: formData.dadosGerais?.empresa || "Formulário Atualizado",
      CNPJ: formData.dadosGerais?.cnpj || "",
      NumeroContrato: formData.dadosGerais?.numeroContrato || "",
      ResponsavelTecnico: formData.dadosGerais?.responsavelTecnico || "",
      GrauRisco: formData.dadosGerais?.grauRisco || "1",
      DadosFormulario: JSON.stringify(formData),
      UltimaModificacao: new Date(),
    };

    await this.sp.web.lists
      .getByTitle(this.listName)
      .items.getById(itemId)
      .update(updateData);
  }

  public async getFormById(id: number): Promise<IHSEFormData | null> {
    try {
      const item = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.getById(id)
        .get();

      // Mapear de volta para IHSEFormData
      const dadosFormulario = JSON.parse(item.DadosFormulario || "{}");

      return {
        id: item.Id,
        statusFormulario: item.StatusAvaliacao || "Rascunho",
        dadosGerais: dadosFormulario.dadosGerais || {},
        conformidadeLegal: dadosFormulario.conformidadeLegal || {},
        servicosEspeciais: dadosFormulario.servicosEspeciais || {},
        anexos: dadosFormulario.anexos || {},
        dataCriacao: item.Created ? new Date(item.Created) : undefined,
        dataUltimaModificacao: item.Modified
          ? new Date(item.Modified)
          : undefined,
      } as IHSEFormData;
    } catch (error) {
      console.error(`Erro ao buscar formulário com ID ${id}:`, error);
      return null;
    }
  }
}
