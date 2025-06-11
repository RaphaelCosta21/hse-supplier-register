import * as React from "react";
import { useState, useRef, useCallback } from "react";
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
import { IAttachmentMetadata } from "../../types/IAttachmentMetadata";
import { SharePointFileService } from "../../services/SharePointFileService";

interface ISharePointFileUploadProps {
  label: string;
  required?: boolean;
  category: string;
  subcategory?: string;
  cnpj: string;
  nomeEmpresa: string;
  sharePointFileService: SharePointFileService;
  accept?: string;
  maxFileSize?: number;
  helpText?: string;
  existingFiles?: IAttachmentMetadata[];
  onFileUploaded?: (metadata: IAttachmentMetadata) => void;
  onFileRemoved?: (metadata: IAttachmentMetadata) => void;
  disabled?: boolean;
  allowMultiple?: boolean;
  formularioId?: number;
}

export const SharePointFileUpload: React.FC<ISharePointFileUploadProps> = ({
  label,
  required = false,
  category,
  subcategory = "",
  cnpj,
  nomeEmpresa,
  sharePointFileService,
  accept = ".pdf,.xlsx,.xls,.docx,.doc,.jpg,.png",
  maxFileSize = 100,
  helpText,
  existingFiles = [],
  onFileUploaded,
  onFileRemoved,
  disabled = false,
  allowMultiple = false,
  formularioId,
}: ISharePointFileUploadProps) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const dropZoneStyles = mergeStyles({
    border: `2px dashed ${theme.palette.neutralQuaternary}`,
    borderRadius: "4px",
    padding: "20px",
    textAlign: "center",
    minHeight: "120px",
    backgroundColor: theme.palette.neutralLighterAlt,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    ":hover": !disabled
      ? {
          borderColor: theme.palette.themePrimary,
          backgroundColor: theme.palette.neutralLighter,
        }
      : {},
  });

  const fileItemStyles = mergeStyles({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    border: `1px solid ${theme.palette.neutralQuaternaryAlt}`,
    borderRadius: "4px",
    backgroundColor: theme.palette.neutralLighterAlt,
    marginBottom: "8px",
  });

  const fileInfoStyles = mergeStyles({
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    marginRight: "12px",
  });

  const validateFile = (file: File): string[] => {
    const errors: string[] = [];

    // Validar tamanho
    if (maxFileSize && file.size > maxFileSize * 1024 * 1024) {
      errors.push(`${file.name}: Arquivo muito grande (máx. ${maxFileSize}MB)`);
    }

    // Validar tipo
    if (accept) {
      const allowedExtensions = accept
        .split(",")
        .map((ext: string) => ext.trim().toLowerCase());
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        errors.push(`${file.name}: Tipo de arquivo não permitido`);
      }
    }

    return errors;
  };

  // Handlers
  const handleFileSelect = useCallback(
    async (files: FileList) => {
      if (!files.length || disabled) return;

      const fileArray = Array.from(files);
      setErrors([]);

      for (const file of fileArray) {
        // Validações
        const validationErrors = validateFile(file);
        if (validationErrors.length > 0) {
          setErrors((prev: string[]) => [...prev, ...validationErrors]);
          continue;
        } // Upload do arquivo
        try {
          setIsUploading(true);
          setProgress(0);

          // Simular progresso visual
          const progressInterval = setInterval(() => {
            setProgress((prev: number) => Math.min(prev + 20, 90));
          }, 100);

          // Criar metadata local (não faz upload para SharePoint ainda)
          const metadata = sharePointFileService.createLocalFileMetadata(
            file,
            category,
            subcategory
          );

          clearInterval(progressInterval);
          setProgress(100);

          onFileUploaded?.(metadata);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Erro desconhecido";
          setErrors((prev: string[]) => [
            ...prev,
            `Erro ao fazer upload de ${file.name}: ${errorMessage}`,
          ]);
        } finally {
          setIsUploading(false);
          setProgress(0);
        }

        // Se não permite múltiplos arquivos, parar após o primeiro
        if (!allowMultiple) break;
      }
    },
    [
      disabled,
      cnpj,
      nomeEmpresa,
      category,
      subcategory,
      formularioId,
      sharePointFileService,
      onFileUploaded,
      allowMultiple,
      validateFile,
    ]
  );
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files).catch(console.error);
      }
    },
    [handleFileSelect, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleButtonClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        handleFileSelect(files).catch(console.error);
      }
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      e.target.value = "";
    },
    [handleFileSelect]
  );

  const handleRemoveFile = useCallback(
    async (file: IAttachmentMetadata) => {
      try {
        const success = await sharePointFileService.deleteFile(
          file.sharepointItemId || 0
        );
        if (success) {
          onFileRemoved?.(file);
        } else {
          setErrors((prev: string[]) => [
            ...prev,
            `Erro ao remover ${file.originalName || file.fileName}`,
          ]);
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        setErrors((prev: string[]) => [
          ...prev,
          `Erro ao remover arquivo: ${errorMessage}`,
        ]);
      }
    },
    [sharePointFileService, onFileRemoved]
  );

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "PDF";
      case "doc":
      case "docx":
        return "WordDocument";
      case "xls":
      case "xlsx":
        return "ExcelDocument";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "FileImage";
      default:
        return "Page";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const hasErrors = errors.length > 0;

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      {/* Label */}
      <Label required={required}>{label}</Label>

      {/* Help Text */}
      {helpText && (
        <Text
          variant="small"
          styles={{ root: { color: theme.palette.neutralSecondary } }}
        >
          {helpText}
        </Text>
      )}

      {/* Drop Zone */}
      <div
        className={dropZoneStyles}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleButtonClick}
        style={{
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={allowMultiple}
          onChange={handleFileInputChange}
          style={{ display: "none" }}
          disabled={disabled}
        />

        {isUploading ? (
          <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="medium">Enviando arquivo...</Text>
            <ProgressIndicator percentComplete={progress / 100} />
          </Stack>
        ) : (
          <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="medium">
              Clique para selecionar ou arraste arquivos aqui
            </Text>
            <Text
              variant="small"
              styles={{ root: { color: theme.palette.neutralSecondary } }}
            >
              Formatos aceitos: {accept} | Tamanho máximo: {maxFileSize}MB
            </Text>
          </Stack>
        )}
      </div>

      {/* Lista de arquivos existentes */}
      {existingFiles && existingFiles.length > 0 && (
        <Stack tokens={{ childrenGap: 8 }}>
          <Text variant="medium" styles={{ root: { fontWeight: 600 } }}>
            Arquivos anexados:
          </Text>
          {existingFiles.map((file: IAttachmentMetadata, index: number) => (
            <div key={index} className={fileItemStyles}>
              <div className={fileInfoStyles}>
                <Stack
                  horizontal
                  tokens={{ childrenGap: 8 }}
                  verticalAlign="center"
                >
                  <IconButton
                    iconProps={{
                      iconName: getFileIcon(file.originalName || file.fileName),
                    }}
                    styles={{ root: { color: theme.palette.themePrimary } }}
                  />

                  <Stack tokens={{ childrenGap: 2 }}>
                    <Text
                      variant="medium"
                      styles={{ root: { fontWeight: 600 } }}
                    >
                      {file.originalName || file.fileName}
                    </Text>
                    <Text
                      variant="small"
                      styles={{
                        root: { color: theme.palette.neutralSecondary },
                      }}
                    >
                      {formatFileSize(file.fileSize || file.tamanho || 0)} •{" "}
                      {new Date(
                        file.uploadDate || file.dataUpload || ""
                      ).toLocaleDateString()}
                    </Text>
                  </Stack>
                </Stack>
              </div>

              <Stack horizontal tokens={{ childrenGap: 8 }}>
                <TooltipHost content="Baixar arquivo">
                  <IconButton
                    iconProps={{ iconName: "Download" }}
                    onClick={() => window.open(file.url, "_blank")}
                    styles={{ root: { color: theme.palette.themePrimary } }}
                  />
                </TooltipHost>

                {!disabled && (
                  <TooltipHost content="Remover arquivo">
                    <IconButton
                      iconProps={{ iconName: "Delete" }}
                      onClick={() => handleRemoveFile(file)}
                      styles={{ root: { color: theme.palette.red } }}
                    />
                  </TooltipHost>
                )}
              </Stack>
            </div>
          ))}
        </Stack>
      )}

      {/* Mensagens de erro */}
      {hasErrors && (
        <Stack tokens={{ childrenGap: 4 }}>
          {errors.map((error: string, index: number) => (
            <MessageBar
              key={index}
              messageBarType={MessageBarType.error}
              dismissButtonAriaLabel="Fechar"
              onDismiss={() => setErrors(errors.filter((_, i) => i !== index))}
            >
              {error}
            </MessageBar>
          ))}
          <MessageBar
            messageBarType={MessageBarType.info}
            actions={
              <div>
                <Text
                  styles={{
                    root: {
                      color: theme.palette.themePrimary,
                      cursor: "pointer",
                      textDecoration: "underline",
                    },
                  }}
                  onClick={clearAllErrors}
                >
                  Limpar todos os erros
                </Text>
              </div>
            }
          >
            Alguns arquivos não puderam ser enviados.
          </MessageBar>
        </Stack>
      )}
    </Stack>
  );
};
