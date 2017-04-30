const debug = require('debug')('dply:page:page')
const path = require('path')
const webdriverio = require('webdriverio')
const _ = require('lodash')
const Promise = require('bluebird')

const {Browsers} = require('./browsers')
const {Docker} = require('./docker')

// Webdriver IO Page helper

class Page {

  static eachBrowser(fn){
    return this.browsers().forEach(fn)
  }

  static browsers(){
    return Browsers.thatHaveAContainer()
  }

  // Find the first, external, IPv4 address on the host running the tests
  static ip( family = 'IPv4', internal = false ){
    let ip = _(require('os').networkInterfaces())
      .map(o => _.find(o, {internal: internal, family: family}))
      .compact()
      .first()
      .address
    if (!ip) throw new Error('Couldn\'t find a local IP to connect to')
    return ip
  }


  static setupAsync(options){
    let page = new this(options)
    // page.initApp()
    // page.initWebdriver()
    return page.promise.then(()=> page)
  }

  constructor ( options = {} ){

    // #### Options:

    // `label` - A label to use for the `Page` in logging/errors.
    this.label = options.label || 'default'

    // `app` - An express app to launch and test against.
    this.app = options.app

    // `docker` - Use selenium in a local container (firefox/chrome)
    this.docker = Boolean(options.docker)
    let docker_host = (this.docker) ? this.constructor.ip() : undefined

    // ##### Async notifiers

    // `cb_app` - Callback function for app init completed
    this.cb_app = options.cb_app

    // `cb_docker` - Callback function for docker init completed
    this.cb_docker = options.cb_docker

    // `cb_wd` - Callback function for webdriver init completed
    this.cb_wd = options.cb_wd

    // `cb` - Callback function for init completed
    this.cb = options.cb

    // The instance property `promises` will be an array populated with
    // any initialisation promises.
    this.promises = []

    // ##### Url options

    // `scheme` - Scheme to use in default testing URL. Env: `PAGE_SCHEME`.
    this.scheme =
      options.scheme ||
      process.env.PAGE_SCHEME ||
      'http'

    // `host` - Host to use in default testing URL. Env: `PAGE_HOST`.
    this.host =
      options.host ||
      process.env.PAGE_HOST ||
      docker_host ||
      'localhost'

    // `port` - Port to use in default testing URL. Env: `PAGE_PORT`.
    this.port =
      options.port ||
      process.env.PAGE_PORT

    // `path` - Path to use in default testing URL. Env `PAGE_PATH`.
    this.path =
      options.path ||
      process.env.PAGE_PATH


    // #### Webdriver remote options

    // `remote_browser` - Name of remote webdriver browser.
    // Env `PAGE_BROWSER`.
    this.remote_browser =
      options.remote_browser ||
      options.browser ||
      process.env.PAGE_BROWSER ||
      'chrome'

    // `remote_host` - Host name of remote webdriver server.
    // Env `PAGE_BROWSER`.
    this.remote_host = options.remote_host ||
      process.env.PAGE_REMOTE_HOST ||
      '127.0.0.1'

    // Default ports for remote browsers.
    this.remote_ports = {
      chrome:  44445,
      firefox: 44446,
      phantom: 44447,
      ie:      44448,
      safari:  44449
    }

    // `remote_port` - Port of remote webdriver server.
    // Env `PAGE_REMOTE_PORT`.
    this.remote_port = options.remote_port ||
      process.env.PAGE_REMOTE_PORT ||
      Browsers.wdPort(this.remote_browser) ||
      4444

    // `remote_path` - Path for of remote webdriver URL.
    // Env `PAGE_REMOTE_PATH`.
    this.remote_path = options.remote_path ||
      process.env.PAGE_REMOTE_PATH ||
      '/wd/hub'

    this.init()

    // `no_async_init` - Do no start async init tasks (app, docker, webdriver)
    if (!options.no_async_init) {
      this.initAsync()
    }
  }


  // Setup a browser instance for testing
  // A constructor can't return a promise to signal
  // startup, but we can store one for external interrogation
  init () {

    this.remote_options = {
      desiredCapabilities: {
        browserName: this.remote_browser
      },
      host: this.remote_host,
      port: this.remote_port,
      path: this.remote_path
    }

    // Poor mans debug for webdriverio.
    if ( process.env.DEBUG ) {
      if (
        /^webdriver/.exec(process.env.DEBUG) ||
        /^dply:page/.exec(process.env.DEBUG) ||
        /^dply:\*/.exec(process.env.DEBUG) ||
        /^\*/.exec(process.env.DEBUG)
      ) {
        this.remote_options.logLevel = 'verbose'
      }
    }
    debug('remote options', this.remote_options)

    return this
  }

