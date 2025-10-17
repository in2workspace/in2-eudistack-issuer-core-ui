import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;
  let translateServiceMock: jest.Mocked<TranslateService>;

  // Helpers
  const saveNavigator = () =>
    ({ languages: navigator.languages, language: navigator.language } as any);

  const mockNavigator = (langs: string[], lang: string) => {
    Object.defineProperty(window.navigator, 'languages', { value: langs, configurable: true });
    Object.defineProperty(window.navigator, 'language', { value: lang, configurable: true });
  };

  const restoreNavigator = (snapshot: any) => {
    Object.defineProperty(window.navigator, 'languages', { value: snapshot.languages, configurable: true });
    Object.defineProperty(window.navigator, 'language', { value: snapshot.language, configurable: true });
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    translateServiceMock = {
      addLangs: jest.fn(),
      getLangs: jest.fn().mockReturnValue(['en', 'es', 'ca']),
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    } as unknown as jest.Mocked<TranslateService>;

    await TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: TranslateService, useValue: translateServiceMock }
      ],
    }).compileComponents();

    service = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should always add available languages when setting languages', async () => {
    translateServiceMock.addLangs.mockClear();

    await service.setLanguage();

    expect(translateServiceMock.addLangs).toHaveBeenCalledWith(['en', 'es', 'ca']);
  });

  it('should fall back to default when no browser match', async () => {

    const snap = saveNavigator();
    mockNavigator(['fr-FR'], 'fr-FR');

    translateServiceMock.setDefaultLang.mockClear();
    translateServiceMock.use.mockClear();

    await service.setLanguage();

    expect(translateServiceMock.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateServiceMock.use).toHaveBeenCalledWith('en');

    restoreNavigator(snap);
  });

  it('should pick the first matching browser language in order of preference', async () => {

    const snap = saveNavigator();
    mockNavigator(['fr-FR', 'ca-ES', 'es-ES'], 'fr-FR');

    translateServiceMock.use.mockClear();

    await service.setLanguage();

    expect(translateServiceMock.use).toHaveBeenCalledWith('ca');

    restoreNavigator(snap);
  });
});
