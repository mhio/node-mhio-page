const debug = require('debug')('dply:page:page')
const path = require('path')
const webdriverio = require('webdriverio')
const {Browsers} = require('./browsers')
// Webdriver IO Page helper

class Page {

  setup(options){
    let page = new Page(options)
    page.initApp()
    page.initWebdriver()
    return page
  }

  constructor ( options = {} ){

    this.label = options.label || 'default'

    // App options
    this.app = options.app

    // Async notifiers
    this.promises = []
    this.cb_app = options.cb_app
    this.cb_wd = options.cb_wd
    this.cb = options.cb

    // Url options

    this.scheme =
      options.scheme ||
      process.env.PAGE_SCHEME ||
      'http'

    this.host =
      options.host ||
      process.env.PAGE_HOST ||
      'localhost'

    this.port =
      options.port ||
      process.env.PAGE_PORT

    this.path =
      options.path ||
      process.env.PAGE_PATH


    // Webdriver remote options

    this.remote_browser =
      options.remote_browser ||
      options.browser ||
      process.env.PAGE_BROWSER ||
      'chrome'

    this.remote_host = options.remote_host ||
      process.env.PAGE_REMOTE_HOST ||
      '127.0.0.1'

    this.remote_ports = {
      chrome:  44445,
      firefox: 44446,
      phantom: 44447,
      ie:      44448,
      safari:  44449
    }

    this.remote_port = options.remote_port ||
      process.env.PAGE_REMOTE_PORT ||
      Browsers.wdPort(this.remote_browser) ||
      4444

    this.remote_path = options.remote_path ||
      process.env.PAGE_REMOTE_PATH ||
      '/wd/hub'

    this.init()
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
        /^dply:\*/.exec(process.env.DEBUG)
      ) {
        this.remote_options.logLevel = 'verbose'
      }
    }
    debug('remote options', this.remote_options)

    return this
  }

  initAsync(){
    // Start an app if we were given one, store the promise
    if (this.app) this.promises.push(this.initApp())

    // Run the webdriver init and store it's promise
    this.promises.push(this.initWebdriver())

    // Attach a promise for all startup promises so
    // consumers can wait on it being resolved
    this.promise = Promise.all(this.promises)
      .then(res => {
        if (this.cb) this.cb(null, res)
      })
      .catch(err => {
        if (this.cb) this.cb(err)
        throw err
      })

    return this.promise
  }

  // Resolves promise when webdriver is ready.
  // Also calls `cb_wd` if it exists.
  initWebdriver(){
    return this.browser = webdriverio
      .remote(this.remote_options)
      .init()
      .then(res => {
        if (this.cb_wd) this.cb_wd(null, res)
      })
      .catch(err => {
        if (this.cb_wd) this.cb_wd(err)
        throw err
      })
  }

  // Resolves promise when server is up.
  // Also calls `cb_app` if it exists.
  initApp(){
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

  // Generate a url from the class host/port
  url( path ){
    let port = (this.port) ? `:${this.port}` : ''
    let path_prefix = (this.path) ? this.path : ''
    if ( path === undefined ) path = ''
    let url = `${this.scheme}://${this.host}${port}${path_prefix}${path}`
    debug('built url %s', url)
    return url
  }

  // Open a page with webdriver instance
  open( path ){
    let this_url = this.url(path)
    debug('open %s', this_url)
    return this.browser.url(this_url)
  }

  openUrl( full_url ){
    debug('open url %s', full_url)
    return this.browser.url(full_url)
  }

  // ### Actions

  // Get the title
  title(){
    return this.browser.getTitle()
  }

  exists( selector ){
    return this.browser.isExisting(selector)
  }

  wait( selector, timeout = 500 ){
    return this.browser.waitForExist(selector, timeout)
  }

  // Get some/all html
  html( selector = 'body' ){
    return this.browser.getHTML(selector)
  }

  source(){
    return this.browser.source()
  }

  screenShotPath( ...dir_paths ){
    return this.screen_shot_path = path.join(...dir_paths)
  }
  screenShot( file_name ){
    if ( !file_name.startsWith(`.${path.sep}`) &&
      !file_name.startsWith(`..${path.sep}`) &&
      !file_name.startsWith(path.sep) &&
      !file_name.match(/^[A-Za-z]:\\/)
    ) {
      if (!this.screen_shot_path) throw new Error('You need to set the `screen_shot_path` to use file names without a defined path')
      file_name = path.join(this.screen_shot_path, file_name)
    }
    return this.browser.saveScreenshot(file_name)
  }


}


module.exports = { Page }

