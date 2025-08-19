import * as React from "react";
import { Text, Icon, Link } from "@fluentui/react";
import styles from "./Footer.module.scss";

export interface IFooterProps {
  className?: string;
}

export const Footer: React.FC<IFooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${styles.footer} ${className || ""}`}>
      <div className={styles.footerContent}>
        {/* Seção principal com logo e informações */}
        <div className={styles.mainSection}>
          <div className={styles.logoSection}>
            <img
              src={require("../../../assets/logo-blue.png")}
              alt="Oceaneering Logo"
              className={styles.footerLogo}
            />
            <div className={styles.companyInfo}>
              <Text variant="medium" className={styles.companyName}>
                Oceaneering International, Inc.
              </Text>
              <Text variant="small" className={styles.systemName}>
                Sistema HSE - Auto-avaliação para Contratadas
              </Text>
            </div>
          </div>

          <div className={styles.linksSection}>
            <div className={styles.linkColumn}>
              <Text variant="mediumPlus" className={styles.columnTitle}>
                Suporte HSE
              </Text>
              <Link
                href="mailto:hse.suppliers@oceaneering.com"
                className={styles.footerLink}
              >
                <Icon iconName="Mail" className={styles.linkIcon} />
                hse.suppliers@oceaneering.com
              </Link>
              <Text variant="small" className={styles.supportInfo}>
                Horário: Segunda a Sexta, 8h às 17h
              </Text>
            </div>

            <div className={styles.linkColumn}>
              <Text variant="mediumPlus" className={styles.columnTitle}>
                Recursos
              </Text>
              <Link href="#" className={styles.footerLink}>
                Política de Privacidade
              </Link>
              <Link href="#" className={styles.footerLink}>
                Termos de Uso
              </Link>
              <Link href="#" className={styles.footerLink}>
                Código de Conduta HSE
              </Link>
              <Link href="#" className={styles.footerLink}>
                Portal de Fornecedores
              </Link>
            </div>

            <div className={styles.linkColumn}>
              <Text variant="mediumPlus" className={styles.columnTitle}>
                Certificações
              </Text>
              <div className={styles.certificationBadges}>
                <div className={styles.badge}>
                  <Text variant="small">ISO 14001</Text>
                </div>
                <div className={styles.badge}>
                  <Text variant="small">ISO 45001</Text>
                </div>
                <div className={styles.badge}>
                  <Text variant="small">ISO 9001</Text>
                </div>
              </div>
              <Text variant="small" className={styles.systemVersion}>
                Versão 1.0.2 | Status: Online
              </Text>
            </div>
          </div>
        </div>

        {/* Linha de separação */}
        <div className={styles.separator} />

        {/* Seção inferior com copyright e créditos */}
        <div className={styles.bottomSection}>
          <div className={styles.copyrightSection}>
            <Text variant="small" className={styles.copyright}>
              © {currentYear} Oceaneering International, Inc. Todos os direitos
              reservados.
            </Text>
            <Text variant="small" className={styles.poweredBy}>
              Powered by Microsoft SharePoint
            </Text>
          </div>

          <div className={styles.creditsSection}>
            <div className={styles.engineeringCredit}>
              <Icon iconName="Code" className={styles.codeIcon} />
              <Text variant="small" className={styles.creditText}>
                Created by Brazil Engineering Team
              </Text>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
