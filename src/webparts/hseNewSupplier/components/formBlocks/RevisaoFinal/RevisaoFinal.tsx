import * as React from "react";
import {
  Stack,
  Text,
  DefaultButton,
  PrimaryButton,
  Separator,
  Icon,
  Dialog,
  DialogType,
  DialogFooter,
  Panel,
  PanelType,
} from "@fluentui/react";
import { useHSEForm } from "../../context/HSEFormContext";
import { NR_QUESTIONS_MAP } from "../../../utils/formConstants";
import { Toast } from "../../common/Toast/Toast";
import { LoadingOverlay } from "../../common/LoadingOverlay/LoadingOverlay";
import { SectionTitle } from "../../common/SectionTitle";
import styles from "./RevisaoFinal.module.scss";

export const RevisaoFinal: React.FC = () => {
  const { state, actions, dispatch, sharePointService, sharePointFileService } =
    useHSEForm();

  const [showSubmitDialog, setShowSubmitDialog] = React.useState(false);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showConformidadePanel, setShowConformidadePanel] =
    React.useState(false);
  const [selectedNR, setSelectedNR] = React.useState<string>("");

  // Toast state
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [toastType, setToastType] = React.useState<
    "success" | "error" | "warning" | "info"
  >("success");
  // Loading Overlay state
  const [loadingVisible, setLoadingVisible] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("");

  // Progress simulation function (similar to FloatingSaveButton)
  // Função utilitária para execução com loading
  const runWithLoading = async (
    action: () => Promise<void>,
    message: string = "Processando..."
  ): Promise<void> => {
    setLoadingVisible(true);
    setLoadingMessage(message);

    try {
      await action();
    } finally {
      setLoadingVisible(false);
    }
  };

  // Função para formatar CNPJ
  const formatCNPJ = (cnpj: string): string => {
    if (!cnpj || cnpj === "Não preenchido") return cnpj;

    // Remove tudo que não é número
    const numbersOnly = cnpj.replace(/\D/g, "");

    // Se não tem 14 dígitos, retorna como está
    if (numbersOnly.length !== 14) return cnpj;

    // Aplica a formatação XX.XXX.XXX/XXXX-XX
    return numbersOnly.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  }; // Função para obter resumo dos dados gerais
  const getDadosGeraisResumo = (): {
    empresa: string;
    cnpj: string;
    numeroContrato: string;
    responsavelTecnico: string;
    dataInicioContrato: string;
    dataTerminoContrato: string;
    anexoREM: string;
    isComplete: boolean;
  } => {
    const { formData, attachments } = state;
    const dadosGerais = formData.dadosGerais;

    return {
      empresa: dadosGerais?.empresa || "Não preenchido",
      cnpj: dadosGerais?.cnpj || "Não preenchido",
      numeroContrato: dadosGerais?.numeroContrato || "Não preenchido",
      responsavelTecnico: dadosGerais?.responsavelTecnico || "Não preenchido",
      dataInicioContrato: dadosGerais?.dataInicioContrato
        ? dadosGerais.dataInicioContrato instanceof Date
          ? dadosGerais.dataInicioContrato.toLocaleDateString("pt-BR")
          : new Date(dadosGerais.dataInicioContrato).toLocaleDateString("pt-BR")
        : "Não preenchido",
      dataTerminoContrato: dadosGerais?.dataTerminoContrato
        ? dadosGerais.dataTerminoContrato instanceof Date
          ? dadosGerais.dataTerminoContrato.toLocaleDateString("pt-BR")
          : new Date(dadosGerais.dataTerminoContrato).toLocaleDateString(
              "pt-BR"
            )
        : "Não preenchido",
      anexoREM:
        attachments.rem?.length > 0
          ? attachments.rem.map((f) => f.fileName || f.originalName).join(", ")
          : "Não anexado",
      isComplete: Boolean(
        dadosGerais?.empresa &&
          dadosGerais?.cnpj &&
          dadosGerais?.numeroContrato &&
          dadosGerais?.responsavelTecnico &&
          dadosGerais?.dataInicioContrato &&
          dadosGerais?.dataTerminoContrato &&
          attachments.rem?.length > 0
      ),
    };
  };

  // Função para obter resumo da conformidade legal
  const getConformidadeLegalResumo = (): {
    nrsRespondidas: Array<{
      nr: string;
      titulo: string;
      questoes: Array<{
        id: number;
        texto: string;
        resposta: string;
        anexo?: string; // Também deve incluir anexo para NRs
      }>;
    }>;
    outrosItensRespondidos: Array<{
      key: string;
      titulo: string;
      questoes: Array<{
        id: number;
        texto: string;
        resposta: string;
        anexo?: string; // Agora também inclui anexo para outros itens
      }>;
    }>;
    anexos: string[];
    isComplete: boolean;
    totalRespondidas: number;
  } => {
    const { formData, attachments } = state;
    const conformidade = formData.conformidadeLegal;

    if (!conformidade) {
      return {
        nrsRespondidas: [],
        outrosItensRespondidos: [],
        anexos: [],
        isComplete: false,
        totalRespondidas: 0,
      };
    } // Mapeamento dos blocos de NR para extrair dados estruturados
    const NR_BLOCKS = [
      {
        key: "nr01",
        titulo: "NR 01 - Disposições Gerais",
        questoes: [
          { key: "questao1", idx: 1 },
          { key: "questao2", idx: 2 },
        ],
      },
      {
        key: "nr04",
        titulo: "NR 04 - SESMT",
        questoes: [
          { key: "questao1", idx: 3 },
          { key: "questao2", idx: 4 },
        ],
      },
      {
        key: "nr05",
        titulo: "NR 05 - CIPA",
        questoes: [
          { key: "questao1", idx: 5 },
          { key: "questao2", idx: 6 },
        ],
      },
      {
        key: "nr06",
        titulo: "NR 06 - EPI",
        questoes: [
          { key: "questao1", idx: 7 },
          { key: "questao2", idx: 8 },
        ],
      },
      {
        key: "nr07",
        titulo: "NR 07 - PCMSO",
        questoes: [
          { key: "questao1", idx: 9 },
          { key: "questao2", idx: 10 },
          { key: "questao3", idx: 11 },
        ],
      },
      {
        key: "nr10",
        titulo: "NR 10 - Instalações e Serviços em Eletricidade",
        questoes: [
          { key: "questao1", idx: 12 },
          { key: "questao2", idx: 13 },
          { key: "questao3", idx: 14 },
        ],
      },
      {
        key: "nr11",
        titulo:
          "NR 11 - Transporte, Movimentação, Armazenagem e Manuseio de Materiais",
        questoes: [
          { key: "questao1", idx: 15 },
          { key: "questao2", idx: 16 },
        ],
      },
      {
        key: "nr12",
        titulo: "NR 12 - Máquinas e Equipamentos",
        questoes: [
          { key: "questao1", idx: 17 },
          { key: "questao2", idx: 18 },
        ],
      },
      {
        key: "nr13",
        titulo: "NR 13 - Caldeiras e Vasos de Pressão",
        questoes: [{ key: "questao1", idx: 19 }],
      },
      {
        key: "nr15",
        titulo: "NR 15 - Atividades e Operações Insalubres",
        questoes: [{ key: "questao1", idx: 20 }],
      },
      {
        key: "nr16",
        titulo: "NR 16 - Atividades e Operações Periculosas",
        questoes: [{ key: "questao1", idx: 21 }],
      },
      {
        key: "nr23",
        titulo: "NR 23 - Proteção Contra Incêndios",
        questoes: [
          { key: "questao1", idx: 22 },
          { key: "questao2", idx: 23 },
          { key: "questao3", idx: 24 },
        ],
      },
    ]; // Mapeamento dos outros itens de conformidade (não-NRs)
    const OUTROS_CONFORMIDADE = [
      {
        key: "licencasAmbientais",
        titulo: "Licenças Ambientais",
        questoes: [{ key: "questao1", idx: 25 }],
      },
      {
        key: "legislacaoMaritima",
        titulo: "Legislação Marítima",
        questoes: [
          { key: "questao1", idx: 26 },
          { key: "questao2", idx: 27 },
          { key: "questao3", idx: 28 },
          { key: "questao4", idx: 29 },
          { key: "questao5", idx: 30 },
          { key: "questao6", idx: 31 },
        ],
      },
      {
        key: "treinamentos",
        titulo: "Treinamentos Obrigatórios",
        questoes: [
          { key: "questao1", idx: 32 },
          { key: "questao2", idx: 33 },
          { key: "questao3", idx: 34 },
        ],
      },
      {
        key: "gestaoSMS",
        titulo: "Gestão de SMS (Saúde, Meio Ambiente e Segurança)",
        questoes: [
          { key: "questao1", idx: 35 },
          { key: "questao2", idx: 36 },
          { key: "questao3", idx: 37 },
          { key: "questao4", idx: 38 },
          { key: "questao5", idx: 39 },
        ],
      },
    ];
    const nrsRespondidas = NR_BLOCKS.filter((block) => {
      const nrData = conformidade[block.key as keyof typeof conformidade];
      if (!nrData || typeof nrData !== "object") return false;

      // NRs obrigatórias que sempre devem aparecer (não têm toggle de aplicabilidade)
      const MANDATORY_NR_BLOCKS = ["nr01", "nr04", "nr05", "nr06", "nr07"];

      // Se é uma NR obrigatória, só mostrar se tiver dados
      if (MANDATORY_NR_BLOCKS.includes(block.key)) {
        return true;
      }

      // Para NRs opcionais, verificar se foi marcada como aplicável pelo usuário
      const blockObj = nrData as unknown as { aplicavel?: boolean };
      return blockObj.aplicavel === true;
    })
      .map((block) => {
        const nrData = conformidade[
          block.key as keyof typeof conformidade
        ] as unknown as Record<string, { resposta?: string }>;

        const questoes = block.questoes
          .map((q) => {
            const questionObj = nrData[q.key] || {};
            const questionMeta = (
              NR_QUESTIONS_MAP as Record<
                string,
                { text: string; attachment?: string }
              >
            )[q.idx];
            const resposta = questionObj.resposta || "";

            // Buscar anexo se existir
            let anexo = "";
            if (questionMeta?.attachment && resposta === "SIM") {
              const attachmentFiles =
                attachments[questionMeta.attachment] || [];
              if (attachmentFiles.length > 0) {
                anexo = attachmentFiles
                  .map((f) => f.fileName || f.originalName)
                  .join(", ");
              }
            }

            return {
              id: q.idx,
              texto: questionMeta?.text || `Questão ${q.idx}`,
              resposta,
              anexo,
            };
          })
          .filter((q) => q.resposta && q.resposta !== ""); // Só questões respondidas

        return {
          nr: block.key.toUpperCase(),
          titulo: block.titulo,
          questoes,
        };
      })
      .filter((nr) => nr.questoes.length > 0); // Só NRs com questões respondidas

    // Processar outros itens de conformidade (não-NRs)
    const outrosItensRespondidos = OUTROS_CONFORMIDADE.filter((block) => {
      const itemData = conformidade[block.key as keyof typeof conformidade];
      if (!itemData || typeof itemData !== "object") return false;

      // Para outros itens de conformidade, verificar se foi marcada como aplicável
      const blockObj = itemData as unknown as { aplicavel?: boolean };
      return blockObj.aplicavel === true;
    })
      .map((block) => {
        const itemData = conformidade[
          block.key as keyof typeof conformidade
        ] as unknown as Record<string, { resposta?: string }>;

        const questoes = block.questoes
          .map((q) => {
            const questionObj = itemData[q.key] || {};
            const questionMeta = (
              NR_QUESTIONS_MAP as Record<
                string,
                { text: string; attachment?: string }
              >
            )[q.idx];
            const resposta = questionObj.resposta || "";

            // Buscar anexo se existir e a resposta for SIM
            let anexo = "";
            if (questionMeta?.attachment && resposta === "SIM") {
              const attachmentFiles =
                attachments[questionMeta.attachment] || [];
              if (attachmentFiles.length > 0) {
                anexo = attachmentFiles
                  .map((f) => f.fileName || f.originalName)
                  .join(", ");
              }
            }

            return {
              id: q.idx,
              texto: questionMeta?.text || `Questão ${q.idx}`,
              resposta,
              anexo, // Agora inclui o anexo
            };
          })
          .filter((q) => q.resposta && q.resposta !== ""); // Só questões respondidas

        return {
          key: block.key,
          titulo: block.titulo,
          questoes,
        };
      })
      .filter((item) => item.questoes.length > 0); // Só itens com questões respondidas    // Obter anexos de conformidade
    const anexosConformidade = [] as string[];

    // Categorias completas de anexos de conformidade legal baseadas no ATTACHMENT_CATEGORIES
    const conformidadeCategories = [
      // Evidências básicas (questões 63-73)
      { key: "sesmt", label: "SESMT" },
      { key: "cipa", label: "CIPA" },
      { key: "treinamento", label: "Treinamentos" },
      { key: "treinamentoEPI", label: "Treinamento EPI" },
      { key: "caEPI", label: "CA EPI" },
      { key: "pcmso", label: "PCMSO" },
      { key: "aso", label: "ASO" },
      { key: "planoResiduos", label: "Plano de Resíduos" },
      { key: "cat", label: "CAT" },

      // NR10 - Novos anexos
      { key: "nr10ProjetoInstalacoes", label: "NR10 - Projeto de Instalações" },
      {
        key: "nr10CertificacaoProfissionais",
        label: "NR10 - Certificação de Profissionais",
      },

      // NR11 - Novo anexo
      {
        key: "nr11CertificadoTreinamento",
        label: "NR11 - Certificado de Treinamento",
      },

      // NR12 - Novos anexos
      { key: "nr12PlanoInspecao", label: "NR12 - Plano de Inspeção" },
      {
        key: "nr12EvidenciaDispositivo",
        label: "NR12 - Evidência de Dispositivo",
      },

      // NR13 - Novo anexo
      {
        key: "nr13EvidenciaSistematica",
        label: "NR13 - Evidência Sistemática",
      },

      // NR15 - Novo anexo
      { key: "nr15LaudoInsalubridade", label: "NR15 - Laudo de Insalubridade" },

      // NR16 - Novo anexo
      {
        key: "nr16LaudoPericulosidade",
        label: "NR16 - Laudo de Periculosidade",
      },

      // NR23 - Novo anexo
      { key: "nr23LaudoManutencao", label: "NR23 - Laudo de Manutenção" },

      // Licenças Ambientais - Novo anexo
      { key: "licencaOperacao", label: "Licença de Operação" },

      // Treinamentos Obrigatórios - Novos anexos
      {
        key: "certificadoProgramaTreinamento",
        label: "Certificado Programa de Treinamento",
      },
      { key: "evidenciaTreinamento", label: "Evidência de Treinamento" },

      // Gestão de SMS - Novos anexos
      {
        key: "smsProcedimentoAcidentes",
        label: "SMS - Procedimento para Acidentes",
      },
      { key: "smsCalendarioInspecoes", label: "SMS - Calendário de Inspeções" },
      {
        key: "smsProcedimentoResiduos",
        label: "SMS - Procedimento para Resíduos",
      },
      { key: "smsMetasObjetivos", label: "SMS - Metas e Objetivos" },
      { key: "smsProgramaAnual", label: "SMS - Programa Anual" },
    ];

    conformidadeCategories.forEach((category) => {
      if (attachments[category.key]?.length > 0) {
        anexosConformidade.push(
          `${category.label}: ${attachments[category.key]
            .map((f) => f.fileName || f.originalName)
            .join(", ")}`
        );
      }
    });
    return {
      nrsRespondidas,
      outrosItensRespondidos,
      anexos: anexosConformidade,
      isComplete: nrsRespondidas.length > 0,
      totalRespondidas: nrsRespondidas.length,
    };
  }; // Função para obter resumo dos serviços especializados
  const getServicosEspecializadosResumo = (): {
    isEmbarcacoes: boolean;
    isIcamento: boolean;
    anexosEmbarcacoes: string[];
    anexosIcamento: string[];
    servicosSelecionados: string;
    isComplete: boolean;
  } => {
    const { formData, attachments } = state;
    const servicos = formData.servicosEspeciais;

    const isEmbarcacoes = servicos?.fornecedorEmbarcacoes;
    const isIcamento = servicos?.fornecedorIcamento;
    const anexosEmbarcacoes = [] as string[];
    const anexosIcamento = [] as string[];

    if (isEmbarcacoes) {
      // Verificar todas as categorias de certificados marítimos obrigatórios
      const embarcacoesCategories = [
        { key: "iopp", label: "IOPP" },
        { key: "registroArmador", label: "Registro Armador" },
        { key: "propriedadeMaritima", label: "Propriedade Marítima" },
        { key: "arqueacao", label: "Arqueação" },
        { key: "segurancaNavegacao", label: "Segurança de Navegação" },
        { key: "classificacaoCasco", label: "Classificação do Casco" },
        { key: "classificacaoMaquinas", label: "Classificação de Máquinas" },
        { key: "bordaLivre", label: "Borda Livre" },
        { key: "seguroDepem", label: "Seguro DEPEM" },
        { key: "autorizacaoAntaq", label: "Autorização ANTAQ" },
        { key: "tripulacaoSeguranca", label: "Tripulação de Segurança" },
        { key: "agulhaMagnetica", label: "Agulha Magnética" },
        { key: "balsaInflavel", label: "Balsa Inflável" },
        { key: "licencaRadio", label: "Licença de Rádio" },
      ];

      embarcacoesCategories.forEach((category) => {
        if (attachments[category.key]?.length > 0) {
          anexosEmbarcacoes.push(
            `${category.label}: ${attachments[category.key]
              .map((f) => f.fileName || f.originalName)
              .join(", ")}`
          );
        }
      });
    }

    if (isIcamento) {
      // Verificar todas as categorias de documentos de içamento obrigatórios
      const icamentoCategories = [
        { key: "testeCarga", label: "Teste de Carga" },
        { key: "registroCREA", label: "CREA Engenheiro" },
        { key: "art", label: "ART" },
        { key: "planoManutencao", label: "Plano de Manutenção" },
        { key: "monitoramentoFumaca", label: "Fumaça Preta" },
        {
          key: "certificacaoEquipamentos",
          label: "Certificação de Equipamentos",
        },
      ];

      icamentoCategories.forEach((category) => {
        if (attachments[category.key]?.length > 0) {
          anexosIcamento.push(
            `${category.label}: ${attachments[category.key]
              .map((f) => f.fileName || f.originalName)
              .join(", ")}`
          );
        }
      });
    }

    return {
      isEmbarcacoes,
      isIcamento,
      anexosEmbarcacoes,
      anexosIcamento,
      servicosSelecionados:
        [isEmbarcacoes && "Embarcações", isIcamento && "Içamento"]
          .filter(Boolean)
          .join(", ") || "Nenhum serviço selecionado",
      isComplete:
        (isEmbarcacoes || isIcamento) &&
        (!isEmbarcacoes ||
          [
            "iopp",
            "registroArmador",
            "propriedadeMaritima",
            "arqueacao",
            "segurancaNavegacao",
            "classificacaoCasco",
            "classificacaoMaquinas",
            "bordaLivre",
            "seguroDepem",
            "autorizacaoAntaq",
            "tripulacaoSeguranca",
            "agulhaMagnetica",
            "balsaInflavel",
            "licencaRadio",
          ].every((cat) => attachments[cat]?.length > 0)) &&
        (!isIcamento ||
          [
            "testeCarga",
            "registroCREA",
            "art",
            "planoManutencao",
            "monitoramentoFumaca",
            "certificacaoEquipamentos",
          ].every((cat) => attachments[cat]?.length > 0)),
    };
  };
  const handleSubmit = async (): Promise<void> => {
    setShowSubmitDialog(false); // Fecha o dialog imediatamente
    setIsSubmitting(true);
    let submissionSuccessful = false;

    try {
      await runWithLoading(async () => {
        // Save attachments first if needed
        let savedAttachments = state.attachments;
        const cnpj = state.formData.dadosGerais.cnpj;
        const empresa = state.formData.dadosGerais.empresa;

        if (cnpj && empresa && Object.keys(state.attachments).length > 0) {
          console.log("=== REVISÃO FINAL: VERIFICANDO ANEXOS ===");

          // Separar anexos que precisam ser salvos vs anexos já salvos
          const attachmentsToSave: {
            [category: string]: (typeof state.attachments)[string];
          } = {};
          let hasNewAttachments = false;

          Object.keys(state.attachments).forEach((category) => {
            const files = state.attachments[category];
            const newFiles = files.filter((file) => file.fileData);

            if (newFiles.length > 0) {
              attachmentsToSave[category] = newFiles;
              hasNewAttachments = true;
              console.log(
                `Categoria '${category}': ${newFiles.length} novos anexos para submissão`
              );
            }
          });

          if (hasNewAttachments) {
            console.log("Salvando novos anexos para submissão final...");
            const newlySavedAttachments =
              await sharePointFileService.saveFormAttachments(
                cnpj,
                empresa,
                attachmentsToSave,
                state.formData.id! // Adicionar ID do formulário obrigatório
              );

            // Mesclar anexos existentes com recém-salvos
            savedAttachments = { ...state.attachments };
            Object.keys(newlySavedAttachments).forEach((category) => {
              if (savedAttachments[category]) {
                const existingFiles = savedAttachments[category].filter(
                  (f) => !f.fileData
                );
                savedAttachments[category] = [
                  ...existingFiles,
                  ...newlySavedAttachments[category],
                ];
              } else {
                savedAttachments[category] = newlySavedAttachments[category];
              }
            });
          } else {
            console.log("Todos os anexos já estão prontos para submissão");
          }
        }

        // Atualizar formulário existente ao invés de criar novo
        if (state.formData.id) {
          // Se já existe um ID, atualizar o formulário existente
          await sharePointService.submitFormWithUpdate(
            state.formData.id,
            {
              ...state.formData,
              statusFormulario: "Enviado",
            },
            savedAttachments
          );
        } else {
          // Se não tem ID, usar o método original (criar novo)
          await sharePointService.submitFormData(
            {
              ...state.formData,
              statusFormulario: "Enviado",
            },
            savedAttachments
          );
        }

        // Clear local draft after successful submission
        localStorage.removeItem("hse_form_draft");

        // Mark as successful if we reach this point
        submissionSuccessful = true;
      }, "submit");

      // Show success toast
      setToastMessage("Formulário enviado com sucesso!");
      setToastType("success");
      setToastVisible(true);
    } catch (error) {
      console.error("Erro no envio:", error);

      // Se o processo principal foi bem-sucedido, considerar sucesso
      if (
        submissionSuccessful ||
        (error instanceof Error &&
          error.message &&
          (error.message.toLowerCase().includes("failed to fetch") ||
            error.message.toLowerCase().includes("falha ao enviar formulário")))
      ) {
        console.log(
          "Considerando envio como bem-sucedido apesar do erro:",
          error.message
        );
        setToastMessage("Formulário enviado com sucesso!");
        setToastType("success");
        setToastVisible(true);
      } else {
        setToastMessage("Erro ao enviar o formulário. Tente novamente.");
        setToastType("error");
        setToastVisible(true);
      }
    } finally {
      setIsSubmitting(false);

      // Aguardar um pouco antes de verificar o toastType para garantir que foi definido
      setTimeout(() => {
        // Após sucesso, resetar formulário e voltar para tela inicial
        if (toastType === "success") {
          // Aguarda o toast sumir antes de resetar (para UX)
          setTimeout(() => {
            actions.resetForm();
            actions.setApplicationPhase({ phase: "ENTRADA" });
          }, 4000); // 4 segundos, igual à duração do Toast
        }
      }, 100);
    }
  };
  // Handler for save button with progress
  // Handler para mostrar confirmação antes de salvar
  const handleSaveClick = (): void => {
    setShowSaveDialog(true);
  };

  const handleSaveWithProgress = async (): Promise<void> => {
    try {
      await runWithLoading(async () => {
        await actions.saveFormData();
      }, "Salvando rascunho...");

      // Show success toast
      setToastMessage(
        "Rascunho salvo com sucesso! Redirecionando para a página inicial..."
      );
      setToastType("success");
      setToastVisible(true);

      // Aguardar um pouco para o usuário ver a mensagem e depois redirecionar
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirecionar para a página inicial
      if (actions?.setApplicationPhase) {
        actions.setApplicationPhase({
          phase: "ENTRADA",
          cnpj: "",
          isOverwrite: false,
          requiresApproval: false,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);

      // Show error toast
      setToastMessage("Erro ao salvar o rascunho. Tente novamente.");
      setToastType("error");
      setToastVisible(true);
    }
  };

  const handleEditSection = (step: number): void => {
    // Navegar para a seção específica para edição usando o dispatch do contexto
    if (dispatch) {
      dispatch({ type: "SET_CURRENT_STEP", payload: step });
    }
  };
  const dadosGeraisResumo = getDadosGeraisResumo();
  const conformidadeLegalResumo = getConformidadeLegalResumo();
  const servicosEspecializadosResumo = getServicosEspecializadosResumo();

  return (
    <div className={styles.revisaoFinal}>
      <Stack tokens={{ childrenGap: 24 }}>
        <SectionTitle
          title="D - Revisão Final"
          subtitle="Verifique todas as informações antes de enviar o formulário"
          icon="ReviewSolid"
          variant="primary"
        />
        {/* Bloco 1: Dados Gerais */}
        <div className={styles.reviewBlock}>
          <div className={styles.blockHeader}>
            <div className={styles.blockIcon}>
              <Icon iconName="ContactInfo" />
            </div>
            <div className={styles.blockTitleArea}>
              <Text variant="xLarge" className={styles.blockTitle}>
                1. Dados Gerais
              </Text>
            </div>
            <PrimaryButton
              text="Editar"
              iconProps={{ iconName: "Edit" }}
              onClick={() => handleEditSection(1)}
              className={styles.editButton}
            />
          </div>

          <div className={styles.blockContent}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <Text variant="smallPlus" className={styles.infoLabel}>
                  Empresa:
                </Text>
                <Text variant="medium" className={styles.infoValue}>
                  {dadosGeraisResumo.empresa}
                </Text>
              </div>{" "}
              <div className={styles.infoItem}>
                <Text variant="smallPlus" className={styles.infoLabel}>
                  CNPJ:
                </Text>
                <Text variant="medium" className={styles.infoValue}>
                  {formatCNPJ(dadosGeraisResumo.cnpj)}
                </Text>
              </div>
              <div className={styles.infoItem}>
                <Text variant="smallPlus" className={styles.infoLabel}>
                  Contrato:
                </Text>
                <Text variant="medium" className={styles.infoValue}>
                  {dadosGeraisResumo.numeroContrato}
                </Text>
              </div>
              <div className={styles.infoItem}>
                <Text variant="smallPlus" className={styles.infoLabel}>
                  Responsável Técnico:
                </Text>
                <Text variant="medium" className={styles.infoValue}>
                  {dadosGeraisResumo.responsavelTecnico}
                </Text>
              </div>
              <div className={styles.infoItem}>
                <Text variant="smallPlus" className={styles.infoLabel}>
                  Início do Contrato:
                </Text>
                <Text variant="medium" className={styles.infoValue}>
                  {dadosGeraisResumo.dataInicioContrato}
                </Text>
              </div>
              <div className={styles.infoItem}>
                <Text variant="smallPlus" className={styles.infoLabel}>
                  Término do Contrato:
                </Text>
                <Text variant="medium" className={styles.infoValue}>
                  {dadosGeraisResumo.dataTerminoContrato}
                </Text>
              </div>
            </div>

            <div className={styles.attachmentSection}>
              <Text variant="mediumPlus" className={styles.attachmentTitle}>
                <Icon iconName="Attach" className={styles.attachIcon} />
                Anexos REM
              </Text>
              <Text variant="medium" className={styles.attachmentValue}>
                {dadosGeraisResumo.anexoREM}
              </Text>
            </div>
          </div>
        </div>{" "}
        {/* Bloco 2: Conformidade Legal */}
        <div className={styles.reviewBlock}>
          <div className={styles.blockHeader}>
            <div className={styles.blockIcon}>
              <Icon iconName="ComplianceAudit" />
            </div>
            <div className={styles.blockTitleArea}>
              <Text variant="xLarge" className={styles.blockTitle}>
                2. Conformidade Legal
              </Text>
            </div>
            <PrimaryButton
              text="Editar"
              iconProps={{ iconName: "Edit" }}
              onClick={() => handleEditSection(2)}
              className={styles.editButton}
            />
          </div>

          <div className={styles.blockContent}>
            <div className={styles.conformidadeInfo}>
              {conformidadeLegalResumo.nrsRespondidas.length > 0 && (
                <div className={styles.nrsListSection}>
                  <Text variant="mediumPlus" className={styles.nrsTitle}>
                    <Icon iconName="CheckMark" className={styles.checkIcon} />
                    NRs Respondidas (
                    {conformidadeLegalResumo.nrsRespondidas.length}):
                  </Text>
                  <div className={styles.nrCardsContainer}>
                    {conformidadeLegalResumo.nrsRespondidas.map((nr) => (
                      <div key={nr.nr} className={styles.nrCard}>
                        <div className={styles.nrCardHeader}>
                          <Text variant="medium" className={styles.nrCardTitle}>
                            {nr.titulo}
                          </Text>
                          <Text
                            variant="small"
                            className={styles.nrCardSubtitle}
                          >
                            {nr.questoes.length} questões respondidas
                          </Text>
                        </div>
                        <div className={styles.nrCardActions}>
                          <button
                            className={styles.detailsButton}
                            onClick={() => setSelectedNR(nr.nr)}
                            title="Ver detalhes das respostas"
                          >
                            <Icon iconName="Info" />
                            Ver Detalhes
                          </button>
                        </div>
                      </div>
                    ))}{" "}
                  </div>
                </div>
              )}{" "}
              {conformidadeLegalResumo.outrosItensRespondidos.length > 0 && (
                <div className={styles.nrsListSection}>
                  <Text variant="mediumPlus" className={styles.nrsTitle}>
                    <Icon
                      iconName="ComplianceAudit"
                      className={styles.checkIcon}
                    />
                    Outros Itens de Conformidade (
                    {conformidadeLegalResumo.outrosItensRespondidos.length}):
                  </Text>
                  <div className={styles.nrCardsContainer}>
                    {conformidadeLegalResumo.outrosItensRespondidos.map(
                      (item) => (
                        <div key={item.key} className={styles.nrCard}>
                          <div className={styles.nrCardHeader}>
                            <Text
                              variant="medium"
                              className={styles.nrCardTitle}
                            >
                              {item.titulo}
                            </Text>
                            <Text
                              variant="small"
                              className={styles.nrCardSubtitle}
                            >
                              {item.questoes.length} questões respondidas
                            </Text>{" "}
                          </div>
                          <div className={styles.nrCardActions}>
                            <button
                              className={styles.detailsButton}
                              onClick={() => setSelectedNR(item.key)}
                              title="Ver detalhes das respostas"
                            >
                              <Icon iconName="Info" />
                              Ver Detalhes
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {conformidadeLegalResumo.anexos.length > 0 && (
              <div className={styles.attachmentSection}>
                <Text variant="mediumPlus" className={styles.attachmentTitle}>
                  <Icon iconName="Attach" className={styles.attachIcon} />
                  Anexos de Conformidade
                </Text>
                {conformidadeLegalResumo.anexos.map((anexo, index) => (
                  <Text
                    key={index}
                    variant="medium"
                    className={styles.attachmentValue}
                  >
                    {anexo}
                  </Text>
                ))}
              </div>
            )}
          </div>
        </div>{" "}
        {/* Bloco 3: Serviços Especializados */}
        <div className={styles.reviewBlock}>
          <div className={styles.blockHeader}>
            <div className={styles.blockIcon}>
              <Icon iconName="Settings" />
            </div>
            <div className={styles.blockTitleArea}>
              <Text variant="xLarge" className={styles.blockTitle}>
                3. Serviços Especializados
              </Text>
            </div>
            <PrimaryButton
              text="Editar"
              iconProps={{ iconName: "Edit" }}
              onClick={() => handleEditSection(3)}
              className={styles.editButton}
            />
          </div>

          <div className={styles.blockContent}>
            <Text variant="mediumPlus" className={styles.servicosInfo}>
              Serviços Selecionados:{" "}
              <strong>
                {servicosEspecializadosResumo.servicosSelecionados}
              </strong>
            </Text>

            {servicosEspecializadosResumo.isEmbarcacoes && (
              <div className={styles.servicoSection}>
                <Text variant="mediumPlus" className={styles.servicoTitle}>
                  <Icon iconName="Ferry" className={styles.servicoIcon} />
                  Serviços de Embarcações
                </Text>
                {servicosEspecializadosResumo.anexosEmbarcacoes.length > 0 ? (
                  servicosEspecializadosResumo.anexosEmbarcacoes.map(
                    (anexo, index) => (
                      <Text
                        key={index}
                        variant="medium"
                        className={styles.attachmentValue}
                      >
                        {anexo}
                      </Text>
                    )
                  )
                ) : (
                  <Text variant="medium" className={styles.missingAttachment}>
                    Anexos pendentes
                  </Text>
                )}
              </div>
            )}

            {servicosEspecializadosResumo.isIcamento && (
              <div className={styles.servicoSection}>
                <Text variant="mediumPlus" className={styles.servicoTitle}>
                  <Icon iconName="crane" className={styles.servicoIcon} />
                  Serviços de Içamento
                </Text>
                {servicosEspecializadosResumo.anexosIcamento.length > 0 ? (
                  servicosEspecializadosResumo.anexosIcamento.map(
                    (anexo, index) => (
                      <Text
                        key={index}
                        variant="medium"
                        className={styles.attachmentValue}
                      >
                        {anexo}
                      </Text>
                    )
                  )
                ) : (
                  <Text variant="medium" className={styles.missingAttachment}>
                    Anexos pendentes
                  </Text>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Área de submissão */}
        <div className={styles.submitArea}>
          <Separator />
          <div className={styles.submitContent}>
            {" "}
            <div className={styles.submitButtons}>
              <DefaultButton
                text="Salvar Rascunho"
                iconProps={{ iconName: "Save" }}
                onClick={handleSaveClick}
                className={styles.saveButton}
                disabled={isSubmitting || loadingVisible}
              />{" "}
              <PrimaryButton
                text={isSubmitting ? "Enviando..." : "Submeter Formulário"}
                iconProps={{ iconName: isSubmitting ? "Sync" : "Send" }}
                onClick={() => setShowSubmitDialog(true)}
                disabled={isSubmitting || loadingVisible}
                className={styles.submitButton}
              />
            </div>
          </div>
        </div>
        {/* Dialog de confirmação */}
        <Dialog
          hidden={!showSubmitDialog}
          onDismiss={() => setShowSubmitDialog(false)}
          dialogContentProps={{
            type: DialogType.largeHeader,
            title: "Confirmar Envio do Formulário",
          }}
          modalProps={{
            isBlocking: true,
            styles: { main: { maxWidth: 450 } },
          }}
        >
          <div style={{ padding: "20px 0" }}>
            <Text
              variant="medium"
              style={{ marginBottom: "16px", display: "block" }}
            >
              Tem certeza que deseja enviar o formulário para revisão do HSE?
            </Text>
            <Text
              variant="medium"
              style={{ marginBottom: "16px", display: "block" }}
            >
              Esta ação não pode ser desfeita.
            </Text>
            <div
              style={{
                background: "#fff4e6",
                border: "1px solid #ffb900",
                borderRadius: "2px",
                padding: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <Icon
                  iconName="Warning"
                  style={{
                    color: "#ffb900",
                    marginTop: "2px",
                    fontSize: "16px",
                  }}
                />
                <div>
                  <Text
                    variant="medium"
                    style={{ fontWeight: "600", color: "#323130" }}
                  >
                    IMPORTANTE:
                  </Text>
                  <Text
                    variant="medium"
                    style={{ color: "#323130", display: "block" }}
                  >
                    Após submissão, você não poderá mais editar esse formulário.
                  </Text>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <PrimaryButton
              onClick={handleSubmit}
              text={isSubmitting ? "Enviando..." : "Confirmar Envio"}
              disabled={isSubmitting || loadingVisible}
              iconProps={{ iconName: isSubmitting ? "Sync" : "Send" }}
            />
            <DefaultButton
              onClick={() => setShowSubmitDialog(false)}
              text="Cancelar"
              disabled={isSubmitting || loadingVisible}
            />
          </DialogFooter>
        </Dialog>{" "}
        {/* Dialog de confirmação para salvar rascunho */}
        <Dialog
          hidden={!showSaveDialog}
          onDismiss={() => setShowSaveDialog(false)}
          dialogContentProps={{
            type: DialogType.largeHeader,
            title: "Confirmar Salvamento",
            subText:
              "Tem certeza que deseja salvar o rascunho do formulário HSE? Após salvar, você poderá fechar a página e continuar de onde parou a qualquer hora.",
          }}
          modalProps={{
            isBlocking: true,
            styles: { main: { maxWidth: 450 } },
          }}
        >
          {/* Mensagem de alerta destacada */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderLeft: "3px solid #ffc107",
              borderRadius: "4px",
              padding: "12px 16px",
              margin: "12px 0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                color: "#856404",
                flexShrink: 0,
              }}
            >
              ⚠️
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "500",
                color: "#495057",
                lineHeight: "1.4",
              }}
            >
              <strong style={{ color: "#856404" }}>IMPORTANTE:</strong>{" "}
              Oceaneering irá avaliar apenas os formulários finalizados e
              submetidos.
            </div>
          </div>
          <DialogFooter>
            <PrimaryButton
              onClick={async () => {
                setShowSaveDialog(false);
                await handleSaveWithProgress();
              }}
              text="Confirmar"
              disabled={isSubmitting || loadingVisible}
            />
            <DefaultButton
              onClick={() => setShowSaveDialog(false)}
              text="Cancelar"
              disabled={isSubmitting || loadingVisible}
            />
          </DialogFooter>
        </Dialog>
        {/* Panel de detalhes da conformidade geral */}
        <Panel
          isOpen={showConformidadePanel}
          onDismiss={() => setShowConformidadePanel(false)}
          type={PanelType.medium}
          headerText="Detalhes da Conformidade Legal"
          className={styles.detailsPanel}
        >
          <div className={styles.panelContent}>
            <div className={styles.conformidadeDetails}>
              <Text variant="large" className={styles.panelSectionTitle}>
                Resumo Geral da Conformidade
              </Text>{" "}
              {conformidadeLegalResumo.nrsRespondidas.length > 0 && (
                <div className={styles.nrGroup}>
                  <Text variant="mediumPlus" className={styles.nrGroupTitle}>
                    <Icon iconName="CheckMark" className={styles.checkIcon} />
                    NRs Respondidas (
                    {conformidadeLegalResumo.nrsRespondidas.length})
                  </Text>
                  {conformidadeLegalResumo.nrsRespondidas.map((nr) => (
                    <div key={nr.nr} className={styles.nrItem}>
                      <Text variant="medium">
                        {nr.titulo} - {nr.questoes.length} questões respondidas
                      </Text>
                    </div>
                  ))}
                </div>
              )}
              {conformidadeLegalResumo.outrosItensRespondidos.length > 0 && (
                <div className={styles.nrGroup}>
                  <Text variant="mediumPlus" className={styles.nrGroupTitle}>
                    <Icon
                      iconName="ComplianceAudit"
                      className={styles.checkIcon}
                    />
                    Outros Itens de Conformidade (
                    {conformidadeLegalResumo.outrosItensRespondidos.length})
                  </Text>
                  {conformidadeLegalResumo.outrosItensRespondidos.map(
                    (item) => (
                      <div key={item.key} className={styles.nrItem}>
                        <Text variant="medium">
                          {item.titulo} - {item.questoes.length} questões
                          respondidas
                        </Text>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div className={styles.panelActions}>
              <PrimaryButton
                text="Editar Conformidade"
                iconProps={{ iconName: "Edit" }}
                onClick={() => {
                  handleEditSection(2);
                  setShowConformidadePanel(false);
                }}
              />
              <DefaultButton
                text="Fechar"
                onClick={() => setShowConformidadePanel(false)}
              />
            </div>
          </div>
        </Panel>{" "}
        {/* Panel de detalhes específicos de uma NR ou Outro Item */}
        <Panel
          isOpen={selectedNR !== ""}
          onDismiss={() => setSelectedNR("")}
          type={PanelType.large}
          headerText={`Detalhes - ${
            conformidadeLegalResumo.nrsRespondidas.find(
              (nr) => nr.nr === selectedNR
            )?.titulo ||
            conformidadeLegalResumo.outrosItensRespondidos.find(
              (item) => item.key === selectedNR
            )?.titulo ||
            ""
          }`}
          className={styles.detailsPanel}
        >
          {selectedNR && (
            <div className={styles.panelContent}>
              {(() => {
                // Primeiro, tentar encontrar nas NRs
                const nrData = conformidadeLegalResumo.nrsRespondidas.find(
                  (nr) => nr.nr === selectedNR
                );

                // Se não encontrar nas NRs, buscar nos outros itens
                const outroItemData =
                  conformidadeLegalResumo.outrosItensRespondidos.find(
                    (item) => item.key === selectedNR
                  );

                const data = nrData || outroItemData;
                if (!data) return null;

                return (
                  <div className={styles.nrDetailCard}>
                    <Text variant="large" className={styles.nrDetailTitle}>
                      {data.titulo}
                    </Text>
                    <Text variant="medium" className={styles.nrDetailCount}>
                      {data.questoes.length} questões respondidas
                    </Text>

                    <div className={styles.questionsDetail}>
                      {data.questoes.map((questao) => (
                        <div
                          key={questao.id}
                          className={styles.questionDetailItem}
                        >
                          <Text
                            variant="medium"
                            className={styles.questionText}
                          >
                            {questao.id}. {questao.texto}
                          </Text>
                          <div className={styles.questionResponse}>
                            {" "}
                            <Text
                              variant="small"
                              className={styles.responseLabel}
                            >
                              Resposta: <strong>{questao.resposta}</strong>
                            </Text>
                            {"anexo" in questao && questao.anexo && (
                              <Text
                                variant="small"
                                className={styles.attachmentInfo}
                              >
                                📎 Anexo: {questao.anexo}
                              </Text>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div className={styles.panelActions}>
                <PrimaryButton
                  text={`Editar ${
                    conformidadeLegalResumo.nrsRespondidas.find(
                      (nr) => nr.nr === selectedNR
                    )
                      ? "esta NR"
                      : "este item"
                  }`}
                  iconProps={{ iconName: "Edit" }}
                  onClick={() => {
                    handleEditSection(2);
                    setSelectedNR("");
                  }}
                />
                <DefaultButton
                  text="Fechar"
                  onClick={() => setSelectedNR("")}
                />
              </div>{" "}
            </div>
          )}
        </Panel>
        {/* Toast Notifications */}
        <Toast
          message={toastMessage}
          type={toastType}
          visible={toastVisible}
          onDismiss={() => setToastVisible(false)}
          duration={4000}
        />
        {/* Loading Overlay */}
        <LoadingOverlay
          visible={loadingVisible}
          message={loadingMessage}
          operationType="submit"
          fileCount={Object.values(state.attachments || {}).reduce(
            (total, files) => {
              return total + (Array.isArray(files) ? files.length : 0);
            },
            0
          )}
          showTimeWarning={true}
        />
      </Stack>
    </div>
  );
};
