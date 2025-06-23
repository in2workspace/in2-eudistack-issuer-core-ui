import { TestBed } from '@angular/core/testing';
import { CountryService, Country } from './country.service';

describe('CountryService', () => {
  let service: CountryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CountryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the list of countries', () => {
    expect(service.getCountries()).toEqual(countries);
  });

  it('should return the sorted countries list', ()=>{
    const sortedCountries = service.getSortedCountries();
    expect(sortedCountries).toEqual(sortedCountries);
  });

  it('should return the correct country for a given ISO country code', () => {
    const isoCode = 'ES';
    const expectedCountry: Country = { name: 'Spain', phoneCode: '34', isoCountryCode: 'ES' };
    const result = service.getCountryFromIsoCode(isoCode);
    expect(result).toEqual(expectedCountry);
  });
  
  it('should return undefined for an invalid ISO country code', () => {
    const isoCode = 'INVALID';
    const result = service.getCountryFromIsoCode(isoCode);
    expect(result).toBeUndefined();
  });

  it('should return the correct country name for a valid ISO country code', () => {
    const isoCode = 'ES';
    const expectedName = 'Spain';
    const result = service.getCountryNameFromIsoCountryCode(isoCode);
    expect(result).toBe(expectedName);
  });
  
  // it('should return an empty string and log an error for an invalid ISO country code when fetching country name', () => {
  //   const isoCode = 'INVALID';
  //   const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  //   const result = service.getCountryNameFromIsoCountryCode(isoCode);
  //   expect(result).toBe('');
  //   expect(consoleSpy).toHaveBeenCalledWith('Country not found. Country phone code: ' + isoCode);
  //   consoleSpy.mockRestore();
  // });
  
  it('should return the correct phone code for a valid ISO country code', () => {
    const isoCode = 'ES';
    const expectedPhoneCode = '34';
    const result = service.getCountryPhoneFromIsoCountryCode(isoCode);
    expect(result).toBe(expectedPhoneCode);
  });
  
  // it('should return an empty string and log an error for an invalid ISO country code when fetching phone code', () => {
  //   const isoCode = 'INVALID';
  //   const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  //   const result = service.getCountryPhoneFromIsoCountryCode(isoCode);
  //   expect(result).toBe('');
  //   expect(consoleSpy).toHaveBeenCalledWith('Country not found. Country phone code: ' + isoCode);
  //   consoleSpy.mockRestore();
  // });
  

});

