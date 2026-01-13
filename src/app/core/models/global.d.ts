// src/types/global.d.ts

interface Window {
    env: {
        iam_url?: string;
        server_url?: string;
        wallet_url?: string;
        wallet_url_test?: string;
        show_wallet_url_test: string;
        knowledge_base_url?: string;
        procedures?: string;
        saveCredential?: string;
        credential_offer_url?: string;
        notification?: string;
        sign_credential_url?: string;
        theme_bundle?: string;
        assets_base_url?: string;
        logo_path?: string;
        favicon_path?: string;
        default_lang?: string
        admin_organization_id?: string;
        sys_tenant: string;
    };
}