  initAsync( options = {} ){
    // Start an app if we were given one, store the promise
    if (this.app) this.promises.push(this.initApp)

    // If we need docker up, run it and store the promise
    if (this.docker) {
      this.promises.push(this.initDocker)
    }

    // Run the webdriver init and store it's promise
    this.promises.push(this.initWebdriver)


    if (options.test) {
      this.promises = [()=>Promise.resolve(options.test)]
    }

    // Attach a promise for all startup promises so
    // consumers can wait on it being resolved
    this.promise = Promise.each(this.promises, i => i.call(this))
      .then(res => {
        if (this.cb) this.cb(null, res)
        return res
      })
      .catch(err => {
        if (this.cb) this.cb(err)
        throw err
      })

    return this.promise
  }

  // Resolves promise when docker selenium is up.
  // Also calls `cb_docker` if it exists.
  initDocker( options = {} ){
    debug('initDocker')

    // Allow for unit testing
    let promise = (!options.test)
      ? Docker.up(this.remote_browser)
      : Promise.resolve(options.test)

    return promise
      .then(res => {
        debug('initDocker docker is up - %s', this.remote_browser, res)
        if (this.cb_docker) this.cb_docker(null, res)
        return res
      })
      .catch(err => {
        if (this.cb_docker) this.cb_docker(err)
        throw err
      })
  }

  // Resolves promise when webdriver is ready.
  // Also calls `cb_wd` if it exists.
  initWebdriver( options = {} ){
    debug('initWebdriver')

    // Allow for unit testing
    let promise = (options.test)
      ? ()=> Promise.resolve(options.test||{state:'running'})
      : ()=> {
          debug('Setting up webdriver with remote options', this.remote_options)
          this.browser = webdriverio.remote(this.remote_options)
          return Promise.try(()=> this.browser.init())
        }

    return promise()
      .then(res => {
        if (this.cb_wd) this.cb_wd(null, res)
      })
      .catch(err => {
        if ( options.tryi < 10 ) {
          debug('initWebdriver trying selenium again', options.tryi)
          options.tryi++
          return Promise.delay(100).then(()=> this.initWebdriver(options))
        }
        if (this.cb_wd) this.cb_wd(err)
        debug('wd error', err)
        throw err
      })
  }

  // Resolves promise when server is up.
  // Also calls `cb_app` if it exists.
  initApp(){
    debug('initApp')

    return new Promise((resolve) =>{
      debug('Express app starting', this.label)
      this.appserver = this.app.listen(()=> {
        this.port = this.appserver.address().port
        debug('Express app started on %s', this.port)
        if (this.cb_app) this.cb_app(null, this.appserver)
        resolve(this.appserver)
      })
    }).catch(err => {
      if (this.cb_app)
      throw err
    })
  }

  // Close down the browser, usually in `after`
  end(){
    if (this.browser) return this.browser.end()
    return Promise.reject(new Error('No browser instance available'))
  }

  // Generate a url from the class host/port
  url( path ){
    let port = (this.port) ? `:${this.port}` : ''
    let path_prefix = (this.path) ? this.path : ''
    if ( path === undefined ) path = ''
    let url = `${this.scheme}://${this.host}${port}${path_prefix}${path}`
    debug('built url %s', url)
    return url
  }

  // ### `.open(path_String)`
  // Open a path, built from the default URL.
  open( path ){
    return Promise.try(()=>{
      let this_url = this.url(path)
      debug('open %s', this_url)
      return this.browser.url(this_url)
    })
  }

  // ### `.openUrl(url_String)`
  // Open a full url, not relying on defaults
  openUrl( full_url ){
    debug('open url %s', full_url)
    return this.browser.url(full_url)
  }

  // ### Actions

  // ### `.title()`
  // Get the current pages title.
  title(){
    return this.browser.getTitle()
  }

  // ### `.exists(css_String)`
  // Does a css selector exist in the current page.
  exists( selector ){
    return this.browser.isExisting(selector)
  }

  // ### `.wait( css_String, ms_Number` )
  // Wait for a selector to exist.
  // `timeout` defaults to 500ms.
  wait( selector, timeout = 500 ){
    return this.browser.waitForExist(selector, timeout)
  }

  // ### `.html( css_String )`
  // Get the html from the current browser, with an optional selector.
  // The selector defaults to `body`.
  html( selector = 'body' ){
    return this.browser.getHTML(selector)
  }

  // ### `.source()`
  // Get the complete source of the current browser.
  source(){
    return this.browser.getSource()
  }

  // ### `.screenShotPath( paths... )`
  // Set the default screen shot path
  screenShotPath( ...dir_paths ){
    return this.screen_shot_path = path.join(...dir_paths)
  }

  // ### `.screenShot( name )`
  // Take a screenshot of the current browser. Relative paths require `.screenShotPath()` to have been set.
  screenShot( file_name ){
    return Promise.try(()=>{
      if (
        !file_name.startsWith(`.${path.sep}`) &&
        !file_name.startsWith(`..${path.sep}`) &&
        !file_name.startsWith(path.sep) &&
        !file_name.match(/^[A-Za-z]:\\/)
      ) {
        if (!this.screen_shot_path) throw new Error('You need to set the `screen_shot_path` to use file names without a path')
        file_name = path.join(this.screen_shot_path, file_name)
      }
      return this.browser.saveScreenshot(file_name)
    })
  }


}


module.exports = { Page }

