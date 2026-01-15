(function(window) {
  window.env = window.env || {};

  // Environment variables
  window["env"]["iam_url"] = "${IAM_URL}";
  window["env"]["server_url"] = "${BASE_URL}";
  window["env"]["admin_organization_id"]= "${ADMIN_ORGANIZATION_ID}"
  window["env"]["sys_tenant"]= "${SYS_TENANT}"
  window["env"]["wallet_url"] = "${WALLET_URL}";
  window["env"]["wallet_url_test"] = "${WALLET_URL_TEST}";
  window["env"]["show_wallet_url_test"] = "${SHOW_WALLET_URL_TEST}";
  window["env"]["knowledge_base_url"] = "${KNOWLEDGE_BASE_URL}";
  window["env"]["knowledge_base_url_wallet"] = "${KNOWLEDGE_BASE_URL_WALLET}";
  window["env"]["knowledge_base_url_issuer"] = "${KNOWLEDGE_BASE_URL_ISSUER}";
  window["env"]["knowledge_base_url_revocation"] = "${KNOWLEDGE_BASE_URL_REVOCATION}";
  window["env"]["privacy_policy_url"] = "${PRIVACY_POLICY_URL}";
  window["env"]["license_url"] = "${LICENSE_URL}";
  window["env"]["code_repository_url"] = "${CODE_REPOSITORY_URL}";
  window["env"]["theme_name"] = "${THEME_NAME}";
  window["env"]["assets_base_url"]= "${ASSETS_BASE_URL}";
  window["env"]["logo_path"]= "${LOGO_PATH}"
  window["env"]["favicon_path"]= "${FAVICON_PATH}"
  window["env"]["default_lang"]= "${DEFAULT_LANG}"
})(this);
