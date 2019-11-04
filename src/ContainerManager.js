const debug = require('debug')('mhio:page:ConatinerManage')
const Promise = require('bluebird')
const needle = require('needle')

// Manage the selenium containers.

class ContainerManage {

  static classInit(){}

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
    debug('container up', container_name)
  }

  static down( container_name ){
    debug('container down', container_name)
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
    debug('container "check"', container_name)
  }


  static stop( container_name ){
  }

  static stopNice( container_name ){
    return { state: 'exited', via: 'stop' }
  }


  static startWaitTcp( container_name, host, port, retries, delay ){
    // Some sort of health check would be more useful
    return this.start(container_name)
      .then(()=> this.testTcp(host, port, retries, delay))
  }

  static startWaitHttp( container_name, url, retries, delay ){
    // Some sort of health check would be more useful
    return this.start(container_name)
      .then(()=> this.testHttp(url, retries, delay))
  }


  static start( container_name ){
    return this.command([
      'start',
      `${container_name}`
    ])
    .delay(40)
    .then(()=> ({ state: 'running', via: 'start' }))
  }

  static rm( container_name ){
    return this.command([
      'rm',
      `${container_name}`
    ])
    .then(()=> ({ state: 'none', via: 'rm' }))
  }

  static rmf( container_name ){
    return this.command([
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

  static runWaitTcp( container_image, options, host, port ){
    // Some sort of health check would be more useful
    return this.run(container_image, options)
      .then(()=> this.testTcp(host, port) )
  }

  static runWaitHttp( container_image, options, url ){
    // Some sort of health check would be more useful
    return this.run(container_image, options)
      .then(()=> this.testHttp(url) )
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

this.classInit()

module.exports = { ContainerManage }
