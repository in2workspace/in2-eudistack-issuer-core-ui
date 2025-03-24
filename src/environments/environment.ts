//this template is used for local serving ("ng serve") and testing

export const environment = {
  production: false,
  iam_url: 'https://keycloak-dev.ssihub.org/realms/in2-issuer',
  iam_realm_path: 'realms/issuer',
  server_url: 'http://localhost:8081',
  wallet_url: 'http://localhost:4200',
  wallet_url_test: 'http://localhost:4200',
  show_wallet_url_test: true,
  knowledgebase_url: "https://knowledgebase.dome-marketplace-sbx.org/",
  customizations:{
    colors:{ 
      primary:'#2d58a7',
      primary_contrast:'#ffffff',
      secondary:'#2cb6b2',
      secondary_contrast:'#dde6f6'
    },
    logo_src:"dome-issuer.png",
    favicon_src:"dome-favicon.png"  
  }
};