const countries: Country[] = [
    { name: 'Spain', phoneCode: '34', isoCountryCode: 'ES' },
    { name: 'Germany', phoneCode: '49', isoCountryCode: 'DE' },
    { name: 'France', phoneCode: '33', isoCountryCode: 'FR' },
    { name: 'Italy', phoneCode: '39', isoCountryCode: 'IT' },
    { name: 'United Kingdom', phoneCode: '44', isoCountryCode: 'GB' },
    { name: 'Russia', phoneCode: '7', isoCountryCode: 'RU' },
    { name: 'Ukraine', phoneCode: '380', isoCountryCode: 'UA' },
    { name: 'Poland', phoneCode: '48', isoCountryCode: 'PL' },
    { name: 'Romania', phoneCode: '40', isoCountryCode: 'RO' },
    { name: 'Netherlands', phoneCode: '31', isoCountryCode: 'NL' },
    { name: 'Belgium', phoneCode: '32', isoCountryCode: 'BE' },
    { name: 'Greece', phoneCode: '30', isoCountryCode: 'GR' },
    { name: 'Portugal', phoneCode: '351', isoCountryCode: 'PT' },
    { name: 'Sweden', phoneCode: '46', isoCountryCode: 'SE' },
    { name: 'Norway', phoneCode: '47', isoCountryCode: 'NO' },
    { name: 'Albania', phoneCode: '355', isoCountryCode: 'AL' },
    { name: 'Andorra', phoneCode: '376', isoCountryCode: 'AD' },
    { name: 'Armenia', phoneCode: '374', isoCountryCode: 'AM' },
    { name: 'Austria', phoneCode: '43', isoCountryCode: 'AT' },
    { name: 'Azerbaijan', phoneCode: '994', isoCountryCode: 'AZ' },
    { name: 'Belarus', phoneCode: '375', isoCountryCode: 'BY' },
    { name: 'Bosnia and Herzegovina', phoneCode: '387', isoCountryCode: 'BA' },
    { name: 'Bulgaria', phoneCode: '359', isoCountryCode: 'BG' },
    { name: 'Croatia', phoneCode: '385', isoCountryCode: 'HR' },
    { name: 'Cyprus', phoneCode: '357', isoCountryCode: 'CY' },
    { name: 'Czech Republic', phoneCode: '420', isoCountryCode: 'CZ' },
    { name: 'Denmark', phoneCode: '45', isoCountryCode: 'DK' },
    { name: 'Estonia', phoneCode: '372', isoCountryCode: 'EE' },
    { name: 'Finland', phoneCode: '358', isoCountryCode: 'FI' },
    { name: 'Georgia', phoneCode: '995', isoCountryCode: 'GE' },
    { name: 'Hungary', phoneCode: '36', isoCountryCode: 'HU' },
    { name: 'Iceland', phoneCode: '354', isoCountryCode: 'IS' },
    { name: 'Ireland', phoneCode: '353', isoCountryCode: 'IE' },
    { name: 'Kazakhstan', phoneCode: '7', isoCountryCode: 'KZ' },
    { name: 'Kosovo', phoneCode: '383', isoCountryCode: 'XK' },
    { name: 'Latvia', phoneCode: '371', isoCountryCode: 'LV' },
    { name: 'Liechtenstein', phoneCode: '423', isoCountryCode: 'LI' },
    { name: 'Lithuania', phoneCode: '370', isoCountryCode: 'LT' },
    { name: 'Luxembourg', phoneCode: '352', isoCountryCode: 'LU' },
    { name: 'Malta', phoneCode: '356', isoCountryCode: 'MT' },
    { name: 'Moldova', phoneCode: '373', isoCountryCode: 'MD' },
    { name: 'Monaco', phoneCode: '377', isoCountryCode: 'MC' },
    { name: 'Montenegro', phoneCode: '382', isoCountryCode: 'ME' },
    { name: 'North Macedonia', phoneCode: '389', isoCountryCode: 'MK' },
    { name: 'San Marino', phoneCode: '378', isoCountryCode: 'SM' },
    { name: 'Serbia', phoneCode: '381', isoCountryCode: 'RS' },
    { name: 'Slovakia', phoneCode: '421', isoCountryCode: 'SK' },
    { name: 'Slovenia', phoneCode: '386', isoCountryCode: 'SI' },
    { name: 'Switzerland', phoneCode: '41', isoCountryCode: 'CH' },
    { name: 'Turkey', phoneCode: '90', isoCountryCode: 'TR' },
    { name: 'Vatican City', phoneCode: '379', isoCountryCode: 'VA' }
];

