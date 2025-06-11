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
  allowMultiple = false, // Manter por compatibilidade, mas forçar para false
}) => {
  const { actions, state } = useHSEForm();
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sempre forçar allowMultiple para false - cada campo deve ter apenas um arquivo
  const actualAllowMultiple = false;

  // Buscar arquivos existentes para esta categoria específica
  const categoryFiles = React.useMemo(() => {
    return state.attachments[category] || [];
  }, [state.attachments, category]);

  const theme = getTheme();

  const dropAreaStyles = mergeStyles({
    border: `2px dashed ${theme.palette.neutralQuaternary}`,
    borderRadius: "4px",
    padding: "20px",
    textAlign: "center",
    minHeight: "120px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.neutralLighterAlt,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
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
      const extensions = accept
        .split(",")
        .map((ext) => ext.trim().toLowerCase());
      const fileName = file.name.toLowerCase();
      const fileExtension = "." + fileName.split(".").pop();

      if (!extensions.includes(fileExtension)) {
        return `Tipo de arquivo não permitido. Permitidos: ${accept}`;
      }
    }

    return null;
  };
  const handleFileSelect = async (files: FileList | null): Promise<void> => {
    if (!files || files.length === 0) return;

    console.log(`=== UPLOAD INICIADO PARA CATEGORIA: ${category} ===`);
    console.log(`Arquivos selecionados: ${files.length}`);
    console.log(`Arquivos existentes na categoria: ${categoryFiles.length}`);

    const newErrors: string[] = [];
    setErrors([]); // Limpar erros anteriores
    setUploadSuccess(false); // Limpar estado de sucesso anterior

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validar arquivo
      const validationError = validateFile(file);
      if (validationError) {
        newErrors.push(`${file.name}: ${validationError}`);
        continue;
      }

      try {
        setUploading(true);
        setUploadProgress(0);

        // Se já existe um arquivo nesta categoria, remover primeiro
        if (categoryFiles.length > 0) {
          console.log(`Removendo arquivo anterior da categoria ${category}...`);
          for (const existingFile of categoryFiles) {
            await actions.removeAttachment(category, existingFile.id);
          }
        }

        // Simular progresso de upload
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        // Fazer upload usando o contexto HSE - usar category como subcategory para criar subpasta
        const uploadedFile = await actions.uploadAttachment(
          file,
          category, // categoria principal
          category // subcategoria = nome do campo para criar subpasta
        );

        // Finalizar progresso
        clearInterval(progressInterval);
        setUploadProgress(100);

        // Mostrar sucesso
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000); // Limpar após 3 segundos

        // Notificar componente pai
        if (onFileUploaded) {
          onFileUploaded(uploadedFile);
        }

        console.log(
          `Arquivo ${file.name} anexado com sucesso na categoria ${category}`
        );
      } catch (error) {
        console.error("Erro no upload:", error);
        newErrors.push(
          `${file.name}: Erro no upload - ${
            error.message || "Erro desconhecido"
          }`
        );
      }
    }

    setUploading(false);
    setUploadProgress(0);
    setErrors(newErrors);

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleRemoveFile = async (file: IAttachmentMetadata): Promise<void> => {
    try {
      await actions.removeAttachment(category, file.id);

      if (onFileRemoved) {
        onFileRemoved(file);
      }
    } catch (error) {
      console.error("Erro ao remover arquivo:", error);
      setErrors([
        `Erro ao remover ${file.fileName}: ${
          error.message || "Erro desconhecido"
        }`,
      ]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files).catch(console.error); // Tratar promise adequadamente
  };

  const openFileDialog = (): void => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Label required={required}>{label}</Label>
      {helpText && (
        <Text
          variant="small"
          styles={{ root: { color: theme.palette.neutralSecondary } }}
        >
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
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {" "}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={actualAllowMultiple}
          onChange={(e): void => {
            handleFileSelect(e.target.files).catch(console.error);
          }}
          style={{ display: "none" }}
          disabled={disabled}
        />
        {uploading ? (
          <Stack
            tokens={{ childrenGap: 8 }}
            styles={{ root: { width: "100%" } }}
          >
            <Text>Enviando arquivo...</Text>
            <ProgressIndicator
              percentComplete={uploadProgress / 100}
              description={`${uploadProgress}% concluído`}
            />
          </Stack>
        ) : uploadSuccess ? (
          <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="medium" style={{ color: theme.palette.green }}>
              ✅ Arquivo anexado com sucesso!
            </Text>
          </Stack>
        ) : (
          <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="medium">
              {categoryFiles.length > 0
                ? "Clique para substituir o arquivo atual"
                : "Clique ou arraste arquivos aqui"}
            </Text>
            <Text variant="small">
              Formatos aceitos: {accept} | Tamanho máximo: {maxFileSize}MB
            </Text>
            <PrimaryButton
              text={
                categoryFiles.length > 0
                  ? "Substituir Arquivo"
                  : "Selecionar Arquivo"
              }
              disabled={disabled}
              onClick={(e): void => {
                e.stopPropagation();
                openFileDialog();
              }}
            />
          </Stack>
        )}
      </div>{" "}
      {/* Lista de arquivos existentes */}
      {categoryFiles.length > 0 && (
        <Stack tokens={{ childrenGap: 8 }}>
          <Text variant="medium">Arquivos anexados:</Text>
          {categoryFiles.map((file, index) => (
            <Stack
              key={index}
              horizontal
              verticalAlign="center"
              tokens={{ childrenGap: 8 }}
              styles={{
                root: {
                  padding: "8px",
                  border: `1px solid ${theme.palette.neutralQuaternaryAlt}`,
                  borderRadius: "4px",
                  backgroundColor: theme.palette.neutralLighterAlt,
                },
              }}
            >
              <Stack.Item grow>
                <Text variant="small">
                  <strong>{file.fileName}</strong>
                </Text>
                <Text
                  variant="tiny"
                  styles={{ root: { color: theme.palette.neutralSecondary } }}
                >
                  {formatFileSize(file.fileSize)} |{" "}
                  {new Date(file.uploadDate).toLocaleDateString()}
                </Text>
              </Stack.Item>{" "}
              {file.url && (
                <TooltipHost content="Visualizar arquivo">
                  <IconButton
                    iconProps={{ iconName: "View" }}
                    onClick={(): void => {
                      if (file.url) {
                        window.open(file.url, "_blank");
                      }
                    }}
                    disabled={disabled}
                  />
                </TooltipHost>
              )}{" "}
              <TooltipHost content="Remover arquivo">
                <IconButton
                  iconProps={{ iconName: "Delete" }}
                  onClick={(): void => {
                    handleRemoveFile(file).catch(console.error);
                  }}
                  disabled={disabled}
                  styles={{
                    root: { color: theme.palette.redDark },
                    rootHovered: { backgroundColor: theme.palette.red },
                  }}
                />
              </TooltipHost>
            </Stack>
          ))}
        </Stack>
      )}{" "}
      {/* Mensagens de erro */}
      {errors.length > 0 && (
        <Stack tokens={{ childrenGap: 4 }}>
          {errors.map((error, index) => (
            <MessageBar
              key={index}
              messageBarType={MessageBarType.error}
              dismissButtonAriaLabel="Fechar"
              onDismiss={(): void =>
                setErrors(errors.filter((_, i) => i !== index))
              }
            >
              {error}
            </MessageBar>
          ))}
        </Stack>
      )}
      {/* Mensagem de sucesso */}
      {uploadSuccess && (
        <MessageBar
          messageBarType={MessageBarType.success}
          dismissButtonAriaLabel="Fechar"
          onDismiss={(): void => setUploadSuccess(false)}
        >
          Arquivo anexado com sucesso!
          {categoryFiles.length > 0 && ` (${categoryFiles[0].fileName})`}
        </MessageBar>
      )}{" "}
      {/* Indicador de carregamento global */}
      {state.isSubmitting && (
        <MessageBar messageBarType={MessageBarType.info}>
          Processando formulário...
        </MessageBar>
      )}
    </Stack>
  );
};
