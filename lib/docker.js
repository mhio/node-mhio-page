const debug = require('debug')('dply:page:docker')
const spawn = require('child_process').spawn
const Promise = require('bluebird')
const {Browser} = require('./browser')


class Docker {



  static run(browser){
    return new Promise((resolve, reject) => {

      let vnc = Browser.vncPort(browser)
      let wd = Browser.wdPort(browser)
      let dkr = spawn('docker', ['run','-d','-p',`${vnc}:5900`,'-p',`${wd}:4444`,`selenium/standalone-${browser}`])

      let results = {
        errors: [],     // Any errors picked up
        stdout: [],     // stdout
        stderr: [],     // stderr
        exit_code: null // process.exit code
      }

      dkr.stdout.on('data', (data) => {
        debug(`docker stdout: `, data.toString().replace(/\n$/,''))
        results.stdout.push(data.toString())
      })

      dkr.stderr.on('data', (data) => {
        debug(`docker stderr: `, data.toString().replace(/\n$/,''))
        results.stderr.push(data.toString())
      })

      dkr.on('close', (exit_code) => {
        debug(`container launched with ${exit_code}`)
        results.exit_code = exit_code
        if ( exit_code !== 0 ) {
          let err = new Error(`Docker exited with "${exit_code}"`)
          err.results = results
          return reject(err)
        }
        resolve(results)
      })

    })
  }

}

module.exports = { Docker }
