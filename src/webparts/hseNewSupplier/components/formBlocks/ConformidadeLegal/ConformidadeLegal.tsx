import * as React from "react";
import {
  Stack,
  Text,
  Dropdown,
  IDropdownOption,
  TextField,
  Separator,
  MessageBar,
  MessageBarType,
  DefaultButton,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
} from "@fluentui/react";
import { useHSEForm } from "../../../context/HSEFormContext";
import { HSEFileUpload } from "../../common/HSEFileUpload/HSEFileUpload";
import {
  RESPOSTA_OPTIONS,
  NR_QUESTIONS_MAP,
} from "../../../utils/formConstants";
import styles from "./ConformidadeLegal.module.scss";

export const ConformidadeLegal: React.FC = () => {
  const { state, dispatch, actions } = useHSEForm();
  const { formData } = state;

  const handleNRResponse = (
    questionId: number,
    field: "resposta" | "comentario",
    value: string
  ) => {
    const currentData = formData.conformidadeLegal[questionId] || {};
    dispatch({
      type: "UPDATE_FIELD",
      payload: {
        field: "conformidadeLegal",
        value: {
          ...formData.conformidadeLegal,
          [questionId]: {
            ...currentData,
            [field]: value,
          },
        },
      },
    });
  };

  const renderNRSection = (
    nrCode: string,
    questions: number[],
    title: string
  ) => {
    return (
      <AccordionItem value={nrCode}>
        <AccordionHeader>{title}</AccordionHeader>
        <AccordionPanel>
          <Stack tokens={{ childrenGap: 15 }}>
            {questions.map((questionId) => {
              const questionData = NR_QUESTIONS_MAP[questionId];
              const currentResponse =
                formData.conformidadeLegal[questionId] || {};

              return (
                <div key={questionId} className={styles.questionContainer}>
                  <Text variant="medium" className={styles.questionText}>
                    {questionId}.{" "}
                    {questionData?.text || `Pergunta ${questionId}`}
                  </Text>

                  <div className={styles.responseRow}>
                    <Dropdown
                      label="Resposta"
                      options={RESPOSTA_OPTIONS}
                      selectedKey={currentResponse.resposta}
                      onChange={(_, option) =>
                        handleNRResponse(
                          questionId,
                          "resposta",
                          option?.key as string
                        )
                      }
                      className={styles.responseDropdown}
                      required
                    />

                    <TextField
                      label="Comentários"
                      value={currentResponse.comentario || ""}
                      onChange={(_, value) =>
                        handleNRResponse(questionId, "comentario", value || "")
                      }
                      multiline
                      rows={2}
                      className={styles.commentField}
                      placeholder="Adicione comentários ou esclarecimentos (opcional)"
                    />
                  </div>

                  {questionData?.attachment &&
                    currentResponse.resposta === "SIM" && (
                      <div className={styles.attachmentSection}>
                        <HSEFileUpload
                          label={`Anexar documento para pergunta ${questionId}`}
                          category={questionData.attachment}
                          required={true}
                          accept=".pdf,.docx,.xlsx"
                          maxFileSize={50}
                          helpText="Anexar documento comprobatório obrigatório"
                        />
                      </div>
                    )}
                </div>
              );
            })}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    );
  };

  return (
    <div className={styles.conformidadeLegal}>
      <Stack tokens={{ childrenGap: 20 }}>
        <div className={styles.sectionHeader}>
          <Text variant="xLarge" className={styles.sectionTitle}>
            B - Cumprimento da Legislação Básica
          </Text>
        </div>

        <MessageBar messageBarType={MessageBarType.info}>
          Para cada questão, selecione SIM, NÃO ou NÃO APLICÁVEL (NA). Quando
          necessário, adicione comentários. Para respostas "SIM" em questões
          específicas, será solicitado anexo de documento comprobatório.
        </MessageBar>

        <Accordion multiple collapsible>
          {renderNRSection(
            "NR01",
            [1, 2, 3, 4, 5],
            "NR 01 - Disposições Gerais"
          )}
          {renderNRSection("NR04", [7, 8], "NR 04 - SESMT")}
          {renderNRSection("NR05", [10, 11], "NR 05 - CIPA")}
          {renderNRSection("NR06", [13, 14], "NR 06 - EPI")}
          {renderNRSection("NR07", [16, 17, 18], "NR 07 - PCMSO")}
          {renderNRSection("NR09", [20, 21, 22], "NR 09 - PPRA")}
          {renderNRSection(
            "NR10",
            [24, 25, 26],
            "NR 10 - Instalações Elétricas"
          )}
          {renderNRSection(
            "NR11",
            [28, 29],
            "NR 11 - Transporte e Movimentação"
          )}
          {renderNRSection("NR12", [31, 32], "NR 12 - Máquinas e Equipamentos")}
          {renderNRSection(
            "NR13",
            [34],
            "NR 13 - Caldeiras e Vasos de Pressão"
          )}
          {renderNRSection("NR15", [36], "NR 15 - Atividades Insalubres")}
          {renderNRSection(
            "NR23",
            [38, 39, 40],
            "NR 23 - Proteção Contra Incêndios"
          )}
          {renderNRSection("AMBIENTAL", [42], "Licenças Ambientais")}
          {renderNRSection(
            "MARITIMA",
            [44, 45, 46, 47, 48, 49],
            "Legislação Marítima"
          )}
          {renderNRSection("TREINAMENTOS", [51, 52, 53], "Treinamentos")}
          {renderNRSection("GESTAO", [55, 56, 57, 58, 59], "Gestão de SMS")}
        </Accordion>

        <div className={styles.actionsSection}>
          <Stack
            horizontal
            tokens={{ childrenGap: 10 }}
            horizontalAlign="space-between"
          >
            <DefaultButton
              text="Etapa Anterior"
              iconProps={{ iconName: "ChevronLeft" }}
              onClick={actions.goToPreviousStep}
            />
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <DefaultButton
                text="Salvar Progresso"
                iconProps={{ iconName: "Save" }}
                onClick={actions.saveFormData}
                disabled={state.isSubmitting}
              />
              <DefaultButton
                text="Próxima Etapa"
                iconProps={{ iconName: "ChevronRight" }}
                onClick={actions.goToNextStep}
                primary
              />
            </Stack>
          </Stack>
        </div>
      </Stack>
    </div>
  );
};
