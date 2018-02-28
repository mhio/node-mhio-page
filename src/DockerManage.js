const debug = require('debug')('dply:page:DockerManage')
const Promise = require('bluebird')
const needle = require('needle')

const { SpawnCommand } = require('./SpawnCommand')

// Manage the selenium docker containers.
// Should be using an API rather than docker command line


class DockerManage {

  static classInit(){}

  // Run a generic `docker` passing along all args.
  static command(args){
    return SpawnCommand.run('docker', args)
  }

  static testTcp( port, retry = 1, retries = 10, delay = 500 ){
    return Promise.try(()=> {
      debug('testTcp %s - retry %s', port, retry)
      return needle('get', `http://127.0.0.1:${port}/wd/hub/sessions`)
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
            .then(()=>this.testTcp(port, retry+1))
        })
    })
  }

  static testHttp( url, retry = 1, retries = 10, delay = 500 ){
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
            .then(()=>this.testHttp(url, retry+1))
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
      //console.error('DockerManage "up" error:', err.results)
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
      }

      return res

    }).catch(err => {
      //console.error('DockerManage "down" error:', err.results)
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


  static startWaitTcp( container_name, port ){
    // Some sort of health check would be more useful
    return DockerManage.start(container_name)
      .then(()=> DockerManage.testTcp(port) )
  }

  static startWaitHttp( container_name, url ){
    // Some sort of health check would be more useful
    return DockerManage.start(container_name)
      .then(()=> DockerManage.testHttp(url) )
  }


  static start( container_name ){
    return DockerManage.command([
      'start',
      `${container_name}`
    ])
    .delay(40)
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
        if ( res.exit_code === 1 && /No such container: /.test(res.stderr_buffer.toString()) ){
          return { state: 'none', via: 'rmf' }
        }
      }
      throw err
    })
  }

  static runWaitTcp( container_image, options, port ){
    // Some sort of health check would be more useful
    return DockerManage.run(container_image, options)
      .then(()=> DockerManage.testTcp(port) )
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
        .delay(40) // allow a process in the continer to achieve something
        .then(() => ({ state: 'running', via: 'run' }))

      resolve(p)

    })
  }



}

DockerManage.classInit()

module.exports = { DockerManage }
