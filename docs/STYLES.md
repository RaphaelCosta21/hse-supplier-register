# Sistema de Estilos - HSE Supplier Register

Este documento detalha o sistema de design, estilos SCSS, e padrões visuais utilizados no projeto HSE Supplier Register.

## Índice

- [Design System](#design-system)
- [Tokens de Design](#tokens-de-design)
- [Componentes de Estilo](#componentes-de-estilo)
- [Utilitários CSS](#utilitários-css)
- [Temas e Personalização](#temas-e-personalização)
- [Responsividade](#responsividade)
- [Animações e Transições](#animações-e-transições)
- [Padrões de Estilo](#padrões-de-estilo)

---

## Design System

### Filosofia de Design

O HSE Supplier Register utiliza um design system moderno baseado em:

- **Clareza**: Interface limpa e intuitiva
- **Consistência**: Padrões visuais uniformes
- **Acessibilidade**: Conformidade com WCAG 2.1
- **Responsividade**: Adaptação a diferentes dispositivos
- **Performance**: Estilos otimizados e modulares

### Estrutura de Arquivos

```
styles/
├── modern-design-system.scss     # Design tokens e utilitários
├── variables.scss                # Variáveis SCSS globais
├── themes.scss                   # Temas da aplicação
├── mixins.scss                   # Mixins reutilizáveis
├── microinteractions.scss        # Animações e transições
└── components/                   # Estilos específicos de componentes
    ├── HseNewSupplier.module.scss
    ├── FloatingSaveButton.module.scss
    └── [outros].module.scss
```

---

## Tokens de Design

### `modern-design-system.scss`

**Localização**: `/styles/modern-design-system.scss`
**Função**: Sistema de design tokens e utilitários CSS modernos.

#### Cores Primárias

```scss
:root {
  --primary-50: #e3f2fd;
  --primary-100: #bbdefb;
  --primary-200: #90caf9;
  --primary-300: #64b5f6;
  --primary-400: #42a5f5;
  --primary-500: #0078d4; // Cor principal
  --primary-600: #106ebe;
  --primary-700: #1565c0;
  --primary-800: #0d47a1;
  --primary-900: #0a3d91;
}
```

#### Cores de Estado

```scss
:root {
  // Sucesso
  --success-50: #e8f5e8;
  --success-500: #4caf50;
  --success-700: #2e7d32;

  // Erro
  --error-50: #ffebee;
  --error-500: #f44336;
  --error-700: #d32f2f;

  // Alerta
  --warning-50: #fff3e0;
  --warning-500: #ff9800;
  --warning-700: #e65100;

  // Informação
  --info-50: #e3f2fd;
  --info-500: #2196f3;
  --info-700: #1565c0;
}
```

#### Sistema de Cinzas

```scss
:root {
  --gray-50: #fafbfc; // Background muito claro
  --gray-100: #f8f9fa; // Background claro
  --gray-200: #e9ecef; // Bordas suaves
  --gray-300: #dee2e6; // Bordas padrão
  --gray-400: #ced4da; // Bordas ativas
  --gray-500: #adb5bd; // Texto secundário
  --gray-600: #6c757d; // Texto normal
  --gray-700: #495057; // Texto escuro
  --gray-800: #343a40; // Texto muito escuro
  --gray-900: #212529; // Texto principal
}
```

#### Tipografia

```scss
:root {
  --font-family-primary: "Segoe UI", -apple-system, BlinkMacSystemFont, "Roboto",
    "Helvetica Neue", Arial, sans-serif;
  --font-family-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono",
    Consolas, "Courier New", monospace;

  // Tamanhos
  --font-size-xs: 0.75rem; // 12px
  --font-size-sm: 0.875rem; // 14px
  --font-size-base: 1rem; // 16px
  --font-size-lg: 1.125rem; // 18px
  --font-size-xl: 1.25rem; // 20px
  --font-size-2xl: 1.5rem; // 24px
  --font-size-3xl: 1.875rem; // 30px
  --font-size-4xl: 2.25rem; // 36px

  // Pesos
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  // Altura de linha
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

#### Espaçamento

```scss
:root {
  --space-1: 0.25rem; // 4px
  --space-2: 0.5rem; // 8px
  --space-3: 0.75rem; // 12px
  --space-4: 1rem; // 16px
  --space-5: 1.25rem; // 20px
  --space-6: 1.5rem; // 24px
  --space-8: 2rem; // 32px
  --space-10: 2.5rem; // 40px
  --space-12: 3rem; // 48px
  --space-16: 4rem; // 64px
  --space-20: 5rem; // 80px
}
```

#### Border Radius

```scss
:root {
  --radius-sm: 0.25rem; // 4px
  --radius-base: 0.375rem; // 6px
  --radius-md: 0.5rem; // 8px
  --radius-lg: 0.75rem; // 12px
  --radius-xl: 1rem; // 16px
  --radius-2xl: 1.5rem; // 24px
  --radius-full: 9999px; // Circular
}
```

#### Sombras

```scss
:root {
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

#### Transições

```scss
:root {
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
  --transition-bounce: 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --transition-smooth: 400ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Utilitários CSS

### Layout Flexbox

```scss
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.flex-row {
  flex-direction: row;
}

.items-center {
  align-items: center;
}
.items-start {
  align-items: flex-start;
}
.items-end {
  align-items: flex-end;
}

.justify-center {
  justify-content: center;
}
.justify-between {
  justify-content: space-between;
}
.justify-start {
  justify-content: flex-start;
}
.justify-end {
  justify-content: flex-end;
}

.gap-1 {
  gap: var(--space-1);
}
.gap-2 {
  gap: var(--space-2);
}
.gap-3 {
  gap: var(--space-3);
}
.gap-4 {
  gap: var(--space-4);
}
.gap-6 {
  gap: var(--space-6);
}
.gap-8 {
  gap: var(--space-8);
}
```

### Sistema de Grid

```scss
.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.col-span-1 {
  grid-column: span 1 / span 1;
}
.col-span-2 {
  grid-column: span 2 / span 2;
}
.col-span-3 {
  grid-column: span 3 / span 3;
}
.col-span-4 {
  grid-column: span 4 / span 4;
}
```

### Utilitários de Texto

```scss
.text-xs {
  font-size: var(--font-size-xs);
}
.text-sm {
  font-size: var(--font-size-sm);
}
.text-base {
  font-size: var(--font-size-base);
}
.text-lg {
  font-size: var(--font-size-lg);
}
.text-xl {
  font-size: var(--font-size-xl);
}

.font-light {
  font-weight: var(--font-weight-light);
}
.font-normal {
  font-weight: var(--font-weight-normal);
}
.font-medium {
  font-weight: var(--font-weight-medium);
}
.font-semibold {
  font-weight: var(--font-weight-semibold);
}
.font-bold {
  font-weight: var(--font-weight-bold);
}

.text-center {
  text-align: center;
}
.text-left {
  text-align: left;
}
.text-right {
  text-align: right;
}
```

### Utilitários de Cor

```scss
.text-primary {
  color: var(--primary-500);
}
.text-success {
  color: var(--success-500);
}
.text-error {
  color: var(--error-500);
}
.text-warning {
  color: var(--warning-500);
}
.text-info {
  color: var(--info-500);
}

.bg-primary {
  background-color: var(--primary-500);
}
.bg-success {
  background-color: var(--success-50);
}
.bg-error {
  background-color: var(--error-50);
}
.bg-warning {
  background-color: var(--warning-50);
}
.bg-info {
  background-color: var(--info-50);
}
```

---

## Componentes de Estilo

### Componente Principal (`HseNewSupplier.module.scss`)

```scss
.hseNewSupplier {
  min-height: 100vh;
  background-color: $ms-color-neutralLighter;

  .header {
    background: linear-gradient(135deg, #0078d4 0%, #106ebe 50%, #004578 100%);
    color: white;
    padding: 24px 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,...") repeat;
      opacity: 0.4;
    }

    .headerContent {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
  }
}
```

### Botão Flutuante de Salvar

```scss
.floatingSaveButton {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: var(--z-fixed);

  .saveButton {
    background: linear-gradient(135deg, var(--success-500), var(--success-700));
    border: none;
    border-radius: var(--radius-full);
    color: white;
    padding: 16px 24px;
    box-shadow: var(--shadow-lg);
    transition: var(--transition-base);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
    }

    &:active {
      transform: translateY(0);
    }
  }
}
```

### Indicador de Progresso

```scss
.progressIndicator {
  .container {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    box-shadow: var(--shadow-base);
    margin-bottom: var(--space-8);
  }

  .stepIndicator {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--gray-200);
      z-index: 1;
    }

    .step {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);

      .circle {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        background: white;
        border: 3px solid var(--gray-300);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-base);

        &.active {
          border-color: var(--primary-500);
          background: var(--primary-500);
          color: white;
        }

        &.completed {
          border-color: var(--success-500);
          background: var(--success-500);
          color: white;
        }
      }
    }
  }
}
```

---

## Animações e Transições

### `microinteractions.scss`

**Localização**: `/styles/microinteractions.scss`
**Função**: Animações sutis e microinterações para melhorar UX.

#### Animações de Entrada

```scss
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

#### Classes de Animação

```scss
.animate-fade-in-up {
  animation: fadeInUp var(--transition-base);
}

.animate-slide-in-right {
  animation: slideInRight var(--transition-base);
}

.animate-scale-in {
  animation: scaleIn var(--transition-fast);
}

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

#### Hover Effects

```scss
.hover-lift {
  transition: var(--transition-base);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

.hover-glow {
  transition: var(--transition-base);

  &:hover {
    box-shadow: 0 0 20px rgba(0, 120, 212, 0.3);
  }
}

.hover-scale {
  transition: var(--transition-base);

  &:hover {
    transform: scale(1.05);
  }
}
```

---

## Responsividade

### Breakpoints

```scss
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### Mixins Responsivos

```scss
@mixin mobile {
  @media (max-width: #{$breakpoint-sm - 1px}) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: #{$breakpoint-sm}) and (max-width: #{$breakpoint-lg - 1px}) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: #{$breakpoint-lg}) {
    @content;
  }
}

@mixin large-screen {
  @media (min-width: #{$breakpoint-xl}) {
    @content;
  }
}
```

### Classes Responsivas

```scss
// Visibility
.hidden-mobile {
  @include mobile {
    display: none;
  }
}

.hidden-tablet {
  @include tablet {
    display: none;
  }
}

.hidden-desktop {
  @include desktop {
    display: none;
  }
}

// Layout
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-4);

  @include tablet {
    padding: 0 var(--space-6);
  }

  @include desktop {
    padding: 0 var(--space-8);
  }
}
```

---

## Temas e Personalização

### Tema Claro (Padrão)

```scss
:root {
  --background-primary: #ffffff;
  --background-secondary: #f8f9fa;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --border-color: #dee2e6;
}
```

### Tema Escuro

```scss
[data-theme="dark"] {
  --background-primary: #1a1a1a;
  --background-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --border-color: #404040;
}
```

### Alto Contraste

```scss
[data-theme="high-contrast"] {
  --background-primary: #000000;
  --background-secondary: #1a1a1a;
  --text-primary: #ffffff;
  --text-secondary: #ffffff;
  --border-color: #ffffff;
  --primary-500: #ffff00;
}
```

---

## Padrões de Componentes

### Card Pattern

```scss
.card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  padding: var(--space-6);
  transition: var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  .cardHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--gray-200);
  }

  .cardTitle {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--gray-900);
    margin: 0;
  }

  .cardContent {
    color: var(--gray-700);
    line-height: var(--line-height-relaxed);
  }
}
```

### Form Pattern

```scss
.formGroup {
  margin-bottom: var(--space-6);

  .formLabel {
    display: block;
    font-weight: var(--font-weight-medium);
    color: var(--gray-700);
    margin-bottom: var(--space-2);
    font-size: var(--font-size-sm);
  }

  .formInput {
    width: 100%;
    padding: var(--space-3) var(--space-4);
    border: 2px solid var(--gray-300);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    transition: var(--transition-base);

    &:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
    }

    &.error {
      border-color: var(--error-500);
    }

    &.success {
      border-color: var(--success-500);
    }
  }

  .formHelperText {
    font-size: var(--font-size-xs);
    color: var(--gray-500);
    margin-top: var(--space-1);
  }

  .formErrorText {
    font-size: var(--font-size-xs);
    color: var(--error-500);
    margin-top: var(--space-1);
  }
}
```

### Button Pattern

```scss
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-base);
  text-decoration: none;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  // Variantes
  &.primary {
    background: var(--primary-500);
    color: white;

    &:hover:not(:disabled) {
      background: var(--primary-600);
      transform: translateY(-1px);
    }
  }

  &.secondary {
    background: white;
    color: var(--primary-500);
    border-color: var(--primary-500);

    &:hover:not(:disabled) {
      background: var(--primary-50);
    }
  }

  &.success {
    background: var(--success-500);
    color: white;

    &:hover:not(:disabled) {
      background: var(--success-600);
    }
  }

  // Tamanhos
  &.small {
    padding: var(--space-2) var(--space-4);
    font-size: var(--font-size-sm);
  }

  &.large {
    padding: var(--space-4) var(--space-8);
    font-size: var(--font-size-lg);
  }
}
```

---

## Acessibilidade

### Focus States

```scss
.focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  @extend .focus-visible;
}
```

### High Contrast Support

```scss
@media (prefers-contrast: high) {
  :root {
    --shadow-base: 0 0 0 1px var(--gray-900);
    --shadow-md: 0 0 0 2px var(--gray-900);
  }

  .button {
    border-width: 2px;
    border-style: solid;
  }
}
```

### Reduced Motion Support

```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Performance e Otimização

### CSS Custom Properties

- Uso extensivo de CSS custom properties para flexibilidade
- Fácil implementação de temas
- Melhor performance em comparação com SCSS variables

### Modularidade

- Arquivos SCSS modulares por componente
- Import apenas dos estilos necessários
- Redução de CSS não utilizado

### Lazy Loading de Estilos

```scss
// Carregamento condicional de estilos pesados
@media print {
  @import "print-styles";
}

@media (min-width: 1024px) {
  @import "desktop-enhancements";
}
```

---

## Próximos Passos

1. **Implementar Design Tokens**: Expandir sistema de design tokens
2. **Adicionar Mais Temas**: Criar variações de tema
3. **Otimizar Performance**: Reduzir tamanho do CSS final
4. **Melhorar Acessibilidade**: Adicionar mais suporte a tecnologias assistivas
5. **Documentar Componentes**: Criar Storybook com todos os componentes

Para mais detalhes sobre implementações específicas, consulte:

- [Componentes](./COMPONENTS.md)
- [Contexto](./CONTEXT.md)
- [Setup](./SETUP.md)
