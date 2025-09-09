import { HttpRequest, HttpErrorResponse, HttpResponse, HttpStatusCode, HttpEvent } from "@angular/common/http";
import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { TranslateService } from "@ngx-translate/core";
import { throwError, of } from "rxjs";
import { DialogWrapperService } from "src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service";
import { environment } from "src/environments/environment";
import { ServeErrorInterceptor } from "./server-error-interceptor";
import { DialogComponent } from "src/app/shared/components/dialog/dialog-component/dialog.component";


describe('ServeErrorInterceptor', () => {
  let interceptor: ServeErrorInterceptor;
  let dialogServiceSpy: { openErrorInfoDialog: jest.Mock };
  let translateServiceSpy: { instant: jest.Mock };
  let httpRequest: Partial<HttpRequest<any>>;
  let httpHandler: { handle: jest.Mock };

  beforeEach(() => {
    httpRequest = { url: 'mocked-url', method: 'GET' } as Partial<HttpRequest<any>>;
    httpHandler = { handle: jest.fn() };
    dialogServiceSpy = { openErrorInfoDialog: jest.fn().mockReturnValue('') };
    translateServiceSpy = { instant: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: DialogWrapperService, useValue: dialogServiceSpy },
        ServeErrorInterceptor,
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    });

    interceptor = TestBed.inject(ServeErrorInterceptor);

  });

  afterEach(() => {
    TestBed.resetTestingModule();
    jest.clearAllMocks(); 
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  describe('when HttpErrorResponse is received', () => {
    it('should call showAlert with the proper message for 404 error', fakeAsync(() => {
      const httpErrorResponse = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });

      httpHandler.handle.mockReturnValue(throwError(() => httpErrorResponse));
      translateServiceSpy.instant.mockReturnValue('error.not_found');

      interceptor.intercept(httpRequest as HttpRequest<any>, httpHandler).subscribe({
        next: () => fail('expected an error, not a response'),
        error: (err: HttpErrorResponse) => {
          expect(err.status).toBe(404);
          expect(translateServiceSpy.instant).toHaveBeenCalledWith('error.not_found');
          expect(dialogServiceSpy.openErrorInfoDialog).toHaveBeenCalledWith(DialogComponent, 'error.not_found');
        }
      });
      tick();
    }));

    it('should call showAlert with the proper message for 401 error', done => {
      const httpErrorResponse = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });

      httpHandler.handle.mockReturnValue(throwError(() => httpErrorResponse));
      translateServiceSpy.instant.mockReturnValue('error.unauthorized');

      interceptor.intercept(httpRequest as HttpRequest<any>, httpHandler).subscribe({
        next: () => fail('expected an error, not a response'),
        error: (err: HttpErrorResponse) => {
          expect(err.status).toBe(401);
          expect(translateServiceSpy.instant).toHaveBeenCalledWith('error.unauthorized');
          expect(dialogServiceSpy.openErrorInfoDialog).toHaveBeenCalledWith(DialogComponent, 'error.unauthorized');
          done();
        }
      });
    });

    it('should call showAlert with the proper message for 403 error', done => {
      const httpErrorResponse = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' });

      httpHandler.handle.mockReturnValue(throwError(() => httpErrorResponse));
      translateServiceSpy.instant.mockReturnValue('error.forbidden');

      interceptor.intercept(httpRequest as HttpRequest<any>, httpHandler).subscribe({
        next: () => fail('expected an error, not a response'),
        error: (err: HttpErrorResponse) => {
          expect(err.status).toBe(403);
          expect(translateServiceSpy.instant).toHaveBeenCalledWith('error.forbidden');
          expect(dialogServiceSpy.openErrorInfoDialog).toHaveBeenCalledWith(DialogComponent, 'error.forbidden');
          done();
        }
      });
    });

    it('should call showAlert with the proper message for 500 error', done => {
      const httpErrorResponse = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });

      httpHandler.handle.mockReturnValue(throwError(() => httpErrorResponse));
      translateServiceSpy.instant.mockReturnValue('error.internal_server');

      interceptor.intercept(httpRequest as HttpRequest<any>, httpHandler).subscribe({
        next: () => fail('expected an error, not a response'),
        error: (err: HttpErrorResponse) => {
          expect(err.status).toBe(500);
          expect(translateServiceSpy.instant).toHaveBeenCalledWith('error.internal_server');
          expect(dialogServiceSpy.openErrorInfoDialog).toHaveBeenCalledWith(DialogComponent, 'error.internal_server');
          done();
        }
      });
    });

    it('should call showAlert with the proper message for unknown error', done => {
      const httpErrorResponse = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });

      httpHandler.handle.mockReturnValue(throwError(() => httpErrorResponse));
      translateServiceSpy.instant.mockReturnValue('error.unknown_error');

      interceptor.intercept(httpRequest as HttpRequest<any>, httpHandler).subscribe({
        next: () => fail('expected an error, not a response'),
        error: (err: HttpErrorResponse) => {
          expect(err.status).toBe(0);
          expect(translateServiceSpy.instant).toHaveBeenCalledWith('error.unknown_error');
          expect(dialogServiceSpy.openErrorInfoDialog).toHaveBeenCalledWith(DialogComponent, 'error.unknown_error');
          done();
        }
      });
    });

it('should handle errors silently for IAM endpoint and rethrow error', done => {
  const iamUrl = environment.iam_url;
  const httpErrorResponse = new HttpErrorResponse({
    status: 401,
    statusText: 'Unauthorized',
    url: iamUrl
  });

  const customRequest = { ...httpRequest, url: iamUrl } as HttpRequest<any>;

  httpHandler.handle.mockReturnValue(throwError(() => httpErrorResponse));

  const logSpy = jest.spyOn(interceptor as any, 'logHandledSilentlyError');

  interceptor.intercept(customRequest, httpHandler).subscribe({
    next: () => fail('expected an error, not a response'),
    error: (err: HttpErrorResponse) => {
      expect(err).toBe(httpErrorResponse);
      expect(logSpy).toHaveBeenCalledWith(httpErrorResponse);
      done();
    }
  });
});


  });

  describe('when an empty body is received', () => {
    it('should handle an empty body response gracefully', done => {
      const httpResponse = new HttpResponse<unknown>({ body: null, status: HttpStatusCode.Ok });

      httpHandler.handle.mockReturnValue(of(httpResponse));
      translateServiceSpy.instant.mockReturnValue('Empty Body');

      interceptor.intercept(httpRequest as HttpRequest<any>, httpHandler).subscribe({
        next: (result: HttpEvent<unknown>) => {
          if (result instanceof HttpResponse) {
            expect(result.body).toBeNull();
            done();
          }
        },
        error: () => fail('expected a response, not an error')
      });
    });
  });

  describe('when a correct response is received', () => {
    it('should pass the response through', done => {
      const expectedBody = { message: 'Correct Body' };
      const httpResponse = new HttpResponse({ body: expectedBody, status: HttpStatusCode.Ok });

      httpHandler.handle.mockReturnValue(of(httpResponse));

      interceptor.intercept(httpRequest as HttpRequest<any>, httpHandler).subscribe({
        next: (result: HttpEvent<unknown>) => {
          if (result instanceof HttpResponse) {
            expect(result.body).toEqual(expectedBody);
            done();
          }
        },
        error: () => fail('expected a response, not an error')
      });
    });
  });

  it('should handle error silently', () => {
    const mockError = { message: 'Error!' } as any;
    const logSpy = jest.spyOn(console, 'error');
    
    interceptor['logHandledSilentlyError'](mockError);
    expect(logSpy).toHaveBeenCalledTimes(2);
    
  });
});
