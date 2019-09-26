import path from 'path'
import debugr from 'debug'
import * as webdriverio from 'webdriverio'
import _ from 'lodash'
import _has from 'lodash/has'
import _find from 'lodash/find'
import Promise from 'bluebird'
import needle from 'needle'
import base62 from 'base62-random'

const {Browsers} = require('./browsers')
const {Docker} = require('./docker')

const debug = debugr('mhio:page:Page')

// Webdriver IO Page helper

class WebDriverIoStub {
  init(){}
  end(){}
}


// Generic Page helper, to be extended

class Page {

  static classInit(){

  }

  static eachBrowser(fn){
    return this.browsers().forEach(fn)
  }

  static browsers(){
    return Browsers.thatHaveAContainer()
  }

  // Find the first, external, IPv4 address on the host running the tests
  // Won't always be right but close enough.
  static ip( family = 'IPv4', internal = false ){
    let ip = _(require('os').networkInterfaces())
      .map(o => _find(o, {internal: internal, family: family}))
      .compact()
      .first()
      .address
    if (!ip) throw new Error('Couldn\'t find a local IP to connect to')
    return ip
  }


  static async setupAsync(options){
    let page = new this(options)
    // page.initApp()
    // page.initWebdriver()
    await page.promise
    return page
  }


  // new Page()
  constructor ( options = {} ){

    this.uid = base62(12)
    this.debug = debugr(`mhio:page:Page[${this.uid}]`)
    this.debug('creating a new Page with', Object.keys(options))

    // The instance property `promises` will be an array populated with
    // any initialisation promises.
    this.promises = []


    // #### Options:

    // `label` - A label to use for the `Page` in logging/errors.
    this.label = options.label || 'default'

    // `app` - An express app to launch and test against.
    if (_has(options,'app') && !options.app) throw new Error('Page constructor: "app" in options is falsey')
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
    this.remote_port = Number(options.remote_port) ||
      Number(process.env.PAGE_REMOTE_PORT) ||
      Browsers.wdPort(this.remote_browser) ||
      4444

    // `remote_path` - Path for of remote webdriver URL.
    // Env `PAGE_REMOTE_PATH`.
    this.remote_path = options.remote_path ||
      process.env.PAGE_REMOTE_PATH ||
      '/wd/hub'

    this.init()

    // `no_async_init` - Do no start async init tasks (app, docker, webdriver)
    if ( Boolean(options.no_async_init) === false ) {
      // Protect against next tick init issues
      this.promise = this.initAsync()
    }
  }

  // Setup a browser instance for testing
  // A constructor can't return a promise to signal
  // startup, but we can store one for external interrogation
  init () {

    this.remote_options = {
      capabilities: {
        browserName: this.remote_browser
      },
      host: this.remote_host,
      port: this.remote_port,
      path: this.remote_path
    }

    // Poor mans node debug for webdriverio.
    if ( process.env.DEBUG ) {
      if (
        /^webdriver/.exec(process.env.DEBUG) ||
        /^mhio:page/.exec(process.env.DEBUG) ||
        /^mhio:\*/.exec(process.env.DEBUG) ||
        /^mhio\*/.exec(process.env.DEBUG) ||
        /^mhi\*/.exec(process.env.DEBUG) ||
        /^mh\*/.exec(process.env.DEBUG) ||
        /^m\*/.exec(process.env.DEBUG) ||
        /^\*/.exec(process.env.DEBUG)
      ) {
        this.remote_options.logLevel = 'trace'
        this.remote_options.logLevels = { webdriver: 'trace' }
        console.debug('enabling DEBUG due to process.env.DEBUG', process.env.DEBUG)
      }
    }
    else {
      this.remote_options.logLevel = 'error'
      this.remote_options.logLevels = { webdriver: 'error' }
    }
    this.debug('remote options', this.remote_options)

    return this
  }

  // Does the async initialisation of the class,
  // Stores promise functions in `this.promises` for serial initialisation
  // Stores overall status in `this.promise`
  async initAsync( options = {} ){
    this.debug('initAsync', options)
    // Start an app if we were given one, store the promise
    if (this.app) this.promises.push(this.initApp)

    // If we need docker up, run it and store the promise
    if (this.docker) {
      this.promises.push(this.initDocker)
    }

    // Run the webdriver init and store it's promise
    this.promises.push(this.initWebdriver)

    // Allow test injection
    if (options.test) {
      this.promises = [()=> Promise.resolve(options.test)]
    }

    // Attach a promise for all startup promises so
    // consumers can wait on it being resolved
    // The functions are called in here so they reject as promises (`async` would fix this)
    try {
      this.promise = await Promise.each(this.promises, i => i.call(this))
      this.debug('initAsync init complete', this.promise)
      if (this.cb) this.cb(null, this.promise)
      return this.promise
    } catch (err) {
      if (this.cb) this.cb(err)
      throw err
    }
  }

  // Resolves promise when docker selenium is up.
  // Also calls `cb_docker` if it exists.
  async initDocker( options = {} ){
    this.debug('initDocker', options)
    if (!options) throw new Error('No options supplied to initDocker')

    // Allow for unit testing
    let promise = (!options.test)
      ? Docker.up(this.remote_browser)
      : Promise.resolve(options.test)

    try {
      let res = await promise
      this.debug('initDocker docker is up - %s', this.remote_browser, res)
      if (this.cb_docker) this.cb_docker(null, res)
      return res
    }
    catch (err) {
      if (this.cb_docker) this.cb_docker(err)
      throw err
    }
  }

