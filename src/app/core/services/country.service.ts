import { Injectable } from '@angular/core';
import { COUNTRIES } from 'src/app/core/constants/countries';
import { SelectorOption } from '../models/entity/lear-credential-issuance';

export interface Country {
  name: string;
  phoneCode: string;
  isoCountryCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private readonly countries: Country[] = COUNTRIES;


  public getCountries(): Country[] {
    return this.countries;
  }

  public getSortedCountries(): Country[] {
    return [...this.countries].sort((a, b) => a.name.localeCompare(b.name));
  }

  public getCountryFromIsoCode(isoCode: string): Country | undefined {
    return this.countries.find(c => c.isoCountryCode === isoCode);
  }

  public getCountryFromName(name: string): Country | undefined {
    return this.countries.find(c => c.name.toLowerCase() === name.toLowerCase());
  }

  public getCountryNameFromIsoCountryCode(isoCode: string): string {
    const country = this.countries.find(c => c.isoCountryCode === isoCode);
    if(country){
      return country.name;
    }else{
      return '';
    }
  }

  public getCountryPhoneFromIsoCountryCode(isoCode: string): string {
    const country = this.countries.find(c => c.isoCountryCode === isoCode);
    if(country){
      return country.phoneCode;
    }else{
      return '';
    }
  }

  public getCountriesAsSelectorOptions(): SelectorOption[]{
    return this.getSortedCountries().map(country => ({
      label: country.name,
      value: country.isoCountryCode
    }))
  }
}
