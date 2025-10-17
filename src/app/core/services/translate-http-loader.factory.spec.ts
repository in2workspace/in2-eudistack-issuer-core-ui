import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { httpTranslateLoader } from './translate-http-loader.factory';

describe('httpTranslateLoader factory', () => {
  test('should create a TranslateHttpLoader instance using the provided HttpClient', () => {
    // Arrange
    const getMock = jest.fn().mockReturnValue(of({}));
    const httpMock: Partial<HttpClient> = { get: getMock };

    // Act
    const loader = httpTranslateLoader(httpMock as HttpClient);

    // Assert
    // Ensure we returned the correct loader type
    expect(loader).toBeInstanceOf(TranslateHttpLoader);
  });

  test('should use default prefix/suffix and call http.get with the expected URL', (done) => {
    // Arrange
    const responses = { en: { HELLO: 'world' } };
    const getMock = jest.fn().mockImplementation((url: string) => {
      if (url.endsWith('/assets/i18n/en.json')) return of(responses.en);
      return of({});
    });
    const httpMock: Partial<HttpClient> = { get: getMock };
    const loader = httpTranslateLoader(httpMock as HttpClient);

    // Act
    loader.getTranslation('en').subscribe((payload: any) => {
      expect(getMock).toHaveBeenCalledTimes(1);

      const firstCallArgs = getMock.mock.calls[0];
      expect(firstCallArgs[0]).toBe('/assets/i18n/en.json');

      expect(payload).toEqual(responses.en);

      done();
    });
  });
});
