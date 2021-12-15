import { TestBed } from '@angular/core/testing';

import { ChainGuards } from './chain.guard';

describe('ChainGuards', () => {
  let guard: ChainGuards;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ChainGuards);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
