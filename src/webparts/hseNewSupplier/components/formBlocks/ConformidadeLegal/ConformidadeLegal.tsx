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

export const ConformidadeLegal: React.FC<IConformidadeLegalProps> = ({
  value,
  onChange,
  errors,
}) => {
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

    // Verificar se há dados preenchidos em cada bloco
    Object.keys(value).forEach((blockKey) => {
      const blockValue = value[blockKey as keyof typeof value];
      if (blockValue && typeof blockValue === "object") {
        const blockObj = blockValue as unknown as { [k: string]: unknown };
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
          initialExpandedBlocks[blockKey] = false; // Começar colapsado
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
    onChange(nrKey, {
      ...nrBlockObj,
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
        // Criar objeto vazio no formData para o bloco ao marcar como aplicável
        onChange(blockKey as keyof typeof value, {});
      } else {
        // Limpar dados do bloco quando desmarcar
        onChange(blockKey as keyof typeof value, {});
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
    // Limpar dados do bloco
    onChange(blockKey as keyof typeof value, {});
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
  };

  // Função para verificar se um bloco NR está completo
  const isBlockComplete = (
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

    // Verifica se todas as questões têm resposta preenchida
    return questions.every((q) => {
      const questionObj = blockValue[q.key] as
        | { resposta?: string }
        | undefined;
      return questionObj && questionObj.resposta && questionObj.resposta !== "";
    });
  };

  // Mapeamento das NRs e blocos do formulário conforme o modelo de dados e PDF
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
        { key: "questao7", idx: 7 },
        { key: "questao8", idx: 8 },
      ],
      comentarios: true,
    },
    {
      key: "nr05",
      title: "NR 05 - CIPA",
      questions: [
        { key: "questao10", idx: 10 },
        { key: "questao11", idx: 11 },
      ],
      comentarios: true,
    },
    {
      key: "nr06",
      title: "NR 06 - EPI",
      questions: [
        { key: "questao13", idx: 13 },
        { key: "questao14", idx: 14 },
      ],
      comentarios: true,
    },
    {
      key: "nr07",
      title: "NR 07 - PCMSO",
      questions: [
        { key: "questao16", idx: 16 },
        { key: "questao17", idx: 17 },
        { key: "questao18", idx: 18 },
      ],
      comentarios: true,
    },
    {
      key: "nr09",
      title: "NR 09 - PPRA",
      questions: [
        { key: "questao20", idx: 20 },
        { key: "questao21", idx: 21 },
        { key: "questao22", idx: 22 },
      ],
      comentarios: true,
    },
    {
      key: "nr10",
      title: "NR 10 - Segurança em Instalações e Serviços em Eletricidade",
      questions: [
        { key: "questao24", idx: 24 },
        { key: "questao25", idx: 25 },
        { key: "questao26", idx: 26 },
      ],
      comentarios: true,
    },
    {
      key: "nr11",
      title:
        "NR 11 - Transporte, Movimentação, Armazenagem e Manuseio de Materiais",
      questions: [
        { key: "questao28", idx: 28 },
        { key: "questao29", idx: 29 },
      ],
      comentarios: true,
    },
    {
      key: "nr12",
      title: "NR 12 - Segurança no Trabalho em Máquinas e Equipamentos",
      questions: [
        { key: "questao31", idx: 31 },
        { key: "questao32", idx: 32 },
      ],
      comentarios: true,
    },
    {
      key: "nr13",
      title: "NR 13 - Caldeiras, Vasos de Pressão e Tubulações",
      questions: [{ key: "questao34", idx: 34 }],
      comentarios: true,
    },
    {
      key: "nr15",
      title: "NR 15 - Atividades e Operações Insalubres",
      questions: [{ key: "questao36", idx: 36 }],
      comentarios: true,
    },
    {
      key: "nr23",
      title: "NR 23 - Proteção Contra Incêndios",
      questions: [
        { key: "questao38", idx: 38 },
        { key: "questao39", idx: 39 },
        { key: "questao40", idx: 40 },
      ],
      comentarios: true,
    },
    {
      key: "licencasAmbientais",
      title: "Licenças Ambientais",
      questions: [{ key: "questao42", idx: 42 }],
      comentarios: true,
    },
    {
      key: "legislacaoMaritima",
      title: "Legislação Marítima",
      questions: [
        { key: "questao44", idx: 44 },
        { key: "questao45", idx: 45 },
        { key: "questao46", idx: 46 },
        { key: "questao47", idx: 47 },
        { key: "questao48", idx: 48 },
        { key: "questao49", idx: 49 },
      ],
      comentarios: true,
    },
    {
      key: "treinamentos",
      title: "Treinamentos Obrigatórios",
      questions: [
        { key: "questao51", idx: 51 },
        { key: "questao52", idx: 52 },
        { key: "questao53", idx: 53 },
      ],
      comentarios: true,
    },
    {
      key: "gestaoSMS",
      title: "Gestão de SMS (Saúde, Meio Ambiente e Segurança)",
      questions: [
        { key: "questao55", idx: 55 },
        { key: "questao56", idx: 56 },
        { key: "questao57", idx: 57 },
        { key: "questao58", idx: 58 },
        { key: "questao59", idx: 59 },
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
        <div className={styles.sectionHeader}>
          <Text variant="xLarge" className={styles.sectionTitle}>
            B - Cumprimento da Legislação Básica
          </Text>
        </div>
        <MessageBar messageBarType={MessageBarType.info}>
          Selecione apenas os blocos de Normas Regulamentadoras que se aplicam
          ao seu tipo de atividade/fornecimento. Para cada questão dos blocos
          selecionados, escolha SIM, NÃO ou NÃO APLICÁVEL (NA). Para respostas
          &quot;SIM&quot; em questões específicas, será solicitado anexo de
          documento comprobatório.
        </MessageBar>

        <div className={styles.blocksContainer}>
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
                  <div key={block.key} className={styles.nrSection}>
                    <div className={styles.blockHeader}>
                      <div className={styles.blockTitleSection}>
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
                          onText="Aplicável"
                          offText="Não aplicável"
                          className={styles.blockToggle}
                        />
                        {isComplete && isApplicable && (
                          <Icon
                            iconName="CheckMark"
                            className={styles.completionIcon}
                            title="Bloco completo"
                          />
                        )}
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
                                <Text
                                  variant="medium"
                                  className={styles.questionText}
                                >
                                  {q.idx}.{" "}
                                  {questionMeta?.text || `Pergunta ${q.idx}`}
                                </Text>
                              </div>

                              <div className={styles.responseSection}>
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
                                {showUpload && (
                                  <div style={{ marginTop: 8 }}>
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
          </div>

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
                <div key={block.key} className={styles.nrSection}>
                  <div className={styles.blockHeader}>
                    <div className={styles.blockTitleSection}>
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
                        onText="Aplicável"
                        offText="Não aplicável"
                        className={styles.blockToggle}
                      />
                      {isComplete && isApplicable && (
                        <Icon
                          iconName="CheckMark"
                          className={styles.completionIcon}
                          title="Bloco completo"
                        />
                      )}
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
                              <Text
                                variant="medium"
                                className={styles.questionText}
                              >
                                {q.idx}.{" "}
                                {questionMeta?.text || `Pergunta ${q.idx}`}
                              </Text>
                            </div>

                            <div className={styles.responseSection}>
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
                              {showUpload && (
                                <div style={{ marginTop: 8 }}>
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
