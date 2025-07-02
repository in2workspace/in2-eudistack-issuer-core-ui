import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { environment } from 'src/environments/environment';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { ServeErrorInterceptor } from './app/core/interceptors/server-error-interceptor';
import { AuthInterceptor, AuthModule } from 'angular-auth-oidc-client';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { RouterModule } from "@angular/router";
import { routes } from "./app/app-routing";
import { HttpLoaderFactory } from "./app/core/services/translate-http-loader.factory";
import { overrideDefaultValueAccessor } from './app/core/overrides/value-accessor.overrides';
import { IAM_PARAMS, IAM_POST_LOGIN_ROUTE, IAM_POST_LOGOUT_URI, IAM_REDIRECT_URI } from './app/core/constants/iam.constants';
import { CREDENTIAL_SCHEMA_BUILDERS } from './app/features/credential-issuance/services/issuance-schema-builders/issuance-schema-builder';
import { LearCredentialEmployeeSchemaBuilder } from './app/features/credential-issuance/services/issuance-schema-builders/lear-credential-employee-issuance-schema-builder';
import { LearCredentialMachineIssuanceSchemaBuilder } from './app/features/credential-issuance/services/issuance-schema-builders/lear-credential-machine-issuance-schema-builder';

overrideDefaultValueAccessor();

bootstrapApplication(AppComponent, {
    providers: [
        {
            provide: CREDENTIAL_SCHEMA_BUILDERS,
            useClass: LearCredentialEmployeeSchemaBuilder,
            multi: true
        },
        {
            provide: CREDENTIAL_SCHEMA_BUILDERS,
            useClass: LearCredentialMachineIssuanceSchemaBuilder,
            multi: true
        },
        importProvidersFrom(BrowserModule, RouterModule.forRoot(routes), TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }), AuthModule.forRoot({
            config: {
                // Add "logLevel: 1" to see library logs
                postLoginRoute: IAM_POST_LOGIN_ROUTE,
                authority: environment.iam_url,
                redirectUrl: IAM_REDIRECT_URI,
                postLogoutRedirectUri: IAM_POST_LOGOUT_URI,
                clientId: IAM_PARAMS.CLIENT_ID,
                scope: IAM_PARAMS.SCOPE,
                responseType: IAM_PARAMS.GRANT_TYPE,
                silentRenew: true,
                useRefreshToken: true,
                historyCleanupOff: false,
                ignoreNonceAfterRefresh: true,
                triggerRefreshWhenIdTokenExpired: false,
                secureRoutes: [environment.server_url, environment.iam_url].filter((route): route is string => route !== undefined)
            },
        })),
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ServeErrorInterceptor, multi: true },
        provideAnimations(),
    ]
})
  .catch(err => console.error(err));
