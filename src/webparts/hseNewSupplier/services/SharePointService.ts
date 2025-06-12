import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx, SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IHSEFormData } from "../types/IHSEFormData";
import { IAttachmentMetadata } from "../types/IAttachmentMetadata";

export class SharePointService {
  private sp: SPFI;
  private listName: string;
  private context: WebPartContext;

  constructor(context: WebPartContext, listName: string) {
    this.sp = spfi().using(SPFx(context));
    this.listName = listName;
    this.context = context;
  }
  public async saveFormData(
    formData: IHSEFormData,
    attachments: { [category: string]: IAttachmentMetadata[] }
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
    }; // Contar anexos de forma mais segura
    const countAttachments = (): number => {
      if (!attachments) {
        return 0;
      }

      if (typeof attachments !== "object") {
        return 0;
      }

      const keys = Object.keys(attachments);

      if (keys.length === 0) {
        return 0;
      }

      const count = keys.reduce((total, category) => {
        const categoryFiles = attachments[category];
        const categoryCount = Array.isArray(categoryFiles)
          ? categoryFiles.length
          : 0;
        return total + categoryCount;
      }, 0);

      return count;
    }; // Normalizar anexos para evitar problemas no JSON
    const normalizeAttachments = (): {
      [category: string]: IAttachmentMetadata[];
    } => {
      if (!attachments || typeof attachments !== "object") {
        return {};
      }

      const normalized: { [category: string]: IAttachmentMetadata[] } = {};

      Object.keys(attachments).forEach((category) => {
        const categoryFiles = attachments[category];
        if (Array.isArray(categoryFiles) && categoryFiles.length > 0) {
          normalized[category] = categoryFiles;
        }
      });

      return normalized;
    }; // Capturar informações do usuário
    const userContext = this.context?.pageContext?.user;
    const now = new Date();
    const normalizedAttachments = normalizeAttachments();
    const attachmentCount = countAttachments(); // Criar JSON de forma mais segura
    const createFormDataJSON = (): object => {
      const jsonData = {
        dadosGerais: formData.dadosGerais || {},
        conformidadeLegal: formData.conformidadeLegal || {},
        servicosEspeciais: formData.servicosEspeciais || {},
        anexos: normalizedAttachments, // Usar anexos normalizados
        metadata: {
          dataSalvamento: now.toISOString(),
          usuario: userContext?.displayName || "Usuário Externo",
          email: userContext?.email || "usuario@externo.com",
          temAnexos: attachmentCount > 0,
          totalAnexos: attachmentCount,
        },
      };

      return jsonData;
    };

    const jsonData = createFormDataJSON();

