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
  }

  private async createHSEList(): Promise<void> {
    // Criar lista simples
    const listCreationInfo = {
      Title: this.listName,
      Description: "Lista para formulários HSE de fornecedores",
      BaseTemplate: 100, // Lista customizada
    };

    const list = await this.sp.web.lists.add(listCreationInfo);

    // Adicionar apenas campos essenciais
    await this.addBasicFields(list);
  }

  private async addBasicFields(list: any): Promise<void> {
    const fields = [
      { name: "Empresa", type: "Text", required: false },
      { name: "CNPJ", type: "Text", required: false },
      { name: "NumeroContrato", type: "Text", required: false },
      { name: "ResponsavelTecnico", type: "Text", required: false },
      { name: "GrauRisco", type: "Text", required: false },
      { name: "StatusFormulario", type: "Text", required: false },
      { name: "PercentualConclusao", type: "Number", required: false },
      { name: "DataEnvio", type: "DateTime", required: false },
      { name: "EmailPreenchimento", type: "Text", required: false },
      { name: "NomePreenchimento", type: "Text", required: false },
      { name: "DadosFormulario", type: "Note", required: false },
      { name: "AnexosCount", type: "Number", required: false },
      { name: "Observacoes", type: "Note", required: false },
    ];

    for (const field of fields) {
      try {
        await list.fields.add(field.name, field.type, {
          Required: field.required || false,
        });
        console.log(`Campo ${field.name} criado com sucesso`);
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

    // Criar dados simples para salvar
    const itemData = {
      Title: dados.empresa || "Formulário em Andamento",
      Empresa: dados.empresa || "",
      CNPJ: dados.cnpj || "",
      NumeroContrato: dados.numeroContrato || "",
      ResponsavelTecnico: dados.responsavelTecnico || "",
      GrauRisco: dados.grauRisco || "1",
      StatusFormulario: "Em Andamento",
      PercentualConclusao: calculateCompletionPercentage(),
      DataEnvio: new Date().toISOString(),
      EmailPreenchimento: userContext?.email || "usuario@externo.com",
      NomePreenchimento: userContext?.displayName || "Usuário Externo",
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
    await this.ensureListExists();

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

    // Criar dados de forma simples para evitar problemas de JSON
    const itemData = {
      Title: dados.empresa || "Formulário HSE",

      // Campos principais
      Empresa: dados.empresa || "",
      CNPJ: dados.cnpj || "",
      NumeroContrato: dados.numeroContrato || "",
      ResponsavelTecnico: dados.responsavelTecnico || "",
      GrauRisco: dados.grauRisco || "1",

      // Status
      StatusFormulario: "Submetido",
      PercentualConclusao: 100,
      DataEnvio: new Date().toISOString(),

      // Dados do usuário
      EmailPreenchimento: userContext?.email || "usuario@externo.com",
      NomePreenchimento: userContext?.displayName || "Usuário Externo",

      // JSON simples com dados completos
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

      // Contagem de anexos
      AnexosCount: countAttachments(),

      // Observações vazias para preenchimento posterior
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
      Empresa: formData.dadosGerais?.empresa || "",
      CNPJ: formData.dadosGerais?.cnpj || "",
      NumeroContrato: formData.dadosGerais?.numeroContrato || "",
      ResponsavelTecnico: formData.dadosGerais?.responsavelTecnico || "",
      GrauRisco: formData.dadosGerais?.grauRisco || "1",
      DadosFormulario: JSON.stringify(formData),
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
        statusFormulario: item.StatusFormulario || "Rascunho",
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
