[![npm version](https://badge.fury.io/js/%40servicetitan%2Ftslint-yield.svg)](https://badge.fury.io/js/%40servicetitan%2Ftslint-yield)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Build Status](https://travis-ci.org/servicetitan/tslint-yield.svg?branch=master)](https://travis-ci.org/servicetitan/tslint-yield)
[![Coverage Status](https://coveralls.io/repos/github/servicetitan/tslint-yield/badge.svg?branch=master)](https://coveralls.io/github/servicetitan/tslint-yield?branch=master)

Yield Rule
======

Lint rule that requires a strict return type for Yield Expressions when result is used for [TSLint](https://github.com/palantir/tslint/).


### Usage

tslint-yield has peer dependencies on TSLint and TypeScript.

To use these lint rule with the default preset, use configuration inheritance via the `extends` keyword.
Here's a sample configuration where `tslint.json` lives adjacent to your `node_modules` folder:

```js
{
  "extends": ["@servicetitan/tslint-yield"],
  "rules": {
    // turn on tslint-yield rule here
    "yield": true
  }
}
```

To lint your `.ts` **and** `.tsx` files you can simply run `tslint -c tslint.json 'src/**/*.{ts,tsx}'`.

### Rule

requires a strict return type for Yield Expressions when result is used in cases:
 
##### Property Access Expressions
```ts
//Fail
(yield getData()).result;

//Good
((yield getData()) as ResultType).result;
```
##### Variable Statement
```ts
//Fail
var result = yield getData();

//Good
var result = (yield getData()) as ResultType;
```
##### Binary Expression
```ts
//Fail
var result = null;
result = yield getData();

//Good
var result = null;
result = (yield getData()) as ResultType;
```
```ts
//Fail
var result = { data: null };
result.data = yield getData();

//Good
var result = { data: null };
result.data = (yield getData()) as ResultType;
```
##### Any is not allowed
```ts
//Fail
(yield getData()) as any).result

//Good
((yield getData()) as ResultType).result;
```
##### Yield Type and casting type should be equal
```ts
const getData = () => new Promise<number>(() => {});

//Fail - string !== number
(yield getData()) as string).result

//Good
((yield getData()) as number).result;
```