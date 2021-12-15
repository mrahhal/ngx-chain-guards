import { Injector, ProviderToken } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';

type GuardResult = Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;

export async function chain(
  method: string,
  injector: Injector,
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  component?: any,
): Promise<boolean | UrlTree> {
  const guards: ProviderToken<any>[] = route.data.guards ?? [];

  for (const guard of guards) {
    const guardInstance: any = injector.get(guard);

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
