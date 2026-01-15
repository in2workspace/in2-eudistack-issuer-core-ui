// src/types/global.d.ts

interface Window {
    env: {
        iam_url?: string;
        server_url?: string;
        wallet_url?: string;
        wallet_url_test?: string;
        show_wallet_url_test?: string; //"true" | "false"
        knowledge_base_url?: string;
        knowledge_base_url_wallet?: string;
        knowledge_base_url_issuer?: string;
        knowledge_base_url_revocation?: string;
        privacy_policy_url?: string;
        license_url?: string;
        code_repository_url?: string;
        procedures?: string;
        saveCredential?: string;
        credential_offer_url?: string;
        notification?: string;
        sign_credential_url?: string;
        theme_name?: string;
        assets_base_url?: string;
        logo_path?: string;
        favicon_path?: string;
        default_lang?: string
        admin_organization_id?: string;
        sys_tenant: string;
    };
}
