import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
} from "@microsoft/sp-webpart-base";
import { HSEFormProvider } from "./components/context/HSEFormContext";
import { HseNewSupplier } from "./components/HseNewSupplier";

export interface IHseNewSupplierWebPartProps {
  title: string;
  sharePointListName: string;
  sharePointDocumentLibraryName: string;
  maxFileSize: number;
  enableDebugMode: boolean;
}

export default class HseNewSupplierWebPart extends BaseClientSideWebPart<IHseNewSupplierWebPartProps> {
  public render(): void {
    const element: React.ReactElement = React.createElement(HSEFormProvider, {
      context: this.context,
      sharePointConfig: {
        siteUrl: this.context.pageContext.web.absoluteUrl,
        listName: this.properties.sharePointListName || "hsenewregister",
        documentLibraryName:
          this.properties.sharePointDocumentLibraryName || "HSEAttachments",
      },
      maxFileSize: this.properties.maxFileSize || 50,
      debugMode: this.properties.enableDebugMode || false,
      children: React.createElement(HseNewSupplier, {
        context: this.context,
        title: this.properties.title || "Formulário HSE - Nova Contratada",
        sharePointListName:
          this.properties.sharePointListName || "hsenewregister",
        sharePointDocumentLibraryName:
          this.properties.sharePointDocumentLibraryName || "HSEAttachments",
        maxFileSize: this.properties.maxFileSize || 50,
        enableDebugMode: this.properties.enableDebugMode || false,
      }),
    });

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
              groupName: "Configurações SharePoint",
              groupFields: [
                PropertyPaneTextField("sharePointListName", {
                  label: "Nome da Lista SharePoint",
                  value: "hsenewregister",
                }),
                PropertyPaneTextField("sharePointDocumentLibraryName", {
                  label: "Nome da Document Library",
                  value: "HSEAttachments",
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
