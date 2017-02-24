const debug = require('debug')('webdriverio-page:docker')
const spawn = require('child_process').spawn
const Promise = require('bluebird')

class Docker {
  
  static browserId(browser){ 
    switch (browser) {
      case 'chrome':  return 5
      case 'firefox': return 6
      case 'phantom': return 7
      case 'ie':      return 8
      case 'safari':  return 9
      default: throw new Error(`Unsupported browser "${browser}"`)
    }
  }

  static run(browser){
    return new Promise((resolve, reject) => {

      let id = this.browserId(browser)
      let vnc = `5900${id}`
      let wd = `4444${id}`
      let dkr = spawn('docker', ['run','-d','-p',`${vnc}:5900`,'-p',`${wd}:4444`,`selenium/standalone-${browser}`])

      let results = {
        errors: [],     // Any errors picked up
        stdout: [],     // stdout
        stderr: [],     // stderr
        exit_code: null // process.exit code
      }

      dkr.stdout.on('data', (data) => {
        debug(`docker stdout: ${data}`)
        results.stdout.push(data)
      })

      dkr.stderr.on('data', (data) => {
        debug(`docker stderr: ${data}`)
        results.stderr.push(data)
      })

      dkr.on('close', (exit_code) => {
        debug(`container launched with ${exit_code}`)
        if ( exit_code !== 0 ) return reject(new Error(`Docker exited with "${exit_code}"`))
        results.exit_code = exit_code
        resolve(results)
      })

    })
  }

}

module.exports = { Docker }
