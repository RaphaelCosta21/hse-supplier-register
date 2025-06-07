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

  const navLinks: INavLink[] = FORM_STEPS.map((step) => ({
    name: step.title,
    key: step.id.toString(),
    icon: step.icon,
    url: "",
    isExpanded: currentStep === step.id,
    disabled: !formSelectors.canProceedToStep(state, step.id),
    onClick: (ev?: React.MouseEvent<HTMLElement>) => {
      ev?.preventDefault();
      // Navegação direta de etapa
      if (!formSelectors.canProceedToStep(state, step.id)) return;
      dispatch({ type: "SET_CURRENT_STEP", payload: step.id });
    },
  }));

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
        return <ServicosEspeciais />;
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
        <Text variant="xxLarge" className={styles.title}>
          Auto-avaliação de HSE para Contratadas
        </Text>
        <Text variant="medium" className={styles.subtitle}>
          Oceaneering Multiflex Brasil
        </Text>
        <CustomProgressIndicator
          percentComplete={getProgressPercentage() / 100}
          description={`Etapa ${currentStep} de ${FORM_STEPS.length}: ${
            getCurrentStepInfo().title
          }`}
          className={styles.progressBar}
          label="Progresso do formulário"
          showLabel
        />
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
          <Nav
            groups={[
              {
                links: navLinks,
              },
            ]}
            className={styles.navPanel}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.stepContainer}>
            {renderCurrentStep()}
            <FormNavigation
              onPrevious={() =>
                dispatch({
                  type: "SET_CURRENT_STEP",
                  payload: Math.max(1, currentStep - 1),
                })
              }
              onNext={() =>
                dispatch({
                  type: "SET_CURRENT_STEP",
                  payload: Math.min(FORM_STEPS.length, currentStep + 1),
                })
              }
              onSave={actions.saveFormData}
              disablePrevious={currentStep === 1}
              disableNext={currentStep === FORM_STEPS.length}
              showSave
              isSubmitting={state.isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