const sortedList: Country[] = [
  { name: 'Albania', phoneCode: '355', isoCountryCode: 'AL' },
  { name: 'Andorra', phoneCode: '376', isoCountryCode: 'AD' },
  { name: 'Armenia', phoneCode: '374', isoCountryCode: 'AM' },
  { name: 'Austria', phoneCode: '43', isoCountryCode: 'AT' },
  { name: 'Azerbaijan', phoneCode: '994', isoCountryCode: 'AZ' },
  { name: 'Belarus', phoneCode: '375', isoCountryCode: 'BY' },
  { name: 'Belgium', phoneCode: '32', isoCountryCode: 'BE' },
  { name: 'Bosnia and Herzegovina', phoneCode: '387', isoCountryCode: 'BA' },
  { name: 'Bulgaria', phoneCode: '359', isoCountryCode: 'BG' },
  { name: 'Croatia', phoneCode: '385', isoCountryCode: 'HR' },
  { name: 'Cyprus', phoneCode: '357', isoCountryCode: 'CY' },
  { name: 'Czech Republic', phoneCode: '420', isoCountryCode: 'CZ' },
  { name: 'Denmark', phoneCode: '45', isoCountryCode: 'DK' },
  { name: 'Estonia', phoneCode: '372', isoCountryCode: 'EE' },
  { name: 'Finland', phoneCode: '358', isoCountryCode: 'FI' },
  { name: 'France', phoneCode: '33', isoCountryCode: 'FR' },
  { name: 'Georgia', phoneCode: '995', isoCountryCode: 'GE' },
  { name: 'Germany', phoneCode: '49', isoCountryCode: 'DE' },
  { name: 'Greece', phoneCode: '30', isoCountryCode: 'GR' },
  { name: 'Hungary', phoneCode: '36', isoCountryCode: 'HU' },
  { name: 'Iceland', phoneCode: '354', isoCountryCode: 'IS' },
  { name: 'Ireland', phoneCode: '353', isoCountryCode: 'IE' },
  { name: 'Italy', phoneCode: '39', isoCountryCode: 'IT' },
  { name: 'Kazakhstan', phoneCode: '7', isoCountryCode: 'KZ' },
  { name: 'Kosovo', phoneCode: '383', isoCountryCode: 'XK' },
  { name: 'Latvia', phoneCode: '371', isoCountryCode: 'LV' },
  { name: 'Liechtenstein', phoneCode: '423', isoCountryCode: 'LI' },
  { name: 'Lithuania', phoneCode: '370', isoCountryCode: 'LT' },
  { name: 'Luxembourg', phoneCode: '352', isoCountryCode: 'LU' },
  { name: 'Malta', phoneCode: '356', isoCountryCode: 'MT' },
  { name: 'Moldova', phoneCode: '373', isoCountryCode: 'MD' },
  { name: 'Monaco', phoneCode: '377', isoCountryCode: 'MC' },
  { name: 'Montenegro', phoneCode: '382', isoCountryCode: 'ME' },
  { name: 'Netherlands', phoneCode: '31', isoCountryCode: 'NL' },
  { name: 'North Macedonia', phoneCode: '389', isoCountryCode: 'MK' },
  { name: 'Norway', phoneCode: '47', isoCountryCode: 'NO' },
  { name: 'Poland', phoneCode: '48', isoCountryCode: 'PL' },
  { name: 'Portugal', phoneCode: '351', isoCountryCode: 'PT' },
  { name: 'Romania', phoneCode: '40', isoCountryCode: 'RO' },
  { name: 'Russia', phoneCode: '7', isoCountryCode: 'RU' },
  { name: 'San Marino', phoneCode: '378', isoCountryCode: 'SM' },
  { name: 'Serbia', phoneCode: '381', isoCountryCode: 'RS' },
  { name: 'Slovakia', phoneCode: '421', isoCountryCode: 'SK' },
  { name: 'Slovenia', phoneCode: '386', isoCountryCode: 'SI' },
  { name: 'Spain', phoneCode: '34', isoCountryCode: 'ES' },
  { name: 'Sweden', phoneCode: '46', isoCountryCode: 'SE' },
  { name: 'Switzerland', phoneCode: '41', isoCountryCode: 'CH' },
  { name: 'Turkey', phoneCode: '90', isoCountryCode: 'TR' },
  { name: 'Ukraine', phoneCode: '380', isoCountryCode: 'UA' },
  { name: 'United Kingdom', phoneCode: '44', isoCountryCode: 'GB' },
  { name: 'Vatican City', phoneCode: '379', isoCountryCode: 'VA' }
];
