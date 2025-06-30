import { TestBed } from '@angular/core/testing';
import { ProviderService } from './provider.service';
import { ProviderRepository } from './provider.repository';
import { of, throwError } from 'rxjs';
import { CloudProvider } from '../models/provider.models';
import {providersMock} from 'src/app/core/mocks/signature-configuration.mock'

describe('ProviderService', () => {
  let service: ProviderService;
  let repositoryMock: jest.Mocked<ProviderRepository>;

  const mockProviders: CloudProvider[] = providersMock;

  beforeEach(() => {
    repositoryMock = {
      getAllCloudProvider: jest.fn()
    } as unknown as jest.Mocked<ProviderRepository>;

    TestBed.configureTestingModule({
      providers: [
        ProviderService,
        { provide: ProviderRepository, useValue: repositoryMock }
      ]
    });

    service = TestBed.inject(ProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return list of providers when available', (done) => {
    repositoryMock.getAllCloudProvider.mockReturnValue(of(mockProviders));

    service.getAllProvider().subscribe({
      next: (providers) => {
        expect(providers).toEqual(mockProviders);
        done();
      },
      error: () => {
        fail('Should not throw error when providers exist');
      }
    });
  });

  it('should throw an error if provider list is empty', (done) => {
    repositoryMock.getAllCloudProvider.mockReturnValue(of([]));

    service.getAllProvider().subscribe({
      next: () => {
        fail('Expected an error to be thrown');
      },
      error: (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('No provider found');
        done();
      }
    });
  });

  it('should propagate error from repository', (done) => {
    repositoryMock.getAllCloudProvider.mockReturnValue(throwError(() => new Error('Network error')));

    service.getAllProvider().subscribe({
      next: () => {
        fail('Expected error');
      },
      error: (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Network error');
        done();
      }
    });
  });
});
