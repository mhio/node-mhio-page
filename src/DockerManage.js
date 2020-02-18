const debug = require('debug')('mhio:page:DockerManage')
const Promise = require('bluebird')
const needle = require('needle')

const { Spawn } = require('@mhio/spawn')


/**
 * Manage the selenium docker containers.
 * Should be using an API rather than docker command line
 */
class DockerManage {

  static classInit(){}

  /**
   * Run a generic `docker` passing along all args.
   * @param {array} args              - `docker` argv array
   */
  static command(args){
    return Spawn.run([ 'docker', ...args ])
  }

  /**
   * Test a TCP host/port for response
   * @param {string} host             - Host or IP to test
   * @param {number} port             - TCP Port number to test
   * @param {number} [retries=10]     - Number of retries
   * @param {number} [delay=200]      - Delay between retries in milliseconds
   * @param {number} [retry=1]        - Current retry count
   */
  static testTcp( host, port, retries = 10, delay = 200, retry = 1 ){
    return new Promise((resolve, reject)=> {
      debug('testTcp %s - retry %s', port, retry)
      let client = require('net').Socket()

      client.connect(port, host, function(){
        debug('connected', host, port)
        setTimeout(()=> client.destroy(), 15)
        resolve({ state: 'running', retry: retry })
      })

      client.on('close', function() {
        debug('socket closed', host, port)
        //client.destroy()
      })

      client.on('error', function(err){
        debug('testTCP got error', host, port, err)
        reject(err)
      })
    })
    .catch(error => {
      if (retry > retries) throw error
      return Promise.delay(delay)
        .then(()=> this.testTcp(host, port, retries, delay, retry+1))
    })
  }

  /**
   * Test a HTTP(S) URL for response
   * @param {string} url              - URL to test 
   * @param {number} [retries=10]     - Number of retries
   * @param {number} [delay=200]      - Delay between retries in milliseconds
   * @param {number} [retry=1]        - Current retry count
   */
  static testHttp( url, retries = 10, delay = 200, retry = 1 ){
    return Promise.try(()=> {
      debug('testHttp %s - retry %s', url, retry)
      return needle('get', url)
        .then(res => {
          if (res.statusCode !== 200) {
            let err = new Error(`Bad status code for "${url}" ${res.statusCode}`)
            err.res = res
            throw err
          }
          return { state: 'running', retry: retry }
        })
        .catch(error => {
          if (retry > retries) throw error
          return Promise.delay(delay)
            .then(()=>this.testHttp(url, retries, delay, retry+1))
        })
    })
  }

  /**
   * Bring up a docker container
   * @param {string} image_name         - Container image name
   * @param {string} container_name     - Name of the container to run
   * @param {object} options            - Options passed to `Docker#run`
   */
  static up( image_name, container_name, options = {} ){
    debug('up docker', container_name)
    return DockerManage.check( container_name ).then(res => {
      debug('up - check state', res.state)
      switch (res.state) {
        case 'running':  // docker
          return res

        case 'created':  // docker
        case 'exited':   // docker
          return DockerManage.start( container_name )

        default:
          options.name = container_name
          return DockerManage.run( image_name, options )
      }

    }).catch(err => {
      debug('DockerManage "up" error:', image_name, container_name, options, err)
      throw err
    })
  }

  /**
   * Bring down a running docker container
   * @param {string} container_name   - Name of the container to stop
   */
  static down( container_name ){
    debug('down docker', container_name)
    return DockerManage.check( container_name ).then(res => {

      let err
      switch( res.state) {
        case 'created': // docker
        case 'exited': // docker
          return DockerManage.rm( container_name )

        case 'none':
          return res

        case 'running':
          return DockerManage.stop( container_name )
            .then(()=> DockerManage.rm(container_name) )

        default:
          debug('down Unknown state [%s]. Doing nothing', res.state)
          err = new Error(`DockerManage Container "${container_name}" is in an unknown state "${res.state}"`)
          err.results = res
          throw err
      }

    }).catch(err => {
      debug('DockerManage "down" error:', container_name, err)
      throw err
    })
  }


  // 
  // 

  // 
  // 
  // 
  // 
  // 
  // 

