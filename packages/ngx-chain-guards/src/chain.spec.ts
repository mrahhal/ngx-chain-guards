import { Injectable, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanDeactivate, RouterStateSnapshot } from '@angular/router';

import { chain } from './chain';

/* eslint-disable @typescript-eslint/no-unused-vars */

@Injectable({ providedIn: 'root' })
export class MockGuard implements CanActivate, CanDeactivate<any>, CanActivateChild {
  called = false;
  calledAt = -1;
  calledMethod: string;

  returnResult = true;

  constructor() { }

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
    this.calledAt = route.data.$calledAt;
    this.calledMethod = route.data.$calledMethod;
    return this.returnResult;
  }
}

/* eslint-enable @typescript-eslint/no-unused-vars */

describe('chain', () => {
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    injector = TestBed.inject(Injector);
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
});
