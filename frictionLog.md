# stargate-kiva Friction Log

## 500 error
During testing, one test failed with a 500 HTTP error code:
```
one test failed for me with a 500 HTTP error code:
3 passing (10s)
  1 failing
  1) A collection of Stargate integration validations.
       should put/replace a loan for loanId:
      AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
500 !== 200
      + expected - actual
      -500
      +200
      at Context.<anonymous> (stargate.test.js:45:12)
      at processTicksAndRejections (internal/process/task_queues.js:93:5)
```

## Database automatically parked
While developing the application, the Astra database was parked and doesn't allow queries. This required the team to unpark and wait to move forward with its work.

## Expiring tokens
While developing the app, the team encountered some 401 errors. This seemed to be due to the token expiring during development. Users need to know how long the token is valid when they generate the original token.
