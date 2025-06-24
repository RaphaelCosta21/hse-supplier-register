import { useEffect } from "react";

/**
 * Hook para aplicar CSS customizado que oculta elementos do cabeçalho do SharePoint
 * ATENÇÃO: Este CSS pode quebrar com atualizações do SharePoint
 */
export const useSharePointHeaderOverrides = (): void => {
  useEffect(() => {
    // CSS para ocultar elementos do cabeçalho
    const customCSS = `
      /* Ocultar barra de pesquisa */
      [data-automation-id="searchBox"],
      .ms-SearchBox-container,
      .ms-SearchBox {
        display: none !important;
      }

      /* Ocultar botão de configurações */
      [data-automation-id="SettingsButton"],
      button[aria-label*="Configurações"],
      button[aria-label*="Settings"] {
        display: none !important;
      }      /* Ocultar botão de ajuda */
      [data-automation-id="HelpButton"],
      button[aria-label*="Ajuda"],
      button[aria-label*="Help"] {
        display: none !important;
      }      /* Ocultar elementos específicos do cabeçalho SharePoint */
      #suiteNavWrapper,
      #spCommandBar,
      [class*="headerRow-"],
      [class*="CommandBarWrapper"],
      [class*="commandBarWrapper_"],
      div[class*="headerRow"],
      div[aria-label*="Cabeçalho do Site do SharePoint"],
      div[aria-label*="Barra de comandos"] {
        display: none !important;
      }

      /* Reduzir altura do cabeçalho */
      .ms-compositeHeader,
      #SuiteNavWrapper,
      .od-TopBar {
        min-height: 48px !important;
        height: 48px !important;
      }

      /* Ajustar espaçamento do conteúdo */
      #workbenchPageContent,
      .CanvasComponent {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }

      /* Seletores mais específicos para elementos recentes */
      .spPageChromeAppHeaderWrapper .ms-SearchBox,
      .spPageChromeAppHeaderWrapper [data-automation-id="searchBox"] {
        display: none !important;
      }

      /* Alternativa com visibilidade para elementos persistentes */
      .root-41 .ms-CommandBar .ms-Button[aria-label*="Pesquisar"],
      .root-41 .ms-CommandBar .ms-Button[aria-label*="Search"],
      .root-41 .ms-CommandBar .ms-Button[aria-label*="Configurações"],
      .root-41 .ms-CommandBar .ms-Button[aria-label*="Settings"] {
        visibility: hidden !important;
        width: 0 !important;
        overflow: hidden !important;
      }
    `;

    // Criar e adicionar elemento style
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.id = "hse-sharepoint-overrides";
    styleElement.innerHTML = customCSS;

    // Verificar se já existe para evitar duplicação
    const existingStyle = document.getElementById("hse-sharepoint-overrides");
    if (existingStyle) {
      existingStyle.remove();
    }

    // Adicionar ao head
    document.head.appendChild(styleElement); // Aplicar mudanças com delay para elementos carregados dinamicamente
    const applyStyles = (): void => {
      // Tentar múltiplos seletores para maior compatibilidade
      const searchSelectors = [
        '[data-automation-id="searchBox"]',
        ".ms-SearchBox-container",
        ".ms-SearchBox",
        'input[placeholder*="Pesquisar"]',
        'input[placeholder*="Search"]',
      ];

      const settingsSelectors = [
        '[data-automation-id="SettingsButton"]',
        'button[aria-label*="Configurações"]',
        'button[aria-label*="Settings"]',
        'i[data-icon-name="Settings"]',
      ];

      // Ocultar elementos de pesquisa
      searchSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          (element as HTMLElement).style.display = "none";
        });
      }); // Ocultar elementos de configurações
      settingsSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          (element as HTMLElement).style.display = "none";
        });
      }); // Ocultar elementos específicos do cabeçalho SharePoint
      const headerSelectors = [
        "#suiteNavWrapper",
        "#spCommandBar",
        "[class*='headerRow-']",
        "[class*='CommandBarWrapper']",
        "[class*='commandBarWrapper_']",
        "div[class*='headerRow']",
        "div[aria-label*='Cabeçalho do Site do SharePoint']",
        "div[aria-label*='Site do SharePoint']",
        "div[aria-label*='Barra de comandos']",
      ];
      headerSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          (element as HTMLElement).style.display = "none";
        });
      }); // Busca adicional por elementos com aria-label específico da imagem
      const headerByAriaLabel = document.querySelector(
        'div[aria-label="Cabeçalho do Site do SharePoint"]'
      );
      if (headerByAriaLabel) {
        (headerByAriaLabel as HTMLElement).style.display = "none";
      }

      // Busca por barra de comandos específica
      const commandBarByAriaLabel = document.querySelector(
        'div[aria-label="Barra de comandos"]'
      );
      if (commandBarByAriaLabel) {
        (commandBarByAriaLabel as HTMLElement).style.display = "none";
      }

      // Busca por ID específico do SharePoint Command Bar
      const spCommandBar = document.getElementById("spCommandBar");
      if (spCommandBar) {
        spCommandBar.style.display = "none";
      }

      // Busca por div com role="region" e style com background-position (como na imagem)
      const headersByRole = document.querySelectorAll(
        'div[role="region"][style*="background-position"]'
      );
      headersByRole.forEach((element) => {
        (element as HTMLElement).style.display = "none";
      });
    };

    // Aplicar imediatamente
    applyStyles();

    // Aplicar novamente após delays para capturar elementos carregados dinamicamente
    const timeouts = [500, 1000, 2000, 5000];
    const timeoutIds = timeouts.map((delay) => setTimeout(applyStyles, delay));

    // Observer para detectar mudanças no DOM
    const observer = new MutationObserver(() => {
      applyStyles();
    });

    // Observar mudanças no cabeçalho
    const headerSelectors = [
      ".ms-compositeHeader",
      "#SuiteNavWrapper",
      ".od-TopBar",
      ".spPageChromeAppHeaderWrapper",
    ];

    headerSelectors.forEach((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        observer.observe(element, {
          childList: true,
          subtree: true,
          attributes: true,
        });
      }
    });

    // Cleanup
    return () => {
      // Remover timeouts
      timeoutIds.forEach(clearTimeout);

      // Desconectar observer
      observer.disconnect();

      // Remover style element
      const styleToRemove = document.getElementById("hse-sharepoint-overrides");
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);
};

