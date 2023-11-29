# lightningcss-url-version

[![GitHub issues](https://img.shields.io/github/issues/dgrammatiko/lightningcss-url-version)](https://github.com/dgrammatiko/lightningcss-url-version/issues)
[![GitHub license](https://img.shields.io/github/license/dgrammatiko/lightningcss-url-version)](https://github.com/dgrammatiko/lightningcss-url-version/blob/main/LICENSE)

[![Twitter](https://img.shields.io/twitter/url?url=https%3A%2F%2Ftwitter.com%2Fdgrammatiko)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fdgrammatiko%2Flightningcss-url-version)


lightningcss-url-version is a simple lightningcss plugin that adds a hash on every `url` property.

### Usage
install it:
```bash
npm i -D @dgrammatiko/lightningcss-plugin-url-version
```
Include it in your scripts:
```js
import UrlVersion from '@dgrammatiko/lightningcss-plugin-url-version';
```

Use as any other lightningcss plugin:
```js
const { code } = transform({
 minify: true,
 code: Buffer.from('...'),
 visitor: composeVisitors([urlVersioning({ from: 'the/path/to/the/current/file.css'})]),
});

```

## Options
There are 4 options, `version` and `variable`, `skipExternal` and `from`:
- `version`: a function that returns a string for the hash (NOT an arrow function!)
- `variable`: could be a a string denoting the URLparam that will be used for the version
- `skipExternal`: skip URLS from an external domain
- `from`: the path to the current css file

eg:

```js
import UrlVersion from 'lightningcss-plugin-url-version';

const { code } = transform({
 minify: true,
 code: Buffer.from('...'),
 visitor: composeVisitors([urlVersioning(opts)]),
});


// Will produce something like url(files/16761/star.gif?v=1614866396902);
```

License MIT
