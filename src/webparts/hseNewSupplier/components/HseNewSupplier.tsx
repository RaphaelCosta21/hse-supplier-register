import * as React from "react";
import {
  Nav,
  INavLink,
  Text,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import { useHSEForm } from "./context/HSEFormContext";
import { DadosGerais } from "./formBlocks/DadosGerais/DadosGerais";
import { ConformidadeLegal } from "./formBlocks/ConformidadeLegal/ConformidadeLegal";
import { Evidencias } from "./formBlocks/Evidencias/Evidencias";
import { ServicosEspeciais } from "./formBlocks/ServicosEspeciais/ServicosEspeciais";
import { RevisaoFinal } from "./formBlocks/RevisaoFinal/RevisaoFinal";
import { FORM_STEPS } from "../utils/formConstants";
import { IHseNewSupplierProps } from "./IHseNewSupplierProps";
import { IQuestaoConformidade } from "../types/IHSEFormData";
import styles from "./HseNewSupplier.module.scss";
import { ProgressIndicator as CustomProgressIndicator } from "./common/ProgressIndicator/ProgressIndicator";
import { LoadingSpinner } from "./common/LoadingSpinner/LoadingSpinner";
import { FormNavigation } from "./common/FormNavigation/FormNavigation";
import { formSelectors } from "./context/formReducer";

export const HseNewSupplier: React.FC<IHseNewSupplierProps> = (props) => {
  const { state, actions, dispatch } = useHSEForm();
  const { currentStep, isLoading, validationErrors } = state;

  // Helper function to convert validation errors array to object format
  const getErrorsForStep = (step: number): { [key: string]: string } => {
    const stepErrors: { [key: string]: string } = {};
    const stepSections = [
      "dadosGerais",
      "conformidadeLegal",
      "evidencias",
      "servicosEspeciais",
    ];
    const sectionName = stepSections[step - 1];

    validationErrors
      .filter((error) => error.section === sectionName)
      .forEach((error) => {
        stepErrors[error.field] = error.message;
      });
    return stepErrors;
  };

  // Helper function to check if a step is completed
  const isStepCompleted = (stepId: number): boolean => {
    const step = FORM_STEPS.find((s) => s.id === stepId);
    if (!step) return false;

    const { formData, attachments } = state;

    // Special handling for step 2 (Conformidade Legal)
    if (stepId === 2) {
      const conformidadeLegal = formData.conformidadeLegal;
      if (!conformidadeLegal) return false;

      // Define todos os blocos conforme ConformidadeLegal.tsx
      const NR_BLOCKS = [
        {
          key: "nr01",
          questions: [
            "questao1",
            "questao2",
            "questao3",
            "questao4",
            "questao5",
          ],
        },
        { key: "nr04", questions: ["questao7", "questao8"] },
        { key: "nr05", questions: ["questao10", "questao11"] },
        { key: "nr06", questions: ["questao13", "questao14"] },
        { key: "nr07", questions: ["questao16", "questao17", "questao18"] },
        { key: "nr09", questions: ["questao20", "questao21", "questao22"] },
        { key: "nr10", questions: ["questao24", "questao25", "questao26"] },
        { key: "nr11", questions: ["questao28", "questao29"] },
        { key: "nr12", questions: ["questao31", "questao32"] },
        { key: "nr13", questions: ["questao34"] },
        { key: "nr15", questions: ["questao36"] },
        { key: "nr23", questions: ["questao38", "questao39", "questao40"] },
        { key: "licencasAmbientais", questions: ["questao42"] },
        {
          key: "legislacaoMaritima",
          questions: [
            "questao44",
            "questao45",
            "questao46",
            "questao47",
            "questao48",
            "questao49",
          ],
        },
        {
          key: "treinamentos",
          questions: ["questao51", "questao52", "questao53"],
        },
        {
          key: "gestaoSMS",
          questions: [
            "questao55",
            "questao56",
            "questao57",
            "questao58",
            "questao59",
          ],
        },
      ];

      // Mapeamento de questões que requerem anexos quando resposta é "SIM"
      const questionsRequiringAttachments: { [key: number]: string } = {
        7: "sesmt", // NR04 - questao7
        10: "cipa", // NR05 - questao10
        13: "caEPI", // NR06 - questao13
        16: "pcmso", // NR07 - questao16
        17: "aso", // NR07 - questao17
        20: "ppra", // NR09 - questao20
        21: "ltcat", // NR09 - questao21
        22: "programa", // NR09 - questao22
        24: "laudoEletrico", // NR10 - questao24
        25: "treinamentoNR10", // NR10 - questao25
        28: "laudoRuido", // NR11 - questao28
        31: "atestadoSaude", // NR12 - questao31
        34: "laudoCaldeira", // NR13 - questao34
        36: "permissaoTrabalho", // NR15 - questao36
        38: "registroSismica", // NR23 - questao38
        42: "licencaAmbiental", // Licenças Ambientais - questao42
        44: "certificadoMaritimo", // Legislação Marítima - questao44
        51: "certificadoTreinamento", // Treinamentos - questao51
        55: "politicaSMS", // Gestão SMS - questao55
      };

      // Função para verificar se um bloco está completo
      const isBlockComplete = (
        blockKey: string,
        questionKeys: string[]
      ): boolean => {
        const blockValue = (
          conformidadeLegal as unknown as Record<
            string,
            Record<string, IQuestaoConformidade | string | undefined>
          >
        )[blockKey];
        if (!blockValue) return false;

        return questionKeys.every((questionKey) => {
          const questionObj = blockValue[questionKey] as IQuestaoConformidade;
          if (
            !questionObj ||
            !questionObj.resposta ||
            (questionObj.resposta as string) === ""
          ) {
            return false;
          }

          // Se a resposta é "SIM" e a questão requer anexo, verificar se existe anexo
          const questionNumber = parseInt(questionKey.replace("questao", ""));
          const attachmentCategory =
            questionsRequiringAttachments[questionNumber];

          if (questionObj.resposta === "SIM" && attachmentCategory) {
            // Verificar se existe anexo para esta questão
            const categoryAttachments = attachments[attachmentCategory] || [];
            return categoryAttachments.length > 0;
          }

          return true;
        });
      };

      // Verificar se todos os blocos estão completos
      return NR_BLOCKS.every((block) =>
        isBlockComplete(block.key, block.questions)
      );
    }

    // Check required fields for this step
    const isFieldsComplete = step.requiredFields.every((field) => {
      const fieldPath = field.split(".");
      let value: unknown = formData;

      // Navigate through nested properties (e.g., dadosGerais.empresa)
      for (const prop of fieldPath) {
        value = (value as Record<string, unknown>)?.[prop];
      }

      return value !== undefined && value !== null && value !== "";
    });

    // Check required attachments for this step
    const isAttachmentsComplete = step.requiredAttachments.every((category) => {
      return (attachments[category] || []).length > 0;
    });

    return isFieldsComplete && isAttachmentsComplete;
  };
  const navLinks: INavLink[] = FORM_STEPS.map((step) => {
    const isCompleted = isStepCompleted(step.id);
    const isActive = currentStep === step.id;

    return {
      name: step.title,
      key: step.id.toString(),
      icon: step.icon, // Sempre usar o ícone original da etapa
      iconProps: undefined, // Remover o ícone customizado
      url: "",
      isExpanded: isActive,
      disabled: !formSelectors.canProceedToStep(state, step.id),
      // Adicionar check verde à direita se completo
      ...(isCompleted && {
        forceAnchor: true,
        ariaLabel: `${step.title} - Completo`,
      }),
      onClick: (ev?: React.MouseEvent<HTMLElement>) => {
        ev?.preventDefault();
        // Navegação direta de etapa
        if (!formSelectors.canProceedToStep(state, step.id)) return;
        dispatch({ type: "SET_CURRENT_STEP", payload: step.id });
      },
    };
  });

  // Funções para atualizar blocos
  const handleDadosGeraisChange = (
    field: keyof typeof state.formData.dadosGerais,
    value: string | number | boolean | Date | undefined
  ): void => {
    dispatch({
      type: "UPDATE_FIELD",
      payload: {
        field: "dadosGerais",
        value: { ...state.formData.dadosGerais, [field]: value },
      },
    });
  };
  const handleConformidadeLegalChange = (
    field: keyof typeof state.formData.conformidadeLegal,
    value: unknown
  ): void => {
    dispatch({
      type: "UPDATE_FIELD",
      payload: {
        field: "conformidadeLegal",
        value: { ...state.formData.conformidadeLegal, [field]: value },
      },
    });
  };

  const handleServicosEspeciaisChange = (
    field: keyof typeof state.formData.servicosEspeciais,
    value: unknown
  ): void => {
    dispatch({
      type: "UPDATE_FIELD",
      payload: {
        field: "servicosEspeciais",
        value: { ...state.formData.servicosEspeciais, [field]: value },
      },
    });
  };

  const renderCurrentStep = (): JSX.Element => {
    switch (currentStep) {
      case 1:
        return (
          <DadosGerais
            value={state.formData.dadosGerais}
            onChange={handleDadosGeraisChange}
            errors={getErrorsForStep(1)}
          />
        );
      case 2:
        return (
          <ConformidadeLegal
            value={state.formData.conformidadeLegal}
            onChange={handleConformidadeLegalChange}
            errors={getErrorsForStep(2)}
          />
        );
      case 3:
        return <Evidencias />;
      case 4:
        return (
          <ServicosEspeciais
            value={state.formData.servicosEspeciais}
            onChange={handleServicosEspeciaisChange}
            errors={getErrorsForStep(4)}
          />
        );
      case 5:
        return <RevisaoFinal />;
      default:
        return (
          <DadosGerais
            value={state.formData.dadosGerais}
            onChange={handleDadosGeraisChange}
            errors={getErrorsForStep(1)}
          />
        );
    }
  };

  // Handle save progress without validation
  const handleSave = React.useCallback(async () => {
    // Save form data without triggering validation
    return actions.saveFormData();
  }, [actions]);

  const getProgressPercentage = (): number => {
    return Math.round((currentStep / FORM_STEPS.length) * 100);
  };

  const getCurrentStepInfo = (): (typeof FORM_STEPS)[0] => {
    return FORM_STEPS.find((step) => step.id === currentStep) || FORM_STEPS[0];
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner label="Carregando formulário..." size="large" />
      </div>
    );
  }

  return (
    <div className={styles.hseNewSupplier}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <Text variant="xxLarge" className={styles.title}>
              Auto-avaliação de HSE para Contratadas
            </Text>
          </div>
          <div className={styles.progressSection}>
            <div className={styles.stepInfo}>
              <Text variant="medium" className={styles.stepText}>
                Etapa {currentStep} de {FORM_STEPS.length}
              </Text>
              <Text variant="large" className={styles.currentStepTitle}>
                {getCurrentStepInfo().title}
              </Text>
            </div>
            <CustomProgressIndicator
              percentComplete={getProgressPercentage() / 100}
              description={`${getProgressPercentage()}% concluído`}
              className={styles.progressBar}
              label="Progresso do formulário"
              showLabel
            />
          </div>
          <div className={styles.logoSection}>
            <img
              src={require("../assets/logo-white.png")}
              alt="Oceaneering Logo"
              className={styles.headerLogo}
            />
          </div>
        </div>
      </div>
      {validationErrors.length > 0 && (
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline
          onDismiss={() => dispatch({ type: "CLEAR_VALIDATION_ERRORS" })}
          className={styles.errorBar}
        >
          <Text variant="medium">
            {validationErrors.length} erro(s) encontrado(s):
          </Text>
          <ul>
            {validationErrors.map(
              (error: { message: string }, index: number) => (
                <li key={index}>{error.message}</li>
              )
            )}
          </ul>
        </MessageBar>
      )}
      <div className={styles.container}>
        <div className={styles.navigation}>
          <div className={styles.navHeader}>
            <img
              src={require("../assets/logo-blue.png")}
              alt="Oceaneering Logo"
              className={styles.navLogo}
            />
            <Text variant="medium" className={styles.navTitle}>
              Sistema HSE
            </Text>
          </div>
          <Nav
            groups={[
              {
                links: navLinks,
              },
            ]}
            className={styles.navPanel}
            onRenderLink={(link, defaultRender) => {
              if (!link || !defaultRender) return null;

              const isCompleted = isStepCompleted(parseInt(link.key || "0"));
              const linkElement = defaultRender(link);

              // Adicionar classe completed se a etapa estiver completa
              if (isCompleted && linkElement) {
                const className = linkElement.props.className || "";
                return React.cloneElement(linkElement, {
                  className: `${className} completed`,
                });
              }

              return linkElement;
            }}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.stepContainer}>
            {renderCurrentStep()}
            <FormNavigation
              onSave={handleSave}
              showSave
              isSubmitting={state.isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
