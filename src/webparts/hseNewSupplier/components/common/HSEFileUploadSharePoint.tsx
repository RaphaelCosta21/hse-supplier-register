import * as React from "react";
import {
  Stack,
  Label,
  Text,
  MessageBar,
  MessageBarType,
  ProgressIndicator,
  IconButton,
  TooltipHost,
  mergeStyles,
  getTheme,
  PrimaryButton,
} from "@fluentui/react";
import { useHSEForm } from "../context/HSEFormContext";
import { IAttachmentMetadata } from "../../types/IAttachmentMetadata";

interface IHSEFileUploadProps {
  label: string;
  required?: boolean;
  category: string;
  subcategory?: string;
  accept?: string;
  maxFileSize?: number;
  helpText?: string;
  existingFiles?: IAttachmentMetadata[];
  onFileUploaded?: (metadata: IAttachmentMetadata) => void;
  onFileRemoved?: (metadata: IAttachmentMetadata) => void;
  disabled?: boolean;
  allowMultiple?: boolean;
}

export const HSEFileUpload: React.FC<IHSEFileUploadProps> = ({
  label,
  required = false,
  category,
  subcategory,
  accept = ".pdf,.xlsx,.xls,.docx,.doc,.jpg,.png",
  maxFileSize = 100,
  helpText,
  existingFiles = [],
  onFileUploaded,
  onFileRemoved,
  disabled = false,
  allowMultiple = false,
}) => {
  const { actions, state } = useHSEForm();
  const [uploading, setUploading] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const theme = getTheme();

  const dropAreaStyles = mergeStyles({
    border: `2px dashed ${theme.palette.neutralQuaternary}`,
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.neutralLighterAlt,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      borderColor: theme.palette.themePrimary,
      backgroundColor: theme.palette.neutralLighter,
    },
  });

  const validateFile = (file: File): string | null => {
    // Validar tamanho
    const maxSizeBytes = maxFileSize * 1024 * 1024; // Converter MB para bytes
    if (file.size > maxSizeBytes) {
      return `Arquivo muito grande. Tamanho máximo: ${maxFileSize}MB`;
    }

    // Validar tipo de arquivo
    if (accept) {
      const extensions = accept.split(',').map(ext => ext.trim().toLowerCase());
      const fileName = file.name.toLowerCase();
      const fileExtension = '.' + fileName.split('.').pop();
      
      if (!extensions.includes(fileExtension)) {
        return `Tipo de arquivo não permitido. Permitidos: ${accept}`;
      }
    }

    return null;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setErrors([]);
    const newErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validar arquivo
      const validationError = validateFile(file);
      if (validationError) {
        newErrors.push(`${file.name}: ${validationError}`);
        continue;
      }

      // Se não permite múltiplos arquivos e já tem arquivo, parar
      if (!allowMultiple && existingFiles.length > 0) {
        newErrors.push("Apenas um arquivo é permitido. Remova o arquivo existente primeiro.");
        break;
      }

      try {
        setUploading(true);
        
        // Fazer upload usando o contexto HSE
        const uploadedFile = await actions.uploadAttachment(file, category, subcategory);
        
        // Notificar componente pai
        if (onFileUploaded) {
          onFileUploaded(uploadedFile);
        }

      } catch (error) {
        console.error("Erro no upload:", error);
        newErrors.push(`${file.name}: Erro no upload - ${error.message || 'Erro desconhecido'}`);
      }
    }

    setUploading(false);
    setErrors(newErrors);

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = async (file: IAttachmentMetadata) => {
    try {
      await actions.removeAttachment(category, file.id);
      
      if (onFileRemoved) {
        onFileRemoved(file);
      }
    } catch (error) {
      console.error("Erro ao remover arquivo:", error);
      setErrors([`Erro ao remover ${file.originalName}: ${error.message || 'Erro desconhecido'}`]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const openFileDialog = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Label required={required}>{label}</Label>
      
      {helpText && (
        <Text variant="small" styles={{ root: { color: theme.palette.neutralSecondary } }}>
          {helpText}
        </Text>
      )}

      {/* Área de Drop/Upload */}
      <div
        className={dropAreaStyles}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
        style={{ 
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={allowMultiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
          disabled={disabled}
        />
        
        {uploading ? (
          <Stack tokens={{ childrenGap: 8 }} styles={{ root: { width: '100%' } }}>
            <Text>Enviando arquivo...</Text>
            <ProgressIndicator />
          </Stack>
        ) : (
          <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="medium">Clique ou arraste arquivos aqui</Text>
            <Text variant="small">
              Formatos aceitos: {accept} | Tamanho máximo: {maxFileSize}MB
            </Text>
            <PrimaryButton 
              text="Selecionar Arquivo"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
            />
          </Stack>
        )}
      </div>

      {/* Lista de arquivos existentes */}
      {existingFiles.length > 0 && (
        <Stack tokens={{ childrenGap: 8 }}>
          <Text variant="medium">Arquivos anexados:</Text>
          {existingFiles.map((file, index) => (
            <Stack 
              key={index}
              horizontal
              verticalAlign="center"
              tokens={{ childrenGap: 8 }}
              styles={{
                root: {
                  padding: '8px',
                  border: `1px solid ${theme.palette.neutralQuaternaryAlt}`,
                  borderRadius: '4px',
                  backgroundColor: theme.palette.neutralLighterAlt,
                }
              }}
            >
              <Stack.Item grow>
                <Text variant="small">
                  <strong>{file.originalName}</strong>
                </Text>
                <Text variant="tiny" styles={{ root: { color: theme.palette.neutralSecondary } }}>
                  {formatFileSize(file.fileSize)} | {new Date(file.uploadDate).toLocaleDateString()}
                </Text>
              </Stack.Item>
              
              {file.url && (
                <TooltipHost content="Visualizar arquivo">
                  <IconButton
                    iconProps={{ iconName: 'View' }}
                    onClick={() => window.open(file.url, '_blank')}
                    disabled={disabled}
                  />
                </TooltipHost>
              )}
              
              <TooltipHost content="Remover arquivo">
                <IconButton
                  iconProps={{ iconName: 'Delete' }}
                  onClick={() => handleRemoveFile(file)}
                  disabled={disabled}
                  styles={{
                    root: { color: theme.palette.redDark },
                    rootHovered: { backgroundColor: theme.palette.red }
                  }}
                />
              </TooltipHost>
            </Stack>
          ))}
        </Stack>
      )}

      {/* Mensagens de erro */}
      {errors.length > 0 && (
        <Stack tokens={{ childrenGap: 4 }}>
          {errors.map((error, index) => (
            <MessageBar 
              key={index}
              messageBarType={MessageBarType.error}
              dismissButtonAriaLabel="Fechar"
              onDismiss={() => setErrors(errors.filter((_, i) => i !== index))}
            >
              {error}
            </MessageBar>
          ))}
        </Stack>
      )}      {/* Indicador de carregamento global */}
      {state.isSubmitting && (
        <MessageBar messageBarType={MessageBarType.info}>
          Processando formulário...
        </MessageBar>
      )}
    </Stack>
  );
};
