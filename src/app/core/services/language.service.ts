import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  public readonly translate = inject(TranslateService);

  private readonly availableLanguages = ['en', 'es', 'ca'];
  private readonly defaultLang = 'en';

  public async setLanguage(){
    this.setAvailableLanguages();

    const browserLang = this.setBrowserLanguage();
    if(browserLang) return;

    this.setDefaultLanguage();
  }

  private setAvailableLanguages(): void{
    this.translate.addLangs(this.availableLanguages);
  }

  private setDefaultLanguage(){
    const defaultLang = this.getDefaultLang();
    console.log("setDefaultLanguage: " + defaultLang);
    this.translate.setDefaultLang(defaultLang);
    this.translate.use(defaultLang);
  }

  private getDefaultLang(): string{
    const defaultLangFromEnv = environment.customizations.default_lang;
    console.log("default language from env: " + defaultLangFromEnv);
    if(this.availableLanguages.includes(defaultLangFromEnv)){
      return defaultLangFromEnv;
    }else{
      console.error('Language from env is not available: ' + defaultLangFromEnv);
      return this.defaultLang;
    }
  }

private setBrowserLanguage(): string | undefined {
  const availableLangs = this.translate.getLangs();
  
  const browserLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  
  console.log("Languages from browser: ");
  console.log(browserLanguages);

  for (const lang of browserLanguages) {
    const shortLang = lang.split('-')[0];

    if (availableLangs.includes(shortLang)) {
      this.translate.use(shortLang);
      return shortLang;
    }
  }
  console.log("Couldn't find any available browser language.");
  return undefined;
}

}
