const debug = require('debug')('mhio:page:DockerManage')
const Promise = require('bluebird')
const needle = require('needle')

const { Spawn } = require('@mhio/spawn')

// Manage the selenium docker containers.
// Should be using an API rather than docker command line


class DockerManage {

  static classInit(){}

  // Run a generic `docker` passing along all args.
  static command(args){
    return Spawn.run([ 'docker', ...args ])
  }

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

  static down( container_name ){
    debug('down docker', container_name)
    return DockerManage.check( container_name ).then(res => {

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
          let err = new Error(`DockerManage Container "${container_name}" is in an unknown state "${res.state}"`)
          err.results = res
          throw err
      }

    }).catch(err => {
      debug('DockerManage "down" error:', container_name, err)
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


  static stop( container_name ){
    return DockerManage.command([
      'stop',
      `${container_name}`
    ])
    .then(()=> ({ state: 'exited', via: 'stop' }))
  }

  static stopNice( container_name ){
    return DockerManage.command([
      'stop',
      `${container_name}`
    ])
    .catch(()=> ({}))
    .then(()=> ({ state: 'exited', via: 'stop' }))
  }


  static startWaitTcp( container_name, host, port, retries, delay ){
    // Some sort of health check would be more useful
    return DockerManage.start(container_name)
      .then(()=> DockerManage.testTcp(host, port, retries, delay))
  }

  static startWaitHttp( container_name, url, retries, delay ){
    // Some sort of health check would be more useful
    return DockerManage.start(container_name)
      .then(()=> DockerManage.testHttp(url, retries, delay))
  }


  static start( container_name ){
    return DockerManage.command([
      'start',
      `${container_name}`
    ])
    .then(()=> Promise.delay(40))
    .then(()=> ({ state: 'running', via: 'start' }))
  }

  static rm( container_name ){
    return DockerManage.command([
      'rm',
      `${container_name}`
    ])
    .then(()=> ({ state: 'none', via: 'rm' }))
  }

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

  static runWaitTcp( container_image, options, host, port ){
    // Some sort of health check would be more useful
    return DockerManage.run(container_image, options)
      .then(()=> DockerManage.testTcp(host, port) )
  }

  static runWaitHttp( container_image, options, url ){
    // Some sort of health check would be more useful
    return DockerManage.run(container_image, options)
      .then(()=> DockerManage.testHttp(url) )
  }


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
