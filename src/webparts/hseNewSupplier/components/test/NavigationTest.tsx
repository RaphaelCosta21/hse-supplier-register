import * as React from "react";
import { useHSEForm } from "../context/HSEFormContext";
import { formSelectors } from "../context/formReducer";
import { PrimaryButton, DefaultButton, Stack, Text } from "@fluentui/react";

export const NavigationTest: React.FC = () => {
  const { state, dispatch, actions } = useHSEForm();

  const isDadosGeraisValid = formSelectors.isDadosGeraisValid(state);
  const isConformidadeLegalValid =
    formSelectors.isConformidadeLegalValid(state);
  const isServicosEspeciaisValid =
    formSelectors.isServicosEspeciaisValid(state);

  const canGoToStep2 = formSelectors.canProceedToStep(state, 2);
  const canGoToStep3 = formSelectors.canProceedToStep(state, 3);
  const canGoToStep4 = formSelectors.canProceedToStep(state, 4);

  const handleFillMinimalData = (): void => {
    if (dispatch) {
      dispatch({
        type: "SET_FORM_DATA",
        payload: {
          ...state.formData,
          dadosGerais: {
            ...state.formData.dadosGerais,
            empresa: "Empresa Teste",
            cnpj: "12.345.678/0001-00",
            numeroContrato: "123456",
            dataInicioContrato: new Date(),
            dataTerminoContrato: new Date(),
            responsavelTecnico: "João Silva",
            atividadePrincipalCNAE: "12345-6",
            gerenteContratoMarine: "Maria Santos",
            grauRisco: "2",
          },
        },
      });

      // Simular anexo REM
      dispatch({
        type: "ADD_ATTACHMENT",
        payload: {
          category: "rem",
          attachment: {
            id: "test-rem-1",
            fileName: "rem-test.pdf",
            fileSize: 1024,
            uploadDate: new Date().toISOString(),
            category: "rem",
            subcategory: "",
            originalName: "rem-test.pdf",
            fileType: ".pdf",
            url: "/test/rem-test.pdf",
          },
        },
      });
    }
  };

  const handleTestSave = async (): Promise<void> => {
    try {
      await actions.saveFormData();
      console.log("Rascunho salvo com sucesso!");

      // Testar redirecionamento para página inicial
      if (actions?.setApplicationPhase) {
        actions.setApplicationPhase({
          phase: "ENTRADA",
          cnpj: "",
          isOverwrite: false,
          requiresApproval: false,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const handleGoToRevisaoFinal = (): void => {
    if (dispatch) {
      dispatch({ type: "SET_CURRENT_STEP", payload: 4 });
    }
  };

  return (
    <Stack tokens={{ childrenGap: 16 }} style={{ padding: 16 }}>
      <Text variant="xLarge">Teste de Navegação Sequencial</Text>

      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant="mediumPlus">Status das Validações:</Text>
        <Text>
          ✅ Dados Gerais: {isDadosGeraisValid ? "Válido" : "Inválido"}
        </Text>
        <Text>
          ✅ Conformidade Legal:{" "}
          {isConformidadeLegalValid ? "Válido" : "Inválido"}
        </Text>
        <Text>
          ✅ Serviços Especializados:{" "}
          {isServicosEspeciaisValid ? "Válido" : "Inválido"}
        </Text>
      </Stack>

      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant="mediumPlus">Permissões de Navegação:</Text>
        <Text>📋 Pode ir para Etapa 2: {canGoToStep2 ? "Sim" : "Não"}</Text>
        <Text>📋 Pode ir para Etapa 3: {canGoToStep3 ? "Sim" : "Não"}</Text>
        <Text>📋 Pode ir para Etapa 4: {canGoToStep4 ? "Sim" : "Não"}</Text>
      </Stack>

      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant="mediumPlus">💡 Dica Visual:</Text>
        <Text>
          O botão flutuante &quot;Salvar Rascunho&quot; agora possui uma pequena
          seta branca ▲ que aparece do lado esquerdo do emoji, centralizada no
          botão, pulsando suavemente para indicar que há mais informações
          disponíveis ao passar o mouse sobre ele.
        </Text>
        <Text>
          A seta desaparece quando o botão está expandido, criando uma
          experiência visual mais limpa. O mesmo comportamento foi aplicado ao
          botão &quot;Revisar e Submeter&quot; que voltou a usar o emoji ✅.
        </Text>
      </Stack>

      <Stack horizontal tokens={{ childrenGap: 8 }}>
        <PrimaryButton
          text="Preencher Dados Mínimos"
          onClick={handleFillMinimalData}
        />
        <PrimaryButton
          text="Testar Salvar Rascunho"
          onClick={handleTestSave}
          disabled={!isDadosGeraisValid}
        />
        <DefaultButton
          text="Ir para Etapa 2"
          onClick={() =>
            dispatch && dispatch({ type: "SET_CURRENT_STEP", payload: 2 })
          }
          disabled={!canGoToStep2}
        />
        <DefaultButton
          text="Ir para Etapa 3"
          onClick={() =>
            dispatch && dispatch({ type: "SET_CURRENT_STEP", payload: 3 })
          }
          disabled={!canGoToStep3}
        />
        <DefaultButton
          text="Ir para Etapa 4"
          onClick={() =>
            dispatch && dispatch({ type: "SET_CURRENT_STEP", payload: 4 })
          }
          disabled={!canGoToStep4}
        />
        <DefaultButton
          text="Ir para Revisão Final (Forçar)"
          onClick={handleGoToRevisaoFinal}
          style={{ backgroundColor: "#ffeb3b", color: "#000" }}
        />
      </Stack>
    </Stack>
  );
};
