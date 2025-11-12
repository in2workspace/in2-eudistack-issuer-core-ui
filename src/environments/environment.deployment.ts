// this template is used for deployment in all environments (LCL, SBX, Dev2 and PRD)

export const environment = {
  production: true,
  // Admin organization identifier (REQUIRED)
  admin_organization_id: window["env"]["admin_organization_id"],
  // System tenant name; included as "Domain" in credential powers
  sys_tenant: window["env"]["sys_tenant"],
  // Keycloak URL (REQUIRED)
  iam_url: window["env"]["iam_url"],
  // Issuer API base URL (REQUIRED)
  server_url: window["env"]["server_url"],
  // Wallet base URL; currently points to PRD (REQUIRED)
  wallet_url: window["env"]["wallet_url"],
  // Wallet base URL for tests (REQUIRED)
  wallet_url_test: window["env"]["wallet_url_test"],
  // Determines whether to show wallet_url_test or not (REQUIRED)
  show_wallet_url_test: window["env"]["show_wallet_url_test"] === "true",
  // Knowledgebase base URL (REQUIRED)
  knowledge_base_url: window["env"]["knowledge_base_url"],
  customizations:{
    colors:{
      // (OPTIONAL with fallback)
      primary: window["env"]["primary"] ?? '#2d58a7',
      // (OPTIONAL with fallback)
      primary_contrast: window["env"]["primary_contrast"] ?? '#ffffff',
      // (OPTIONAL with fallback)
      secondary: window["env"]["secondary"] ?? '#2cb6b2',
      // (OPTIONAL with fallback)
      secondary_contrast: window["env"]["secondary_contrast"] ?? '#dde6f6',
    },
    // Main app logo name, shown in the navbar. Points to "assets/logos/" (REQUIRED)
    logo_src: window["env"]["logo_src"],
    // App favicon. Points to "assets/icons/" (REQUIRED)
    favicon_src: window["env"]["favicon_src"] ?? "",
    // Default app language (OPTIONAL)
    default_lang: window["env"]["default_lang"] ?? "en"
  }
};
