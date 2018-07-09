import { spawn } from 'child_process'
import * as through from 'through2'
import { Transform, Readable } from 'stream'
import * as Vinyl from 'vinyl'

export interface GulpMarkuplintOptions {
  rulesetPath?: string | null
  __debug__?: {
    stdout?: NodeJS.WriteStream
  }
}

type NormalizedOptions = Required<GulpMarkuplintOptions>

const defaultOptions: NormalizedOptions = {
  rulesetPath: null,
  __debug__: {}
}

export function markuplint(_options: GulpMarkuplintOptions = {}): Transform {
  const options = Object.assign({}, defaultOptions, _options)

  return through.obj(function(file: Vinyl, encoding, cb) {
    if (file.isBuffer()) {
      spawnMarkuplint(file.contents.toString(), encoding, options, () => {
        cb(null, file)
      })
      return
    }

    cb(null, file)
  })
}

function spawnMarkuplint(
  html: string,
  encoding: string,
  options: NormalizedOptions,
  done: (error: Error | undefined) => void
): void {
  const input = new Readable({
    read() {
      this.push(html, encoding)
      this.push(null)
    }
  })

  const stdout = options.__debug__.stdout || process.stdout

  const command = ['markuplint']
  if (options.rulesetPath) {
    command.push('--ruleset', options.rulesetPath)
  }

  const child = spawn('npx', command, {
    shell: true,
    stdio: 'pipe'
  })

  input.pipe(child.stdin)
  child.stdout.pipe(stdout)
  child.stderr.pipe(process.stderr)

  child.on('error', done)
  child.on('exit', done)
}
