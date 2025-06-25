import * as React from "react";
import {
  Stack,
  Text,
  Dropdown,
  TextField,
  Separator,
  MessageBar,
  MessageBarType,
  Icon,
  Toggle,
  IconButton,
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
} from "@fluentui/react";
import { IConformidadeLegalProps } from "./IConformidadeLegalProps";
import {
  RESPOSTA_OPTIONS,
  NR_QUESTIONS_MAP,
} from "../../../utils/formConstants";
import styles from "./ConformidadeLegal.module.scss";
import { HSEFileUpload } from "../../common/HSEFileUploadSharePoint";
import { SectionTitle } from "../../common/SectionTitle";
import { useHSEForm } from "../../context/HSEFormContext";

export const ConformidadeLegal: React.FC<IConformidadeLegalProps> = ({
  value,
  onChange,
  errors,
}) => {
  const { state } = useHSEForm();

  // Estados para controlar blocos aplicáveis e expandidos
  const [applicableBlocks, setApplicableBlocks] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [expandedBlocks, setExpandedBlocks] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [confirmDialog, setConfirmDialog] = React.useState<{
    isOpen: boolean;
    blockKey: string;
    blockTitle: string;
  }>({ isOpen: false, blockKey: "", blockTitle: "" });
  // useEffect para inicializar estados com base nos dados existentes
  React.useEffect(() => {
    const initialApplicableBlocks: { [key: string]: boolean } = {};
    const initialExpandedBlocks: { [key: string]: boolean } = {};

    // Verificar estado de aplicabilidade em cada bloco
    Object.keys(value).forEach((blockKey) => {
      const blockValue = value[blockKey as keyof typeof value];
      if (blockValue && typeof blockValue === "object") {
        const blockObj = blockValue as unknown as {
          [k: string]: unknown;
          aplicavel?: boolean;
        };

        // Verificar se o bloco tem a flag de aplicabilidade
        if (blockObj.aplicavel === true) {
          initialApplicableBlocks[blockKey] = true;
          initialExpandedBlocks[blockKey] = false; // Começar colapsado
        } else if (blockObj.aplicavel === false) {
          // Bloco explicitamente marcado como não aplicável
          initialApplicableBlocks[blockKey] = false;
          initialExpandedBlocks[blockKey] = false;
        } else {
          // Compatibilidade com dados antigos: verificar se há dados preenchidos
          const hasData = Object.keys(blockObj).some((questionKey) => {
            const questionObj = blockObj[questionKey];
            return (
              questionObj &&
              typeof questionObj === "object" &&
              (questionObj as { resposta?: string }).resposta
            );
          });

          if (hasData) {
            initialApplicableBlocks[blockKey] = true;
            initialExpandedBlocks[blockKey] = false;
          }
        }
      }
    });

    setApplicableBlocks(initialApplicableBlocks);
    setExpandedBlocks(initialExpandedBlocks);
  }, []); // Executa apenas uma vez ao montar o componente
  // Função para lidar com respostas das NRs
  const handleNRResponse = (
    nrKey: keyof typeof value,
    questionKey: string,
    field: "resposta",
    val: string
  ): void => {
    const nrBlock = value[nrKey] as unknown;
    const nrBlockObj =
      typeof nrBlock === "object" && nrBlock !== null
        ? (nrBlock as { [k: string]: unknown })
        : {};
    const questionObj =
      typeof nrBlockObj[questionKey] === "object" &&
      nrBlockObj[questionKey] !== null
        ? (nrBlockObj[questionKey] as { [k: string]: unknown })
        : {};

    // Preservar a flag de aplicabilidade ao atualizar respostas
    onChange(nrKey, {
      ...nrBlockObj,
      aplicavel: true, // Garantir que está marcado como aplicável quando há respostas
      [questionKey]: {
        ...questionObj,
        [field]: val,
      },
    });
  };

  // Função para alternar se um bloco é aplicável
  const handleBlockApplicabilityChange = (
    blockKey: string,
    blockTitle: string,
    isApplicable: boolean
  ): void => {
    if (!isApplicable && applicableBlocks[blockKey]) {
      // Se está desmarcando um bloco que era aplicável, mostrar confirmação
      setConfirmDialog({
        isOpen: true,
        blockKey,
        blockTitle,
      });
    } else {
      // Marcando como aplicável ou desmarcando um que não estava marcado
      setApplicableBlocks((prev) => ({
        ...prev,
        [blockKey]: isApplicable,
      }));
      if (isApplicable) {
        // Expandir automaticamente quando marcar como aplicável
        setExpandedBlocks((prev) => ({
          ...prev,
          [blockKey]: true,
        }));
        // Criar objeto com flag de aplicabilidade para o bloco ao marcar como aplicável
        onChange(blockKey as keyof typeof value, { aplicavel: true });
      } else {
        // Marcar como não aplicável (mas manter registro para distinguir de "nunca marcado")
        onChange(blockKey as keyof typeof value, { aplicavel: false });
      }
    }
  };
  // Função para confirmar desmarcação do bloco
  const confirmBlockRemoval = (): void => {
    const { blockKey } = confirmDialog;
    setApplicableBlocks((prev) => ({
      ...prev,
      [blockKey]: false,
    }));
    setExpandedBlocks((prev) => ({
      ...prev,
      [blockKey]: false,
    }));
    // Marcar como não aplicável (mantém registro para distinguir de "nunca marcado")
    onChange(blockKey as keyof typeof value, { aplicavel: false });
    setConfirmDialog({ isOpen: false, blockKey: "", blockTitle: "" });
  };

  // Função para cancelar desmarcação
  const cancelBlockRemoval = (): void => {
    setConfirmDialog({ isOpen: false, blockKey: "", blockTitle: "" });
  };

  // Função para alternar expansão do bloco
  const toggleBlockExpansion = (blockKey: string): void => {
    setExpandedBlocks((prev) => ({
      ...prev,
      [blockKey]: !prev[blockKey],
    }));
  }; // Função para verificar se um bloco NR está completo
  const isBlockComplete = React.useCallback(
    (
      blockKey: string,
      questions: Array<{ key: string; idx: number }>
    ): boolean => {
      // Se o bloco não é aplicável, considera como completo
      if (!applicableBlocks[blockKey]) {
        return true;
      }

      const blockValue = getBlockValue(blockKey as keyof typeof value) as {
        [key: string]: unknown;
      };

      if (!blockValue) return false;

      // Verifica se todas as questões têm resposta preenchida e anexos quando necessário
      return questions.every((q) => {
        const questionObj = blockValue[q.key] as
          | { resposta?: string }
          | undefined;

        // Verificar se a pergunta tem resposta
        if (
          !questionObj ||
          !questionObj.resposta ||
          questionObj.resposta === ""
        ) {
          return false;
        }

        // Se a resposta é "SIM", verificar se há anexo obrigatório
        if (questionObj.resposta === "SIM") {
          const questionMeta = (
            NR_QUESTIONS_MAP as Record<
              string,
              { text: string; attachment?: string }
            >
          )[String(q.idx)];

          // Se a pergunta requer anexo e a resposta é SIM
          if (questionMeta && questionMeta.attachment) {
            const categoryFiles =
              state.attachments[questionMeta.attachment] || [];
            return categoryFiles.length > 0;
          }
        }

        return true;
      });
    },
    [applicableBlocks, value, state.attachments]
  ); // Mapeamento das NRs e blocos do formulário conforme o modelo de dados e PDF
  const NR_BLOCKS = [
    {
      key: "nr01",
      title: "NR 01 - Disposições Gerais",
      questions: [
        { key: "questao1", idx: 1 },
        { key: "questao2", idx: 2 },
        { key: "questao3", idx: 3 },
        { key: "questao4", idx: 4 },
        { key: "questao5", idx: 5 },
      ],
      comentarios: true,
    },
    {
      key: "nr04",
      title: "NR 04 - SESMT",
      questions: [
        { key: "questao1", idx: 6 },
        { key: "questao2", idx: 7 },
      ],
      comentarios: true,
    },
    {
      key: "nr05",
      title: "NR 05 - CIPA",
      questions: [
        { key: "questao1", idx: 8 },
        { key: "questao2", idx: 9 },
      ],
      comentarios: true,
    },
    {
      key: "nr06",
      title: "NR 06 - EPI",
      questions: [
        { key: "questao1", idx: 10 },
        { key: "questao2", idx: 11 },
      ],
      comentarios: true,
    },
    {
      key: "nr07",
      title: "NR 07 - PCMSO",
      questions: [
        { key: "questao1", idx: 12 },
        { key: "questao2", idx: 13 },
        { key: "questao3", idx: 14 },
      ],
      comentarios: true,
    },
    {
      key: "nr09",
      title: "NR 09 - PPRA",
      questions: [
        { key: "questao1", idx: 15 },
        { key: "questao2", idx: 16 },
        { key: "questao3", idx: 17 },
      ],
      comentarios: true,
    },
    {
      key: "nr10",
      title: "NR 10 - Instalações e Serviços em Eletricidade",
      questions: [
        { key: "questao1", idx: 18 },
        { key: "questao2", idx: 19 },
        { key: "questao3", idx: 20 },
      ],
      comentarios: true,
    },
    {
      key: "nr11",
      title:
        "NR 11 - Transporte, Movimentação, Armazenagem e Manuseio de Materiais",
      questions: [
        { key: "questao1", idx: 21 },
        { key: "questao2", idx: 22 },
      ],
      comentarios: true,
    },
    {
      key: "nr12",
      title: "NR 12 - Máquinas e Equipamentos",
      questions: [
        { key: "questao1", idx: 23 },
        { key: "questao2", idx: 24 },
      ],
      comentarios: true,
    },
    {
      key: "nr13",
      title: "NR 13 - Caldeiras e Vasos de Pressão",
      questions: [{ key: "questao1", idx: 25 }],
      comentarios: true,
    },
    {
      key: "nr15",
      title: "NR 15 - Atividades e Operações Insalubres",
      questions: [{ key: "questao1", idx: 26 }],
      comentarios: true,
    },
    {
      key: "nr23",
      title: "NR 23 - Proteção Contra Incêndios",
      questions: [
        { key: "questao1", idx: 27 },
        { key: "questao2", idx: 28 },
        { key: "questao3", idx: 29 },
      ],
      comentarios: true,
    },
  ];

  // Outros itens de conformidade (não são NRs)
  const OTHER_BLOCKS = [
    {
      key: "licencasAmbientais",
      title: "Licenças Ambientais",
      questions: [{ key: "questao1", idx: 30 }],
      comentarios: true,
    },
    {
      key: "legislacaoMaritima",
      title: "Legislação Marítima",
      questions: [
        { key: "questao1", idx: 31 },
        { key: "questao2", idx: 32 },
        { key: "questao3", idx: 33 },
        { key: "questao4", idx: 34 },
        { key: "questao5", idx: 35 },
        { key: "questao6", idx: 36 },
      ],
      comentarios: true,
    },
    {
      key: "treinamentos",
      title: "Treinamentos Obrigatórios",
      questions: [
        { key: "questao1", idx: 37 },
        { key: "questao2", idx: 38 },
        { key: "questao3", idx: 39 },
      ],
      comentarios: true,
    },
    {
      key: "gestaoSMS",
      title: "Gestão de SMS (Saúde, Meio Ambiente e Segurança)",
      questions: [
        { key: "questao1", idx: 40 },
        { key: "questao2", idx: 41 },
        { key: "questao3", idx: 42 },
        { key: "questao4", idx: 43 },
        { key: "questao5", idx: 44 },
      ],
      comentarios: true,
    },
  ];

  // Função utilitária para acessar blocos de forma flexível
  function getBlockValue(key: keyof typeof value): unknown {
    return value[key] as unknown;
  }

  return (
    <div className={styles.conformidadeLegal}>
      <Stack tokens={{ childrenGap: 20 }}>
        <SectionTitle
          title="B - Cumprimento da Legislação Básica"
          subtitle="Selecione apenas os blocos de NRs aplicáveis ao seu tipo de atividade"
          icon="ComplianceAudit"
          variant="secondary"
        />{" "}
        <MessageBar messageBarType={MessageBarType.info}>
          <Stack tokens={{ childrenGap: 8 }}>
            <Text
              variant="mediumPlus"
              style={{ fontWeight: 600, color: "#0078d4" }}
            >
              📋 INSTRUÇÕES IMPORTANTES:
            </Text>
            <Text variant="medium">
              <strong style={{ color: "#d83b01" }}>SELECIONE</strong> apenas os
              blocos de Normas Regulamentadoras que se aplicam ao seu tipo de
              atividade/fornecimento.
            </Text>
            <Text variant="medium">
              Para cada questão dos blocos selecionados, escolha{" "}
              <strong>SIM</strong>, <strong>NÃO</strong> ou{" "}
              <strong>NÃO APLICÁVEL (NA)</strong>.
            </Text>{" "}
            <Text variant="medium">
              Para respostas{" "}
              <strong style={{ color: "#107c10" }}>&quot;SIM&quot;</strong> em
              questões específicas, será solicitado anexo de documento
              comprobatório.
            </Text>
          </Stack>
        </MessageBar>
        <div className={styles.blocksContainer}>
          {" "}
          {/* Primeira coluna - Blocos 1-8 */}
          <div className={styles.singleBlock}>
            {NR_BLOCKS.slice(0, Math.ceil(NR_BLOCKS.length / 2)).map(
              (block) => {
                const blockValue = getBlockValue(
                  block.key as keyof typeof value
                ) as {
                  [key: string]: unknown;
                };

                const isComplete = isBlockComplete(block.key, block.questions);
                const isApplicable = applicableBlocks[block.key] || false;
                const isExpanded = expandedBlocks[block.key] || false;

                return (
                  <div
                    key={block.key}
                    className={`${styles.nrSection} ${
                      isApplicable ? styles.applicable : styles.notApplicable
                    }`}
                  >
                    {" "}
                    <div className={styles.blockHeader}>
                      <div className={styles.blockTitleSection}>
                        <div className={styles.toggleAndStatus}>
                          <Toggle
                            label={block.title}
                            checked={isApplicable}
                            onChange={(_, checked) =>
                              handleBlockApplicabilityChange(
                                block.key,
                                block.title,
                                checked || false
                              )
                            }
                            onText="Selecionado"
                            offText="Não Selecionado"
                            className={styles.blockToggle}
                          />
                          {isApplicable && (
                            <div className={styles.statusBadgeContainer}>
                              {isComplete ? (
                                <div
                                  className={`${styles.completionBadge} ${styles.fadeIn}`}
                                >
                                  <Icon
                                    iconName="CheckMark"
                                    className={styles.completionIcon}
                                  />
                                  <span className={styles.completionIconBadge}>
                                    Completo
                                  </span>
                                </div>
                              ) : (
                                <div
                                  className={`${styles.incompleteBadge} ${styles.fadeIn}`}
                                >
                                  <Icon
                                    iconName="Warning"
                                    className={styles.incompleteIcon}
                                  />
                                  <span className={styles.incompleteIconBadge}>
                                    Incompleto
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <Text
                          variant="small"
                          className={styles.questionCounter}
                          style={{
                            fontStyle: "italic",
                            color: "#666",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {block.questions.length === 1
                            ? "Uma questão"
                            : `${block.questions.length} questões`}
                        </Text>
                      </div>

                      {isApplicable && (
                        <IconButton
                          iconProps={{
                            iconName: isExpanded ? "ChevronUp" : "ChevronDown",
                          }}
                          title={
                            isExpanded ? "Recolher bloco" : "Expandir bloco"
                          }
                          onClick={() => toggleBlockExpansion(block.key)}
                          className={styles.expandButton}
                        />
                      )}
                    </div>
                    {isApplicable && isExpanded && (
                      <div className={styles.questionsSection}>
                        {block.questions.map((q) => {
                          const questionObj =
                            blockValue &&
                            typeof blockValue === "object" &&
                            q.key in blockValue
                              ? (blockValue[q.key] as { [k: string]: unknown })
                              : {};

                          const questionMeta = (
                            NR_QUESTIONS_MAP as Record<
                              string,
                              { text: string; attachment?: string }
                            >
                          )[String(q.idx)];

                          const requiresAttachment =
                            questionMeta && questionMeta.attachment;
                          const showUpload =
                            requiresAttachment &&
                            questionObj.resposta === "SIM";
                          return (
                            <div
                              key={q.key}
                              className={styles.questionContainer}
                            >
                              <div className={styles.questionSection}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <span className={styles.questionNumber}>
                                    {q.idx}
                                  </span>
                                  <Text
                                    variant="medium"
                                    className={styles.questionText}
                                    style={{ flex: 1 }}
                                  >
                                    {questionMeta?.text || `Pergunta ${q.idx}`}
                                  </Text>
                                </div>
                              </div>

                              <div className={styles.responseSection}>
                                <div className={styles.responseControls}>
                                  <div className={styles.dropdownContainer}>
                                    <Dropdown
                                      label="Resposta"
                                      options={RESPOSTA_OPTIONS}
                                      selectedKey={
                                        typeof questionObj.resposta === "string"
                                          ? questionObj.resposta
                                          : ""
                                      }
                                      onChange={(_, option) =>
                                        handleNRResponse(
                                          block.key as keyof typeof value,
                                          q.key,
                                          "resposta",
                                          option?.key as string
                                        )
                                      }
                                      required
                                      className={styles.responseDropdown}
                                    />
                                  </div>
                                </div>
                                {showUpload && (
                                  <div className={styles.attachmentContainer}>
                                    <HSEFileUpload
                                      label={`Anexar documento comprobatório (${
                                        questionMeta.attachment
                                          ? questionMeta.attachment.toUpperCase()
                                          : ""
                                      })`}
                                      required
                                      category={questionMeta.attachment || ""}
                                      subcategory={q.key}
                                      accept={".pdf,.docx,.xlsx,.jpg,.png"}
                                      maxFileSize={50}
                                      helpText="Anexe o documento solicitado para comprovação."
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {block.comentarios && (
                          <TextField
                            label="Comentários gerais deste bloco (opcional)"
                            value={
                              blockValue &&
                              typeof blockValue === "object" &&
                              typeof blockValue.comentarios === "string"
                                ? blockValue.comentarios
                                : ""
                            }
                            onChange={(_, v) =>
                              onChange(block.key as keyof typeof value, {
                                ...blockValue,
                                aplicavel: true, // Preservar flag de aplicabilidade
                                comentarios: v || "",
                              })
                            }
                            multiline
                            rows={2}
                            className={styles.commentField}
                          />
                        )}
                      </div>
                    )}
                    <Separator />
                  </div>
                );
              }
            )}
          </div>{" "}
          {/* Segunda coluna - Blocos restantes */}
          <div className={styles.singleBlock}>
            {NR_BLOCKS.slice(Math.ceil(NR_BLOCKS.length / 2)).map((block) => {
              const blockValue = getBlockValue(
                block.key as keyof typeof value
              ) as {
                [key: string]: unknown;
              };

              const isComplete = isBlockComplete(block.key, block.questions);
              const isApplicable = applicableBlocks[block.key] || false;
              const isExpanded = expandedBlocks[block.key] || false;

              return (
                <div
                  key={block.key}
                  className={`${styles.nrSection} ${
                    isApplicable ? styles.applicable : styles.notApplicable
                  }`}
                >
                  {" "}
                  <div className={styles.blockHeader}>
                    <div className={styles.blockTitleSection}>
                      <div className={styles.toggleAndStatus}>
                        <Toggle
                          label={block.title}
                          checked={isApplicable}
                          onChange={(_, checked) =>
                            handleBlockApplicabilityChange(
                              block.key,
                              block.title,
                              checked || false
                            )
                          }
                          onText="Selecionado"
                          offText="Não Selecionado"
                          className={styles.blockToggle}
                        />
                        {isApplicable && (
                          <div className={styles.statusBadgeContainer}>
                            {isComplete ? (
                              <div
                                className={`${styles.completionBadge} ${styles.fadeIn}`}
                              >
                                <Icon
                                  iconName="CheckMark"
                                  className={styles.completionIcon}
                                />
                                <span className={styles.completionIconBadge}>
                                  Completo
                                </span>
                              </div>
                            ) : (
                              <div
                                className={`${styles.incompleteBadge} ${styles.fadeIn}`}
                              >
                                <Icon
                                  iconName="Warning"
                                  className={styles.incompleteIcon}
                                />
                                <span className={styles.incompleteIconBadge}>
                                  Incompleto
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Text
                        variant="small"
                        className={styles.questionCounter}
                        style={{
                          fontStyle: "italic",
                          color: "#666",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {block.questions.length === 1
                          ? "Uma questão"
                          : `${block.questions.length} questões`}
                      </Text>
                    </div>

                    {isApplicable && (
                      <IconButton
                        iconProps={{
                          iconName: isExpanded ? "ChevronUp" : "ChevronDown",
                        }}
                        title={isExpanded ? "Recolher bloco" : "Expandir bloco"}
                        onClick={() => toggleBlockExpansion(block.key)}
                        className={styles.expandButton}
                      />
                    )}
                  </div>
                  {isApplicable && isExpanded && (
                    <div className={styles.questionsSection}>
                      {block.questions.map((q) => {
                        const questionObj =
                          blockValue &&
                          typeof blockValue === "object" &&
                          q.key in blockValue
                            ? (blockValue[q.key] as { [k: string]: unknown })
                            : {};

                        const questionMeta = (
                          NR_QUESTIONS_MAP as Record<
                            string,
                            { text: string; attachment?: string }
                          >
                        )[String(q.idx)];

                        const requiresAttachment =
                          questionMeta && questionMeta.attachment;
                        const showUpload =
                          requiresAttachment && questionObj.resposta === "SIM";

                        return (
                          <div key={q.key} className={styles.questionContainer}>
                            <div className={styles.questionSection}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                }}
                              >
                                <span className={styles.questionNumber}>
                                  {q.idx}
                                </span>
                                <Text
                                  variant="medium"
                                  className={styles.questionText}
                                  style={{ flex: 1 }}
                                >
                                  {questionMeta?.text || `Pergunta ${q.idx}`}
                                </Text>
                              </div>
                            </div>{" "}
                            <div className={styles.responseSection}>
                              <div className={styles.responseControls}>
                                <div className={styles.dropdownContainer}>
                                  <Dropdown
                                    label="Resposta"
                                    options={RESPOSTA_OPTIONS}
                                    selectedKey={
                                      typeof questionObj.resposta === "string"
                                        ? questionObj.resposta
                                        : ""
                                    }
                                    onChange={(_, option) =>
                                      handleNRResponse(
                                        block.key as keyof typeof value,
                                        q.key,
                                        "resposta",
                                        option?.key as string
                                      )
                                    }
                                    required
                                    className={styles.responseDropdown}
                                  />
                                </div>
                              </div>
                              {showUpload && (
                                <div className={styles.attachmentContainer}>
                                  <HSEFileUpload
                                    label={`Anexar documento comprobatório (${
                                      questionMeta.attachment
                                        ? questionMeta.attachment.toUpperCase()
                                        : ""
                                    })`}
                                    required
                                    category={questionMeta.attachment || ""}
                                    subcategory={q.key}
                                    accept={".pdf,.docx,.xlsx,.jpg,.png"}
                                    maxFileSize={50}
                                    helpText="Anexe o documento solicitado para comprovação."
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {block.comentarios && (
                        <TextField
                          label="Comentários gerais deste bloco (opcional)"
                          value={
                            blockValue &&
                            typeof blockValue === "object" &&
                            typeof blockValue.comentarios === "string"
                              ? blockValue.comentarios
                              : ""
                          }
                          onChange={(_, v) =>
                            onChange(block.key as keyof typeof value, {
                              ...blockValue,
                              aplicavel: true, // Preservar flag de aplicabilidade
                              comentarios: v || "",
                            })
                          }
                          multiline
                          rows={2}
                          className={styles.commentField}
                        />
                      )}
                    </div>
                  )}
                  <Separator />
                </div>
              );
            })}
          </div>{" "}
        </div>
        {/* Seção Outros Itens de Conformidade */}
        <div style={{ marginTop: "40px" }}>
          <Stack tokens={{ childrenGap: 16 }}>
            <Stack
              horizontal
              verticalAlign="center"
              tokens={{ childrenGap: 8 }}
            >
              <Icon
                iconName="CheckboxCompositeReversed"
                style={{ fontSize: 18, color: "#0078d4" }}
              />
              <Text
                variant="xLarge"
                style={{ fontWeight: 600, color: "#0078d4" }}
              >
                Outros Itens de Conformidade (
                {
                  OTHER_BLOCKS.filter((block) => applicableBlocks[block.key])
                    .length
                }
                ):
              </Text>
            </Stack>

            <div className={styles.blocksContainer}>
              <div className={styles.singleBlock}>
                {OTHER_BLOCKS.map((block) => {
                  const blockValue = getBlockValue(
                    block.key as keyof typeof value
                  ) as {
                    [key: string]: unknown;
                  };

                  const isComplete = isBlockComplete(
                    block.key,
                    block.questions
                  );
                  const isApplicable = applicableBlocks[block.key] || false;
                  const isExpanded = expandedBlocks[block.key] || false;

                  return (
                    <div
                      key={block.key}
                      className={`${styles.nrSection} ${
                        isApplicable ? styles.applicable : styles.notApplicable
                      }`}
                    >
                      <div className={styles.blockHeader}>
                        <div className={styles.blockTitleSection}>
                          <div className={styles.toggleAndStatus}>
                            <Toggle
                              label={block.title}
                              checked={isApplicable}
                              onChange={(_, checked) =>
                                handleBlockApplicabilityChange(
                                  block.key,
                                  block.title,
                                  checked || false
                                )
                              }
                              onText="Selecionado"
                              offText="Não Selecionado"
                              className={styles.blockToggle}
                            />
                            {isApplicable && (
                              <div className={styles.statusBadgeContainer}>
                                {isComplete ? (
                                  <div
                                    className={`${styles.completionBadge} ${styles.fadeIn}`}
                                  >
                                    <Icon
                                      iconName="CheckMark"
                                      className={styles.completionIcon}
                                    />
                                    <span
                                      className={styles.completionIconBadge}
                                    >
                                      Completo
                                    </span>
                                  </div>
                                ) : (
                                  <div
                                    className={`${styles.incompleteBadge} ${styles.fadeIn}`}
                                  >
                                    <Icon
                                      iconName="Warning"
                                      className={styles.incompleteIcon}
                                    />
                                    <span
                                      className={styles.incompleteIconBadge}
                                    >
                                      Incompleto
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <Text
                            variant="small"
                            className={styles.questionCounter}
                            style={{
                              fontStyle: "italic",
                              color: "#666",
                              fontSize: "12px",
                              marginTop: "4px",
                            }}
                          >
                            {block.questions.length === 1
                              ? "Uma questão"
                              : `${block.questions.length} questões`}
                          </Text>
                        </div>

                        {isApplicable && (
                          <IconButton
                            iconProps={{
                              iconName: isExpanded
                                ? "ChevronUp"
                                : "ChevronDown",
                            }}
                            title={
                              isExpanded ? "Recolher bloco" : "Expandir bloco"
                            }
                            onClick={() => toggleBlockExpansion(block.key)}
                            className={styles.expandButton}
                          />
                        )}
                      </div>
                      {isApplicable && isExpanded && (
                        <div className={styles.questionsSection}>
                          {block.questions.map((q) => {
                            const questionObj =
                              blockValue &&
                              typeof blockValue === "object" &&
                              q.key in blockValue
                                ? (blockValue[q.key] as {
                                    [k: string]: unknown;
                                  })
                                : {};

                            const questionMeta = (
                              NR_QUESTIONS_MAP as Record<
                                string,
                                { text: string; attachment?: string }
                              >
                            )[String(q.idx)];

                            const requiresAttachment =
                              questionMeta && questionMeta.attachment;
                            const showUpload =
                              requiresAttachment &&
                              questionObj.resposta === "SIM";
                            return (
                              <div
                                key={q.key}
                                className={styles.questionContainer}
                              >
                                <div className={styles.questionSection}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <span className={styles.questionNumber}>
                                      {q.idx}
                                    </span>
                                    <Text
                                      variant="medium"
                                      className={styles.questionText}
                                      style={{ flex: 1 }}
                                    >
                                      {questionMeta?.text ||
                                        `Pergunta ${q.idx}`}
                                    </Text>
                                  </div>
                                </div>

                                <div className={styles.responseSection}>
                                  <div className={styles.responseControls}>
                                    <div className={styles.dropdownContainer}>
                                      <Dropdown
                                        label="Resposta"
                                        options={RESPOSTA_OPTIONS}
                                        selectedKey={
                                          typeof questionObj.resposta ===
                                          "string"
                                            ? questionObj.resposta
                                            : ""
                                        }
                                        onChange={(_, option) =>
                                          handleNRResponse(
                                            block.key as keyof typeof value,
                                            q.key,
                                            "resposta",
                                            option?.key as string
                                          )
                                        }
                                        required
                                        className={styles.responseDropdown}
                                      />
                                    </div>
                                  </div>
                                  {showUpload && (
                                    <div className={styles.attachmentContainer}>
                                      <HSEFileUpload
                                        label={`Anexar documento comprobatório (${
                                          questionMeta.attachment
                                            ? questionMeta.attachment.toUpperCase()
                                            : ""
                                        })`}
                                        required
                                        category={questionMeta.attachment || ""}
                                        subcategory={q.key}
                                        accept={".pdf,.docx,.xlsx,.jpg,.png"}
                                        maxFileSize={50}
                                        helpText="Anexe o documento solicitado para comprovação."
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {block.comentarios && (
                            <TextField
                              label="Comentários gerais deste bloco (opcional)"
                              value={
                                blockValue &&
                                typeof blockValue === "object" &&
                                typeof blockValue.comentarios === "string"
                                  ? blockValue.comentarios
                                  : ""
                              }
                              onChange={(_, v) =>
                                onChange(block.key as keyof typeof value, {
                                  ...blockValue,
                                  aplicavel: true, // Preservar flag de aplicabilidade
                                  comentarios: v || "",
                                })
                              }
                              multiline
                              rows={2}
                              className={styles.commentField}
                            />
                          )}
                        </div>
                      )}
                      <Separator />
                    </div>
                  );
                })}
              </div>
            </div>
          </Stack>
        </div>
      </Stack>

      {/* Dialog de confirmação para desmarcação de bloco */}
      <Dialog
        hidden={!confirmDialog.isOpen}
        onDismiss={cancelBlockRemoval}
        dialogContentProps={{
          type: DialogType.normal,
          title: "Confirmar remoção do bloco",
          subText: `Tem certeza que deseja desmarcar o bloco "${confirmDialog.blockTitle}"? Todas as respostas já preenchidas neste bloco serão perdidas.`,
        }}
        modalProps={{
          isBlocking: true,
        }}
      >
        {" "}
        <DialogFooter>
          <PrimaryButton onClick={confirmBlockRemoval} text="Sim, remover" />
          <DefaultButton onClick={cancelBlockRemoval} text="Cancelar" />
        </DialogFooter>
      </Dialog>
    </div>
  );
};
