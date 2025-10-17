import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MatPaginatorIntlService } from './mat-paginator-intl.service'; // <-- adjust the path if needed

describe('MatPaginatorIntlService (Jest)', () => {
  // Keys used by the service (mirrors the constants in the service)
  const PAGINATOR_PREFIX = 'credentialManagement.paginator';
  const ITEMS_PER_PAGE   = `${PAGINATOR_PREFIX}.items-per-page`;
  const NEXT_PAGE        = `${PAGINATOR_PREFIX}.next-page`;
  const PREV_PAGE        = `${PAGINATOR_PREFIX}.previous-page`;
  const FIRST_PAGE       = `${PAGINATOR_PREFIX}.first-page`;
  const LAST_PAGE        = `${PAGINATOR_PREFIX}.last-page`;
  const OF_KEY           = `${PAGINATOR_PREFIX}.of`;

  let service: MatPaginatorIntlService;

  // We'll simulate language changes and dynamic translations
  const langChange$ = new Subject<LangChangeEvent>();
  let currentLang = 'en';

  // Basic fake translations generator
  const makeDict = (keys: string[], lang: string) =>
    Object.fromEntries(keys.map(k => [k, `${k} [${lang}]`]));

  // TranslateService mock
  const translateMock: Partial<TranslateService> = {
    // onLangChange is an Observable in ngx-translate
    onLangChange: langChange$.asObservable() as any,

    // get returns an observable that emits a dictionary of the requested keys
    get: jest.fn((keys: string[] | string) => {
      const list = Array.isArray(keys) ? keys : [keys];
      return of(makeDict(list, currentLang));
    }) as any,

    // instant returns a single translated string synchronously
    instant: jest.fn((key: string) => {
      if (key === OF_KEY) return `of [${currentLang}]`;
      return `${key} [${currentLang}]`;
    }) as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        MatPaginatorIntlService,
        { provide: TranslateService, useValue: translateMock },
      ],
    });

    service = TestBed.inject(MatPaginatorIntlService);
  });

  afterEach(() => {
    // Reset language after each test
    currentLang = 'en';
  });

  test('should create the service', () => {
    expect(service).toBeTruthy();
  });

 test('should initialize labels on construction and emit changes', () => {
  // Arrange
  const changesSpy = jest.spyOn(service.changes, 'next');

  // Act: force a new init so the spy can see the emission
  service.getAndInitTranslations();

  // Assert: labels are set with [en]
  expect(service.itemsPerPageLabel).toBe(`${ITEMS_PER_PAGE} [en]`);
  expect(service.nextPageLabel).toBe(`${NEXT_PAGE} [en]`);
  expect(service.previousPageLabel).toBe(`${PREV_PAGE} [en]`);
  expect(service.firstPageLabel).toBe(`${FIRST_PAGE} [en]`);
  expect(service.lastPageLabel).toBe(`${LAST_PAGE} [en]`);

  // Assert: a change notification was emitted
  expect(changesSpy).toHaveBeenCalled();
});

  test('should refresh labels and emit changes when language changes', () => {
    // Arrange
    const changesSpy = jest.spyOn(service.changes, 'next');
    changesSpy.mockClear(); // clear initial emit from constructor

    // Act: switch to "es" and emit a LangChangeEvent
    currentLang = 'es';
    langChange$.next({ lang: 'es', translations: {} } as LangChangeEvent);

    // Assert: labels updated to [es] and change emitted again
    expect(service.itemsPerPageLabel).toBe(`${ITEMS_PER_PAGE} [es]`);
    expect(service.nextPageLabel).toBe(`${NEXT_PAGE} [es]`);
    expect(service.previousPageLabel).toBe(`${PREV_PAGE} [es]`);
    expect(service.firstPageLabel).toBe(`${FIRST_PAGE} [es]`);
    expect(service.lastPageLabel).toBe(`${LAST_PAGE} [es]`);
    expect(changesSpy).toHaveBeenCalledTimes(1);
  });

  describe('getRangeLabel', () => {
    test('should return "0 / length" when length is 0', () => {
      // Act
      const label = service.getRangeLabel(0, 10, 0);

      // Assert
      expect(label).toBe('0 / 0');
    });

    test('should return "0 / length" when pageSize is 0', () => {
      // Act
      const label = service.getRangeLabel(2, 0, 50);

      // Assert
      expect(label).toBe('0 / 50');
    });

    test('should return the proper range with translated "of"', () => {
      // Arrange
      currentLang = 'en'; // ensure predictable "of [en]"
      // page=1 (second page), pageSize=10, length=35 -> 11 - 20 of 35
      // Note: The service uses translate.instant for the "of" key.
      const expected = `11 - 20 of [en] 35`;

      // Act
      const label = service.getRangeLabel(1, 10, 35);

      // Assert
      expect(label).toBe(expected);
      expect(translateMock.instant).toHaveBeenCalledWith(OF_KEY);
    });

    test('should allow startIndex beyond length (Angular Material default behavior)', () => {
      // Arrange
      // page=4, pageSize=10, length=35 -> start=40, end=50
      const expected = `41 - 50 of [en] 35`;

      // Act
      const label = service.getRangeLabel(4, 10, 35);

      // Assert
      expect(label).toBe(expected);
    });
  });
});
