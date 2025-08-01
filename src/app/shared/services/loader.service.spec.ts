import { TestBed } from '@angular/core/testing';
import { LoaderService } from './loader.service';
import { BehaviorSubject, Observable } from 'rxjs';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have isLoading$ as an observable', (done) => {
    expect(service.isLoading$).toBeInstanceOf(Observable);
    service.isLoading$.subscribe((isLoading) => {
      expect(typeof isLoading).toBe('boolean');
      done();
    });
  });

  it('should initially set isLoading to false', (done) => {
    service.isLoading$.subscribe((isLoading) => {
      expect(isLoading).toBe(false);
      done();
    });
  });

  it('should update isLoading when updateIsLoading is called', (done) => {
    service.updateIsLoading(true);

    service.isLoading$.subscribe((isLoading) => {
      if (isLoading) {
        expect(isLoading).toBe(true);
        done();
      }
    });
  });

  it('should emit false when updateIsLoading(false) is called', (done) => {
    service.updateIsLoading(false);

    service.isLoading$.subscribe((isLoading) => {
      expect(isLoading).toBe(false);
      done();
    });
  });
});
