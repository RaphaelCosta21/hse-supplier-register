# SharePoint Header Customization

Este módulo permite ocultar elementos do cabeçalho do SharePoint diretamente via código.

## ⚠️ IMPORTANTE

- Estas customizações podem quebrar com atualizações do SharePoint
- Teste sempre após atualizações da plataforma
- Funciona como F12 + CSS, mas aplicado automaticamente

## 🚀 Como Usar

### Opção 1: Automático (Recomendado)

O hook já está integrado no `HseNewSupplier.tsx` e oculta automaticamente:

- ✅ Barra de pesquisa
- ✅ Botão de configurações (engrenagem)
- ✅ Botão de ajuda

### Opção 2: Controle Manual

```tsx
import { useSimpleSharePointCustomizer } from "../components/common/SharePointCustomizer";

// No seu componente
useSimpleSharePointCustomizer({
  hideSearch: true, // Ocultar pesquisa
  hideSettings: true, // Ocultar configurações
  hideHelp: true, // Ocultar ajuda
  hideUserMenu: false, // Manter menu do usuário
  aggressive: false, // Não usar modo agressivo
});
```

### Opção 3: Modo Debug

Adicione `?debug=true` na URL para ver o painel de controle:

- Permite ativar/desativar customizações
- Modo agressivo que oculta todo o cabeçalho
- Interface visual para testes

### Opção 4: Modo Agressivo

```tsx
import { useSharePointHeaderOverridesAggressive } from "../hooks/useSharePointOverrides";

// Oculta TODO o cabeçalho superior
useSharePointHeaderOverridesAggressive();
```

## 🎯 O que é Ocultado

### Modo Normal

- Barra de pesquisa
- Botão de configurações
- Botão de ajuda
- Reduz altura do cabeçalho

### Modo Agressivo

- Todo o cabeçalho superior
- Barra de comandos
- Breadcrumb
- Força conteúdo ao topo

## 🔧 Customização

Para ocultar elementos específicos, edite:

- `hooks/useSharePointOverrides.ts` - Lógica principal
- `styles/sharepoint-overrides.scss` - CSS adicional

## 🐛 Troubleshooting

**Não funcionou?**

1. Abra F12 e veja se o CSS foi aplicado
2. Verifique se há erros no console
3. Tente o modo agressivo
4. Use `?debug=true` para testar

**Elementos voltaram?**

- SharePoint pode ter atualizado
- Verifique se os seletores CSS ainda são válidos
- Atualize os seletores no hook

## 📝 Seletores CSS Utilizados

```css
/* Pesquisa */
[data-automation-id="searchBox"]
.ms-SearchBox-container
.ms-SearchBox

/* Configurações */
[data-automation-id="SettingsButton"]
button[aria-label*="Configurações"]
button[aria-label*="Settings"]

/* Ajuda */
[data-automation-id="HelpButton"]
button[aria-label*="Ajuda"]
button[aria-label*="Help"]
```

## 🎨 Resultado Final

Antes:

- Cabeçalho completo com pesquisa, configurações, ajuda
- Ocupa mais espaço vertical

Depois:

- Interface mais limpa
- Foco no conteúdo da web part
- Mais espaço para o formulário HSE
