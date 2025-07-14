import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx, SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IHSEFormData } from "../types/IHSEFormData";
import { IAttachmentMetadata } from "../types/IAttachmentMetadata";
import { IFormFieldChange, IRevisionEntry } from "../types/IApplicationPhase";
import { SharePointFileService } from "./SharePointFileService";

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
    const attachmentCount = countAttachments(); // Determinar status e campos dinâmicos baseados no statusFormulario
    // Isso unifica saveFormData e submitFormData em um só método
    const isSubmission = formData.statusFormulario === "Enviado";
    const statusAvaliacao = isSubmission ? "Enviado" : "Em Andamento";
    const percentualConclusao = isSubmission
      ? 100
      : calculateCompletionPercentage();
    const titleFormulario = isSubmission
      ? dados.empresa || "Formulário HSE"
      : dados.empresa || "Formulário em Andamento";

    // Criar JSON de forma mais segura
    const createFormDataJSON = (): Record<string, unknown> => {
      const baseJsonData = {
        dadosGerais: formData.dadosGerais || {},
        conformidadeLegal: formData.conformidadeLegal || {},
        servicosEspeciais: formData.servicosEspeciais || {},
        anexos: normalizedAttachments, // Usar anexos normalizados
        metadata: {
          [isSubmission ? "dataSubmissao" : "dataSalvamento"]:
            now.toISOString(),
          usuario: userContext?.displayName || "Usuário Externo",
          email: userContext?.email || "usuario@externo.com",
          temAnexos: attachmentCount > 0,
          totalAnexos: attachmentCount,
          // Adicionar histórico de mudança de status
          historicoStatusChange: {
            [statusAvaliacao]: {
              dataAlteracao: now.toISOString(),
              usuario: userContext?.displayName || "Usuário Externo",
              email: userContext?.email || "usuario@externo.com",
            },
          },
        },
      };

      // Adicionar rastreamento de revisão
      return this.addRevisionHistoryToJSON(
        baseJsonData,
        isSubmission ? "enviado" : "salvo"
      );
    };

    const jsonData = createFormDataJSON();

    // Mapear dados para as colunas exatas da lista SharePoint
    const itemData = {
      Title: titleFormulario.toString(),
      CNPJ: (dados.cnpj || "").toString(),
      NumeroContrato: (dados.numeroContrato || "").toString(),
      StatusAvaliacao: statusAvaliacao, // Opções: Em Andamento, Enviado, Aprovado, Rejeitado
      DataEnvio: now.toISOString(),
      DataCriacao: now.toISOString(),
      ResponsavelTecnico: (dados.responsavelTecnico || "").toString(),
      GrauRisco: (dados.grauRisco || "1").toString(), // Choice field
      PercentualConclusao: percentualConclusao,
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

      // 1. Criar item na lista principal (hse-new-register)
      const result = await list.items.add(itemData);
      const formId = result.Id;
      console.log(
        `🟢 Formulário criado na lista principal (hse-new-register). ID do item: ${formId}`
      );
      // 2. Criar pasta se existem dados básicos (para novos formulários)
      if (dados.cnpj && dados.empresa) {
        try {
          const sharePointFileService = new SharePointFileService(
            this.context,
            "anexos-contratadas"
          );

          // Criar pasta com estrutura: CNPJ-NomeDaEmpresa-ID
          const folderResult = await sharePointFileService.ensureMainFolder(
            dados.cnpj,
            dados.empresa,
            formId
          );

          // 3. Criar item na lista secundária (hse-new-register-sup) se pasta foi criada
          if (folderResult.wasCreated) {
            const userEmail = this.context.pageContext.user.email;
            await sharePointFileService.addSupplierRegisterEntry(
              folderResult.folderName,
              userEmail
            );
            console.log(
              "✅ Ordem correta: Lista principal → Pasta → Lista secundária"
            );
          }
        } catch (error) {
          console.warn(
            "Erro ao criar pasta/lista secundária, mas formulário foi salvo:",
            error
          );
          // Não falhar o salvamento principal por causa deste erro
        }
      }

      return formId;
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
    const createFormDataJSON = (): Record<string, unknown> => {
      const baseJsonData = {
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
          // Adicionar histórico de mudança de status (para novos formulários que vão direto para Enviado)
          historicoStatusChange: {
            Enviado: {
              dataAlteracao: now.toISOString(),
              usuario: userContext?.displayName || "Usuário Externo",
              email: userContext?.email || "usuario@externo.com",
            },
          },
        },
      };

      // Adicionar rastreamento de revisão
      return this.addRevisionHistoryToJSON(baseJsonData, "enviado");
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

      // 1. Criar item na lista principal (hse-new-register)
      const result = await list.items.add(itemData);
      const formId = result.Id;

      // 2. Criar pasta se existem dados básicos (para novos formulários)
      if (dados.cnpj && dados.empresa) {
        try {
          const sharePointFileService = new SharePointFileService(
            this.context,
            "anexos-contratadas"
          );

          // Criar pasta com estrutura: CNPJ-NomeDaEmpresa-ID
          const folderResult = await sharePointFileService.ensureMainFolder(
            dados.cnpj,
            dados.empresa,
            formId
          );

          // 3. Criar item na lista secundária (hse-new-register-sup) se pasta foi criada
          if (folderResult.wasCreated) {
            const userEmail = this.context.pageContext.user.email;
            await sharePointFileService.addSupplierRegisterEntry(
              folderResult.folderName,
              userEmail
            );
            console.log(
              "✅ Ordem correta: Lista principal → Pasta → Lista secundária"
            );
          }
        } catch (error) {
          console.warn(
            "Erro ao criar pasta/lista secundária, mas formulário foi salvo:",
            error
          );
          // Não falhar o salvamento principal por causa deste erro
        }
      }

      console.log("Formulário HSE enviado com sucesso! ID:", formId);
      return formId;
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
  /**
   * Submete formulário final atualizando o item existente ao invés de criar novo
   * Se houver alterações, cria uma nova revisão ANTES de alterar o status
   */
  public async submitFormWithUpdate(
    itemId: number,
    formData: IHSEFormData,
    attachments: { [category: string]: IAttachmentMetadata[] }
  ): Promise<void> {
    const dados = formData.dadosGerais;
    const userContext = this.context?.pageContext?.user;
    const now = new Date();

    console.log("=== INICIANDO SUBMISSÃO COM VERIFICAÇÃO DE ALTERAÇÕES ===");

    // Contar anexos de forma segura
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

    // Normalizar anexos
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

    const normalizedAttachments = normalizeAttachments();
    const attachmentCount = countAttachments();

    // PRIMEIRO: Verificar se há alterações no formulário
    const currentFormData = await this.getFormById(itemId);
    if (!currentFormData) {
      throw new Error(`Formulário com ID ${itemId} não encontrado`);
    }

    const formChanges = this.detectChanges(currentFormData, formData);
    const currentAttachments =
      (currentFormData.anexos as unknown as {
        [category: string]: IAttachmentMetadata[];
      }) || {};
    const attachmentChanges = this.detectAttachmentChanges(
      currentAttachments,
      normalizedAttachments
    );
    const hasChanges = formChanges.length > 0 || attachmentChanges.length > 0;

    console.log("📊 Verificação de alterações:", {
      formChanges: formChanges.length,
      attachmentChanges: attachmentChanges.length,
      hasChanges,
    });

    // SEGUNDO: Se houver alterações, criar nova revisão ANTES de submeter
    if (hasChanges) {
      console.log(
        "🔄 Detectadas alterações. Criando nova revisão antes de submeter..."
      );
      await this.updateFormWithChanges(itemId, formData, normalizedAttachments);
    }

    // TERCEIRO: Carregar dados atuais COMPLETOS (após possível nova revisão)
    let historicoStatusChange: Record<
      string,
      { dataAlteracao: string; usuario: string; email: string }
    > = {};
    let historicoRevisoesExistente: IRevisionEntry[] = [];
    let metadataExistente: Record<string, unknown> = {};
    let formDataAtual: IHSEFormData;
    let dataCriacaoOriginal: string; // Data de criação original do item

    try {
      const currentItem = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.getById(itemId)
        .select("DadosFormulario", "StatusAvaliacao", "Created")();

      // Armazenar data de criação original do item (nunca deve ser alterada)
      dataCriacaoOriginal = currentItem.Created;

      if (currentItem.DadosFormulario) {
        const currentData = JSON.parse(currentItem.DadosFormulario);

        // Preservar TUDO que já existia
        historicoStatusChange =
          currentData.metadata?.historicoStatusChange || {};
        historicoRevisoesExistente =
          currentData.metadata?.historicoRevisoes || [];
        metadataExistente = currentData.metadata || {};
        formDataAtual = currentData;

        console.log("📋 Dados preservados após possível revisão:");
        console.log(
          "- Histórico de Status:",
          Object.keys(historicoStatusChange)
        );
        console.log(
          "- Revisões existentes:",
          historicoRevisoesExistente.length
        );
        console.log("- Data de criação original:", dataCriacaoOriginal);

        // Adicionar entrada de quando o status "Em Andamento" foi criado (se não existir)
        if (!historicoStatusChange["Em Andamento"] && currentItem.Created) {
          historicoStatusChange["Em Andamento"] = {
            dataAlteracao: currentItem.Created,
            usuario: userContext?.displayName || "Sistema",
            email: userContext?.email || "sistema@oceaneering.com",
          };
        }
      } else {
        formDataAtual = formData;
      }
    } catch (error) {
      console.log(
        "Erro ao carregar histórico existente, iniciando novo:",
        error
      );
      formDataAtual = formData;
      dataCriacaoOriginal = now.toISOString(); // Fallback se não conseguir carregar
    }

    // QUARTO: Adicionar entrada para status "Enviado" (APENAS isso, sem criar nova revisão)
    historicoStatusChange.Enviado = {
      dataAlteracao: now.toISOString(),
      usuario: userContext?.displayName || "Usuário Externo",
      email: userContext?.email || "usuario@externo.com",
    };

    console.log(
      "🔄 Atualizando status para 'Enviado' - SEM criar nova revisão"
    );

    // QUINTO: Criar JSON dos dados para submissão (PRESERVANDO TODOS OS CAMPOS)
    const createFormDataJSON = (): Record<string, unknown> => {
      return {
        // Preservar campos obrigatórios do formulário
        id: itemId,
        statusFormulario: "Enviado",
        dataCriacao: dataCriacaoOriginal, // SEMPRE usar a data de criação original do item
        dataUltimaModificacao: now.toISOString(),
        // Dados do formulário
        dadosGerais: formDataAtual.dadosGerais || {},
        conformidadeLegal: formDataAtual.conformidadeLegal || {},
        servicosEspeciais: formDataAtual.servicosEspeciais || {},
        anexos: normalizedAttachments,
        metadata: {
          // Preservar metadata existente (EXCETO dataSubmissao que é redundante)
          ...metadataExistente,
          // Remover campo duplicado se existir
          dataSubmissao: undefined,
          // Atualizar apenas campos necessários
          dataUltimaModificacao: now.toISOString(),
          usuario: userContext?.displayName || "Usuário Externo",
          email: userContext?.email || "usuario@externo.com",
          temAnexos: attachmentCount > 0,
          totalAnexos: attachmentCount,
          // PRESERVAR histórico de revisões existente
          historicoRevisoes: historicoRevisoesExistente,
          // ATUALIZAR apenas histórico de status
          historicoStatusChange: historicoStatusChange,
          // Manter operação como mudança de status
          tipoOperacao: hasChanges
            ? "Formulário Submetido com Alterações"
            : "Formulário Submetido",
        },
      };
    };

    const jsonData = createFormDataJSON();

    // SEXTO: Dados para atualização no SharePoint
    const updateData = {
      Title: (dados.empresa || "Formulário HSE").toString(),
      CNPJ: (dados.cnpj || "").toString(),
      NumeroContrato: (dados.numeroContrato || "").toString(),
      StatusAvaliacao: "Enviado", // Alterar status para Enviado
      DataEnvio: now.toISOString(),
      ResponsavelTecnico: (dados.responsavelTecnico || "").toString(),
      GrauRisco: (dados.grauRisco || "1").toString(),
      PercentualConclusao: 100,
      DadosFormulario: JSON.stringify(jsonData),
      UltimaModificacao: now.toISOString(),
      AnexosCount: attachmentCount,
    };

    try {
      const list = this.sp.web.lists.getByTitle(this.listName);

      // Atualizar item existente ao invés de criar novo
      await list.items.getById(itemId).update(updateData);

      console.log("✅ Formulário HSE submetido com sucesso! ID:", itemId);
      console.log("- Status alterado para: Enviado");
      console.log("- Alterações detectadas:", hasChanges ? "Sim" : "Não");
      console.log("- Revisões totais:", historicoRevisoesExistente.length);
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
      throw new Error(`Falha ao submeter formulário: ${error.message}`);
    }
  }

  /**
   * Detecta mudanças entre formulários antigo e novo, focando apenas em alterações reais do usuário
   */
  private detectChanges(
    oldFormData: IHSEFormData,
    newFormData: IHSEFormData
  ): IFormFieldChange[] {
    const changes: IFormFieldChange[] = [];

    try {
      // 1. DADOS GERAIS - comparação direta dos campos principais
      const dadosGeraisFields: (keyof typeof oldFormData.dadosGerais)[] = [
        "empresa",
        "cnpj",
        "numeroContrato",
        "responsavelTecnico",
        "grauRisco",
        "escopoServico",
        "atividadePrincipalCNAE",
        "totalEmpregados",
        "empregadosParaServico",
        "possuiSESMT",
        "numeroComponentesSESMT",
        "gerenteContratoMarine",
      ];

      dadosGeraisFields.forEach((field) => {
        const oldValue = oldFormData.dadosGerais?.[field];
        const newValue = newFormData.dadosGerais?.[field];

        if (oldValue !== newValue) {
          // Ignorar mudanças insignificantes
          if ((oldValue === undefined || oldValue === null) && newValue === "")
            return;
          if ((newValue === undefined || newValue === null) && oldValue === "")
            return;

          changes.push({
            campo: `dadosGerais.${String(field)}`,
            tipo:
              oldValue === undefined || oldValue === null
                ? "adicionado"
                : "alterado",
            valorAnterior: oldValue,
            valorNovo: newValue,
          });
        }
      });

      // 2. CONFORMIDADE LEGAL - Detectar TODAS as mudanças sem filtros de prioridade
      const oldConformidade = oldFormData.conformidadeLegal || {};
      const newConformidade = newFormData.conformidadeLegal || {};

      // Obter todas as NRs (seções) presentes nos dados antigos e novos
      const allNRs = new Set([
        ...Object.keys(oldConformidade),
        ...Object.keys(newConformidade),
      ]);

      // NRs obrigatórias que sempre têm aplicavel: true (não devem gerar mudanças de aplicabilidade)
      const nrsObrigatorias = new Set(["nr01", "nr04", "nr05", "nr06", "nr07"]);

      console.log("=== DETECTANDO MUDANÇAS NA CONFORMIDADE LEGAL ===");
      console.log("NRs a verificar:", Array.from(allNRs));
      console.log(
        "NRs obrigatórias (ignorar aplicabilidade):",
        Array.from(nrsObrigatorias)
      );
      console.log(
        "REGISTRANDO TODAS AS ALTERAÇÕES (sem filtros de prioridade)"
      );

      allNRs.forEach((nrKey) => {
        const oldNR = (oldConformidade as unknown as Record<string, unknown>)[
          nrKey
        ] as Record<string, unknown>;
        const newNR = (newConformidade as unknown as Record<string, unknown>)[
          nrKey
        ] as Record<string, unknown>;

        console.log(`Processando ${nrKey}`);

        // Se a NR não existia antes e agora existe
        if (!oldNR && newNR) {
          // Registrar mudança de aplicabilidade APENAS para NRs não obrigatórias
          if (newNR.aplicavel !== undefined && !nrsObrigatorias.has(nrKey)) {
            changes.push({
              campo: `conformidadeLegal.${nrKey}.aplicavel`,
              tipo: "adicionado",
              valorAnterior: undefined,
              valorNovo: newNR.aplicavel as boolean,
            });
            console.log(
              `✅ ${nrKey} aplicabilidade adicionada: ${newNR.aplicavel}`
            );
          }

          // Verificar todas as questões respondidas
          Object.keys(newNR).forEach((key) => {
            if (
              key.startsWith("questao") &&
              (newNR[key] as Record<string, unknown>)?.resposta
            ) {
              const questao = newNR[key] as Record<string, unknown>;
              changes.push({
                campo: `conformidadeLegal.${nrKey}.${key}.resposta`,
                tipo: "adicionado",
                valorAnterior: undefined,
                valorNovo: questao.resposta as string,
              });
              console.log(`✅ ${nrKey}.${key} respondida: ${questao.resposta}`);
            }
          });
        }
        // Se a NR existia antes e ainda existe, verificar mudanças
        else if (oldNR && newNR) {
          // Verificar mudança na aplicabilidade APENAS para NRs não obrigatórias
          if (
            oldNR.aplicavel !== newNR.aplicavel &&
            !nrsObrigatorias.has(nrKey)
          ) {
            changes.push({
              campo: `conformidadeLegal.${nrKey}.aplicavel`,
              tipo: "alterado",
              valorAnterior: oldNR.aplicavel as boolean,
              valorNovo: newNR.aplicavel as boolean,
            });
            console.log(
              `✅ ${nrKey} aplicabilidade alterada: ${oldNR.aplicavel} → ${newNR.aplicavel}`
            );
          }

          // Verificar mudanças nas questões (TODAS as alterações)
          const allQuestoes = new Set([
            ...Object.keys(oldNR).filter((k) => k.startsWith("questao")),
            ...Object.keys(newNR).filter((k) => k.startsWith("questao")),
          ]);

          allQuestoes.forEach((questaoKey) => {
            const oldQuestao = oldNR[questaoKey] as Record<string, unknown>;
            const newQuestao = newNR[questaoKey] as Record<string, unknown>;

            // Questão adicionada
            if (!oldQuestao?.resposta && newQuestao?.resposta) {
              changes.push({
                campo: `conformidadeLegal.${nrKey}.${questaoKey}.resposta`,
                tipo: "adicionado",
                valorAnterior: undefined,
                valorNovo: newQuestao.resposta as string,
              });
              console.log(
                `✅ ${nrKey}.${questaoKey} adicionada: ${newQuestao.resposta}`
              );
            }
            // Questão alterada
            else if (
              oldQuestao?.resposta &&
              newQuestao?.resposta &&
              oldQuestao.resposta !== newQuestao.resposta
            ) {
              changes.push({
                campo: `conformidadeLegal.${nrKey}.${questaoKey}.resposta`,
                tipo: "alterado",
                valorAnterior: oldQuestao.resposta as string,
                valorNovo: newQuestao.resposta as string,
              });
              console.log(
                `✅ ${nrKey}.${questaoKey} alterada: ${oldQuestao.resposta} → ${newQuestao.resposta}`
              );
            }
            // Questão removida
            else if (oldQuestao?.resposta && !newQuestao?.resposta) {
              changes.push({
                campo: `conformidadeLegal.${nrKey}.${questaoKey}.resposta`,
                tipo: "removido",
                valorAnterior: oldQuestao.resposta as string,
                valorNovo: undefined,
              });
              console.log(
                `✅ ${nrKey}.${questaoKey} removida: ${oldQuestao.resposta}`
              );
            }
          });
        }
        // Se a NR existia antes mas não existe mais
        else if (oldNR && !newNR) {
          changes.push({
            campo: `conformidadeLegal.${nrKey}`,
            tipo: "removido",
            valorAnterior: "NR preenchida",
            valorNovo: undefined,
          });
          console.log(`✅ ${nrKey} removida completamente`);
        }
      });

      // 3. SERVIÇOS ESPECIAIS - comparação direta
      if (oldFormData.servicosEspeciais && newFormData.servicosEspeciais) {
        // Verificar fornecedor de embarcações
        if (
          oldFormData.servicosEspeciais.fornecedorEmbarcacoes !==
          newFormData.servicosEspeciais.fornecedorEmbarcacoes
        ) {
          changes.push({
            campo: "servicosEspeciais.fornecedorEmbarcacoes",
            tipo: "alterado",
            valorAnterior: oldFormData.servicosEspeciais.fornecedorEmbarcacoes,
            valorNovo: newFormData.servicosEspeciais.fornecedorEmbarcacoes,
          });
        }

        // Verificar fornecedor de içamento
        if (
          oldFormData.servicosEspeciais.fornecedorIcamento !==
          newFormData.servicosEspeciais.fornecedorIcamento
        ) {
          changes.push({
            campo: "servicosEspeciais.fornecedorIcamento",
            tipo: "alterado",
            valorAnterior: oldFormData.servicosEspeciais.fornecedorIcamento,
            valorNovo: newFormData.servicosEspeciais.fornecedorIcamento,
          });
        }

        // Verificar se dados de embarcações foram alterados - comparar campos específicos
        const oldEmbarcacoes = oldFormData.servicosEspeciais.embarcacoes;
        const newEmbarcacoes = newFormData.servicosEspeciais.embarcacoes;

        if (
          oldEmbarcacoes &&
          newEmbarcacoes &&
          newFormData.servicosEspeciais.fornecedorEmbarcacoes
        ) {
          // Verificar mudanças específicas nos dados de embarcações
          const embarcacaoFields = [
            "tipoEmbarcacao",
            "capacidadePassageiros",
            "numeroRegistro",
            "certificadosValidos",
          ];
          embarcacaoFields.forEach((field) => {
            const oldVal = (
              oldEmbarcacoes as unknown as Record<string, unknown>
            )[field];
            const newVal = (
              newEmbarcacoes as unknown as Record<string, unknown>
            )[field];
            if (oldVal !== newVal) {
              changes.push({
                campo: `servicosEspeciais.embarcacoes.${field}`,
                tipo: oldVal === undefined ? "adicionado" : "alterado",
                valorAnterior: oldVal as string | boolean | number,
                valorNovo: newVal as string | boolean | number,
              });
            }
          });
        }

        // Verificar se dados de içamento foram alterados - comparar campos específicos
        const oldIcamento = oldFormData.servicosEspeciais.icamento;
        const newIcamento = newFormData.servicosEspeciais.icamento;

        if (
          oldIcamento &&
          newIcamento &&
          newFormData.servicosEspeciais.fornecedorIcamento
        ) {
          // Verificar mudanças específicas nos dados de içamento
          const icamentoFields = [
            "capacidadeMaxima",
            "tipoEquipamento",
            "certificadosValidos",
            "operadoresQualificados",
          ];
          icamentoFields.forEach((field) => {
            const oldVal = (oldIcamento as unknown as Record<string, unknown>)[
              field
            ];
            const newVal = (newIcamento as unknown as Record<string, unknown>)[
              field
            ];
            if (oldVal !== newVal) {
              changes.push({
                campo: `servicosEspeciais.icamento.${field}`,
                tipo: oldVal === undefined ? "adicionado" : "alterado",
                valorAnterior: oldVal as string | boolean | number,
                valorNovo: newVal as string | boolean | number,
              });
            }
          });
        }
      }

      console.log("=== MUDANÇAS DETECTADAS ===");
      console.log("Total de mudanças:", changes.length);
      changes.forEach((change) => {
        console.log(`${change.tipo.toUpperCase()}: ${change.campo}`, {
          anterior: change.valorAnterior,
          novo: change.valorNovo,
        });
      });
    } catch (error) {
      console.error("Erro ao detectar mudanças:", error);
      // Em caso de erro, retornar uma mudança genérica
      changes.push({
        campo: "Formulário",
        tipo: "alterado",
        valorAnterior: "Estado anterior",
        valorNovo: "Estado atualizado",
      });
    }

    return changes;
  }

  /**
   * Detecta mudanças nos anexos
   */
  private detectAttachmentChanges(
    oldAttachments: { [category: string]: IAttachmentMetadata[] } | undefined,
    newAttachments: { [category: string]: IAttachmentMetadata[] }
  ): IFormFieldChange[] {
    const changes: IFormFieldChange[] = [];

    // Normalizar anexos (garantir que são objetos válidos)
    const normalizeAttachments = (
      attachments: unknown
    ): { [category: string]: IAttachmentMetadata[] } => {
      if (!attachments || typeof attachments !== "object") return {};

      const normalized: { [category: string]: IAttachmentMetadata[] } = {};
      Object.keys(attachments as Record<string, unknown>).forEach(
        (category) => {
          const files = (attachments as Record<string, unknown>)[category];
          if (Array.isArray(files)) {
            normalized[category] = files;
          }
        }
      );
      return normalized;
    };

    const oldNormalized = normalizeAttachments(oldAttachments);
    const newNormalized = normalizeAttachments(newAttachments);

    // Obter todas as categorias
    const allCategories = new Set([
      ...Object.keys(oldNormalized),
      ...Object.keys(newNormalized),
    ]);

    allCategories.forEach((category) => {
      const oldFiles = oldNormalized[category] || [];
      const newFiles = newNormalized[category] || [];

      // Criar mapas por nome de arquivo para comparação
      const oldFileMap = new Map(oldFiles.map((f) => [f.fileName, f]));
      const newFileMap = new Map(newFiles.map((f) => [f.fileName, f]));

      // Arquivos removidos
      oldFiles.forEach((oldFile) => {
        if (!newFileMap.has(oldFile.fileName)) {
          changes.push({
            campo: `Anexo - ${category}`,
            tipo: "removido",
            valorAnterior: `${oldFile.fileName} (${oldFile.fileType})`,
            valorNovo: undefined,
          });
        }
      });

      // Arquivos adicionados
      newFiles.forEach((newFile) => {
        if (!oldFileMap.has(newFile.fileName)) {
          changes.push({
            campo: `Anexo - ${category}`,
            tipo: "adicionado",
            valorAnterior: undefined,
            valorNovo: `${newFile.fileName} (${newFile.fileType})`,
          });
        }
      });

      // Arquivos alterados (mesmo nome, dados diferentes)
      newFiles.forEach((newFile) => {
        const oldFile = oldFileMap.get(newFile.fileName);
        if (
          oldFile &&
          (oldFile.fileType !== newFile.fileType ||
            oldFile.fileSize !== newFile.fileSize)
        ) {
          changes.push({
            campo: `Anexo - ${category}`,
            tipo: "alterado",
            valorAnterior: `${oldFile.fileName} (${oldFile.fileType})`,
            valorNovo: `${newFile.fileName} (${newFile.fileType})`,
          });
        }
      });
    });

    console.log("=== MUDANÇAS DE ANEXOS DETECTADAS ===");
    console.log("Total de mudanças de anexos:", changes.length);
    changes.forEach((change) => {
      console.log(`${change.tipo.toUpperCase()}: ${change.campo}`, {
        anterior: change.valorAnterior,
        novo: change.valorNovo,
      });
    });

    return changes;
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
   * Atualiza um formulário com rastreamento completo de mudanças
   */
  public async updateFormWithChanges(
    itemId: number,
    newFormData: IHSEFormData,
    newAttachments: { [category: string]: IAttachmentMetadata[] }
  ): Promise<void> {
    try {
      console.log("=== INICIANDO ATUALIZAÇÃO COM RASTREAMENTO DE MUDANÇAS ===");
      console.log("Item ID:", itemId);

      // 1. Obter dados atuais do formulário
      const currentFormData = await this.getFormById(itemId);
      if (!currentFormData) {
        throw new Error(`Formulário com ID ${itemId} não encontrado`);
      }

      console.log("Dados atuais carregados:", {
        dadosGerais: !!currentFormData.dadosGerais,
        conformidadeLegal: !!currentFormData.conformidadeLegal,
        servicosEspeciais: !!currentFormData.servicosEspeciais,
        anexos: !!currentFormData.anexos,
      });

      // 2. Detectar mudanças no formulário
      const formChanges = this.detectChanges(currentFormData, newFormData);

      // 3. Detectar mudanças nos anexos
      const currentAttachments =
        (currentFormData.anexos as unknown as {
          [category: string]: IAttachmentMetadata[];
        }) || {};
      const attachmentChanges = this.detectAttachmentChanges(
        currentAttachments,
        newAttachments
      );

      // 4. Combinar todas as mudanças
      const allChanges = [...formChanges, ...attachmentChanges];

      console.log("=== RESUMO FINAL DE MUDANÇAS ===");
      console.log("Mudanças no formulário:", formChanges.length);
      console.log("Mudanças nos anexos:", attachmentChanges.length);
      console.log("Total de mudanças:", allChanges.length);

      // 5. Preparar dados atualizados com histórico de revisão
      const userContext = this.context?.pageContext?.user;
      const now = new Date();

      // Carregar histórico existente diretamente do SharePoint (dados brutos)
      let historicoRevisoes: IRevisionEntry[] = [];
      try {
        const rawItem = await this.sp.web.lists
          .getByTitle(this.listName)
          .items.getById(itemId)
          .select("DadosFormulario")();

        if (rawItem.DadosFormulario) {
          const rawData = JSON.parse(rawItem.DadosFormulario);
          if (
            rawData.metadata?.historicoRevisoes &&
            Array.isArray(rawData.metadata.historicoRevisoes)
          ) {
            historicoRevisoes = rawData.metadata
              .historicoRevisoes as IRevisionEntry[];
            console.log(
              "Histórico existente carregado:",
              historicoRevisoes.length,
              "revisões"
            );
          } else {
            console.log("Nenhum histórico encontrado, iniciando novo");
          }
        }
      } catch (error) {
        console.log(
          "Erro ao carregar histórico existente, iniciando novo:",
          error
        );
        historicoRevisoes = [];
      }

      // 6. Criar nova entrada de revisão apenas se houver mudanças
      if (allChanges.length > 0) {
        const novaVersao = historicoRevisoes.length + 1;
        const novaRevisao: IRevisionEntry = {
          numeroRevisao: novaVersao,
          data: now.toISOString(),
          usuario: userContext?.displayName || "Usuário Externo",
          email: userContext?.email || "usuario@externo.com",
          tipoOperacao: "Rascunho Atualizado",
          alteracoes: allChanges,
          totalAlteracoes: allChanges.length,
          resumo: `Rascunho atualizado (Rev. ${novaVersao}) - ${allChanges.length} mudança(s)`,
        };

        historicoRevisoes.push(novaRevisao);
        console.log(`=== NOVA REVISÃO ADICIONADA ===`);
        console.log(
          `Revisão ${novaVersao} criada com ${allChanges.length} alterações`
        );
        console.log(`Total de revisões agora: ${historicoRevisoes.length}`);
        console.log(
          "Alterações desta revisão:",
          allChanges.map((c) => `${c.campo}: ${c.tipo}`)
        );
      } else {
        console.log("=== NENHUMA MUDANÇA DETECTADA ===");
        console.log(`Mantendo ${historicoRevisoes.length} revisões existentes`);
      }

      // 7. Preparar dados finais para salvamento
      const numeroRevisaoAtual = historicoRevisoes.length;

      // Manter ou criar histórico de status (se não existir)
      let historicoStatusExistente: Record<
        string,
        { dataAlteracao: string; usuario: string; email: string }
      > = {};
      try {
        const rawItem = await this.sp.web.lists
          .getByTitle(this.listName)
          .items.getById(itemId)
          .select("DadosFormulario")();

        if (rawItem.DadosFormulario) {
          const rawData = JSON.parse(rawItem.DadosFormulario);
          historicoStatusExistente =
            rawData.metadata?.historicoStatusChange || {};
        }
      } catch (error) {
        console.log("Erro ao carregar histórico de status:", error);
      }

      // Se não existe histórico de "Em Andamento", criar
      if (!historicoStatusExistente["Em Andamento"]) {
        historicoStatusExistente["Em Andamento"] = {
          dataAlteracao: now.toISOString(),
          usuario: userContext?.displayName || "Usuário Externo",
          email: userContext?.email || "usuario@externo.com",
        };
      }

      // 🔥 DETECTAR MUDANÇA DE STATUS PARA "ENVIADO"
      const isSubmission = newFormData.statusFormulario === "Enviado";
      let tipoOperacaoFinal =
        allChanges.length > 0 ? "Rascunho Atualizado" : "Sem Alterações";

      if (isSubmission) {
        // Adicionar entrada no histórico de status para "Enviado"
        historicoStatusExistente.Enviado = {
          dataAlteracao: now.toISOString(),
          usuario: userContext?.displayName || "Usuário Externo",
          email: userContext?.email || "usuario@externo.com",
        };
        tipoOperacaoFinal = "Formulário Enviado";

        // Criar nova revisão específica para submissão (se não havia mudanças)
        if (allChanges.length === 0) {
          const novaVersao = historicoRevisoes.length + 1;
          const revisaoSubmissao: IRevisionEntry = {
            numeroRevisao: novaVersao,
            data: now.toISOString(),
            usuario: userContext?.displayName || "Usuário Externo",
            email: userContext?.email || "usuario@externo.com",
            tipoOperacao: "Formulário Enviado",
            alteracoes: [
              {
                campo: "StatusFormulario",
                tipo: "alterado",
                valorAnterior: "Em Andamento",
                valorNovo: "Enviado",
              },
            ],
            totalAlteracoes: 1,
            resumo: `Formulário enviado para análise (Rev. ${novaVersao})`,
          };

          historicoRevisoes.push(revisaoSubmissao);
          console.log(`=== REVISÃO DE SUBMISSÃO CRIADA ===`);
          console.log(
            `Revisão ${novaVersao} para mudança de status: Em Andamento → Enviado`
          );
        } else {
          // Se já havia mudanças, atualizar a última revisão para refletir a submissão
          const ultimaRevisao = historicoRevisoes[historicoRevisoes.length - 1];
          if (ultimaRevisao) {
            ultimaRevisao.tipoOperacao = "Formulário Enviado";
            ultimaRevisao.resumo = ultimaRevisao.resumo.replace(
              "Rascunho atualizado",
              "Formulário enviado"
            );
            // Adicionar mudança de status às alterações
            ultimaRevisao.alteracoes.push({
              campo: "StatusFormulario",
              tipo: "alterado",
              valorAnterior: "Em Andamento",
              valorNovo: "Enviado",
            });
            ultimaRevisao.totalAlteracoes++;
          }
        }

        console.log("✅ Histórico de status atualizado para incluir 'Enviado'");
      }

      const updatedFormData = {
        ...newFormData,
        anexos: newAttachments,
        metadata: {
          dataSalvamento: now.toISOString(),
          usuario: userContext?.displayName || "Usuário Externo",
          email: userContext?.email || "usuario@externo.com",
          temAnexos: Object.keys(newAttachments).length > 0,
          totalAnexos: Object.values(newAttachments).reduce(
            (total, files) => total + files.length,
            0
          ),
          historicoRevisoes: historicoRevisoes,
          numeroRevisao: numeroRevisaoAtual,
          tipoOperacao: tipoOperacaoFinal,
          historicoStatusChange: historicoStatusExistente,
        },
      };

      // 8. Calcular percentual de conclusão
      const calculateCompletionPercentage = (): number => {
        let completed = 0;
        const totalSections = 3;

        if (
          newFormData.dadosGerais?.empresa &&
          newFormData.dadosGerais?.cnpj &&
          newFormData.dadosGerais?.numeroContrato
        )
          completed++;
        if (
          newFormData.conformidadeLegal &&
          Object.keys(newFormData.conformidadeLegal).length > 0
        )
          completed++;
        if (newFormData.servicosEspeciais) completed++;

        return Math.round((completed / totalSections) * 100);
      };

      // 9. Atualizar no SharePoint
      const updateData = {
        Title: (
          newFormData.dadosGerais?.empresa || "Formulário Atualizado"
        ).toString(),
        CNPJ: (newFormData.dadosGerais?.cnpj || "").toString(),
        NumeroContrato: (
          newFormData.dadosGerais?.numeroContrato || ""
        ).toString(),
        ResponsavelTecnico: (
          newFormData.dadosGerais?.responsavelTecnico || ""
        ).toString(),
        GrauRisco: (newFormData.dadosGerais?.grauRisco || "1").toString(),
        StatusAvaliacao: isSubmission ? "Enviado" : "Em Andamento", // 🔥 Atualizar status na coluna do SharePoint
        PercentualConclusao: isSubmission
          ? 100
          : calculateCompletionPercentage(), // 🔥 100% quando enviado
        DadosFormulario: JSON.stringify(updatedFormData),
        UltimaModificacao: now.toISOString(),
        AnexosCount: Object.values(newAttachments).reduce(
          (total, files) => total + files.length,
          0
        ),
      };

      await this.sp.web.lists
        .getByTitle(this.listName)
        .items.getById(itemId)
        .update(updateData);

      console.log("=== ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ===");
      console.log("Número total de revisões salvas:", historicoRevisoes.length);
      console.log("Revisão atual:", numeroRevisaoAtual);
      console.log("Última operação:", tipoOperacaoFinal);
      console.log("Status final:", isSubmission ? "Enviado" : "Em Andamento");
    } catch (error) {
      console.error("Erro na atualização com rastreamento:", error);
      throw new Error(`Falha ao atualizar formulário: ${error.message}`);
    }
  }
  /**
   * Cria uma entrada de histórico simplificada para salvamentos
   */
  private createSimpleRevisionEntry(
    action: "criado" | "salvo" | "enviado",
    changeCount: number = 1,
    versionNumber: number = 1
  ): IRevisionEntry {
    const userContext = this.context?.pageContext?.user;
    const now = new Date();

    let tipoOperacao: string;
    let resumo: string;
    switch (action) {
      case "criado":
        tipoOperacao = "Rascunho Criado";
        resumo = "Rascunho inicial criado";
        break;
      case "salvo":
        tipoOperacao = "Rascunho Atualizado";
        resumo = `Rascunho atualizado (Rev. ${versionNumber})`;
        break;
      case "enviado":
        tipoOperacao = "Formulário Enviado";
        resumo = "Formulário enviado para análise";
        break;
      default:
        tipoOperacao = "Operação Desconhecida";
        resumo = `Formulário ${action} com sucesso`;
    }

    return {
      numeroRevisao: versionNumber,
      data: now.toISOString(),
      usuario: userContext?.displayName || "Usuário Externo",
      email: userContext?.email || "usuario@externo.com",
      tipoOperacao: tipoOperacao,
      alteracoes: [
        {
          campo: "Formulário",
          tipo: action === "criado" ? "adicionado" : "alterado",
          valorAnterior: action === "criado" ? undefined : "Estado anterior",
          valorNovo:
            action === "criado" ? "Formulário criado" : `Formulário ${action}`,
        },
      ],
      totalAlteracoes: changeCount,
      resumo: resumo,
    };
  }

  /**
   * Adiciona rastreamento de mudanças aos métodos de salvamento existentes
   */
  private addRevisionHistoryToJSON(
    jsonData: Record<string, unknown>,
    action: "criado" | "salvo" | "enviado"
  ): Record<string, unknown> {
    const revisao = this.createSimpleRevisionEntry(action, 1, 1); // Para novo formulário sempre Rev. 1

    const tipoOperacao =
      action === "criado"
        ? "Rascunho Criado"
        : action === "salvo"
        ? "Rascunho Atualizado"
        : "Formulário Enviado";

    console.log(`=== CRIANDO PRIMEIRO HISTÓRICO DE REVISÃO ===`);
    console.log(`Ação: ${action}, Tipo Operação: ${tipoOperacao}`);

    return {
      ...jsonData,
      metadata: {
        ...((jsonData.metadata as Record<string, unknown>) || {}),
        historicoRevisoes: [revisao],
        numeroRevisao: 1,
        tipoOperacao: tipoOperacao,
      },
    };
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
      dataModificacaoCompleta: string;
      userEmail: string;
      userName: string;
      isOwner: boolean;
      numeroRevisoes: number;
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
          "NomePreenchimento",
          "DadosFormulario"
        )
        .orderBy("Modified", false)();

      console.log("Formulários encontrados:", items.length);

      return items.map((item) => {
        // Extrair informações do histórico de revisões
        let numeroRevisoes = 0;
        let dataModificacaoCompleta = item.Modified;

        console.log(`=== PROCESSANDO FORMULÁRIO ${item.Id} ===`);

        try {
          if (item.DadosFormulario) {
            const parsedData = JSON.parse(item.DadosFormulario);
            const metadata = parsedData.metadata;

            console.log(
              `Formulário ${item.Id} - Metadata encontrado:`,
              !!metadata
            );

            if (
              metadata &&
              metadata.historicoRevisoes &&
              Array.isArray(metadata.historicoRevisoes)
            ) {
              numeroRevisoes = metadata.historicoRevisoes.length;
              console.log(
                `Formulário ${item.Id} - Número de revisões: ${numeroRevisoes}`
              );

              // Usar a data da última revisão se disponível
              if (numeroRevisoes > 0) {
                const ultimaRevisao =
                  metadata.historicoRevisoes[numeroRevisoes - 1];
                if (ultimaRevisao && ultimaRevisao.data) {
                  dataModificacaoCompleta = ultimaRevisao.data;
                  console.log(
                    `Formulário ${item.Id} - Data da última revisão: ${dataModificacaoCompleta}`
                  );
                }
              }
            } else {
              console.log(
                `Formulário ${item.Id} - Histórico de revisões não encontrado ou inválido`
              );
            }
          } else {
            console.log(`Formulário ${item.Id} - DadosFormulario ausente`);
          }
        } catch (parseError) {
          console.warn(
            `Erro ao extrair histórico do formulário ${item.Id}:`,
            parseError
          );
          // Manter valores padrão em caso de erro
        }

        // Formatar data completa para exibição
        const formatDataCompleta = (dateString: string): string => {
          try {
            const date = new Date(dateString);
            return date.toLocaleString("pt-BR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          } catch {
            return dateString;
          }
        };

        return {
          id: item.Id,
          cnpj: item.CNPJ || "",
          empresa: item.Title || "",
          status: item.StatusAvaliacao || "Rascunho",
          dataModificacao: item.Modified,
          dataModificacaoCompleta: formatDataCompleta(dataModificacaoCompleta),
          userEmail: item.EmailPreenchimento || "",
          userName: item.NomePreenchimento || "",
          isOwner: true, // Sempre true pois filtramos pelo email do usuário
          numeroRevisoes: numeroRevisoes,
        };
      });
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
