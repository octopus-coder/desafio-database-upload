

```
yarn test
yarn run v1.22.4
$ cross-env NODE_ENV=test jest
 PASS  src/__tests__/Transaction.spec.ts
  Transaction
    ✓ should be able to list transactions (112ms)
    ✓ should be able to create new transaction (25ms)
    ✓ should create tags when inserting new transactions (29ms)
    ✓ should not create tags when they already exists (25ms)
    ✓ should not be able to create outcome transaction without a valid balance (30ms)
    ✓ should be able to delete a transaction (35ms)
    ✓ should be able to import transactions (95ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        2.792s, estimated 5s
Ran all test suites.
✨  Done in 4.30s.
```
