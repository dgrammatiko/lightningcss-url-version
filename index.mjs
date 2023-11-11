import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const defaultOptions = {
  variable: 'v',
  from: undefined,
  skipExternal: true,
  version: function (urlString) {
    let newUrlString = urlString;
    if (skipExternal && (newUrlString.startsWith('http') || newUrlString.startsWith('//'))) {
      return `${newUrlString}`;
    }

    if (newUrlString.contains('?')) {
      return `${newUrlString}`;
    }

    if (this.from && existsSync(resolve(this.from))) {
      const hash = createHash('md5')
      hash.update(readFileSync(resolve(this.from)));

      return `${newUrlString}?${this.variable}=${hash.digest('hex')}`;
    }

    return `${newUrlString}?${this.variable}=${(new Date()).valueOf().toString()}`;
  },
};

/**
 * @param {{variable: String, from: String, skipExternal: boolean, version: function}} options - An object with key value pairs to replace in the url
 * @returns {import('lightningcss').Visitor} - A visitor that replaces the url
 */
export default function urlVersioning(opts) {
  const options = { ...defaultOptions, ...opts };
  return {
    /**
     * @param {import('lightningcss').Url} url - The url object to transform
     * @returns {import('lightningcss').Url} - The transformed url object
     */
    Url(url) {
      if (url.url.startsWith('url("data:') || url.url.startsWith('url(\'data:')) {
        return url;
      }

      return {...url, ...{ url: options.version(url.url) } };
    }
  }
};
