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
import styles from "./RevisaoFinal.module.scss";

export const RevisaoFinal: React.FC = () => {
  const { state, actions, dispatch } = useHSEForm();

  const [showSubmitDialog, setShowSubmitDialog] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showConformidadePanel, setShowConformidadePanel] =
    React.useState(false);
  const [selectedNR, setSelectedNR] = React.useState<string>("");

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
      dataInicioContrato:
        dadosGerais?.dataInicioContrato?.toLocaleDateString("pt-BR") ||
        "Não preenchido",
      dataTerminoContrato:
        dadosGerais?.dataTerminoContrato?.toLocaleDateString("pt-BR") ||
        "Não preenchido",
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
  }; // Função para obter resumo da conformidade legal
  const getConformidadeLegalResumo = (): {
    nrsRespondidas: Array<{
      nr: string;
      titulo: string;
      questoes: Array<{
        id: number;
        texto: string;
        resposta: string;
        anexo?: string;
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
        anexos: [],
        isComplete: false,
        totalRespondidas: 0,
      };
    }

    // Mapeamento dos blocos de NR para extrair dados estruturados
    const NR_BLOCKS = [
      {
        key: "nr01",
        titulo: "NR 01 - Disposições Gerais",
        questoes: [
          { key: "questao1", idx: 1 },
          { key: "questao2", idx: 2 },
          { key: "questao3", idx: 3 },
          { key: "questao4", idx: 4 },
          { key: "questao5", idx: 5 },
        ],
      },
      {
        key: "nr04",
        titulo: "NR 04 - SESMT",
        questoes: [
          { key: "questao7", idx: 7 },
          { key: "questao8", idx: 8 },
        ],
      },
      {
        key: "nr05",
        titulo: "NR 05 - CIPA",
        questoes: [
          { key: "questao10", idx: 10 },
          { key: "questao11", idx: 11 },
        ],
      },
      {
        key: "nr06",
        titulo: "NR 06 - EPI",
        questoes: [
          { key: "questao13", idx: 13 },
          { key: "questao14", idx: 14 },
        ],
      },
      // Adicionar outros blocos conforme necessário
    ];
    const nrsRespondidas = NR_BLOCKS.filter((block) => {
      const nrData = conformidade[block.key as keyof typeof conformidade];
      return nrData && typeof nrData === "object";
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
      .filter((nr) => nr.questoes.length > 0); // Só NRs com questões respondidas    // Obter anexos de conformidade
    const anexosConformidade = [] as string[];

    // Verificar todas as categorias de anexos de conformidade legal baseadas no ATTACHMENT_CATEGORIES
    const conformidadeCategories = [
      { key: "sesmt", label: "SESMT" },
      { key: "cipa", label: "CIPA" },
      { key: "treinamento", label: "Treinamentos" },
      { key: "treinamentoEPI", label: "Treinamento EPI" },
      { key: "caEPI", label: "CA EPI" },
      { key: "ppra", label: "PPRA" },
      { key: "pcmso", label: "PCMSO" },
      { key: "aso", label: "ASO" },
      { key: "planoResiduos", label: "Plano de Resíduos" },
      { key: "cat", label: "CAT" },
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
        { key: "creaEngenheiro", label: "CREA Engenheiro" },
        { key: "art", label: "ART" },
        { key: "planoManutencao", label: "Plano de Manutenção" },
        { key: "fumacaPreta", label: "Fumaça Preta" },
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
            "creaEngenheiro",
            "art",
            "planoManutencao",
            "fumacaPreta",
            "certificacaoEquipamentos",
          ].every((cat) => attachments[cat]?.length > 0)),
    };
  };
  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      const success = await actions.submitForm();
      if (success) {
        setShowSubmitDialog(false);
        // Redirecionar ou mostrar mensagem de sucesso
      }
    } catch (error) {
      console.error("Erro no envio:", error);
    } finally {
      setIsSubmitting(false);
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
        {" "}
        {/* Header */}
        <div className={styles.modernHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <Text variant="xxLarge" className={styles.mainTitle}>
                Revisão Final
              </Text>
              <Text variant="medium" className={styles.subtitle}>
                Verifique todas as informações antes de enviar o formulário
              </Text>
            </div>
          </div>
        </div>
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
                    ))}
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
                text="Salvar Progresso"
                iconProps={{ iconName: "Save" }}
                onClick={() => actions.saveFormData()}
                className={styles.saveButton}
                disabled={isSubmitting}
              />{" "}
              <PrimaryButton
                text={isSubmitting ? "Enviando..." : "Submeter Formulário"}
                iconProps={{ iconName: isSubmitting ? "Sync" : "Send" }}
                onClick={() => setShowSubmitDialog(true)}
                disabled={isSubmitting}
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
            type: DialogType.normal,
            title: "Confirmar Envio do Formulário",
            subText:
              "Tem certeza que deseja enviar o formulário? Esta ação não pode ser desfeita.",
          }}
          modalProps={{
            isBlocking: true,
          }}
        >
          <DialogFooter>
            <PrimaryButton
              onClick={handleSubmit}
              text={isSubmitting ? "Enviando..." : "Confirmar Envio"}
              disabled={isSubmitting}
              iconProps={{ iconName: isSubmitting ? "Sync" : "Send" }}
            />
            <DefaultButton
              onClick={() => setShowSubmitDialog(false)}
              text="Cancelar"
              disabled={isSubmitting}
            />
          </DialogFooter>
        </Dialog>{" "}
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
              </Text>

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
        </Panel>
        {/* Panel de detalhes específicos de uma NR */}
        <Panel
          isOpen={selectedNR !== ""}
          onDismiss={() => setSelectedNR("")}
          type={PanelType.large}
          headerText={`Detalhes - ${
            conformidadeLegalResumo.nrsRespondidas.find(
              (nr) => nr.nr === selectedNR
            )?.titulo || ""
          }`}
          className={styles.detailsPanel}
        >
          {selectedNR && (
            <div className={styles.panelContent}>
              {(() => {
                const nrData = conformidadeLegalResumo.nrsRespondidas.find(
                  (nr) => nr.nr === selectedNR
                );
                if (!nrData) return null;

                return (
                  <div className={styles.nrDetailCard}>
                    <Text variant="large" className={styles.nrDetailTitle}>
                      {nrData.titulo}
                    </Text>
                    <Text variant="medium" className={styles.nrDetailCount}>
                      {nrData.questoes.length} questões respondidas
                    </Text>

                    <div className={styles.questionsDetail}>
                      {nrData.questoes.map((questao) => (
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
                            <Text
                              variant="small"
                              className={styles.responseLabel}
                            >
                              Resposta: <strong>{questao.resposta}</strong>
                            </Text>
                            {questao.anexo && (
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
                  text="Editar esta NR"
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
              </div>
            </div>
          )}
        </Panel>
      </Stack>
    </div>
  );
};
