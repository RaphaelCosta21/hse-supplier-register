import { IHSEFormContext } from "../components/context/HSEFormContext";

/**
 * Interface para propriedades retornadas pela função getFieldControlProps
 */
export interface IFieldControlProps {
  disabled: boolean;
  className: string;
  readOnly: boolean;
  isRestricted: boolean;
  isEditable: boolean;
  description?: string;
  styles?: Record<string, unknown>;
}

/**
 * Retorna as propriedades adequadas para qualquer campo do formulário
 * baseado no modo de correção e campos restritos
 *
 * @param fieldPath - Caminho do campo (ex: "dadosGerais.empresa", "conformidadeLegal.nr06.questao1")
 * @param context - Contexto do formulário HSE
 * @param customClassName - Classe CSS adicional personalizada
 * @returns Objeto com propriedades para aplicar ao campo
 */
export const getFieldControlProps = (
  fieldPath: string,
  context: IHSEFormContext,
  customClassName?: string
): IFieldControlProps => {
  const { state, actions } = context;

  // Verificar se o campo pode ser editado
  const isEditable = actions.canEditField(fieldPath);

  // Verificar se o campo está no modo de correção e é um campo restrito
  const isRestricted = state.correctionMode && isEditable;

  // Log para debug
  console.log(`[FIELD CONTROL] ${fieldPath}:`, {
    correctionMode: state.correctionMode,
    isEditable,
    isRestricted,
    restrictedFields: state.restrictedFields,
    formCreated: !!state.formData?.id,
  });

  // Montar className final
  let className = customClassName || "";
  if (isRestricted) {
    className += " restrictedField";
  }

  return {
    disabled: !isEditable,
    className: className.trim(),
    readOnly: !isEditable,
    isRestricted,
    isEditable,
    description: isRestricted
      ? "⚠️ Este campo precisa ser corrigido conforme as restrições identificadas."
      : undefined,
    styles: isRestricted
      ? {
          fieldGroup: {
            borderColor: "#ff8c00 !important",
            backgroundColor: "#fff4e6 !important",
            borderWidth: "2px !important",
          },
        }
      : undefined,
  };
};

/**
 * Função auxiliar específica para campos de anexo (attachment)
 */
export const getAttachmentFieldProps = (
  fieldPath: string,
  context: IHSEFormContext
): IFieldControlProps & {
  allowUpload: boolean;
  allowDelete: boolean;
  showRestrictionWarning: boolean;
} => {
  const baseProps = getFieldControlProps(fieldPath, context);

  return {
    ...baseProps,
    // Propriedades específicas para campos de anexo
    allowUpload: baseProps.isEditable,
    allowDelete: baseProps.isEditable,
    showRestrictionWarning: baseProps.isRestricted,
  };
};

/**
 * Função auxiliar específica para ChoiceGroup/RadioButton
 */
export const getChoiceGroupProps = (
  fieldPath: string,
  context: IHSEFormContext
): Omit<IFieldControlProps, "readOnly"> => {
  const baseProps = getFieldControlProps(fieldPath, context);

  return {
    ...baseProps,
    // ChoiceGroup usa 'disabled' ao invés de 'readOnly'
    disabled: !baseProps.isEditable,
  };
};

/**
 * Função auxiliar específica para blocos de Conformidade Legal (NRs)
 * Verifica se um bloco inteiro de NR pode ser editado
 */
export const getBlockControlProps = (
  blockPath: string,
  context: IHSEFormContext
): IFieldControlProps => {
  const { state, actions } = context;

  // Verificar se o bloco pode ser editado
  const isEditable = actions.canEditField(blockPath);

  // Verificar se o bloco está no modo de correção e é um bloco restrito
  const isRestricted = state.correctionMode && isEditable;

  // Log para debug
  console.log(`[BLOCK CONTROL] ${blockPath}:`, {
    correctionMode: state.correctionMode,
    isEditable,
    isRestricted,
    restrictedFields: state.restrictedFields,
    formCreated: !!state.formData?.id,
  });

  return {
    disabled: !isEditable,
    className: isRestricted ? "restrictedBlock" : "",
    readOnly: !isEditable,
    isRestricted,
    isEditable,
    description: isRestricted
      ? "⚠️ Esta seção precisa ser corrigida conforme as restrições identificadas."
      : undefined,
    styles: isRestricted
      ? {
          container: {
            borderColor: "#ff8c00 !important",
            backgroundColor: "#fff4e6 !important",
            borderWidth: "2px !important",
            borderRadius: "8px",
          },
        }
      : undefined,
  };
};
