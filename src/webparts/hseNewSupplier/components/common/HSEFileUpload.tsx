import React, { useState, useRef, useCallback } from "react";
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
  useTheme,
} from "@fluentui/react";
import { useAzureUpload } from "../hooks/useAzureUpload";
import { IAttachmentMetadata, IAzureBlobConfig } from "../utils/azureConfig";

interface IHSEFileUploadProps {
  label: string;
  required?: boolean;
  category: string;
  subcategory: string;
  cnpj: string;
  azureConfig: IAzureBlobConfig;
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
  cnpj,
  azureConfig,
  accept = ".pdf,.xlsx,.xls,.docx,.doc,.jpg,.png",
  maxFileSize = 100,
  helpText,
  existingFiles = [],
  onFileUploaded,
  onFileRemoved,
  disabled = false,
  allowMultiple = false,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const {
    isUploading,
    progress,
    errors,
    hasErrors,
    uploadFile,
    deleteFile,
    clearErrors,
    validateFile,
    formatFileSize,
  } = useAzureUpload({
    azureConfig,
    cnpj,
    onUploadComplete: onFileUploaded,
    onUploadError: (error) => console.error("Upload error:", error),
  });

  // Estilos
  const dropZoneStyles = mergeStyles({
    border: `2px dashed ${
      dragOver ? theme.palette.themePrimary : theme.palette.neutralQuaternary
    }`,
    borderRadius: theme.effects.roundedCorner4,
    padding: "20px",
    textAlign: "center",
    backgroundColor: dragOver
      ? theme.palette.themeLight
      : theme.palette.neutralLighterAlt,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease-in-out",
    opacity: disabled ? 0.6 : 1,
    ":hover": !disabled
      ? {
          backgroundColor: theme.palette.neutralLighter,
          borderColor: theme.palette.themePrimary,
        }
      : {},
  });

  const fileItemStyles = mergeStyles({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    border: `1px solid ${theme.palette.neutralQuaternary}`,
    borderRadius: theme.effects.roundedCorner2,
    backgroundColor: theme.palette.white,
    marginBottom: "8px",
  });

  const fileInfoStyles = mergeStyles({
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    marginRight: "12px",
  });

