# gulp-markuplint

Gulp plugin for [markuplint](https://markuplint.github.io/).

## Install

```sh
$ npm install -D gulp-markuplint markuplint
```

## Example

```js
const gulp = require('gulp')
const { markuplint } = require('gulp-markuplint')

gulp('lint', () => {
  return gulp.src('*.html').pipe(
    markuplint({
      rulesetPath: '/path/to/.markuplintrc'
    })
  )
})
```

## License

MIT
