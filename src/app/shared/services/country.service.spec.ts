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

  it('should map countries to translation labels on construction', () => {
    // Indirectly tests the private mapCountriesToTranslationLabel()
    const countries = service.getCountries();

    // Sanity: list should not be empty
    expect(countries.length).toBeGreaterThan(0);

    // Every country name should have the "countries." prefix
    countries.forEach(c => {
      expect(c.name.startsWith('countries.')).toBe(true);
    });

    // A couple of concrete examples derived from the provided COUNTRIES
    expect(service.getCountryFromIsoCode('ES')?.name).toBe('countries.spain');
    expect(service.getCountryFromIsoCode('GB')?.name).toBe('countries.unitedkingdom'); // original was "unitedKingdom"
  });

  it('should return the list of countries (already mapped)', () => {
    const list = service.getCountries();
    // Pick a few to assert exact shape
    expect(list).toEqual(
      expect.arrayContaining<Country>([
        { name: 'countries.spain', phoneCode: '34', isoCountryCode: 'ES' },
        { name: 'countries.germany', phoneCode: '49', isoCountryCode: 'DE' },
        { name: 'countries.france', phoneCode: '33', isoCountryCode: 'FR' },
      ])
    );
  });

  it('should return a new sorted list by name without mutating the original', () => {
    const originalRef = service.getCountries(); // This is the internal array
    const sorted = service.getSortedCountries();

    // Should be a new array instance
    expect(sorted).not.toBe(originalRef);

    // Should be sorted ascending by name
    const names = sorted.map(c => c.name);
    const sortedNamesCopy = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sortedNamesCopy);

    // Original reference should remain the same (no in-place mutation)
    expect(service.getCountries()).toBe(originalRef);
  });

  it('should return the correct country for a given ISO country code', () => {
    const result = service.getCountryFromIsoCode('ES');
    expect(result).toEqual<Country>({
      name: 'countries.spain',
      phoneCode: '34',
      isoCountryCode: 'ES',
    });
  });

  it('should return undefined for an invalid ISO country code', () => {
    const result = service.getCountryFromIsoCode('INVALID');
    expect(result).toBeUndefined();
  });

  it('should find a country by its translation key name, case-insensitive', () => {
    // The service now stores names as "countries.xxx"
    const result = service.getCountryFromName('CoUnTrIeS.SpAiN');
    expect(result).toEqual<Country>({
      name: 'countries.spain',
      phoneCode: '34',
      isoCountryCode: 'ES',
    });
  });

  it('should return the correct translation-key name for a valid ISO country code', () => {
    const result = service.getCountryNameFromIsoCountryCode('ES');
    expect(result).toBe('countries.spain');
  });

  it('should return an empty string for an invalid ISO country code when fetching name', () => {
    const result = service.getCountryNameFromIsoCountryCode('INVALID');
    expect(result).toBe('');
  });

  it('should return the correct phone code for a valid ISO country code', () => {
    const result = service.getCountryPhoneFromIsoCountryCode('ES');
    expect(result).toBe('34');
  });

  it('should return an empty string for an invalid ISO country code when fetching phone code', () => {
    const result = service.getCountryPhoneFromIsoCountryCode('INVALID');
    expect(result).toBe('');
  });

  it('should return countries as selector options with translation-key labels', () => {
    const options = service.getCountriesAsSelectorOptions();

    // Each option should have a translation-key label and the ISO country code as value
    options.forEach(opt => {
      expect(opt.label.startsWith('countries.')).toBe(true);
      expect(typeof opt.value).toBe('string');
      expect(opt.value.length).toBeGreaterThan(0);
    });

    // A concrete example for ES
    expect(options).toEqual(
      expect.arrayContaining([
        { label: 'countries.spain', value: 'ES' },
      ])
    );
  });
});
