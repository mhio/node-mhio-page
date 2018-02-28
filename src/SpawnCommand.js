const debug = require('debug')('dply:page:SpawnCommand')
const Promise = require('bluebird')
const { spawn }= require('child_process')


class SpawnCommand {
  // Run a generic `docker` passing along all args.
  static run( command, args, ){ //options = {} ){
    return new Promise((resolve, reject) => {
      debug('SpawnCommand run command: "%s" %j', command, args)

      let dkr = spawn(command, args)

      let results = {
        errors: [],     // Any errors picked up
        stdout: [],     // stdout
        stdout_buffer: [],     // stdout
        stderr: [],     // stderr
        stderr_buffer: [],     // stderr
        exit_code: null // process.exit code
      }

      dkr.stdout.on('data', (data) => {
        results.stdout_buffer.push(data)
        let str = data.toString()
        str = str.replace(/\r?\n$/, '')  // Due to array
        debug('SpawnCommand %s stdout:', command, str)
        results.stdout = results.stdout.concat( str.split(/\r?\n/) )
      })

      dkr.stderr.on('data', (data) => {
        results.stderr_buffer.push(data)
        let str = data.toString()
        str = str.replace(/\r?\n$/, '')  // Due to array
        debug('SpawnCommand %s stderr:', command, str)
        results.stderr = results.stderr.concat( str.split(/\r?\n/) )
      })

      dkr.on('close', (exit_code) => {
        debug(`SpawnCommand "${command}" finished with ${exit_code}`)
        results.exit_code = exit_code

        if ( exit_code !== 0 ) {
          let err = new Error(`SpawnCommand "${command}" exited with "${exit_code}" for: docker ${args.join(' ')}:\n${results.stderr[0]}`)
          err.results = results
          return reject(err)
        }

        resolve(results)
      })

    })
  }
}

module.exports = { SpawnCommand }
