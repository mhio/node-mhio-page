const debug = require('debug')('mhio:page:browsers')
const {map, compact} = require('lodash')

class Browsers {

  static init(){
    this.config = {
      chrome:  { name: 'chrome',  id: 5, container: true },
      firefox: { name: 'firefox', id: 6, container: true },
      phantom: { name: 'phantom', id: 7 },
      ie:      { name: 'ie',      id: 8 },
      safari:  { name: 'safari',  id: 9 }
    }
    this.vnc_port_prefix = 5900
    this.wd_port_prefix = 4444
  }

  static thatHaveAContainer(){
    let arr = map(this.config, browser => {if (browser.container) return browser.name})
    return compact(arr)
  }

  static id(browser){
    if (!this.config[browser]) throw new Error(`Unsupported browser "${browser}"`)
    return this.config[browser].id
  }

  static wdPort(browser){
    if (!this.config[browser]) throw new Error(`Unsupported browser "${browser}"`)
    return Number(`${this.wd_port_prefix}${this.config[browser].id}`)
  }

  static vncPort(browser){
    if (!this.config[browser]) throw new Error(`Unsupported browser "${browser}"`)
    return Number(`${this.vnc_port_prefix}${this.config[browser].id}`)
  }

}
Browsers.init()

module.exports = { Browsers }
