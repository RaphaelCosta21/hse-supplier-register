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
  Dialog,
  DialogType,
  DialogFooter,
} from "@fluentui/react";
import { useHSEForm } from "../context/HSEFormContext";
import {
  ICNPJVerificationResult,
  IUserFormSummary,
  IFormAvaliacao,
  ICampoRestricao,
} from "../../types/IApplicationPhase";
import { validators } from "../../utils/validators";
import { formatters } from "../../utils/formatters";
import { Footer } from "../common/Footer/Footer";
import styles from "../HseNewSupplier.module.scss";

// Assets da Oceaneering
import logoWhite from "../../assets/logo-white.png";
import oceaneeringBadge from "../../assets/oceaneering-badge.png";

// Cores da Oceaneering baseadas na imagem fornecida
const oceaneeringColors = {
  primaryBlue: "#003b5c", // PMS 302 C
  secondaryBlue: "#00263e", // PMS 2965 C
  accent: "#ffc72c", // PMS 123 C
  lightBlue: "#0078d4",
  white: "#ffffff",
  lightGray: "#f3f2f1",
  textSecondary: "#605e5c",
};

// Componente Card simples com design da Oceaneering
const SimpleCard: React.FC<{
  children: React.ReactNode;
  tokens?: { childrenMargin?: number };
  style?: React.CSSProperties;
  variant?: "default" | "primary" | "accent";
}> = ({ children, style = {}, variant = "default" }) => {
  const getCardStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: "24px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      border: "none",
      ...style,
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, ${oceaneeringColors.primaryBlue} 0%, ${oceaneeringColors.secondaryBlue} 100%)`,
          color: oceaneeringColors.white,
        };
      case "accent":
        return {
          ...baseStyle,
          backgroundColor: oceaneeringColors.accent,
          color: oceaneeringColors.secondaryBlue,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: oceaneeringColors.white,
          border: `1px solid ${oceaneeringColors.lightGray}`,
        };
    }
  };

  return <div style={getCardStyle()}>{children}</div>;
};

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
  const [restrictionModalOpen, setRestrictionModalOpen] =
    React.useState<boolean>(false);
  const [selectedFormRestrictions, setSelectedFormRestrictions] =
    React.useState<{
      form: IUserFormSummary;
      restrictions: ICampoRestricao[];
    } | null>(null);

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

      // Validar em tempo real
      const validation = validateCNPJ(formatted);
      setCnpjValidation(validation);

      // Limpar erros ao digitar
      setCnpjError("");
      setSearchResult(null);
    }
  };

  // Handler para buscar CNPJ
  const handleSearchCNPJ = async (): Promise<void> => {
    if (!cnpj || !cnpjValidation.isValid) {
      setCnpjError("Digite um CNPJ válido");
      return;
    }

    setSearchingCNPJ(true);
    setCnpjError("");
    try {
      console.log("Iniciando busca por CNPJ:", cnpj);
      const result = await actions.searchCNPJWithSecurity(cnpj);
      console.log("Resultado da busca:", result);

      setSearchResult(result);
      onCNPJVerified(result);
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      setCnpjError("Erro ao buscar CNPJ. Tente novamente.");
    } finally {
      setSearchingCNPJ(false);
    }
  };
  // Handler para continuar com formulário existente
  const handleContinueExisting = async (): Promise<void> => {
    if (!searchResult?.itemId) {
      console.error("ID do formulário não encontrado");
      return;
    }

    try {
      console.log("Carregando formulário existente:", searchResult.itemId);
      await actions.loadExistingForm(searchResult.itemId);
    } catch (error) {
      console.error("Erro ao carregar formulário existente:", error);
    }
  };

  // Handler para editar formulário do usuário
  const handleEditUserForm = async (form: IUserFormSummary): Promise<void> => {
    try {
      console.log("=== CLIQUE NO BOTÃO EDITAR ===");
      console.log("Formulário selecionado:", form);
      console.log("ID do formulário:", form.id);
      console.log("Status do formulário:", form.status);

      console.log("Chamando actions.loadExistingForm...");
      await actions.loadExistingForm(form.id);
      console.log("LoadExistingForm concluído com sucesso");
    } catch (error) {
      console.error("=== ERRO AO CARREGAR FORMULÁRIO PARA EDIÇÃO ===");
      console.error("Erro:", error);
      console.error("Stack:", error?.stack);
    }
  };

  // Função utilitária para buscar a avaliação mais recente
  const getLatestEvaluation = (
    form: IUserFormSummary
  ): { key: string; data: IFormAvaliacao } | null => {
    const avaliacoes = form.metadata?.Avaliacao;
    if (!avaliacoes) return null;

    const avaliacaoKeys = Object.keys(avaliacoes);
    if (avaliacaoKeys.length === 0) return null;

    // Ordenar as chaves numericamente e pegar a maior (mais recente)
    const ultimaAvaliacaoKey = avaliacaoKeys
      .map((key) => parseInt(key))
      .sort((a, b) => b - a)[0]
      .toString();

    return {
      key: ultimaAvaliacaoKey,
      data: avaliacoes[ultimaAvaliacaoKey],
    };
  };

  // Handler para corrigir restrições de formulário aprovado
  const handleCorrectRestrictions = async (
    form: IUserFormSummary
  ): Promise<void> => {
    try {
      console.log("=== INICIANDO CORREÇÃO DE RESTRIÇÕES ===");
      console.log("Formulário selecionado:", form);

      // Buscar a avaliação mais recente
      const latestEvaluation = getLatestEvaluation(form);
      if (!latestEvaluation) {
        console.error("Nenhuma avaliação encontrada para este formulário");
        return;
      }

      const { key: ultimaAvaliacaoKey, data: ultimaAvaliacao } =
        latestEvaluation;
      console.log(
        `Usando avaliação mais recente (${ultimaAvaliacaoKey}):`,
        ultimaAvaliacao
      );

      if (
        ultimaAvaliacao?.Restricao === "Sim" &&
        ultimaAvaliacao.CamposRestricao
      ) {
        console.log("Restrições encontradas:", ultimaAvaliacao.CamposRestricao);

        // Abrir modal de correção de restrições
        setSelectedFormRestrictions({
          form,
          restrictions: ultimaAvaliacao.CamposRestricao,
        });
        setRestrictionModalOpen(true);
        console.log("Modal de correção de restrições aberto");
      } else {
        console.log("Nenhuma restrição encontrada nesta avaliação");
      }
    } catch (error) {
      console.error("=== ERRO AO INICIAR CORREÇÃO DE RESTRIÇÕES ===");
      console.error("Erro:", error);
    }
  };

  // Função para verificar se um formulário aprovado tem restrições
  const hasRestrictions = (form: IUserFormSummary): boolean => {
    console.log("=== VERIFICANDO RESTRIÇÕES ===");
    console.log("Form status:", form.status);
    console.log("Form metadata:", form.metadata);

    if (form.status !== "Aprovado") {
      console.log("Status não é Aprovado, retornando false");
      return false;
    }

    const latestEvaluation = getLatestEvaluation(form);
    console.log("Latest evaluation:", latestEvaluation);

    if (!latestEvaluation) {
      console.log("Nenhuma avaliação encontrada, retornando false");
      return false;
    }

    const ultimaAvaliacao = latestEvaluation.data;
    console.log("Última avaliação:", ultimaAvaliacao);
    console.log("Restricao:", ultimaAvaliacao?.Restricao);
    console.log(
      "CamposRestricao length:",
      ultimaAvaliacao?.CamposRestricao?.length
    );

    const hasRestr =
      ultimaAvaliacao?.Restricao === "Sim" &&
      Boolean(ultimaAvaliacao.CamposRestricao?.length);

    console.log("Resultado hasRestrictions:", hasRestr);
    return hasRestr;
  };

  // Handler para download do formulário em PDF
  const handleDownloadFormPDF = async (
    form: IUserFormSummary
  ): Promise<void> => {
    try {
      console.log("Gerando PDF para o formulário:", form);

      // Carregar dados completos do formulário
      const formData = await actions.loadFormDataForPDF(form.id);

      if (!formData) {
        console.error("Não foi possível carregar os dados do formulário");
        return;
      }

      // Gerar e baixar PDF
      await actions.downloadFormAsPDF(formData, form.empresa || form.cnpj);
    } catch (error) {
      console.error("Erro ao gerar PDF do formulário:", error);
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string): JSX.Element => {
    const statusConfig: Record<string, { color: string; icon: string }> = {
      "Em Andamento": { color: "#ff8c00", icon: "Clock" },
      Enviado: { color: oceaneeringColors.lightBlue, icon: "Send" },
      Aprovado: { color: "#107c10", icon: "CheckMark" },
      Rejeitado: { color: "#d13438", icon: "Cancel" },
      Cancelado: { color: "#605e5c", icon: "StatusCircleBlock" },
      "Em Análise": { color: "#0078d4", icon: "Search" },
      "Pendente Info.": { color: "#ca5010", icon: "Info" },
    };

    const config = statusConfig[status] || statusConfig["Em Andamento"];

    return (
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 4 }}>
        <Icon
          iconName={config.icon}
          style={{ color: config.color, fontSize: 12 }}
        />{" "}
        <Text variant="small" style={{ color: config.color, fontWeight: 600 }}>
          {status}
        </Text>
      </Stack>
    );
  };

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${oceaneeringColors.lightGray} 0%, ${oceaneeringColors.white} 100%)`,
        minHeight: "100vh",
        padding: "0",
      }}
    >
      {/* Header com Logo da Oceaneering */}
      <SimpleCard
        variant="primary"
        style={{ marginBottom: "24px", borderRadius: "0 0 16px 16px" }}
      >
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 16 }}>
            {" "}
            <img
              src={logoWhite}
              alt="Oceaneering Logo"
              style={{ height: "48px", width: "auto" }}
            />
            <Stack>
              <Text
                variant="xLarge"
                style={{
                  fontWeight: 700,
                  color: oceaneeringColors.white,
                  marginBottom: "4px",
                }}
              >
                Sistema HSE
              </Text>
              <Text
                variant="medium"
                style={{
                  color: oceaneeringColors.accent,
                  fontWeight: 500,
                }}
              >
                Auto-avaliação para Contratadas
              </Text>
            </Stack>
          </Stack>{" "}
          <img
            src={oceaneeringBadge}
            alt="Oceaneering Badge"
            style={{ height: "64px", width: "auto" }}
          />
        </Stack>
      </SimpleCard>

      <Stack
        tokens={{ childrenGap: 24 }}
        style={{ padding: "0 24px 24px 24px" }}
      >
        {/* Header com informações do usuário */}
        <SimpleCard>
          <Stack tokens={{ childrenGap: 12 }}>
            <Stack
              horizontal
              verticalAlign="center"
              tokens={{ childrenGap: 12 }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${oceaneeringColors.primaryBlue} 0%, ${oceaneeringColors.lightBlue} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  iconName="Contact"
                  style={{ fontSize: 24, color: oceaneeringColors.white }}
                />
              </div>
              <Stack>
                <Text
                  variant="large"
                  style={{
                    fontWeight: 600,
                    color: oceaneeringColors.primaryBlue,
                  }}
                >
                  Bem-vindo, {currentUser.displayName}
                </Text>
                <Text
                  variant="medium"
                  style={{ color: oceaneeringColors.textSecondary }}
                >
                  {currentUser.email}
                </Text>
              </Stack>
            </Stack>

            <Text
              variant="medium"
              style={{ color: oceaneeringColors.textSecondary }}
            >
              Sistema de Auto-avaliação HSE para Contratadas da Oceaneering
            </Text>
          </Stack>
        </SimpleCard>

        {/* Informações adicionais */}
        <SimpleCard
          style={{
            backgroundColor: "#f8f9fa",
            border: `1px solid ${oceaneeringColors.accent}`,
          }}
        >
          <Stack tokens={{ childrenGap: 12 }}>
            <Stack
              horizontal
              verticalAlign="center"
              tokens={{ childrenGap: 12 }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: oceaneeringColors.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  iconName="Info"
                  style={{
                    fontSize: 18,
                    color: oceaneeringColors.secondaryBlue,
                  }}
                />
              </div>
              <Text
                variant="large"
                style={{
                  fontWeight: 600,
                  color: oceaneeringColors.primaryBlue,
                }}
              >
                Informações Importantes
              </Text>
            </Stack>

            <Stack tokens={{ childrenGap: 8 }}>
              <Text
                variant="medium"
                style={{ color: oceaneeringColors.textSecondary }}
              >
                • Apenas o usuário responsável pela criação do formulário possui
                permissão para visualização e edição.
              </Text>
              <Text
                variant="medium"
                style={{ color: oceaneeringColors.textSecondary }}
              >
                • É permitido criar múltiplos formulários; entretanto, somente
                aqueles marcados como &quot;Enviado&quot; serão avaliados pela
                Oceaneering.
              </Text>
              <Text
                variant="medium"
                style={{ color: oceaneeringColors.textSecondary }}
              >
                • O progresso do formulário pode ser salvo a qualquer momento
                após o preenchimento dos campos obrigatórios da seção
                &quot;Dados Gerais&quot;. Os rascunhos ficam disponíveis em
                &quot;Meus Formulários&quot; para consulta e edição.
              </Text>
              <Text
                variant="medium"
                style={{ color: oceaneeringColors.textSecondary }}
              >
                • Formulários com status &quot;Aprovado&quot;,
                &quot;Rejeitado&quot;, &quot;Cancelado&quot;, &quot;Em
                Análise&quot; ou &quot;Enviado&quot; permitem apenas download em
                PDF.
              </Text>
              <Text
                variant="medium"
                style={{ color: oceaneeringColors.textSecondary }}
              >
                • Formulários com status &quot;Em Andamento&quot; ou
                &quot;Pendente Info.&quot; podem ser editados.
              </Text>
              <Text
                variant="medium"
                style={{ color: oceaneeringColors.textSecondary }}
              >
                • Após iniciado, o formulário não pode ser excluído, mas pode
                ser revisado e alterado quantas vezes necessário até sua
                submissão e envio.
              </Text>
              <Text
                variant="medium"
                style={{ color: oceaneeringColors.textSecondary }}
              >
                • Em caso de dúvidas, entre em contato com o time de HSE.
              </Text>
            </Stack>
          </Stack>
        </SimpleCard>

        {/* Busca por CNPJ */}
        <SimpleCard>
          <Stack tokens={{ childrenGap: 16 }}>
            <Stack
              horizontal
              verticalAlign="center"
              tokens={{ childrenGap: 12 }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${oceaneeringColors.accent} 0%, #ffb000 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  iconName="Search"
                  style={{
                    fontSize: 18,
                    color: oceaneeringColors.secondaryBlue,
                  }}
                />
              </div>{" "}
              <Text
                variant="large"
                style={{
                  fontWeight: 600,
                  color: oceaneeringColors.primaryBlue,
                }}
              >
                Iniciar Formulário
              </Text>{" "}
              <div className={styles.stepBlockedMessage}>
                <Icon iconName="Info" className={styles.stepBlockedIcon} />
                Apenas para novos cadastros
              </div>
            </Stack>

            <Stack
              horizontal
              tokens={{ childrenGap: 12 }}
              verticalAlign="start"
            >
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
                  styles={{
                    fieldGroup: {
                      borderColor: oceaneeringColors.lightBlue,
                      ":hover": {
                        borderColor: oceaneeringColors.primaryBlue,
                      },
                      ":focus-within": {
                        borderColor: oceaneeringColors.primaryBlue,
                      },
                    },
                  }}
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
                  styles={{
                    root: {
                      backgroundColor: oceaneeringColors.primaryBlue,
                      borderColor: oceaneeringColors.primaryBlue,
                      ":hover": {
                        backgroundColor: oceaneeringColors.secondaryBlue,
                        borderColor: oceaneeringColors.secondaryBlue,
                      },
                    },
                  }}
                />
              </Stack>
            </Stack>

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
                        ? `Formulário encontrado para o CNPJ ${searchResult.cnpj}. Você pode continuar de onde parou.`
                        : `Este CNPJ já possui um formulário criado por outro usuário.`}
                    </MessageBar>

                    {searchResult.isOwner && searchResult.itemId && (
                      <Stack tokens={{ childrenGap: 8 }}>
                        <Text variant="medium" style={{ fontWeight: 600 }}>
                          CNPJ: {formatters.cnpj(searchResult.cnpj)}
                        </Text>
                        <Text
                          variant="small"
                          style={{ color: oceaneeringColors.textSecondary }}
                        >
                          Status: {searchResult.status || "Em andamento"}
                        </Text>
                        <Text
                          variant="small"
                          style={{ color: oceaneeringColors.textSecondary }}
                        >
                          Usuário: {searchResult.userName || "Não informado"}
                        </Text>
                        <PrimaryButton
                          text="Continuar Formulário"
                          iconProps={{ iconName: "Forward" }}
                          onClick={handleContinueExisting}
                          styles={{
                            root: {
                              backgroundColor: oceaneeringColors.accent,
                              borderColor: oceaneeringColors.accent,
                              color: oceaneeringColors.secondaryBlue,
                              ":hover": {
                                backgroundColor: "#ffb000",
                                borderColor: "#ffb000",
                              },
                            },
                          }}
                        />
                      </Stack>
                    )}
                  </Stack>
                ) : (
                  <Stack tokens={{ childrenGap: 12 }}>
                    <MessageBar messageBarType={MessageBarType.success}>
                      CNPJ disponível! Você pode iniciar um novo formulário.
                    </MessageBar>
                    <PrimaryButton
                      text="Criar Novo Formulário"
                      iconProps={{ iconName: "Add" }}
                      onClick={() => actions.startNewForm(cnpj)}
                      styles={{
                        root: {
                          backgroundColor: "#107c10",
                          borderColor: "#107c10",
                        },
                      }}
                    />
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>
        </SimpleCard>

        {/* Meus Formulários */}
        <SimpleCard>
          <Stack tokens={{ childrenGap: 16 }}>
            <Stack
              horizontal
              verticalAlign="center"
              tokens={{ childrenGap: 12 }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${oceaneeringColors.lightBlue} 0%, ${oceaneeringColors.primaryBlue} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  iconName="DocumentSet"
                  style={{ fontSize: 18, color: oceaneeringColors.white }}
                />
              </div>
              <Text
                variant="large"
                style={{
                  fontWeight: 600,
                  color: oceaneeringColors.primaryBlue,
                }}
              >
                Meus Formulários
              </Text>
            </Stack>

            {/* Mensagem de alerta sobre avaliação */}
            <div className={styles.alertMessageInitial}>
              <Icon iconName="Warning" className={styles.alertIcon} />
              <div className={styles.alertText}>
                <strong>IMPORTANTE:</strong> Apenas formulários com o status
                &quot;Enviado&quot; serão avaliados pela Oceaneering. Caso seja
                necessária a revisão de qualquer campo de um formulário já
                enviado, solicite suporte ao time de HSE.
              </div>
            </div>

            {loadingUserForms ? (
              <Stack
                horizontal
                verticalAlign="center"
                tokens={{ childrenGap: 8 }}
              >
                <Spinner size={SpinnerSize.small} />
                <Text variant="medium">Carregando formulários...</Text>
              </Stack>
            ) : userForms.length > 0 ? (
              <Stack tokens={{ childrenGap: 12 }}>
                {userForms.map((form) => (
                  <SimpleCard
                    key={form.id}
                    style={{ backgroundColor: "#fafafa" }}
                  >
                    <Stack tokens={{ childrenGap: 8 }}>
                      <Stack
                        horizontal
                        horizontalAlign="space-between"
                        verticalAlign="start"
                      >
                        <Stack tokens={{ childrenGap: 4 }}>
                          <Text
                            variant="medium"
                            style={{
                              fontWeight: 600,
                              color: oceaneeringColors.primaryBlue,
                            }}
                          >
                            {form.empresa || `CNPJ: ${form.cnpj}`}
                          </Text>
                          <Text
                            variant="small"
                            style={{ color: oceaneeringColors.textSecondary }}
                          >
                            CNPJ: {formatters.cnpj(form.cnpj)}
                          </Text>
                          <Stack
                            horizontal
                            tokens={{ childrenGap: 12 }}
                            style={{ flexWrap: "wrap" }}
                          >
                            <Text
                              variant="small"
                              style={{ color: oceaneeringColors.textSecondary }}
                            >
                              Última modificação:{" "}
                              {form.dataModificacaoCompleta ||
                                new Date(
                                  form.dataModificacao
                                ).toLocaleDateString("pt-BR") +
                                  " às " +
                                  new Date(
                                    form.dataModificacao
                                  ).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                            </Text>
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "2px 8px",
                                backgroundColor:
                                  oceaneeringColors.lightBlue + "20",
                                borderRadius: "12px",
                                border: `1px solid ${oceaneeringColors.lightBlue}`,
                              }}
                              title={`Este formulário foi salvo/modificado ${
                                form.numeroRevisoes || 1
                              } vez(es)`}
                            >
                              <Icon
                                iconName="History"
                                style={{
                                  fontSize: "12px",
                                  color: oceaneeringColors.primaryBlue,
                                }}
                              />
                              <Text
                                variant="small"
                                style={{
                                  color: oceaneeringColors.primaryBlue,
                                  fontWeight: 600,
                                  fontSize: "11px",
                                }}
                              >
                                Rev. {form.numeroRevisoes || 1}
                              </Text>
                            </div>
                          </Stack>
                        </Stack>

                        <Stack
                          horizontalAlign="end"
                          tokens={{ childrenGap: 8 }}
                        >
                          {renderStatusBadge(form.status)}
                          {/* Lógica dos botões baseada no status do formulário */}
                          {hasRestrictions(form) ? (
                            // Mostrar botão "Corrigir Restrições" para formulários aprovados com restrições
                            <DefaultButton
                              text="Corrigir Restrições"
                              iconProps={{ iconName: "EditNote" }}
                              onClick={() => handleCorrectRestrictions(form)}
                              styles={{
                                root: {
                                  borderColor: "#ca5010",
                                  color: "#ca5010",
                                  ":hover": {
                                    backgroundColor: "#ca5010",
                                    color: oceaneeringColors.white,
                                  },
                                },
                              }}
                            />
                          ) : form.status === "Enviado" ||
                            form.status === "Aprovado" ||
                            form.status === "Em Análise" ||
                            form.status === "Rejeitado" ||
                            form.status === "Cancelado" ? (
                            // Mostrar botão Download PDF para estes status
                            <DefaultButton
                              text="Download PDF"
                              iconProps={{ iconName: "Download" }}
                              onClick={() => handleDownloadFormPDF(form)}
                              styles={{
                                root: {
                                  borderColor: oceaneeringColors.lightBlue,
                                  color: oceaneeringColors.lightBlue,
                                  ":hover": {
                                    backgroundColor:
                                      oceaneeringColors.lightBlue,
                                    color: oceaneeringColors.white,
                                  },
                                },
                              }}
                            />
                          ) : (
                            // Mostrar botão Editar para Em Andamento e Pendente Info.
                            <DefaultButton
                              text="Editar"
                              iconProps={{ iconName: "Edit" }}
                              onClick={() => handleEditUserForm(form)}
                              styles={{
                                root: {
                                  borderColor: oceaneeringColors.primaryBlue,
                                  color: oceaneeringColors.primaryBlue,
                                  ":hover": {
                                    backgroundColor:
                                      oceaneeringColors.primaryBlue,
                                    color: oceaneeringColors.white,
                                  },
                                },
                              }}
                            />
                          )}
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
      </Stack>

      {/* Rodapé do sistema */}
      <Footer />

      {/* Modal de Correção de Restrições */}
      <Dialog
        hidden={!restrictionModalOpen}
        onDismiss={() => setRestrictionModalOpen(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: "Corrigir Restrições",
          subText: selectedFormRestrictions
            ? `Formulário: ${selectedFormRestrictions.form.empresa} (${selectedFormRestrictions.form.cnpj})`
            : "",
        }}
        modalProps={{
          isBlocking: true,
          styles: { main: { maxWidth: 800, width: "90%" } },
        }}
      >
        {selectedFormRestrictions && (
          <Stack tokens={{ childrenGap: 20 }}>
            <MessageBar messageBarType={MessageBarType.warning}>
              Os seguintes campos precisam ser corrigidos conforme as restrições
              identificadas na avaliação:
            </MessageBar>

            <Stack tokens={{ childrenGap: 15 }}>
              {selectedFormRestrictions.restrictions.map((restricao, index) => (
                <Stack key={index} tokens={{ childrenGap: 8 }}>
                  <Text
                    variant="mediumPlus"
                    style={{
                      fontWeight: 600,
                      color: oceaneeringColors.primaryBlue,
                    }}
                  >
                    {restricao.nomeExibicao}
                  </Text>
                  <Stack
                    style={{
                      padding: 12,
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      variant="small"
                      style={{ fontWeight: 600, color: "#dc2626" }}
                    >
                      Motivo da Restrição:
                    </Text>
                    <Text variant="small" style={{ color: "#dc2626" }}>
                      {restricao.motivo}
                    </Text>
                  </Stack>

                  <Text
                    variant="small"
                    style={{
                      fontStyle: "italic",
                      color: oceaneeringColors.textSecondary,
                    }}
                  >
                    Seção: {restricao.secao} | Campo: {restricao.campo}
                  </Text>
                </Stack>
              ))}
            </Stack>

            <MessageBar messageBarType={MessageBarType.info}>
              Para corrigir estas restrições, clique em &quot;Editar
              Formulário&quot; para acessar a versão completa do formulário com
              os campos restritos destacados.
            </MessageBar>
          </Stack>
        )}

        <DialogFooter>
          <PrimaryButton
            text="Editar Formulário"
            onClick={async () => {
              if (selectedFormRestrictions) {
                console.log("=== INICIANDO CARREGAMENTO EM MODO CORREÇÃO ===");
                console.log(
                  "Restrições a serem aplicadas:",
                  selectedFormRestrictions.restrictions
                );

                // Armazenar as restrições no sessionStorage para uso no contexto
                sessionStorage.setItem(
                  "camposRestricao",
                  JSON.stringify(selectedFormRestrictions.restrictions)
                );
                sessionStorage.setItem("modoCorrecao", "true");

                console.log("SessionStorage definido:");
                console.log(
                  "- modoCorrecao:",
                  sessionStorage.getItem("modoCorrecao")
                );
                console.log(
                  "- camposRestricao:",
                  sessionStorage.getItem("camposRestricao")
                );

                // Carregar o formulário para edição
                console.log(
                  "Chamando loadExistingForm para o ID:",
                  selectedFormRestrictions.form.id
                );
                await actions.loadExistingForm(
                  selectedFormRestrictions.form.id
                );
                setRestrictionModalOpen(false);
                console.log(
                  "Modal fechado, formulário deve estar carregando..."
                );
              }
            }}
          />
          <DefaultButton
            text="Cancelar"
            onClick={() => setRestrictionModalOpen(false)}
          />
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default InitialScreen;
