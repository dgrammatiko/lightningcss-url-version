import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const defaultOptions = {
  variable: 'v',
  from: undefined,
  skipExternal: true,
  version: function (urlString) {
    let newUrlString = urlString;
    if (this.skipExternal && (newUrlString.startsWith('http') || newUrlString.startsWith('//'))) {
      return `${newUrlString}`;
    }

    if (newUrlString.includes('?')) {
      return `${newUrlString}`;
    }

    if (!this.from) {
      return `${newUrlString}?${this.variable}=${(new Date()).valueOf().toString()}`;
    }

    if (!existsSync(resolve(`${dirname(this.from)}/${newUrlString}`))) {
      return `${newUrlString}?${this.variable}=${(new Date()).valueOf().toString()}`;
    }

    const hash = createHash('md5')
    hash.update(readFileSync(resolve(`${dirname(this.from)}/${newUrlString}`)));

    return `${newUrlString}?${this.variable}=${hash.digest('hex').substring(0, 6)}`;
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
      // Skip inline base64 encoded data
      if (url.url.startsWith('data:')) {
        return url;
      }

      return {...url, ...{ url: options.version(url.url) } };
    }
  }
};
