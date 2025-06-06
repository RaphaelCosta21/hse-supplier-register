import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
} from "@microsoft/sp-webpart-base";
import { HSEFormProvider } from "./context/HSEFormContext";
import { HseNewSupplier } from "./components/HseNewSupplier";
import { IHseNewSupplierProps } from "./components/IHseNewSupplierProps";

export interface IHseNewSupplierWebPartProps {
  title: string;
  azureStorageAccount: string;
  azureContainerName: string;
  sharePointListName: string;
  maxFileSize: number;
  enableDebugMode: boolean;
}

export default class HseNewSupplierWebPart extends BaseClientSideWebPart<IHseNewSupplierWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IHseNewSupplierProps> =
      React.createElement(
        HSEFormProvider,
        {
          context: this.context,
          azureConfig: {
            accountName:
              this.properties.azureStorageAccount || "hsestorageaccount",
            containerName:
              this.properties.azureContainerName || "hse-attachments",
            sasToken: "", // Será gerado dinamicamente
          },
          sharePointConfig: {
            siteUrl: this.context.pageContext.web.absoluteUrl,
            listName: this.properties.sharePointListName || "hsenewregister",
          },
          maxFileSize: this.properties.maxFileSize || 50,
          debugMode: this.properties.enableDebugMode || false,
        },
        React.createElement(HseNewSupplier, {
          context: this.context,
          title: this.properties.title || "Formulário HSE - Nova Contratada",
          azureStorageAccount: this.properties.azureStorageAccount,
          azureContainerName: this.properties.azureContainerName,
          sharePointListName: this.properties.sharePointListName,
          maxFileSize: this.properties.maxFileSize,
          enableDebugMode: this.properties.enableDebugMode,
        })
      );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return super.onInit();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Configurações do Formulário HSE",
          },
          groups: [
            {
              groupName: "Configurações Gerais",
              groupFields: [
                PropertyPaneTextField("title", {
                  label: "Título do Web Part",
                  value: "Formulário HSE - Nova Contratada",
                }),
                PropertyPaneTextField("sharePointListName", {
                  label: "Nome da Lista SharePoint",
                  value: "hsenewregister",
                }),
              ],
            },
            {
              groupName: "Configurações Azure Storage",
              groupFields: [
                PropertyPaneTextField("azureStorageAccount", {
                  label: "Nome da Conta Azure Storage",
                  value: "hsestorageaccount",
                }),
                PropertyPaneTextField("azureContainerName", {
                  label: "Nome do Container",
                  value: "hse-attachments",
                }),
                PropertyPaneTextField("maxFileSize", {
                  label: "Tamanho Máximo de Arquivo (MB)",
                  value: "50",
                }),
              ],
            },
            {
              groupName: "Configurações de Desenvolvimento",
              groupFields: [
                PropertyPaneToggle("enableDebugMode", {
                  label: "Ativar Modo Debug",
                  checked: false,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
