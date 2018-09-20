Yield Rule
======

Lint rule that requires a strict return type for Yield Expressions when result is used for [TSLint](https://github.com/palantir/tslint/).

### Usage

tslint-yield has peer dependencies on TSLint and TypeScript.

To use these lint rule with the default preset, use configuration inheritance via the `extends` keyword.
Here's a sample configuration where `tslint.json` lives adjacent to your `node_modules` folder:

```js
{
  "extends": ["tslint-yield"],
  "rules": {
    // turn on tslint-yield rules here
    "yield": true
  }
}
```

To lint your `.ts` **and** `.tsx` files you can simply run `tslint -c tslint.json 'src/**/*.{ts,tsx}'`.

### Rule

requires a strict return type for Yield Expressions when result is used in cases:
 
#####Property Access Expressions
```ts
//Fail
(yield getData()).result;

//Good
((yield getData()) as ResultType).result;
```
#####Variable Statement
```ts
//Fail
var result = yield getData();

//Good
var result = (yield getData()) as ResultType;
```
#####Binary Expression
```ts
//Fail
var result = null;
result = yield getData();

//Good
var result = null;
result = (yield getData()) as ResultData;
```
```ts
//Fail
var result = { data: null };
result.data = yield getData();

//Good
var result = { data: null };
result.data = (yield getData()) as ResultData;
```
#####Any is not allowed
```ts
//Fail
(yield getData()) as any).result

//Good
((yield getData()) as ResultData).result;
```