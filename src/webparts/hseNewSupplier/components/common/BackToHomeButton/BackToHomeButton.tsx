import * as React from "react";
import {
  DefaultButton,
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  Stack,
  Text,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import { useHSEForm } from "../../context/HSEFormContext";
import styles from "./BackToHomeButton.module.scss";

interface IBackToHomeButtonProps {
  style?: React.CSSProperties;
}

export const BackToHomeButton: React.FC<IBackToHomeButtonProps> = ({
  style,
}) => {
  const { actions, applicationPhase } = useHSEForm();
  const [showConfirmDialog, setShowConfirmDialog] =
    React.useState<boolean>(false);

  const handleBackToHome = (): void => {
    setShowConfirmDialog(true);
  };
  const handleConfirmBackToHome = (): void => {
    actions.resetForm();
    actions.setApplicationPhase({
      phase: "ENTRADA",
      cnpj: "",
    });
    setShowConfirmDialog(false);
  };

  const handleCancelBackToHome = (): void => {
    setShowConfirmDialog(false);
  };

  // Só mostrar o botão se não estivermos na tela inicial
  if (applicationPhase.phase === "ENTRADA") {
    return null;
  }

  return (
    <>
      {" "}
      <DefaultButton
        text="Voltar ao Início"
        iconProps={{ iconName: "Home" }}
        onClick={handleBackToHome}
        className={styles.backToHomeButton}
        style={style}
      />
      <Dialog
        hidden={!showConfirmDialog}
        onDismiss={handleCancelBackToHome}
        dialogContentProps={{
          type: DialogType.normal,
          title: "Confirmar Volta ao Início",
          subText: "Tem certeza que deseja voltar ao início?",
        }}
        modalProps={{
          isBlocking: true,
          styles: { main: { maxWidth: 450 } },
        }}
      >
        <Stack tokens={{ childrenGap: 16 }}>
          <MessageBar messageBarType={MessageBarType.warning}>
            <Text>
              <strong>Atenção:</strong> Se continuar, você perderá todo o
              progresso não salvo do formulário atual.
            </Text>
          </MessageBar>

          <Text>
            Todos os dados preenchidos que não foram salvos serão perdidos. Esta
            ação não pode ser desfeita.
          </Text>
        </Stack>

        <DialogFooter>
          <PrimaryButton
            onClick={handleConfirmBackToHome}
            text="Sim, Voltar ao Início"
            iconProps={{ iconName: "Home" }}
          />
          <DefaultButton onClick={handleCancelBackToHome} text="Cancelar" />
        </DialogFooter>
      </Dialog>
    </>
  );
};
