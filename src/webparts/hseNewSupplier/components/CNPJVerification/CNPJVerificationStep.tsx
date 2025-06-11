import * as React from "react";
import {
  Stack,
  Text,
  TextField,
  PrimaryButton,
  DefaultButton,
  MessageBar,
  MessageBarType,
  Dialog,
  DialogType,
  DialogFooter,
  Spinner,
  SpinnerSize,
} from "@fluentui/react";
import {
  ICNPJVerificationResult,
  IOverwriteConfirmation,
} from "../../types/IApplicationPhase";
import { useHSEForm } from "../context/HSEFormContext";
import styles from "./CNPJVerificationStep.module.scss";

export interface ICNPJVerificationStepProps {
  onCNPJVerified: (result: ICNPJVerificationResult) => void;
  onNewEntry: (cnpj: string) => void;
  isLoading?: boolean;
}

export const CNPJVerificationStep: React.FC<ICNPJVerificationStepProps> = ({
  onCNPJVerified,
  onNewEntry,
  isLoading = false,
}) => {
  const { actions } = useHSEForm();
  const [cnpj, setCnpj] = React.useState<string>("");
  const [isVerifying, setIsVerifying] = React.useState<boolean>(false);
  const [verificationResult, setVerificationResult] =
    React.useState<ICNPJVerificationResult | null>(null);
  const [error, setError] = React.useState<string>("");
  const [overwriteConfirmation, setOverwriteConfirmation] =
    React.useState<IOverwriteConfirmation | null>(null);

  // Função para formatar CNPJ
  const formatCNPJ = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  // Função para validar CNPJ
  const isValidCNPJ = (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, "");

    if (numbers.length !== 14) return false;

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(numbers)) return false;

    // Validação dos dígitos verificadores
    let sum = 0;
    let weight = 2;

    for (let i = 11; i >= 0; i--) {
      sum += parseInt(numbers[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }

    const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (parseInt(numbers[12]) !== firstDigit) return false;

    sum = 0;
    weight = 2;

    for (let i = 12; i >= 0; i--) {
      sum += parseInt(numbers[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }

    const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    return parseInt(numbers[13]) === secondDigit;
  };
  const handleCNPJChange = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    if (newValue !== undefined) {
      const formatted = formatCNPJ(newValue);
      setCnpj(formatted);
      setError("");
      setVerificationResult(null);

      // Validação em tempo real para melhor UX
      if (formatted.length > 0) {
        const normalizedValue = formatted.replace(/\D/g, "");
        if (normalizedValue.length === 14) {
          // Só validar quando tiver 14 dígitos
          if (!isValidCNPJ(formatted)) {
            setError("CNPJ inválido. Verifique os dígitos informados.");
          }
        }
      }
    }
  };
  const handleVerifyCNPJ = async (): Promise<void> => {
    setError("");

    if (!cnpj.trim()) {
      setError("Por favor, informe o CNPJ.");
      return;
    }

    if (!isValidCNPJ(cnpj)) {
      setError("CNPJ inválido. Verifique os dígitos informados.");
      return;
    }

    setIsVerifying(true);

    try {
      console.log("Iniciando verificação de CNPJ:", cnpj);
      const normalizedCNPJ = cnpj.replace(/\D/g, "");

      const result = await actions.verifyCNPJ(normalizedCNPJ);
      console.log("Verificação concluída:", result);

      // Apenas armazenar o resultado, não chamar onCNPJVerified ainda
      // O usuário deve escolher a ação primeiro
      setVerificationResult(result);
    } catch (err: unknown) {
      console.error("Erro na verificação de CNPJ:", err);

      // Tratamento específico de diferentes tipos de erro
      let errorMessage = "Erro ao verificar CNPJ. Tente novamente.";

      if (err instanceof Error) {
        if (err.message.includes("dígitos")) {
          errorMessage = "CNPJ deve conter exatamente 14 dígitos.";
        } else if (
          err.message.includes("conexão") ||
          err.message.includes("rede")
        ) {
          errorMessage =
            "Erro de conexão. Verifique sua internet e tente novamente.";
        } else if (
          err.message.includes("SharePoint") ||
          err.message.includes("sistema")
        ) {
          errorMessage = "Erro no sistema. Tente novamente em alguns minutos.";
        } else if (err.message.length > 0) {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };
  const handleNewEntry = (): void => {
    console.log("Usuário escolheu criar novo cadastro");
    const normalizedCNPJ = cnpj.replace(/\D/g, "");
    onNewEntry(normalizedCNPJ);
  };

  const handleEditExisting = (): void => {
    console.log("Usuário escolheu editar cadastro existente");

    if (!verificationResult) {
      console.error("Resultado da verificação não disponível");
      setError("Erro interno. Tente verificar o CNPJ novamente.");
      return;
    }

    if (verificationResult.requiresApproval) {
      setOverwriteConfirmation({
        show: true,
        cnpj: cnpj,
        existingData: verificationResult.formData,
        onConfirm: () => {
          setOverwriteConfirmation(null);
          // Chamar com isOverwrite = true
          onCNPJVerified({ ...verificationResult, isOverwrite: true });
        },
        onCancel: () => setOverwriteConfirmation(null),
      });
    } else {
      // Chamar com isOverwrite = true
      onCNPJVerified({ ...verificationResult, isOverwrite: true });
    }
  };
  const handleKeyPress = (event: React.KeyboardEvent): void => {
    if (event.key === "Enter" && !isVerifying) {
      handleVerifyCNPJ().catch(console.error);
    }
  };
  return (
    <div className={styles.cnpjVerificationContainer}>
      <div className={styles.verificationCard}>
        <Stack tokens={{ childrenGap: 24 }}>
          <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="xxLarge" className={styles.title}>
              Cadastro de Fornecedor HSE
            </Text>
            <Text variant="medium" className={styles.subtitle}>
              Para iniciar o cadastro, informe o CNPJ da empresa
            </Text>
          </Stack>

          <Stack tokens={{ childrenGap: 16 }}>
            <TextField
              label="CNPJ da Empresa"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={handleCNPJChange}
              onKeyPress={handleKeyPress}
              maxLength={18}
              required
              disabled={isVerifying}
              className={styles.cnpjInput}
            />

            {error && (
              <MessageBar messageBarType={MessageBarType.error}>
                {error}
              </MessageBar>
            )}

            <PrimaryButton
              text={isVerifying ? "Verificando..." : "Verificar CNPJ"}
              onClick={handleVerifyCNPJ}
              disabled={!cnpj.trim() || isVerifying}
              className={styles.verifyButton}
            />

            {isVerifying && (
              <Stack
                horizontal
                tokens={{ childrenGap: 8 }}
                className={styles.loadingContainer}
              >
                <Spinner size={SpinnerSize.small} />
                <Text variant="medium">Verificando CNPJ no sistema...</Text>
              </Stack>
            )}
          </Stack>

          {verificationResult && (
            <div className={styles.resultCard}>
              <Stack tokens={{ childrenGap: 16 }}>
                {verificationResult.exists ? (
                  <>
                    <MessageBar messageBarType={MessageBarType.warning}>
                      <strong>CNPJ já cadastrado no sistema</strong>
                      <br />
                      Status: {verificationResult.status}
                      {verificationResult.itemId && (
                        <>
                          <br />
                          ID: {verificationResult.itemId}
                        </>
                      )}
                    </MessageBar>

                    <Text variant="medium">
                      Este CNPJ já possui um cadastro. Escolha uma das opções
                      abaixo:
                    </Text>

                    <Stack horizontal tokens={{ childrenGap: 12 }}>
                      <PrimaryButton
                        text="Editar Cadastro Existente"
                        onClick={handleEditExisting}
                        className={styles.actionButton}
                      />
                      <DefaultButton
                        text="Verificar Outro CNPJ"
                        onClick={() => {
                          setCnpj("");
                          setVerificationResult(null);
                          setError("");
                        }}
                        className={styles.actionButton}
                      />
                    </Stack>
                  </>
                ) : (
                  <>
                    <MessageBar messageBarType={MessageBarType.success}>
                      <strong>CNPJ disponível para cadastro</strong>
                      <br />
                      Este CNPJ não possui cadastro no sistema.
                    </MessageBar>

                    <Text variant="medium">
                      Você pode prosseguir com o cadastro deste fornecedor.
                    </Text>

                    <Stack horizontal tokens={{ childrenGap: 12 }}>
                      <PrimaryButton
                        text="Iniciar Cadastro"
                        onClick={handleNewEntry}
                        className={styles.actionButton}
                      />
                      <DefaultButton
                        text="Verificar Outro CNPJ"
                        onClick={() => {
                          setCnpj("");
                          setVerificationResult(null);
                          setError("");
                        }}
                        className={styles.actionButton}
                      />
                    </Stack>
                  </>
                )}
              </Stack>
            </div>
          )}
        </Stack>
      </div>

      {/* Dialog de confirmação para sobrescrita */}
      {overwriteConfirmation && (
        <Dialog
          hidden={!overwriteConfirmation.show}
          onDismiss={overwriteConfirmation.onCancel}
          dialogContentProps={{
            type: DialogType.normal,
            title: "Confirmação de Sobrescrita",
            subText: `Tem certeza que deseja editar o cadastro existente para o CNPJ ${overwriteConfirmation.cnpj}? Esta ação requer aprovação.`,
          }}
          modalProps={{
            isBlocking: true,
          }}
        >
          <DialogFooter>
            <PrimaryButton
              onClick={overwriteConfirmation.onConfirm}
              text="Confirmar"
            />
            <DefaultButton
              onClick={overwriteConfirmation.onCancel}
              text="Cancelar"
            />
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
};
