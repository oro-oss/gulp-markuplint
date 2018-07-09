import { Readable, Writable } from 'stream'
import * as path from 'path'
import * as Vinyl from 'vinyl'
import { markuplint } from '../src/index'

describe('gulp-markuplint', () => {
  it('do not output if lint is passed', done => {
    const spy = jest.fn()
    src('<input type="text">')
      .pipe(
        markuplint({
          rulesetPath: resolve('config/attr-value-quotes'),
          __debug__: {
            stdout: mockWritable(spy)
          }
        })
      )
      .pipe(
        finialize(() => {
          expect(spy).not.toHaveBeenCalled()
          done()
        })
      )
  })

  it('will not emit error when there is a report', done => {
    src('<input type=text>')
      .pipe(
        markuplint({
          rulesetPath: resolve('config/attr-value-quotes'),
          __debug__: {
            stdout: mockWritable(jest.fn())
          }
        })
      )
      .pipe(
        finialize(err => {
          expect(err).toBe(undefined)
          done()
        })
      )
  })

  it('produces an error report', done => {
    const spy = jest.fn()
    src('<input type=text>')
      .pipe(
        markuplint({
          rulesetPath: resolve('config/attr-value-quotes'),
          __debug__: {
            stdout: mockWritable(spy)
          }
        })
      )
      .pipe(
        finialize(() => {
          expect(spy.mock.calls[0][0]).toMatch(/attr-value-quotes/)
          done()
        })
      )
  })
})

function resolve(_path: string): string {
  return path.resolve(__dirname, _path)
}

function mockWritable(cb: (chunk: string) => void): NodeJS.WriteStream {
  return new Writable({
    write(chunk, _encoding, done) {
      cb(String(chunk))
      done(null)
    }
  }) as any
}

function src(html: string): Readable {
  return new Readable({
    objectMode: true,
    read() {
      this.push(
        new Vinyl({
          cwd: process.cwd(),
          path: path.resolve(__dirname, 'test.html'),
          contents: Buffer.from(html)
        })
      )
      this.push(null)
    }
  })
}

function finialize(done: (error?: Error) => void): Writable {
  const w = new Writable({
    objectMode: true,
    write(_, __, cb) {
      cb(null)
    }
  })

  w.on('error', done)
  w.on('finish', done)
  return w
}
