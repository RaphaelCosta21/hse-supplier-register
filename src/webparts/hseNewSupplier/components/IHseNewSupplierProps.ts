import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IHseNewSupplierProps {
  context: WebPartContext;
  title: string;
  sharePointListName: string;
  sharePointDocumentLibraryName: string;
  maxFileSize: number;
  enableDebugMode: boolean;
}
