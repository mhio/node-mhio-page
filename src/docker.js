const debug = require('debug')('mhio:page:docker')
const Promise = require('bluebird')
const needle = require('needle')

const {Browsers} = require('./browsers')
const {DockerManage} = require('./DockerManage')

// Manage the selenium docker containers.
// Should be using an API rather than docker command line

class Docker {

  static init(){
    this.image_prefix = 'selenium/standalone-'
    this.name_prefix = 'mhio-selenium-standalone-'
    this.testing = false
    this.containers = {}
  }

  static testingInit(){
    this.image_prefix = 'mhio/selenium-standalone-stub:'
    this.name_prefix = 'mhio-selenium-standalone-testing-'
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
      return needle('get', `http://127.0.0.1:${wd}/wd/hub/sessions`)
        .then(res => {
          if (res.statusCode !== 200) {
            let err = new Error(`Bad status code for /sessions ${res.statusCode}`)
            err.res = res
            throw err
          }
          return { state: 'running', retry: retry }
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
        //case 'started':  // module
        case 'running':  // docker
          return Docker.testPort(browser)

        //case 'stopped':  // module
        case 'created':  // docker
        case 'exited':   // docker
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
        //case 'stopped': // module
        case 'created': // docker
        case 'exited': // docker
          return Docker.rm( browser )

        case 'none':
          return res

        //case 'started':
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


  // Docker states
  // https://github.com/moby/moby/blob/66e6beeb249948634e2815ef5cac97984d5c0d56/container/state.go#L114-L138

  // "paused" implies running
  // "restarting" implies running
  // "removing"
  // "dead"
  // "created"
  // "exited"

  static check( browser ){
    debug('check docker', browser)
    return DockerManage.command([
      'inspect',
      `${this.name_prefix}${browser}`,
      '--format',
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
        /No such (object|container)/.exec(err.results.stderr[0])
      ) {
        return { state: 'none', via: 'check' }
      }
      throw err
    })
  }

  static stop( browser ){
    return DockerManage.command([
      'stop',
      `${this.name_prefix}${browser}`
    ])
    .then(()=> ({ state: 'exited', via: 'stop' }))
  }

  static startWait( browser ){
    // Some sort of health check would be more useful
    return Docker.start(browser)
      .then(()=> Docker.testPort(browser) )
  }

  static start( browser ){
    return DockerManage.command([
      'start',
      `${this.name_prefix}${browser}`
    ])
    .then(()=> Promise.delay(40))
    .then(()=> ({ state: 'running', via: 'start' }))
  }

  static rm( browser ){
    return DockerManage.command([
      'rm',
      `${this.name_prefix}${browser}`
    ])
    .then(()=> ({ state: 'none', via: 'rm' }))
  }

  static rmf( browser ){
    return DockerManage.command([
      'rm',
      '-f',
      `${this.name_prefix}${browser}`
    ])
    .then(()=> ({ state: 'none' }))
    .catch(err => {
      if (err.results) {
        let res = err.results
        if ( res.exit_code === 1 && res.stderr.some(line => /No such container: /.exec(line)) ){
          return { state: 'none', via: 'rmf' }
        }
      }
      throw err
    })
  }

  static runWait( browser ){
    // Some sort of health check would be more useful
    return Docker.run(browser)
      .then(()=> Docker.testPort(browser) )
  }

  static run( browser ){
    return new Promise(resolve => {

      let vnc = this.vncPort( browser )
      let wd = this.wdPort( browser )
      let p = DockerManage.command([
        'run',
        '--name', `${this.name_prefix}${browser}`,
        '--detach',
        '-p', `${vnc}:5900`,
        '-p', `${wd}:4444`,
        `${this.image_prefix}${browser}`
      ])
      .then(() => Promise.delay(40))
      .then(() => ({ state: 'running', via: 'run' }))

      resolve(p)

    })
  }



}

Docker.init()

module.exports = { Docker }