    // Mapear dados para as colunas exatas da lista SharePoint
    const itemData = {
      Title: (dados.empresa || "Formulário em Andamento").toString(),
      CNPJ: (dados.cnpj || "").toString(),
      NumeroContrato: (dados.numeroContrato || "").toString(),
      StatusAvaliacao: "Em Andamento", // Opções: Em Andamento, Enviado, Aprovado, Rejeitado
      DataEnvio: now.toISOString(),
      DataCriacao: now.toISOString(),
      ResponsavelTecnico: (dados.responsavelTecnico || "").toString(),
      GrauRisco: (dados.grauRisco || "1").toString(), // Choice field
      PercentualConclusao: calculateCompletionPercentage(),
      DadosFormulario: JSON.stringify(jsonData),
      UltimaModificacao: now.toISOString(),
      EmailPreenchimento: (
        userContext?.email || "usuario@externo.com"
      ).toString(),
      NomePreenchimento: (
        userContext?.displayName || "Usuário Externo"
      ).toString(),
      AnexosCount: attachmentCount,
      Observacoes: "",
    };
    try {
      const list = this.sp.web.lists.getByTitle(this.listName); // Testar se conseguimos acessar as propriedades da lista
      try {
        await list();
      } catch {
        throw new Error(
          `Lista '${this.listName}' não encontrada ou sem permissão de acesso`
        );
      }

      const result = await list.items.add(itemData);
      return result.data.Id;
    } catch (error) {
      console.error("Erro ao salvar formulário:", error);
      throw new Error(`Falha ao salvar formulário: ${error.message}`);
    }
  }
  public async submitFormData(
    formData: IHSEFormData,
    attachments: { [category: string]: IAttachmentMetadata[] }
  ): Promise<number> {
    const dados = formData.dadosGerais;

    // Contar anexos de forma mais segura
    const countAttachments = (): number => {
      if (!attachments || typeof attachments !== "object") {
        return 0;
      }

      const keys = Object.keys(attachments);
      if (keys.length === 0) {
        return 0;
      }

      const count = keys.reduce((total, category) => {
        const categoryFiles = attachments[category];
        const categoryCount = Array.isArray(categoryFiles)
          ? categoryFiles.length
          : 0;
        return total + categoryCount;
      }, 0);

      return count;
    };

    // Normalizar anexos para evitar problemas no JSON
    const normalizeAttachments = (): {
      [category: string]: IAttachmentMetadata[];
    } => {
      if (!attachments || typeof attachments !== "object") {
        return {};
      }

      const normalized: { [category: string]: IAttachmentMetadata[] } = {};

      Object.keys(attachments).forEach((category) => {
        const categoryFiles = attachments[category];
        if (Array.isArray(categoryFiles) && categoryFiles.length > 0) {
          normalized[category] = categoryFiles;
        }
      });
      return normalized;
    };

    // Capturar informações do usuário atual
    const userContext = this.context?.pageContext?.user;
    const now = new Date();
    const normalizedAttachments = normalizeAttachments();
    const attachmentCount = countAttachments();

    // Criar JSON de forma mais segura para envio
    const createFormDataJSON = (): object => {
      const jsonData = {
        dadosGerais: formData.dadosGerais || {},
        conformidadeLegal: formData.conformidadeLegal || {},
        servicosEspeciais: formData.servicosEspeciais || {},
        anexos: normalizedAttachments, // Usar anexos normalizados
        metadata: {
          dataSubmissao: now.toISOString(),
          usuario: userContext?.displayName || "Usuário Externo",
          email: userContext?.email || "usuario@externo.com",
          temAnexos: attachmentCount > 0,
          totalAnexos: attachmentCount,
        },
      };

      return jsonData;
    };

    const jsonData = createFormDataJSON();

    // Mapear dados para as colunas exatas da lista SharePoint
    const itemData = {
      Title: (dados.empresa || "Formulário HSE").toString(),
      CNPJ: (dados.cnpj || "").toString(),
      NumeroContrato: (dados.numeroContrato || "").toString(),
      StatusAvaliacao: "Enviado", // Opções: Em Andamento, Enviado, Aprovado, Rejeitado
      DataEnvio: now.toISOString(),
      DataCriacao: now.toISOString(),
      ResponsavelTecnico: (dados.responsavelTecnico || "").toString(),
      GrauRisco: (dados.grauRisco || "1").toString(), // Choice field
      PercentualConclusao: 100,
      DadosFormulario: JSON.stringify(jsonData),
      UltimaModificacao: now.toISOString(),
      EmailPreenchimento: (
        userContext?.email || "usuario@externo.com"
      ).toString(),
      NomePreenchimento: (
        userContext?.displayName || "Usuário Externo"
      ).toString(),
      AnexosCount: attachmentCount,
      Observacoes: "",
    };
    try {
      const list = this.sp.web.lists.getByTitle(this.listName);
      // Testar se conseguimos acessar as propriedades da lista
      try {
        await list();
      } catch {
        throw new Error(
          `Lista '${this.listName}' não encontrada ou sem permissão de acesso`
        );
      }

      const result = await list.items.add(itemData);
      console.log("Formulário HSE enviado com sucesso! ID:", result.data.Id);
      return result.data.Id;
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);

      // Se chegou até aqui mas deu erro, pode ser um problema de rede/timeout após o sucesso
      // Vamos re-lançar o erro mas com uma mensagem mais específica
      if (error instanceof Error) {
        throw new Error(`Falha ao enviar formulário: ${error.message}`);
      } else {
        throw new Error(`Falha ao enviar formulário: Erro desconhecido`);
      }
    }
  }
  public async updateFormData(
    itemId: number,
    formData: Partial<IHSEFormData>
  ): Promise<void> {
    const now = new Date();

    // Implementação simplificada para atualização
    const updateData = {
      Title: (
        formData.dadosGerais?.empresa || "Formulário Atualizado"
      ).toString(),
      CNPJ: (formData.dadosGerais?.cnpj || "").toString(),
      NumeroContrato: (formData.dadosGerais?.numeroContrato || "").toString(),
      ResponsavelTecnico: (
        formData.dadosGerais?.responsavelTecnico || ""
      ).toString(),
      GrauRisco: (formData.dadosGerais?.grauRisco || "1").toString(),
      DadosFormulario: JSON.stringify(formData),
      UltimaModificacao: now.toISOString(),
    };

    await this.sp.web.lists
      .getByTitle(this.listName)
      .items.getById(itemId)
      .update(updateData);
  }
  /**
   * Busca um formulário específico por ID
   */
  public async getFormById(itemId: number): Promise<IHSEFormData | undefined> {
    try {
      console.log("=== CARREGANDO FORMULÁRIO POR ID ===");
      console.log("Item ID:", itemId);

      if (!itemId || typeof itemId !== "number") {
        throw new Error("ID do item é obrigatório e deve ser um número");
      }

      // Buscar o item específico
      console.log("Buscando item no SharePoint...");
      const item = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.getById(itemId)
        .select(
          "Id",
          "Title",
          "CNPJ",
          "NumeroContrato",
          "StatusAvaliacao",
          "PercentualConclusao",
          "DadosFormulario",
          "Created",
          "Modified",
          "EmailPreenchimento",
          "NomePreenchimento",
          "ResponsavelTecnico",
          "GrauRisco",
          "DataEnvio",
          "DataCriacao",
          "AnexosCount",
          "Observacoes"
        )();

      console.log("Item encontrado:", {
        Id: item.Id,
        Title: item.Title,
        CNPJ: item.CNPJ,
        StatusAvaliacao: item.StatusAvaliacao,
        PercentualConclusao: item.PercentualConclusao,
        DadosFormulario: item.DadosFormulario ? "Presente" : "Ausente",
      });

      if (!item) {
        throw new Error(`Item com ID ${itemId} não encontrado`);
      } // Parse dos dados do formulário
      let parsedFormData: Record<string, unknown> = {};

      if (item.DadosFormulario) {
        try {
          console.log("Fazendo parse do JSON dos dados do formulário...");
          parsedFormData = JSON.parse(item.DadosFormulario) as Record<
            string,
            unknown
          >;
          console.log("Dados parseados com sucesso:", {
            dadosGerais: parsedFormData.dadosGerais ? "Presente" : "Ausente",
            conformidadeLegal: parsedFormData.conformidadeLegal
              ? "Presente"
              : "Ausente",
            servicosEspeciais: parsedFormData.servicosEspeciais
              ? "Presente"
              : "Ausente",
            anexos: parsedFormData.anexos ? "Presente" : "Ausente",
          });
        } catch (parseError) {
          console.error("Erro ao fazer parse do JSON:", parseError);
          console.log("JSON bruto:", item.DadosFormulario);
          // Continuar com dados vazios ao invés de falhar
          parsedFormData = {
            dadosGerais: {},
            conformidadeLegal: {},
            servicosEspeciais: {},
            anexos: {},
          };
        }
      } else {
        console.log(
          "Item não possui DadosFormulario, iniciando com dados vazios"
        );
        parsedFormData = {
          dadosGerais: {},
          conformidadeLegal: {},
          servicosEspeciais: {},
          anexos: {},
        };
      } // Buscar anexos do item
      console.log("Buscando anexos do item...");
      let attachments: { [category: string]: IAttachmentMetadata[] } = {};

      try {
        // Simplificar busca de anexos - usar apenas dados do JSON por enquanto
        if (
          parsedFormData.anexos &&
          typeof parsedFormData.anexos === "object"
        ) {
          attachments = parsedFormData.anexos as {
            [category: string]: IAttachmentMetadata[];
          };
          console.log("Anexos carregados do JSON:", Object.keys(attachments));
        } else {
          console.log("Nenhum anexo encontrado nos dados salvos");
          attachments = {};
        }
      } catch (attachmentError) {
        console.error("Erro ao buscar anexos:", attachmentError);
        // Continuar sem anexos ao invés de falhar
        attachments = {};
      }

      // Construir objeto IHSEFormData
      const formData: IHSEFormData = {
        id: item.Id,
        statusFormulario: item.StatusAvaliacao || "Rascunho",
        dadosGerais: {
          cnpj: item.CNPJ || "",
          empresa: item.Title || "",
          numeroContrato: item.NumeroContrato || "",
          responsavelTecnico: item.ResponsavelTecnico || "",
          grauRisco: item.GrauRisco || "1",
          dataInicioContrato: undefined,
          dataTerminoContrato: undefined,
          escopoServico: "",
          atividadePrincipalCNAE: "",
          totalEmpregados: undefined,
          empregadosParaServico: undefined,
          possuiSESMT: false,
          numeroComponentesSESMT: undefined,
          gerenteContratoMarine: "",
          ...((parsedFormData.dadosGerais as Record<string, unknown>) || {}),
        },
        conformidadeLegal: (parsedFormData.conformidadeLegal ||
          {}) as IHSEFormData["conformidadeLegal"],
        servicosEspeciais: {
          fornecedorEmbarcacoes: false,
          fornecedorIcamento: false,
          ...((parsedFormData.servicosEspeciais as Record<string, unknown>) ||
            {}),
        } as IHSEFormData["servicosEspeciais"],
        anexos: (parsedFormData.anexos ||
          attachments ||
          {}) as IHSEFormData["anexos"],
        dataCriacao: item.Created ? new Date(item.Created) : undefined,
        dataUltimaModificacao: item.Modified
          ? new Date(item.Modified)
          : undefined,
      };

      console.log("=== FORMULÁRIO CARREGADO COMPLETAMENTE ===");
      console.log("Dados Gerais:", formData.dadosGerais);
      console.log("Conformidade Legal:", formData.conformidadeLegal);
      console.log("Serviços Especiais:", formData.servicosEspeciais);
      console.log("Anexos:", formData.anexos);

      return formData;
    } catch (error) {
      console.error(`Erro ao buscar formulário com ID ${itemId}:`, error);
      return undefined;
    }
  }
  /**
   * Busca um formulário por CNPJ - Busca pelo formato completo (XX.XXX.XXX/XXXX-XX)
   */
  public async searchFormByCNPJ(cnpj: string): Promise<{
    exists: boolean;
    formData?: IHSEFormData;
    itemId?: number;
    status?: string;
  }> {
    try {
      console.log("=== BUSCA POR CNPJ FORMATADO ===");
      console.log("CNPJ recebido:", cnpj); // Normalizar CNPJ removendo caracteres especiais para validação
      const normalizedCNPJ = cnpj.replace(/[^\d]/g, "");
      console.log("CNPJ só números:", normalizedCNPJ);

      // Validar se o CNPJ normalizado tem 14 dígitos
      if (normalizedCNPJ.length !== 14) {
        console.error("CNPJ inválido: deve ter 14 dígitos");
        throw new Error("CNPJ deve conter exatamente 14 dígitos");
      }

      // Formatar CNPJ no padrão XX.XXX.XXX/XXXX-XX para busca
      const formattedCNPJ = `${normalizedCNPJ.slice(
        0,
        2
      )}.${normalizedCNPJ.slice(2, 5)}.${normalizedCNPJ.slice(
        5,
        8
      )}/${normalizedCNPJ.slice(8, 12)}-${normalizedCNPJ.slice(12, 14)}`;
      console.log("CNPJ formatado para busca:", formattedCNPJ);

      // Buscar pelo CNPJ formatado - como está armazenado no SharePoint
      console.log("Iniciando busca no SharePoint...");
      const items = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.filter(`CNPJ eq '${formattedCNPJ}'`)
        .select(
          "Id",
          "Title",
          "CNPJ",
          "DadosFormulario",
          "StatusAvaliacao",
          "PercentualConclusao",
          "Created",
          "Modified",
          "EmailPreenchimento"
        )
        .orderBy("Modified", false)
        .top(1)();

      console.log(`Busca concluída. ${items.length} item(s) encontrado(s)`);
      if (items.length === 0) {
        console.log("Nenhum formulário encontrado para o CNPJ");
        return { exists: false };
      }

      const item = items[0];
      console.log("Item encontrado:", {
        Id: item.Id,
        CNPJ: item.CNPJ,
        StatusAvaliacao: item.StatusAvaliacao,
        PercentualConclusao: item.PercentualConclusao,
        Modified: item.Modified,
      }); // Parse dos dados do formulário
      let formData: IHSEFormData | undefined;
      try {
        if (item.DadosFormulario) {
          const parsedData = JSON.parse(item.DadosFormulario);

          // Construir objeto IHSEFormData completo
          formData = {
            id: item.Id,
            statusFormulario: item.StatusAvaliacao || "Rascunho",
            dadosGerais: parsedData.dadosGerais || {},
            conformidadeLegal: parsedData.conformidadeLegal || {},
            servicosEspeciais: parsedData.servicosEspeciais || {},
            anexos: parsedData.anexos || {},
            dataCriacao: item.Created ? new Date(item.Created) : undefined,
            dataUltimaModificacao: item.Modified
              ? new Date(item.Modified)
              : undefined,
          };

          console.log("Dados do formulário parseados com sucesso");
        } else {
          console.warn("Item encontrado mas sem dados de formulário");
        }
      } catch (parseError) {
        console.error(
          "Erro ao fazer parse dos dados do formulário:",
          parseError
        );
        // Não throw aqui para permitir que o sistema continue
      } // Determinar status final (usar apenas StatusAvaliacao)
      const finalStatus = item.StatusAvaliacao || "Rascunho";

      return {
        exists: true,
        formData,
        itemId: item.Id,
        status: finalStatus,
      };
    } catch (error) {
      console.error("Erro ao buscar formulário por CNPJ:", error);

      // Distinguir entre erros de validação e erros de rede/SharePoint
      if (error.message && error.message.includes("dígitos")) {
        throw error; // Re-throw validation errors
      }
      // Para erros de rede/SharePoint, fornecer mensagem mais amigável
      throw new Error(
        `Erro ao verificar CNPJ no sistema. Verifique sua conexão e tente novamente. Detalhes: ${
          error.message || "Erro desconhecido"
        }`
      );
    }
  }

  /**
   * Busca todos os formulários preenchidos pelo usuário atual
   */
  public async getUserForms(userEmail: string): Promise<
    Array<{
      id: number;
      cnpj: string;
      empresa: string;
      status: string;
      dataModificacao: string;
      userEmail: string;
      userName: string;
      isOwner: boolean;
    }>
  > {
    try {
      console.log("=== BUSCANDO FORMULÁRIOS DO USUÁRIO ===");
      console.log("Email do usuário:", userEmail);
      const items = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.filter(`EmailPreenchimento eq '${userEmail}'`)
        .select(
          "Id",
          "CNPJ",
          "Title",
          "StatusAvaliacao",
          "Modified",
          "EmailPreenchimento",
          "NomePreenchimento"
        )
        .orderBy("Modified", false)();

      console.log("Formulários encontrados:", items.length);
      return items.map((item) => ({
        id: item.Id,
        cnpj: item.CNPJ || "",
        empresa: item.Title || "",
        status: item.StatusAvaliacao || "Rascunho",
        dataModificacao: item.Modified,
        userEmail: item.EmailPreenchimento || "",
        userName: item.NomePreenchimento || "",
        isOwner: true, // Sempre true pois filtramos pelo email do usuário
      }));
    } catch (error) {
      console.error("Erro ao buscar formulários do usuário:", error);
      throw new Error(`Erro ao carregar seus formulários: ${error.message}`);
    }
  }

  /**
   * Busca formulário por CNPJ com verificação de propriedade
   */
  public async searchFormByCNPJWithOwnership(
    cnpj: string,
    currentUserEmail: string
  ): Promise<{
    exists: boolean;
    cnpj: string;
    itemId?: number;
    status?: string;
    formData?: unknown;
    allowEdit?: boolean;
    requiresApproval?: boolean;
    userEmail?: string;
    userName?: string;
    isOwner?: boolean;
  }> {
    try {
      console.log("=== BUSCA POR CNPJ COM VERIFICAÇÃO DE PROPRIEDADE ===");
      console.log("CNPJ:", cnpj);
      console.log("Email do usuário atual:", currentUserEmail);

      // Primeiro fazer a busca normal por CNPJ
      const result = await this.searchFormByCNPJ(cnpj);
      if (!result.exists) {
        return {
          ...result,
          cnpj: cnpj,
          isOwner: false,
          allowEdit: false,
        };
      } // Buscar dados completos do item para verificar o email
      const item = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.getById(result.itemId!)
        .select(
          "Id",
          "CNPJ",
          "Title",
          "StatusAvaliacao",
          "EmailPreenchimento",
          "NomePreenchimento"
        )();
      const isOwner = item.EmailPreenchimento === currentUserEmail;
      const allowEdit = isOwner && item.StatusAvaliacao !== "Aprovado";

      console.log("Proprietário do formulário:", item.EmailPreenchimento);
      console.log("Usuário é o proprietário?", isOwner);
      console.log("Pode editar?", allowEdit);
      return {
        ...result,
        cnpj: cnpj,
        userEmail: item.EmailPreenchimento,
        userName: item.NomePreenchimento,
        isOwner,
        allowEdit,
      };
    } catch (error) {
      console.error("Erro ao buscar formulário por CNPJ:", error);
      throw new Error(`Erro ao verificar CNPJ: ${error.message}`);
    }
  }
}
