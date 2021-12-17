# ngx-chain-guards

[![CI](https://github.com/mrahhal/ngx-chain-guards/actions/workflows/ci.yml/badge.svg)](https://github.com/mrahhal/ngx-chain-guards/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/ngx-chain-guards.svg)](https://www.npmjs.com/package/ngx-chain-guards)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.txt)

An angular guard that chains other guards, waiting for each one to complete before proceeding to the next.

Can be used with `canActivate`, `canActivateChild`, `canDeactivate`.

## Usage

```ts
import { ChainGuards } from 'ngx-chain-guards';

// In the route config:
{
  path: '...',
  data: {
    // The guards you want to chain:
    guards: [SomeGuard1, SomeGuard2, ...]
  },
  canActivate: [ChainGuards],
  // or
  // canDeactivate: [ChainGuards],
  // canActivateChild: [ChainGuards],
}
```

If you have different guards you want to chain for different methods:

```ts
import { ChainGuards } from 'ngx-chain-guards';

// In the route config:
{
  path: '...',
  data: {
    canActivateGuards: [SomeGuard1, SomeGuard2, ...],
    canDeactivateGuards: [AnotherGuard, ...]
  },
  canActivate: [ChainGuards],
  canDeactivate: [ChainGuards],
}
```

Note that you can still specify a `guards` array in the above snippet, in which case these will be considered common for all methods, and will be inserted at 0 in the chain before the specific guards.
