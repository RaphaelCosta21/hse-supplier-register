import * as React from "react";
import {
  Toggle,
  Stack,
  Text,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import {
  useSharePointHeaderOverrides,
  useSharePointHeaderOverridesAggressive,
} from "../../../hooks/useSharePointOverrides";

export interface ISharePointCustomizerProps {
  enableCustomization?: boolean;
}

/**
 * Componente para controlar a customização do cabeçalho do SharePoint
 * Permite ativar/desativar as modificações
 */
export const SharePointCustomizer: React.FC<ISharePointCustomizerProps> = ({
  enableCustomization = true,
}) => {
  const [isEnabled, setIsEnabled] = React.useState(enableCustomization);
  const [useAggressive, setUseAggressive] = React.useState(false);

  // Aplicar hooks condicionalmente
  if (isEnabled && !useAggressive) {
    useSharePointHeaderOverrides();
  } else if (isEnabled && useAggressive) {
    useSharePointHeaderOverridesAggressive();
  }

  // Este componente só é visível em modo debug
  const isDebugMode = window.location.search.includes("debug=true");

  if (!isDebugMode) {
    // Aplicar automaticamente se não estiver em debug
    if (enableCustomization) {
      useSharePointHeaderOverrides();
    }
    return null;
  }

  return (
    <Stack
      tokens={{ childrenGap: 8 }}
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        background: "white",
        padding: 16,
        border: "1px solid #ccc",
        borderRadius: 4,
        zIndex: 9999,
        minWidth: 300,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Text variant="mediumPlus" style={{ fontWeight: 600 }}>
        🎨 Customizador SharePoint
      </Text>

      <MessageBar messageBarType={MessageBarType.warning} isMultiline={false}>
        Modo Debug - Controles de customização
      </MessageBar>

      <Toggle
        label="Ocultar elementos do cabeçalho"
        checked={isEnabled}
        onChange={(_, checked) => setIsEnabled(!!checked)}
        onText="Ativado"
        offText="Desativado"
      />

      {isEnabled && (
        <Toggle
          label="Modo agressivo (oculta mais elementos)"
          checked={useAggressive}
          onChange={(_, checked) => setUseAggressive(!!checked)}
          onText="Ativado"
          offText="Desativado"
        />
      )}

      <Stack tokens={{ childrenGap: 4 }}>
        <Text variant="small" style={{ color: "#666" }}>
          <strong>Modo Normal:</strong> Oculta pesquisa, configurações, ajuda
        </Text>
        <Text variant="small" style={{ color: "#666" }}>
          <strong>Modo Agressivo:</strong> Oculta todo o cabeçalho superior
        </Text>
        <Text variant="small" style={{ color: "#999", fontSize: "10px" }}>
          Para remover este painel, retire ?debug=true da URL
        </Text>
      </Stack>
    </Stack>
  );
};

/**
 * Hook simples para aplicar customizações sem interface
 */
export const useSimpleSharePointCustomizer = (
  options: {
    hideSearch?: boolean;
    hideSettings?: boolean;
    hideHelp?: boolean;
    hideUserMenu?: boolean;
    aggressive?: boolean;
  } = {}
): void => {
  const {
    hideSearch = true,
    hideSettings = true,
    hideHelp = true,
    hideUserMenu = false,
    aggressive = false,
  } = options;

  React.useEffect(() => {
    if (aggressive) {
      // Usar modo agressivo
      useSharePointHeaderOverridesAggressive();
      return;
    }

    // CSS customizado baseado nas opções
    let customCSS = "";

    if (hideSearch) {
      customCSS += `
        [data-automation-id="searchBox"],
        .ms-SearchBox-container,
        .ms-SearchBox,
        input[placeholder*="Pesquisar"],
        input[placeholder*="Search"] {
          display: none !important;
        }
      `;
    }

    if (hideSettings) {
      customCSS += `
        [data-automation-id="SettingsButton"],
        button[aria-label*="Configurações"],
        button[aria-label*="Settings"] {
          display: none !important;
        }
      `;
    }

    if (hideHelp) {
      customCSS += `
        [data-automation-id="HelpButton"],
        button[aria-label*="Ajuda"],
        button[aria-label*="Help"] {
          display: none !important;
        }
      `;
    }

    if (hideUserMenu) {
      customCSS += `
        [data-automation-id="meButton"],
        .ms-Persona-coin,
        button[aria-label*="Minha conta"],
        button[aria-label*="My account"] {
          display: none !important;
        }
      `;
    }

    if (customCSS) {
      const styleElement = document.createElement("style");
      styleElement.type = "text/css";
      styleElement.id = "hse-simple-sharepoint-overrides";
      styleElement.innerHTML = customCSS;

      const existingStyle = document.getElementById(
        "hse-simple-sharepoint-overrides"
      );
      if (existingStyle) {
        existingStyle.remove();
      }

      document.head.appendChild(styleElement);
    }
  }, [hideSearch, hideSettings, hideHelp, hideUserMenu, aggressive]);
};