  // Handlers
  const handleFileSelect = useCallback(
    async (files: FileList) => {
      if (!files.length || disabled) return;

      const fileArray = Array.from(files);

      for (const file of fileArray) {
        // Validar arquivo
        const validation = validateFile(file);
        if (!validation.isValid) {
          // Mostrar erro de validação
          continue;
        }

        // Fazer upload
        try {
          await uploadFile(file, category, subcategory);
        } catch (error) {
          console.error("Erro no upload:", error);
        }

        // Se não permite múltiplos arquivos, parar após o primeiro
        if (!allowMultiple) break;
      }
    },
    [uploadFile, category, subcategory, validateFile, disabled, allowMultiple]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      await handleFileSelect(files);
    },
    [handleFileSelect, disabled]
  );

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        await handleFileSelect(e.target.files);
        // Limpar input para permitir selecionar o mesmo arquivo novamente
        e.target.value = "";
      }
    },
    [handleFileSelect]
  );

  const handleRemoveFile = useCallback(
    async (metadata: IAttachmentMetadata) => {
      try {
        const success = await deleteFile(metadata);
        if (success && onFileRemoved) {
          onFileRemoved(metadata);
        }
      } catch (error) {
        console.error("Erro ao remover arquivo:", error);
      }
    },
    [deleteFile, onFileRemoved]
  );

  const getFileIcon = useCallback((fileName: string): string => {
    const extension = fileName
      .toLowerCase()
      .substring(fileName.lastIndexOf("."));
    switch (extension) {
      case ".pdf":
        return "PDF";
      case ".xlsx":
      case ".xls":
        return "ExcelDocument";
      case ".docx":
      case ".doc":
        return "WordDocument";
      case ".jpg":
      case ".jpeg":
      case ".png":
        return "FileImage";
      default:
        return "Document";
    }
  }, []);

  const clearAllErrors = useCallback(() => {
    clearErrors();
  }, [clearErrors]);

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      {/* Label */}
      <Label required={required}>
        {label}
        {helpText && (
          <TooltipHost content={helpText}>
            <IconButton
              iconProps={{ iconName: "Info" }}
              styles={{ root: { marginLeft: 4 } }}
            />
          </TooltipHost>
        )}
      </Label>

      {/* Zona de Drop */}
      <div
        className={dropZoneStyles}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={allowMultiple}
          onChange={handleInputChange}
          style={{ display: "none" }}
          disabled={disabled}
        />

        <Stack tokens={{ childrenGap: 8 }} horizontalAlign="center">
          <IconButton
            iconProps={{
              iconName: "CloudUpload",
              styles: { root: { fontSize: 32 } },
            }}
            disabled={disabled}
          />

          <Text variant="medium">
            {dragOver
              ? "Solte os arquivos aqui"
              : "Arraste arquivos aqui ou clique para selecionar"}
          </Text>

          <Text
            variant="small"
            styles={{ root: { color: theme.palette.neutralSecondary } }}
          >
            Formatos aceitos: {accept.replace(/\./g, "").toUpperCase()}
            {maxFileSize && ` • Tamanho máximo: ${maxFileSize}MB`}
          </Text>
        </Stack>
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <ProgressIndicator
          label="Fazendo upload..."
          percentComplete={progress / 100}
          description={`${progress}% concluído`}
        />
      )}

      {/* Erros */}
      {hasErrors && (
        <MessageBar
          messageBarType={MessageBarType.error}
          onDismiss={clearAllErrors}
          dismissButtonAriaLabel="Fechar"
        >
          <Stack tokens={{ childrenGap: 4 }}>
            {errors.map((error, index) => (
              <Text key={index} variant="small">
                {error}
              </Text>
            ))}
          </Stack>
        </MessageBar>
      )}

      {/* Lista de Arquivos Existentes */}
      {existingFiles.length > 0 && (
        <Stack tokens={{ childrenGap: 8 }}>
          <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
            Arquivos anexados:
          </Text>

          {existingFiles.map((file, index) => (
            <div key={index} className={fileItemStyles}>
              <div className={fileInfoStyles}>
                <Stack
                  horizontal
                  tokens={{ childrenGap: 8 }}
                  verticalAlign="center"
                >
                  <IconButton
                    iconProps={{ iconName: getFileIcon(file.nomeOriginal) }}
                    styles={{ root: { color: theme.palette.themePrimary } }}
                  />

                  <Stack tokens={{ childrenGap: 2 }}>
                    <Text
                      variant="medium"
                      styles={{ root: { fontWeight: 600 } }}
                    >
                      {file.nomeOriginal}
                    </Text>
                    <Text
                      variant="small"
                      styles={{
                        root: { color: theme.palette.neutralSecondary },
                      }}
                    >
                      {formatFileSize(file.tamanho)} •{" "}
                      {new Date(file.dataUpload).toLocaleDateString("pt-BR")}
                    </Text>
                  </Stack>
                </Stack>
              </div>

              <Stack horizontal tokens={{ childrenGap: 4 }}>
                <TooltipHost content="Fazer download">
                  <IconButton
                    iconProps={{ iconName: "Download" }}
                    onClick={() => window.open(file.url, "_blank")}
                  />
                </TooltipHost>

                <TooltipHost content="Remover arquivo">
                  <IconButton
                    iconProps={{ iconName: "Delete" }}
                    onClick={() => handleRemoveFile(file)}
                    disabled={disabled}
                    styles={{ root: { color: theme.palette.red } }}
                  />
                </TooltipHost>
              </Stack>
            </div>
          ))}
        </Stack>
      )}

      {/* Texto de ajuda */}
      {helpText && !hasErrors && (
        <Text
          variant="small"
          styles={{ root: { color: theme.palette.neutralSecondary } }}
        >
          {helpText}
        </Text>
      )}
    </Stack>
  );
};