  /** 
   * Check the state of a container
   * Docker states:
   * https://github.com/moby/moby/blob/66e6beeb249948634e2815ef5cac97984d5c0d56/container/state.go#L114-L138
   * `paused` implies running
   * `restarting` implies running
   * `removing`
   * `dead`
   * `created`
   * `exited`
   * @param {string} container_name   - Container name to check
   */
  static check( container_name ){
    debug('check docker', container_name)
    return DockerManage.command([
      'inspect',
      `${container_name}`,
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
        err.results.stderr[0].match(/No such (object|container)/)
      ) {
        return { state: 'none', via: 'check' }
      }
      throw err
    })
  }


  /**
   * Stop a container
   * @param {string} container_name     - Container name to check
   * @returns {object}                  - 
   */
  static stop( container_name ){
    return DockerManage.command([
      'stop',
      `${container_name}`,
    ])
    .then(()=> ({ state: 'exited', via: 'stop' }))
  }

  /**
   * Nicely stop a container
   * @param {string} container_name     - Container name
   */
  static stopNice( container_name ){
    return DockerManage.command([
      'stop',
      `${container_name}`,
    ])
    .catch(()=> ({}))
    .then(()=> ({ state: 'exited', via: 'stop' }))
  }

  /**
   * Start a container and wait for a TCP port
   * @param {string} container_name       - Container name
   * @param {string} host                 - Host name or IP to check
   * @param {number|string} port          - TCP port to wit on
   * @param {number} retries              - Number of retries
   * @param {number} delay                - Delay between retries in milliseconds
   */
  static startWaitTcp( container_name, host, port, retries, delay ){
    // Some sort of health check would be more useful
    return DockerManage.start(container_name)
      .then(()=> DockerManage.testTcp(host, port, retries, delay))
  }

  /**
   * Start a container and wait for a URL to respond
   * @param {string} container_name       - Container name
   * @param {string} url                  - URL to check
   * @param {number} retries              - Number of retries
   * @param {number} delay                - Delay between retries in milliseconds
   */
  static startWaitHttp( container_name, url, retries, delay ){
    // Some sort of health check would be more useful
    return DockerManage.start(container_name)
      .then(()=> DockerManage.testHttp(url, retries, delay))
  }


  /**
   * Start a container
   * @param {string} container_name       - Container name
   */
  static start( container_name ){
    return DockerManage.command([
      'start',
      `${container_name}`
    ])
    .then(()=> Promise.delay(40))
    .then(()=> ({ state: 'running', via: 'start' }))
  }

  /**
   * Remove a container
   * @param {string} container_name       - Container name
   */
  static rm( container_name ){
    return DockerManage.command([
      'rm',
      `${container_name}`
    ])
    .then(()=> ({ state: 'none', via: 'rm' }))
  }

  /**
   * Forcibly removes a container
   * @param {string} container_name       - Container name
   */
  static rmf( container_name ){
    return DockerManage.command([
      'rm',
      '-f',
      `${container_name}`
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

  /**
   * Run a container and wait for TCP port
   * @param {string} container_name       - Container name
   * @param {Object} options              - 
   * @param {string} host                 - Hostname or IP
   * @param {string|number} port          - TCP Port
   */
  static runWaitTcp( container_image, options, host, port ){
    // Some sort of health check would be more useful
    return DockerManage.run(container_image, options)
      .then(()=> DockerManage.testTcp(host, port) )
  }

  /**
   * Run a container and wait for HTTP URL
   * @param {string} container_name       - Container name
   * @param {Object} options              - 
   * @param {string} url                  - HTTP(S) URL to check
   */
  static runWaitHttp( container_image, options, url ){
    // Some sort of health check would be more useful
    return DockerManage.run(container_image, options)
      .then(()=> DockerManage.testHttp(url) )
  }


  /**
   * Run a container, with command line options
   * @param {string} image                - Image name
   * @param {Object} options              - Object of command line args
   * @returns {Object}                    - Status
   */
  static run( image, options = {} ){
    return new Promise(resolve => {

      let command_opts = [ 'run' ]
      options['d'] = null

      Object.keys(options).forEach(option => {
        let opt_prefix = (option.length > 1 ) ? '--' : '-'
        command_opts.push(`${opt_prefix}${option}`)
        if ( options[option] !== undefined && options[option] !== null ) {
          command_opts.push(options[option])
        }
      })
      command_opts.push(image)

      let p = DockerManage
        .command(command_opts)
        .then(() => Promise.delay(40)) // allow a process in the continer to achieve something
        .then(() => ({ state: 'running', via: 'run' }))

      resolve(p)

    })
  }

}

DockerManage.classInit()

module.exports = { DockerManage }
