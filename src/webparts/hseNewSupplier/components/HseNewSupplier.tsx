import * as React from "react";
import {
  Stack,
  Nav,
  INavLink,
  Text,
  ProgressIndicator,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
} from "@fluentui/react";
import { useHSEForm } from "../context/HSEFormContext";
import { DadosGerais } from "./formBlocks/DadosGerais/DadosGerais";
import { ConformidadeLegal } from "./formBlocks/ConformidadeLegal/ConformidadeLegal";
import { Evidencias } from "./formBlocks/Evidencias/Evidencias";
import { ServicosEspeciais } from "./formBlocks/ServicosEspeciais/ServicosEspeciais";
import { RevisaoFinal } from "./formBlocks/RevisaoFinal/RevisaoFinal";
import { FORM_STEPS } from "../utils/formConstants";
import { IHseNewSupplierProps } from "./IHseNewSupplierProps";
import styles from "./HseNewSupplier.module.scss";

export const HseNewSupplier: React.FC<IHseNewSupplierProps> = (props) => {
  const { state, actions } = useHSEForm();
  const { currentStep, isLoading, validationErrors } = state;

  const navLinks: INavLink[] = FORM_STEPS.map((step, index) => ({
    name: step.title,
    key: step.id.toString(),
    icon: step.icon,
    url: "",
    isExpanded: currentStep === step.id,
    disabled: !step.isAccessible(state),
    onClick: (ev?: React.MouseEvent<HTMLElement>) => {
      ev?.preventDefault();
      if (!step.isAccessible(state)) return;
      actions.goToStep(step.id);
    },
  }));

  const renderCurrentStep = (): JSX.Element => {
    switch (currentStep) {
      case 1:
        return <DadosGerais />;
      case 2:
        return <ConformidadeLegal />;
      case 3:
        return <Evidencias />;
      case 4:
        return <ServicosEspeciais />;
      case 5:
        return <RevisaoFinal />;
      default:
        return <DadosGerais />;
    }
  };

  const getProgressPercentage = (): number => {
    return Math.round((currentStep / FORM_STEPS.length) * 100);
  };

  const getCurrentStepInfo = () => {
    return FORM_STEPS.find((step) => step.id === currentStep) || FORM_STEPS[0];
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={SpinnerSize.large} label="Carregando formulário..." />
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

        <ProgressIndicator
          percentComplete={getProgressPercentage() / 100}
          description={`Etapa ${currentStep} de ${FORM_STEPS.length}: ${
            getCurrentStepInfo().title
          }`}
          className={styles.progressBar}
        />
      </div>

      {validationErrors.length > 0 && (
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline
          onDismiss={actions.clearValidationErrors}
          className={styles.errorBar}
        >
          <Text variant="medium">
            {validationErrors.length} erro(s) encontrado(s):
          </Text>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
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
          <div className={styles.stepContainer}>{renderCurrentStep()}</div>
        </div>
      </div>
    </div>
  );
};
