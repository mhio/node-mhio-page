const debug = require('debug')('dply:webdriverio-page')
const path = require('path')
const webdriverio = require('webdriverio')

// Webdriver IO Page helper

class Page {
  
  constructor ( options = {} ){

    this.label = options.label || 'na'

    // App options

    this.app = options.app
    this.app_callback = options.app_callback
    this.setup_done = options.setup_done


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
      chrome:  44444,
      firefox: 44445,
      phantom: 44446,
      ie:      44447,
      safari:  44448
    }

    this.remote_port = options.remote_port ||
      process.env.PAGE_REMOTE_PORT ||
      this.remote_ports[this.remote_browser] ||
      4444

    this.remote_path = options.remote_path ||
      process.env.PAGE_REMOTE_PATH ||
      '/wd/hub'

    this.init()
  }
  
  
  // Setup a browser instance for testing
  init () {

    // Start an app if we were given one
    if (this.app) this.runApp()

    this.remote_options = {
      desiredCapabilities: {
        browserName: this.remote_browser
      },
      host: this.remote_host,
      port: this.remote_port,
      path: this.remote_path
    }

    debug('remote options', this.remote_options)
    
    this.browser = webdriverio
      .remote(this.remote_options)
      .init()
      .url(this.url(''))

    if (this.setup_done) this.setup_done()

    return this
  }

  runApp(){
    return new Promise((resolve) =>{
      debug('app starting', this.label)
      this.appserver = this.app.listen(()=> {
        this.port = this.appserver.address().port
        debug('app started on %s', this.port)
        if (this.app_callback) this.app_callback(null, this.appserver)
        resolve(this.appserver)
      })
    })
  }

  // Generate a url from the class host/port
  url( path ){
    let port = (this.port) ? `:${this.port}` : ''
    let path_prefix = (this.path) ? this.path : ''
    return `${this.scheme}://${this.host}${port}${path_prefix}${path}`
  }

  // Open a page with webdriver instance
  open( path ){
    let this_url = this.url(path)
    debug('page open %s', this_url)
    return this.browser.url(this_url)
  }

  openUrl( url ){
    debug('page open url %s', url)
    return this.browser.url(url)
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

