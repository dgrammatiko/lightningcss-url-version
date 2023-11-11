import { composeVisitors, transform } from 'lightningcss';
import { resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

import urlVersioning from '../index.mjs';

const versionNumber = 123;
const version = `?v=${versionNumber}`;

async function UrlProc(cssBuffer, opts) {
  let options = {
    from: opts.from,
    version: function(urlString) {
      if (urlString.startsWith('http') || urlString.startsWith('//') || urlString.includes('?')) {
        return `${urlString}`;
      }

      if (opts && opts.from && existsSync(resolve(opts.from))) {
        if (!opts.hash)
          return `${urlString}?v=${versionNumber}`;
        else
          return `${urlString}?v=1631026846905`;
      }

      if (opts.nofile) {
        return `${urlString}?v=${versionNumber}`
      }
    }
  }

  const { code } = await transform({
    minify: true,
    code: Buffer.from(cssBuffer),
    visitor: composeVisitors([urlVersioning(options)]),
  });

  return code.toString();
};


const check = (input, output, test) => {
  if (input === output) {
    console.log(`✅ Test ${test} passed`)
    // console.log({input: output})
  } else {
    console.log(`❌ Test ${test} failed`)
    console.log({[input]: output})
  }
}


// Tests based on the use cases from https://developer.mozilla.org/en-US/docs/Web/CSS/url()
(async () => {
  /**
   * Associated properties
   */
  check(
    `body{background-image:url(https://mdn.mozillademos.org/files/16761/star.gif)}`,
    (await UrlProc('body { background-image: url("https://mdn.mozillademos.org/files/16761/star.gif"); }', { from: undefined, nofile: true })),
    'associated properties #1'
  );

  check(
    `body{list-style-image:url(../images/bullet.jpg${version})}`,
    (await UrlProc("body { list-style-image: url('../images/bullet.jpg'); }", { from: 'tests/test.css', nofile: true })),
    'Associated properties #2'
  );

  check(
    `body{content:url(pdficon.jpg${version})}`,
    (await UrlProc('body { content: url("pdficon.jpg"); }', { from: undefined, nofile: true })),
    'Associated properties #3'
  );

  check(
    `body{cursor:url(mycursor.cur${version})}`,
    (await UrlProc('body { cursor: url(mycursor.cur); }', { from: undefined, nofile: true })),
    'Associated properties #4'
  );

  check(
    `body{border-image-source:url(/media/diamonds.png${version})}`,
    (await UrlProc('body { border-image-source: url(/media/diamonds.png); }', { from: undefined, nofile: true })),
    'Associated properties #5'
  );

  check(
    `@font-face{font-family:Open Sans}`,
    (await UrlProc("@font-face { font-family: 'Open Sans'; { src: url('fantasticfont.woff'); } }", { from: undefined, nofile: true })),
    'Associated properties #6'
  );

  check(
    `body{offset-path:url(#path${version})}`,
    (await UrlProc('body { offset-path: url(#path); }', { from: undefined, nofile: true })),
    'Associated properties #7'
  );

  check(
    `body{mask-image:url(masks.svg#mask1${version})}`,
    (await UrlProc('body { mask-image: url("masks.svg#mask1"); }', { from: undefined, nofile: true })),
    'Associated properties #8'
  );

  /**
   * Properties with fallbacks
   */
  check(
    `body{cursor:url(pointer.cur${version}),pointer}`,
    (await UrlProc('body { cursor: url(pointer.cur), pointer; }', { from: undefined, nofile: true })),
    'Properties with fallbacks #9'
  );


  /**
   * Associated short-hand properties
   */
  check(
    `body{background:#00f url(https://mdn.mozillademos.org/files/16761/star.gif) 100% 100% repeat-x}`,
    (await UrlProc('body { background: url("https://mdn.mozillademos.org/files/16761/star.gif") bottom right repeat-x blue; }', { from: undefined, nofile: true })),
    'Associated short-hand properties #10'
  );

  check(
    `body{border-image:url(/media/diamonds.png${version}) 30 fill/30px/30px space}`,
    (await UrlProc('body { border-image: url("/media/diamonds.png") 30 fill / 30px / 30px space; }', { from: undefined, nofile: true })),
    'Associated short-hand properties #11'
  );

  /**
   * As a parameter in another CSS function
   */
  check(
    `body{background-image:cross-fade(20% url(first.png${version}),url(second.png${version}))}`,
    (await UrlProc('body { background-image: cross-fade(20% url(first.png), url(second.png)); }', { from: undefined, nofile: true })),
    'As a parameter in another CSS function #12'
  );

  check(
    `body{mask-image:image(url(mask.png${version}),skyblue,linear-gradient(#000,transparent))}`,
    (await UrlProc('body { mask-image: image(url(mask.png), skyblue, linear-gradient(rgba(0, 0, 0, 1.0), transparent)); }', { from: undefined, nofile: true })),
    'As a parameter in another CSS function #13'
  );

  /**
   * As part of a non-shorthand multiple value
   */
  check(
    `body{content:url(star.svg${version}) url(star.svg${version}) url(star.svg${version}) url(star.svg${version}) url(star.svg${version})}`,
    (await UrlProc('body { content: url(star.svg) url(star.svg) url(star.svg) url(star.svg) url(star.svg); }', { from: undefined, nofile: true })),
    'As part of a non-shorthand multiple value #14'
  );

  /**
   * At-rules
   */
  check(
    `@document url(https://www.example.com/);`,
    (await UrlProc('@document url("https://www.example.com/")', { from: undefined, nofile: true })),
    'At-rules @document SKIPPED #15'
  );

  check(
    `@import "https://www.example.com/style.css";`,
    (await UrlProc('@import url("https://www.example.com/style.css");', { from: undefined, nofile: true })),
    'At-rules #16'
  );

  check(
    `@namespace "http://www.w3.org/1999/xhtml";`,
    (await UrlProc('@namespace url("http://www.w3.org/1999/xhtml")', { from: undefined, nofile: true })),
    'At-rules @namespace: SKIPPED #17'
  );

  /**
   * Associated properties reading a source file
   */
  check(
    `body{list-style-image:url(../images/bullet.jpg?v=1631026846905)}`,
    (await UrlProc(readFileSync('./tests/test.css'), { from: 'tests/test.css', hash: true })),
    'Associated properties with Source File #1'
  );

  check(
    `body{list-style-image:url(../images/bullet.jpg?v=123)}`,
    (await UrlProc(readFileSync('./tests/test.css'), { from: 'tests/test.css' })), //, { from: undefined, nofile: true }
    'Associated properties with Source File #2'
  );

  check(
    `body{list-style-image:url(../images/bullet.jpg?v=123)}`,
    (await UrlProc(readFileSync('./tests/test.css'), { from: './tests/test.css' })), //, { from: undefined, nofile: true }
    'Associated properties with Source File #2'
  );

  /**
   * CSS properties
   */
    check(
      `:root{--tested:url(../images/bullet.jpg${version})}`,
      (await UrlProc(':root { --tested: url("../images/bullet.jpg"); }', { from: 'tests/test.css' })),
      'CSS properties, root #1'
    );

    check(
      `.yay{--tested:url(../images/bullet.jpg${version})}`,
      (await UrlProc('.yay { --tested: url(../images/bullet.jpg); }', { from: 'tests/test.css' })),
      'CSS properties, class #2'
    );

    check(
      `select{--tested:url(../images/bullet.jpg${version})}`,
      (await UrlProc('select { --tested: url(../images/bullet.jpg); }', { from: 'tests/test.css' })),
      'CSS properties, element #3'
    );
})();
