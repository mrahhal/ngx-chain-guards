import { Injector, ProviderToken } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';

type GuardResult = Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;

/**
 * Chains the route configured guards, calling them after each other, waiting for each one before calling the next.
 * @param method The method on the guard to call.
 * @param injector The angular injector.
 * @param route The snapshot of the activated route.
 * @param state The snapshot of the router state.
 * @param component The component this guard is acting on. Required when the method is canDeactivate.
 * @returns The result of the first guard that returns `false` or an instance of a `UrlTree`, otherwise `true`.
 */
export async function chain(
  method: 'canActivate' | 'canDeactivate' | 'canActivateChild',
  injector: Injector,
  route: Partial<ActivatedRouteSnapshot>,
  state: RouterStateSnapshot,
  component?: any,
): Promise<boolean | UrlTree> {
  const guards: ProviderToken<any>[] = route.data?.guards ?? [];
  const specificGuardsKey = `${method}Guards`;
  guards.push(...(route.data?.[specificGuardsKey] ?? []));

  if (!guards.length) {
    console.warn(`You specified ChainGuards in route '${route.routeConfig?.path}' but couldn't find configured guards to chain.`);
    return true;
  }

  for (const guard of guards) {
    // To support tests providing out instances.
    const guardInstance: any = typeof guard == 'function' ? injector.get(guard) : guard;

    let result: GuardResult = component == undefined ?
      await guardInstance[method](route, state) :
      await guardInstance[method](component, route, state);

    if (result instanceof Observable) {
      result = await firstValueFrom(result);
    } else {
      // Could be a promise.
      result = await Promise.resolve(result);
    }

    // From here on, promise will be of type `boolean | UrlTree`.
    if (result === false || result instanceof UrlTree) {
      // Short circuit the chain and return the result.
      return result;
    }
  }

  return true;
}
