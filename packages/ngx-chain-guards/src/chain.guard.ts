import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanDeactivate, RouterStateSnapshot } from '@angular/router';

import { chain } from './chain';

/**
 * Chains the defined `data.guards` on the route and waits for each one to fully completes (waits for Observable/promise result) before proceeding to the next.
 * Short circuits the chain and returns the result if a guard returns `false` or an instance of a `UrlTree`.
 * If all guards execute without returning `false` or `UrlTree`, this guard will return `true`.
 *
 * Can be used with `canActivate`, `canActivateChild`, `canDeactivate`.
 *
 * Usage in Route:
 * ```ts
 * {
 *   path: '...',
 *   data: { guards: [SomeGuard1, SomeGuard2, ...] }
 *   canActivate: [ChainGuards],
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ChainGuards implements CanActivate, CanDeactivate<any>, CanActivateChild {
  constructor(private _injector: Injector) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return chain('canActivate', this._injector, route, state);
  }

  canDeactivate(component: any, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return chain('canDeactivate', this._injector, route, state, component);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return chain('canActivateChild', this._injector, route, state);
  }
}