/**
 * Hook alternativo mais agressivo que tenta ocultar mais elementos
 */
export const useSharePointHeaderOverridesAggressive = (): void => {
  useEffect(() => {
    const aggressiveCSS = `
      /* Ocultar toda a suite de navegação superior */
      #SuiteNavWrapper,
      .ms-compositeHeader,
      .od-TopBar {
        display: none !important;
      }

      /* Ocultar barra de comandos da página */
      .ms-CommandBar {
        display: none !important;
      }

      /* Ocultar breadcrumb */
      .ms-Breadcrumb,
      [data-automation-id="breadcrumb"] {
        display: none !important;
      }

      /* Ajustar layout para ocupar espaço total */
      #workbenchPageContent {
        margin-top: 0 !important;
        padding-top: 0 !important;
        top: 0 !important;
      }

      /* Força o conteúdo a começar do topo */
      .CanvasZone {
        margin-top: 0 !important;
        padding-top: 20px !important;
      }
    `;

    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.id = "hse-sharepoint-aggressive-overrides";
    styleElement.innerHTML = aggressiveCSS;

    const existingStyle = document.getElementById(
      "hse-sharepoint-aggressive-overrides"
    );
    if (existingStyle) {
      existingStyle.remove();
    }

    document.head.appendChild(styleElement);

    return () => {
      const styleToRemove = document.getElementById(
        "hse-sharepoint-aggressive-overrides"
      );
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);
};
