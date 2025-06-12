import * as React from "react";
import {
  Stack,
  Text,
  PrimaryButton,
  DefaultButton,
  TextField,
  MessageBar,
  MessageBarType,
  Separator,
  Spinner,
  SpinnerSize,
  Icon,
  TooltipHost,
  DirectionalHint,
} from "@fluentui/react";
import { useHSEForm } from "../context/HSEFormContext";
import {
  ICNPJVerificationResult,
  IUserFormSummary,
} from "../../types/IApplicationPhase";
import { validators } from "../../utils/validators";
import { formatters } from "../../utils/formatters";

// Componente Card simples para substituir o Card do Fluent UI
const SimpleCard: React.FC<{
  children: React.ReactNode;
  tokens?: { childrenMargin?: number };
  style?: React.CSSProperties;
}> = ({ children, style = {} }) => (
  <div
    style={{
      padding: "16px",
      backgroundColor: "#ffffff",
      border: "1px solid #edebe9",
      borderRadius: "4px",
      boxShadow:
        "0 1.6px 3.6px 0 rgba(0,0,0,0.132), 0 0.3px 0.9px 0 rgba(0,0,0,0.108)",
      ...style,
    }}
  >
    {children}
  </div>
);

export interface IInitialScreenProps {
  onCNPJVerified: (result: ICNPJVerificationResult) => void;
}

