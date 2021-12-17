import { Injectable, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { of } from 'rxjs';

import { chain } from './chain';

let offsetCounter = 0;

/* eslint-disable @typescript-eslint/no-unused-vars */

@Injectable({ providedIn: 'root' })
export class MockGuard implements CanActivate, CanDeactivate<any>, CanActivateChild {
  called = false;
  calledAt = -1;
  calledMethod: string;

  returnResult: any = true;

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.setCalled(route);
  }

  canDeactivate(component: any, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.setCalled(route);
  }

  async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.setCalled(route);
  }

  private setCalled(route: ActivatedRouteSnapshot) {
    this.called = true;
    this.calledAt = offsetCounter++;
    return this.returnResult;
  }
}

/* eslint-enable @typescript-eslint/no-unused-vars */

function mockGuard(result: any) {
  const guard = new MockGuard();
  guard.returnResult = result;
  return guard;
}

describe('chain', () => {
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({ teardown: { destroyAfterEach: true } });
    injector = TestBed.inject(Injector);
    offsetCounter = 0;
  });

  it('should return true and warn when no guards are configured', async () => {
    const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();

    let result = await chain('canActivate', injector, {}, null, null);
    expect(result).toBeTruthy();
    expect(console.warn).toBeCalled();

    consoleWarnMock.mockClear();

    result = await chain('canActivate', injector, { data: {} }, null, null);
    expect(result).toBeTruthy();
    expect(console.warn).toBeCalled();

    consoleWarnMock.mockRestore();
  });

  it('should work with shared guards', async () => {
    const mockGuard0 = mockGuard(true);
    const data = { guards: [mockGuard0] };
    const result = await chain('canActivate', injector, { data }, null, null);
    expect(result).toBeTruthy();
    expect(mockGuard0.called).toBeTruthy();
  });

  it('should work with specific guards', async () => {
    const mockGuard0 = mockGuard(true);
    const data = { canActivateGuards: [mockGuard0] };
    const result = await chain('canActivate', injector, { data }, null, null);
    expect(result).toBeTruthy();
    expect(mockGuard0.called).toBeTruthy();
  });

  it('should work with mixed guards', async () => {
    const mockGuard0 = mockGuard(true);
    const mockGuard1 = mockGuard(true);
    const data = { guards: [mockGuard0], canActivateGuards: [mockGuard1] };
    const result = await chain('canActivate', injector, { data }, null, null);
    expect(result).toBeTruthy();
    expect(mockGuard0.called).toBeTruthy();
    expect(mockGuard0.calledAt).toBe(0);
    expect(mockGuard1.called).toBeTruthy();
    expect(mockGuard1.calledAt).toBe(1);
  });

  it('should not call unrelated specific guards', async () => {
    const mockGuard0 = mockGuard(true);
    const mockGuard1 = mockGuard(true);
    const data = { guards: [mockGuard0], canDeactivateGuards: [mockGuard1] };
    const result = await chain('canActivate', injector, { data }, null, null);
    expect(result).toBeTruthy();
    expect(mockGuard1.called).toBeFalsy();
  });

  it('should short circuit', async () => {
    const mockGuard0 = mockGuard(false);
    const mockGuard1 = mockGuard(true);
    const data = { guards: [mockGuard0, mockGuard1] };
    const result = await chain('canActivate', injector, { data }, null, null);
    expect(result).toBeFalsy();
    expect(mockGuard0.called).toBeTruthy();
    expect(mockGuard1.called).toBeFalsy();
  });

  async function shouldChainGuardsAndReturnTrue(returnResult: any) {
    const mockGuard0 = mockGuard(returnResult);
    const mockGuard1 = mockGuard(returnResult);
    const data = { guards: [mockGuard0, mockGuard1] };
    const result = await chain('canActivate', injector, { data }, null, null);
    expect(result).toBeTruthy();
    expect(mockGuard0.called).toBeTruthy();
    expect(mockGuard0.calledAt).toBe(0);
    expect(mockGuard1.called).toBeTruthy();
    expect(mockGuard1.calledAt).toBe(1);
  }

  it('should chain guards and return true', () =>
    shouldChainGuardsAndReturnTrue(true));

  it('should chain guards and return true (promise)', () =>
    shouldChainGuardsAndReturnTrue(Promise.resolve(true)));

  it('should chain guards and return true (observable)', () =>
    shouldChainGuardsAndReturnTrue(of(true)));

  async function shouldChainGuardsAndReturnUrlTree(returnResult: any) {
    const mockGuard0 = mockGuard(true);
    const mockGuard1 = mockGuard(returnResult);
    const data = { guards: [mockGuard0, mockGuard1] };
    const result = await chain('canActivate', injector, { data }, null, null);
    expect(result).toBeInstanceOf(UrlTree);
    expect(mockGuard0.called).toBeTruthy();
    expect(mockGuard0.calledAt).toBe(0);
    expect(mockGuard1.called).toBeTruthy();
    expect(mockGuard1.calledAt).toBe(1);
  }

  it('should chain guards and return url tree', () =>
    shouldChainGuardsAndReturnUrlTree(new UrlTree()));

  it('should chain guards and return url tree (promise)', () =>
    shouldChainGuardsAndReturnUrlTree(Promise.resolve(new UrlTree())));

  it('should chain guards and return url tree (observable)', () =>
    shouldChainGuardsAndReturnUrlTree(of(new UrlTree())));
});
