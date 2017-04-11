const debug = require('debug')('dply:page:docker')
const Promise = require('bluebird')
const { spawn }= require('child_process')
const needle = Promise.promisifyAll(require('needle'))
const {Browsers} = require('./browsers')

// Manage the selenium docker containers.
// Should be using an API rather than docker command line

class Docker {

  static init(){
    this.image_prefix = 'selenium/standalone-'
    this.name_prefix = 'dply-selenium-standalone-'
    this.testing = false
    this.containers = {}
  }

  static testingInit(){
    this.image_prefix = 'dply/selenium-standalone-stub:'
    this.name_prefix = 'dply-selenium-standalone-testing-'
    this.testing = true
    this.containers = {}
  }

  // static ip(){
  //   // IP fixture
  //   // Find the first, external, IPv4 address
  //   let ip = _(require('os').networkInterfaces())
  //     .map(o => _.find(o, {internal: false, family: 'IPv4'}))
  //     .compact()
  //     .first()
  //     .address
  //   if (!ip) throw new Error('Couldn\'t find a local IP to connect to')
  // }

  static vncPort( browser ){
    let port = Browsers.vncPort( browser )
    if ( this.testing ) port = parseInt(port) + 10
    return port
  }

  static wdPort( browser ){
    let port = Browsers.wdPort( browser )
    if ( this.testing ) port = parseInt(port) + 10
    return port
  }

  static testPort( browser, retry = 1, retries = 40, delay = 200 ){
    return Promise.try(()=> {
      debug('testPort browser %s - retry %s', browser, retry)
      const wd = this.wdPort( browser )
      return needle.getAsync(`http://127.0.0.1:${wd}/wd/hub/sessions`)
        .then(res => {
          if (res.statusCode !== 200) {
            let err = new Error(`Bad status code for /sessions ${res.statusCode}`)
            err.res = res
            throw err
          }
          return {state: 'running', retry: retry}
        })
        .catch(error => {
          if (retry > retries) throw error
          return Promise.delay(delay)
            .then(()=>this.testPort(browser, retry+1))
        })
    })
  }

  static up( browser ){
    debug('up docker', browser)
    return Docker.check( browser ).then(res => {
      debug('up - check state', res.state)
      switch (res.state) {
        case 'started':
        case 'running':
          return Docker.testPort(browser)

        case 'stopped':
        case 'created':
        case 'exited':
          return Docker.startWait( browser )

        default:
          return Docker.runWait( browser )
      }

    }).catch(err => {
      console.error(err.results)
      throw err
    })
  }

  static down( browser ){
    debug('down docker', browser)
    return Docker.check( browser ).then(res => {

      switch( res.state) {
        case 'stopped':
        case 'created':
        case 'exited':
          return Docker.rm( browser )

        case 'none':
          return res

        case 'started':
        case 'running':
          return Docker.stop( browser )
            .then(()=> Docker.rm(browser) )

        default:
          debug('down Unknown state [%s]. Doing nothing', res.state)
      }

      return res

    }).catch(err => {
      console.error(err.results)
      throw err
    })
  }

  static check( browser ){
    debug('check docker', browser)
    return Docker.command([
      'inspect',
      `${this.name_prefix}${browser}`,
      '-f',
      '{{ (index (index .State.Status )) }}'
    ])
    .then(res => {
      debug('check - results', res)
      return { state: res.stdout[0] }
    })
    .catch(err => {
      if (
        err.results.exit_code === 1 &&
        err.results.stderr &&
        err.results.stderr[0] &&
        err.results.stderr[0].match(/No such object/)
      ) {
        return { state: 'none' }
      }
      throw err
    })
  }

  static stop( browser ){
    return Docker.command([
      'stop',
      `${this.name_prefix}${browser}`
    ])
    .then(()=> ({ state: 'stopped' }))
  }

  static startWait( browser ){
    // Some sort of health check would be more useful
    return Docker.start( browser )
      .then(()=> Docker.testPort(browser) )
      .then(()=> Docker.check( browser ) )
  }

  static start( browser ){
    return Docker.command([
      'start',
      `${this.name_prefix}${browser}`
    ])
    .delay(50)
    .then(()=> ({ state: 'started' }))
  }

  static rm( browser ){
    return Docker.command([
      'rm',
      `${this.name_prefix}${browser}`
    ])
    .then(()=> ({ state: 'none' }))
  }

  static runWait( browser ){
    // Some sort of health check would be more useful
    return Docker.run( browser )
      .then(()=> Docker.testPort(browser) )
      .then(()=> Docker.check( browser ) )
  }

  static run( browser ){
    return new Promise(resolve => {

      let vnc = this.vncPort( browser )
      let wd = this.wdPort( browser )
      let p = Docker.command([
        'run',
        '--name', `${this.name_prefix}${browser}`,
        '--detach',
        '-p', `${vnc}:5900`,
        '-p', `${wd}:4444`,
        `${this.image_prefix}${browser}`
      ])
      .delay(50)
      .then(() => ({ state: 'started' }))

      resolve(p)

    })
  }

  static command(args){
    return new Promise((resolve, reject) => {
      debug('running docker command - %j', args)

      let dkr = spawn('docker', args)

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
        str = str.replace(/\n$/, '')
        debug(`docker stdout: `, str)
        results.stdout = results.stdout.concat( str.split('\n') )
      })

      dkr.stderr.on('data', (data) => {
        results.stderr_buffer.push(data)
        let str = data.toString()
        str = str.replace(/\n$/, '')
        debug(`docker stderr: `, str)
        results.stderr = results.stderr.concat( str.split('\n') )
      })

      dkr.on('close', (exit_code) => {
        debug(`command finished with ${exit_code}`)
        results.exit_code = exit_code
        if ( exit_code !== 0 ) {
          let err = new Error(`Docker exited with "${exit_code}" - ${args.join(' ')}`)
          err.results = results
          return reject(err)
        }
        resolve(results)
      })

    })
  }

}

Docker.init()

module.exports = { Docker }
