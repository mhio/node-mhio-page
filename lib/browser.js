const debug = require('debug')('dply:page:browser')


class Browser {

  static init(){
    this.config = {
      chrome:  { id: 5 },
      firefox: { id: 6 },
      phantom: { id: 7 },
      ie:      { id: 8 },
      safari:  { id: 9 }
    }
    this.vnc_port_prefix = 5900
    this.wd_port_prefix = 4444
  }

  static id(browser){
    if (!this.config[browser]) throw new Error(`Unsupported browser "${browser}"`)
    return this.config[browser].id
  }

  static wdPort(browser){
    if (!this.config[browser]) throw new Error(`Unsupported browser "${browser}"`)
    return `${this.wd_port_prefix}${this.config[browser].id}`
  }

  static vncPort(browser){
    if (!this.config[browser]) throw new Error(`Unsupported browser "${browser}"`)
    return `${this.vnc_port_prefix}${this.config[browser].id}`
  }

}
Browser.init()

module.exports = { Browser }