  async initWebdriverTest(){
    this.debug('Setting up test stub webdriver with remote options', this.remote_options)
    this.browser = new WebDriverIoStub(this.remote_options)
    return Promise.resolve({state:'running'})
  }

  async initWebdriverReal(){
    this.debug('Setting up webdriver with remote options', this.remote_options)
    return this.browser = await webdriverio.remote(this.remote_options)
  }

  // Resolves promise when webdriver is ready.
  // Also calls `cb_wd` if it exists.
  async initWebdriver( options = {} ){
    this.debug('initWebdriver', options)

    if (!options) throw Error('No options supplied to initDocker')
    if ( options.tryi === undefined ) options.tryi = 0

    // Allow for unit testing
    let promise_fn = ( options.test !== undefined )
      ? this.initWebdriverTest()
      : this.initWebdriverReal()

    try {
      let res = await promise_fn
      this.debug('initWebdriver: webdriver is up', res)
      if (this.cb_wd) this.cb_wd(null, res)
      return res
    } catch (err) {
      if ( options.tryi < 10 ) {
        this.debug('initWebdriver trying selenium again', options.tryi)
        options.tryi++
        return Promise.delay(100).then(()=> this.initWebdriver(options))
      }
      if (this.cb_wd) this.cb_wd(err)
      this.debug('wd error', err)
      throw err
    }
  }

  // Resolves promise when server is up.
  // Also calls `cb_app` if it exists.
  async initApp(){
    this.debug('initApp')
    return new Promise((resolve) =>{
      this.debug('Express app starting', this.label)
      this.appserver = this.app.listen(()=> {
        this.port = this.appserver.address().port
        this.debug('Express app started on %s', this.port)
        if (this.cb_app) this.cb_app(null, this.appserver)
        resolve(this.appserver)
      })
    }).catch(err => {
      if (this.cb_app) this.cb_app(err)
      throw err
    })
  }


  // End the browser, usually in `after`
  async end(){
    if (this.browser && this.browser.deleteSession) return this.browser.deleteSession()
    return true
    //return Promise.reject(new Error('No browser instance available'))
  }

  // Close down everything, end the browser and any selenium, usually in `after`
  async close(){
    let promises = []
    if (this.browser) promises.push(this.browser.end())
    if (this.docker) promises.push(Docker.down(this.remote_browser))
    return Promise.all(promises)
  }

  // Generate a url from the class host/port
  generateUrl( path ){
    let port = (this.port) ? `:${this.port}` : ''
    let path_prefix = (this.path) ? this.path : ''
    if ( path === undefined ) path = ''
    let url = `${this.scheme}://${this.host}${port}${path_prefix}${path}`
    this.debug('built url %s', url)
    return url
  }

  async testOpen(path){
    let this_url = this.generateUrl(path)
    this.debug('test open %s', this_url)
    let res = await needle('get', this_url)
    this.debug('testOpen res', res.statusCode, res.body)
    return res
  }

  // ### `.open(path_String)`
  // Open a path, built from the default URL.
  async open( path ){
    let this_url = this.generateUrl(path)
    this.debug('open %s', this_url)
    this.browser.url(this_url)
    let body = await this.browser.$('body')
    return body.waitForExist(1000)
    return { status: 0, url: this_url }
  }

  // ### `.openUrl(url_String)`
  // Open a full url, not relying on defaults
  async openUrl( full_url ){
    this.debug('open url %s', full_url)
    this.browser.url(full_url)
    let body = await this.browser.$('body')
    return body.waitForExist(1000)
    return { status: 0, url: full_url }
  }

  // ### Actions

  // ### `.findElement()`
  // Select an element  
  async findElement(selector){
    return this.browser.$(selector)
  }
  $(selector){
    return this.findElement(selector)
  }

  // ### `.title()`
  // Get the current pages title.
  async title(){
    return this.browser.getTitle()
  }

  // ### `.exists(css_String)`
  // Does a css selector exist in the current page.
  async exists( selector ){
    let elem = await this.findElement(selector)
    debug('elem selector [%s]', selector, elem)
    return elem.isExisting()
  }

  // ### `.wait( css_String, ms_Number` )
  // Wait for a selector to exist.
  // `timeout` defaults to 500ms.
  async wait( selector, timeout = 500 ){
    let elem = await this.findElement(selector)
    return elem.waitForExist(timeout)
  }

  // ### `.html( css_String )`
  // Get the html from the current browser, with an optional selector.
  // The selector defaults to `body`.
  async html( selector = 'body' ){
    let elem = await this.findElement(selector)
    return elem.getHTML()
  }

  // ### `.source()`
  // Get the complete source of the current browser.
  async source(){
    return this.browser.getPageSource()
  }

  // ### `.text()`
  // Get the text component of an element
  async text( selector = 'body' ){
    let elem = await this.findElement(selector)
    return elem.getText()
  }

  // ### `.screenShotPath( paths... )`
  // Set the default screen shot path
  screenShotPath( ...dir_paths ){
    return this.screen_shot_path = path.join(...dir_paths)
  }

  // ### `.screenShot( name )`
  // Take a screenshot of the current browser. Relative paths require `.screenShotPath()` to have been set.
  async screenShot( file_name ){
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
  }


}
Page.classInit()

module.exports = { Page }
