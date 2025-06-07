import * as React from "react";
import {
  Stack,
  Text,
  Dropdown,
  TextField,
  Separator,
  MessageBar,
  MessageBarType,
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
  // Corrige tipagem da função handleNRResponse sem usar 'any' nem Record<string, unknown>' global
  const handleNRResponse = (
    nrKey: keyof typeof value,
    questionKey: string,
    field: "resposta" | "comentario",
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
          Para cada questão, selecione SIM, NÃO ou NÃO APLICÁVEL (NA). Quando
          necessário, adicione comentários. Para respostas &quot;SIM&quot; em
          questões específicas, será solicitado anexo de documento
          comprobatório.
        </MessageBar>

        {NR_BLOCKS.map((block) => {
          // Cast para acesso dinâmico, mas sem usar 'any' globalmente
          const blockValue = getBlockValue(block.key as keyof typeof value) as {
            [key: string]: unknown;
          };
          return (
            <div key={block.key} className={styles.nrSection}>
              <Text variant="large">{block.title}</Text>
              {block.questions.map((q) => {
                const questionObj =
                  blockValue &&
                  typeof blockValue === "object" &&
                  q.key in blockValue
                    ? (blockValue[q.key] as { [k: string]: unknown })
                    : {};
                // Verifica se a pergunta exige anexo
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
                    <Text variant="medium" className={styles.questionText}>
                      {q.idx}. {questionMeta?.text || `Pergunta ${q.idx}`}
                    </Text>
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
                    <TextField
                      label="Comentários"
                      value={
                        typeof questionObj.comentario === "string"
                          ? questionObj.comentario
                          : ""
                      }
                      onChange={(_, v) =>
                        handleNRResponse(
                          block.key as keyof typeof value,
                          q.key,
                          "comentario",
                          v || ""
                        )
                      }
                      multiline
                      rows={2}
                      className={styles.commentField}
                      placeholder="Adicione comentários ou esclarecimentos (opcional)"
                    />
                    {/* Upload condicional para perguntas que exigem anexo */}
                    {showUpload && (
                      <div style={{ marginTop: 8 }}>                        <HSEFileUpload
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
              <Separator />
            </div>
          );
        })}
      </Stack>
    </div>
  );
};
