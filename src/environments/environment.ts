//this template is used for local serving ("ng serve") and testing

export const environment = {
  production: false,
  sys_tenant: "TENANT",
  admin_organization_id: "VATES-000000000",
  iam_url: 'https://keycloak-dev.ssihub.org/realms/in2-issuer',
  server_url: 'http://localhost:8081',
  wallet_url: 'http://localhost:4200',
  wallet_url_test: 'http://localhost:4200',
  show_wallet_url_test: "false",
  privacy_policy_url: "https://dome-marketplace.eu/assets/documents/privacy.pdf",
  license_url: "https://creativecommons.org/licenses/by/4.0",
  code_repository_url: "https://github.com/in2workspace/in2-eudistack-issuer-core-ui",
  knowledge_base_url: {
    base: "https://knowledgebase.dome-marketplace.eu",
    wallet: "/books/dome-digital-wallet-user-guide",
    issuer: {
      base: "/books/dome-credential-issuer-user-guide",
      revocation: "/books/dome-credential-issuer-user-guide/page/credential-revocation"
    }
  },
  customizations:{
    theme_name: "altia-theme",
    assets: {
      base_url: "assets",
      logo_path:"logos/altia-logo.svg",
      favicon_path:"icons/altia-favicon.ico",
    },
    default_lang: "en"
  }
};
