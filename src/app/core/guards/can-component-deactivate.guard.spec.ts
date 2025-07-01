// can-deactivate.guard.spec.ts
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { canDeactivateGuard, CanComponentDeactivate } from './can-component-deactivate.guard';

describe('canDeactivateGuard', () => {
  // dummy snapshots to satisfy function signature
  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {} as RouterStateSnapshot;
  const dummyNextState = {} as RouterStateSnapshot;

  it('should return true if component has no canDeactivate method', () => {
    const result = canDeactivateGuard({} as CanComponentDeactivate, dummyRoute, dummyState, dummyNextState);
    expect(result).toBe(true);
  });

  it('should return synchronous boolean from canDeactivate()', () => {
    const component: CanComponentDeactivate = {
      canDeactivate: () => false
    };
    const resultFalse = canDeactivateGuard(component, dummyRoute, dummyState, dummyNextState);
    expect(resultFalse).toBe(false);

    component.canDeactivate = () => true;
    const resultTrue = canDeactivateGuard(component, dummyRoute, dummyState, dummyNextState);
    expect(resultTrue).toBe(true);
  });

  it('should return a UrlTree from canDeactivate()', () => {
    const tree = new UrlTree();
    const component: CanComponentDeactivate = {
      canDeactivate: () => tree
    };
    const result = canDeactivateGuard(component, dummyRoute, dummyState, dummyNextState);
    expect(result).toBe(tree);
  });

  it('should return a Promise<boolean> from canDeactivate()', async () => {
    const component: CanComponentDeactivate = {
      canDeactivate: () => Promise.resolve(true)
    };
    await expect(
      canDeactivateGuard(component, dummyRoute, dummyState, dummyNextState) as Promise<boolean>
    ).resolves.toBe(true);
  });

  it('should return a Promise<UrlTree> from canDeactivate()', async () => {
    const tree = new UrlTree();
    const component: CanComponentDeactivate = {
      canDeactivate: () => Promise.resolve(tree)
    };
    await expect(
      canDeactivateGuard(component, dummyRoute, dummyState, dummyNextState) as Promise<UrlTree>
    ).resolves.toBe(tree);
  });

  it('should return an Observable<boolean> from canDeactivate()', done => {
    const component: CanComponentDeactivate = {
      canDeactivate: () => of(false)
    };
    const result$ = canDeactivateGuard(component, dummyRoute, dummyState, dummyNextState);
    // Check for observable by presence of subscribe
    if (result$ && typeof (result$ as any).subscribe === 'function') {
      (result$ as any).subscribe((value: any) => {
        expect(value).toBe(false);
        done();
      });
    } else {
      fail('Expected an Observable');
    }
  });

  it('should return an Observable<UrlTree> from canDeactivate()', done => {
    const tree = new UrlTree();
    const component: CanComponentDeactivate = {
      canDeactivate: () => of(tree)
    };
    const result$ = canDeactivateGuard(component, dummyRoute, dummyState, dummyNextState);
    if (result$ && typeof (result$ as any).subscribe === 'function') {
      (result$ as any).subscribe((value: any)  => {
        expect(value).toBe(tree);
        done();
      });
    } else {
      fail('Expected an Observable');
    }
  });
});