export const InitialScreen: React.FC<IInitialScreenProps> = ({
  onCNPJVerified,
}) => {
  const { currentUser, actions, state } = useHSEForm();
  const [cnpj, setCnpj] = React.useState<string>("");
  const [cnpjError, setCnpjError] = React.useState<string>("");
  const [cnpjValidation, setCnpjValidation] = React.useState<{
    isValid: boolean;
    message: string;
  }>({ isValid: false, message: "" });
  const [searchResult, setSearchResult] =
    React.useState<ICNPJVerificationResult | null>(null);
  const [userForms, setUserForms] = React.useState<IUserFormSummary[]>([]);
  const [loadingUserForms, setLoadingUserForms] = React.useState<boolean>(true);
  const [searchingCNPJ, setSearchingCNPJ] = React.useState<boolean>(false);

  // Carregar formulários do usuário ao montar o componente
  React.useEffect(() => {
    const loadUserForms = async (): Promise<void> => {
      try {
        console.log("Carregando formulários do usuário...");
        const forms = await actions.getUserForms();
        setUserForms(forms);
        console.log("Formulários carregados:", forms.length);
      } catch (error) {
        console.error("Erro ao carregar formulários do usuário:", error);
      } finally {
        setLoadingUserForms(false);
      }
    };

    loadUserForms().catch(console.error);
  }, [actions]);
  // Função para formatar CNPJ com máscara automática incremental
  const formatCNPJ = (value: string): string => {
    const numbers = value.replace(/\D/g, "").slice(0, 14);
    let formatted = "";
    if (numbers.length > 0) {
      formatted = numbers.substring(0, 2);
    }
    if (numbers.length >= 3) {
      formatted += "." + numbers.substring(2, 5);
    } else if (numbers.length > 2) {
      formatted += "." + numbers.substring(2);
    }
    if (numbers.length >= 6) {
      formatted += "." + numbers.substring(5, 8);
    } else if (numbers.length > 5) {
      formatted += "." + numbers.substring(5);
    }
    if (numbers.length >= 9) {
      formatted += "/" + numbers.substring(8, 12);
    } else if (numbers.length > 8) {
      formatted += "/" + numbers.substring(8);
    }
    if (numbers.length >= 13) {
      formatted += "-" + numbers.substring(12, 14);
    } else if (numbers.length > 12) {
      formatted += "-" + numbers.substring(12);
    }
    return formatted;
  };

  // Validar CNPJ com dígito verificador
  const validateCNPJ = (
    value: string
  ): { isValid: boolean; message: string } => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length === 0) {
      return { isValid: false, message: "" };
    }

    if (numbers.length < 14) {
      return { isValid: false, message: "CNPJ deve conter 14 dígitos" };
    }

    if (numbers.length === 14) {
      const isValid = validators.cnpj(value);
      return {
        isValid,
        message: isValid
          ? "CNPJ válido"
          : "CNPJ inválido - verifique os dígitos",
      };
    }

    return {
      isValid: false,
      message: "CNPJ deve conter exatamente 14 dígitos",
    };
  };
  // Handler para mudança no campo CNPJ com validação em tempo real
  const handleCNPJChange = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    if (newValue !== undefined) {
      const formatted = formatCNPJ(newValue);
      setCnpj(formatted);

      // Validar CNPJ em tempo real
      const validation = validateCNPJ(formatted);
      setCnpjValidation(validation);

      // Limpar erro e resultado de busca
      setCnpjError("");
      setSearchResult(null);
    }
  };
  // Buscar formulário por CNPJ com segurança
  const handleSearchCNPJ = async (): Promise<void> => {
    const validation = validateCNPJ(cnpj);

    if (!validation.isValid) {
      setCnpjError(validation.message || "CNPJ inválido");
      return;
    }

    setSearchingCNPJ(true);
    setCnpjError("");

    try {
      console.log("Iniciando busca segura por CNPJ:", cnpj);
      const result = await actions.searchCNPJWithSecurity(cnpj);
      console.log("Resultado da busca:", result);

      setSearchResult(result);
      onCNPJVerified(result);
    } catch (error) {
      console.error("Erro na busca por CNPJ:", error);
      setCnpjError(
        error instanceof Error ? error.message : "Erro ao buscar CNPJ"
      );
    } finally {
      setSearchingCNPJ(false);
    }
  };

  // Handler para iniciar novo formulário
  const handleStartNewForm = (): void => {
    console.log("Iniciando novo formulário para CNPJ:", cnpj);
    actions.startNewForm(cnpj);
  };

  // Handler para carregar formulário existente
  const handleLoadExistingForm = async (itemId: number): Promise<void> => {
    try {
      console.log("Carregando formulário existente, ID:", itemId);
      await actions.loadExistingForm(itemId);
    } catch (error) {
      console.error("Erro ao carregar formulário existente:", error);
    }
  };

  // Handler para editar formulário do usuário
  const handleEditUserForm = async (form: IUserFormSummary): Promise<void> => {
    try {
      console.log("Editando formulário do usuário:", form);
      await actions.loadExistingForm(form.id);
    } catch (error) {
      console.error("Erro ao carregar formulário para edição:", error);
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string): JSX.Element => {
    const statusConfig: Record<string, { color: string; icon: string }> = {
      Rascunho: { color: "#605e5c", icon: "Edit" },
      "Em Andamento": { color: "#ff8c00", icon: "Clock" },
      Enviado: { color: "#0078d4", icon: "Send" },
      Aprovado: { color: "#107c10", icon: "CheckMark" },
      Rejeitado: { color: "#d13438", icon: "Cancel" },
    };

    const config = statusConfig[status] || statusConfig.Rascunho;

    return (
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 4 }}>
        <Icon
          iconName={config.icon}
          style={{ color: config.color, fontSize: 12 }}
        />
        <Text variant="small" style={{ color: config.color, fontWeight: 600 }}>
          {status}
        </Text>
      </Stack>
    );
  };

  return (
    <Stack tokens={{ childrenGap: 24 }}>
      {/* Header com informações do usuário */}
      <SimpleCard>
        <Stack tokens={{ childrenGap: 12 }}>
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
            <Icon
              iconName="Contact"
              style={{ fontSize: 24, color: "#0078d4" }}
            />
            <Stack>
              <Text variant="large" style={{ fontWeight: 600 }}>
                Bem-vindo, {currentUser.displayName}
              </Text>
              <Text variant="medium" style={{ color: "#605e5c" }}>
                {currentUser.email}
              </Text>
            </Stack>
          </Stack>

          <Text variant="medium">
            Sistema de Auto-avaliação HSE para Contratadas da Oceaneering
          </Text>
        </Stack>
      </SimpleCard>{" "}
      {/* Busca por CNPJ */}
      <SimpleCard>
        <Stack tokens={{ childrenGap: 16 }}>
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
            <Icon
              iconName="Search"
              style={{ fontSize: 20, color: "#0078d4" }}
            />{" "}
            <Text variant="large" style={{ fontWeight: 600 }}>
              Iniciar Formulário
            </Text>
          </Stack>{" "}
          <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="start">
            <Stack style={{ flexGrow: 1 }}>
              <TextField
                label="CNPJ da Empresa"
                value={cnpj}
                onChange={handleCNPJChange}
                required
                maxLength={18}
                placeholder="00.000.000/0000-00"
                errorMessage={cnpjError}
                autoComplete="off"
              />
              <div
                style={{
                  height: 24,
                  minHeight: 24,
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                {cnpjValidation.message && (
                  <Text
                    variant="small"
                    style={{
                      color: cnpjValidation.isValid ? "#107c10" : "#d13438",
                      fontWeight: 500,
                      marginTop: 4,
                    }}
                  >
                    {cnpjValidation.message}
                  </Text>
                )}
              </div>
            </Stack>
            <Stack
              style={{ paddingTop: 28, minHeight: 80 }}
              verticalAlign="start"
            >
              <PrimaryButton
                text="Iniciar"
                iconProps={{ iconName: "Play" }}
                onClick={handleSearchCNPJ}
                disabled={
                  !cnpj ||
                  !cnpjValidation.isValid ||
                  searchingCNPJ ||
                  state.isLoading
                }
              />
            </Stack>
          </Stack>{" "}
          {searchingCNPJ && (
            <Stack
              horizontal
              verticalAlign="center"
              tokens={{ childrenGap: 8 }}
            >
              <Spinner size={SpinnerSize.small} />
              <Text variant="medium">Iniciando formulário...</Text>
            </Stack>
          )}
          {/* Resultado da busca */}
          {searchResult && (
            <Stack tokens={{ childrenGap: 12 }}>
              <Separator />
              {searchResult.exists ? (
                <Stack tokens={{ childrenGap: 12 }}>
                  <MessageBar
                    messageBarType={
                      searchResult.isOwner
                        ? MessageBarType.info
                        : MessageBarType.warning
                    }
                  >
                    {searchResult.isOwner
                      ? "Formulário encontrado! Você é o proprietário deste formulário."
                      : `Formulário encontrado, mas pertence a: ${
                          searchResult.userName || "Outro usuário"
                        }`}
                  </MessageBar>{" "}
                  <SimpleCard>
                    <Stack tokens={{ childrenGap: 8 }}>
                      <Text variant="medium" style={{ fontWeight: 600 }}>
                        Informações do Formulário
                      </Text>
                      <Stack horizontal tokens={{ childrenGap: 16 }}>
                        <Text variant="small">
                          <strong>CNPJ:</strong> {searchResult.cnpj}
                        </Text>
                        <Text variant="small">
                          <strong>Status:</strong>{" "}
                          {renderStatusBadge(searchResult.status || "Rascunho")}
                        </Text>
                      </Stack>
                      {!searchResult.isOwner && (
                        <Text variant="small" style={{ color: "#605e5c" }}>
                          Proprietário: {searchResult.userName} (
                          {searchResult.userEmail})
                        </Text>
                      )}
                    </Stack>
                  </SimpleCard>
                  <Stack horizontal tokens={{ childrenGap: 12 }}>
                    {searchResult.allowEdit && searchResult.isOwner ? (
                      <PrimaryButton
                        text="Editar Formulário"
                        iconProps={{ iconName: "Edit" }}
                        onClick={() =>
                          handleLoadExistingForm(searchResult.itemId!)
                        }
                      />
                    ) : (
                      <TooltipHost
                        content={
                          !searchResult.isOwner
                            ? "Você não tem permissão para editar este formulário"
                            : "Este formulário não pode mais ser editado"
                        }
                        directionalHint={DirectionalHint.topCenter}
                      >
                        <DefaultButton
                          text="Editar Formulário"
                          iconProps={{ iconName: "Edit" }}
                          disabled
                        />
                      </TooltipHost>
                    )}
                  </Stack>
                </Stack>
              ) : (
                <Stack tokens={{ childrenGap: 12 }}>
                  <MessageBar messageBarType={MessageBarType.info}>
                    Nenhum formulário encontrado para este CNPJ.
                  </MessageBar>

                  <Stack horizontal tokens={{ childrenGap: 12 }}>
                    <PrimaryButton
                      text="Iniciar Novo Formulário"
                      iconProps={{ iconName: "Add" }}
                      onClick={handleStartNewForm}
                    />
                  </Stack>
                </Stack>
              )}{" "}
            </Stack>
          )}
        </Stack>
      </SimpleCard>
      {/* Meus Formulários */}
      <SimpleCard>
        <Stack tokens={{ childrenGap: 16 }}>
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
            <Icon
              iconName="BulletedList"
              style={{ fontSize: 20, color: "#0078d4" }}
            />
            <Text variant="large" style={{ fontWeight: 600 }}>
              Meus Formulários
            </Text>
          </Stack>

          {loadingUserForms ? (
            <Stack
              horizontal
              verticalAlign="center"
              tokens={{ childrenGap: 8 }}
            >
              <Spinner size={SpinnerSize.small} />
              <Text variant="medium">Carregando seus formulários...</Text>
            </Stack>
          ) : userForms.length > 0 ? (
            <Stack tokens={{ childrenGap: 12 }}>
              {userForms.map((form) => (
                <SimpleCard key={form.id}>
                  <Stack tokens={{ childrenGap: 8 }}>
                    <Stack
                      horizontal
                      horizontalAlign="space-between"
                      verticalAlign="start"
                    >
                      <Stack tokens={{ childrenGap: 4 }}>
                        <Text variant="medium" style={{ fontWeight: 600 }}>
                          {form.empresa || `CNPJ: ${form.cnpj}`}
                        </Text>{" "}
                        <Text variant="small" style={{ color: "#605e5c" }}>
                          CNPJ: {formatters.cnpj(form.cnpj)}
                        </Text>
                        <Text variant="small" style={{ color: "#605e5c" }}>
                          Última modificação:{" "}
                          {new Date(form.dataModificacao).toLocaleDateString(
                            "pt-BR"
                          )}
                        </Text>
                      </Stack>

                      <Stack horizontalAlign="end" tokens={{ childrenGap: 8 }}>
                        {renderStatusBadge(form.status)}
                        <DefaultButton
                          text="Editar"
                          iconProps={{ iconName: "Edit" }}
                          onClick={() => handleEditUserForm(form)}
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                </SimpleCard>
              ))}
            </Stack>
          ) : (
            <MessageBar messageBarType={MessageBarType.info}>
              Você ainda não possui formulários cadastrados. Use a busca por
              CNPJ acima para iniciar um novo formulário.
            </MessageBar>
          )}
        </Stack>
      </SimpleCard>
      {/* Informações adicionais */}
      <SimpleCard>
        <Stack tokens={{ childrenGap: 12 }}>
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
            <Icon iconName="Info" style={{ fontSize: 20, color: "#0078d4" }} />
            <Text variant="large" style={{ fontWeight: 600 }}>
              Informações Importantes
            </Text>
          </Stack>

          <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="medium">
              • Você só pode visualizar e editar formulários que você mesmo
              criou
            </Text>
            <Text variant="medium">
              • Formulários aprovados não podem mais ser editados
            </Text>
            <Text variant="medium">
              • Mantenha suas informações sempre atualizadas
            </Text>
            <Text variant="medium">
              • Em caso de dúvidas, entre em contato com o suporte técnico
            </Text>
          </Stack>
        </Stack>
      </SimpleCard>
    </Stack>
  );
};

export default InitialScreen;
