// const debug = require('debug')('mhio:page:browsers')
const { map, compact } = require('lodash')

class Browsers {

  /**
   * Setup class vars
   */
  static classInitialise(){
    this.config = {
      chrome:  { name: 'chrome',  id: 5, container: true },
      firefox: { name: 'firefox', id: 6, container: true },
      phantom: { name: 'phantom', id: 7 },
      ie:      { name: 'ie',      id: 8 },
      safari:  { name: 'safari',  id: 9 },
    }
    this.vnc_port_prefix = 5900
    this.wd_port_prefix = 4444
  }

  /**
   * Return browsers that can run in a container
   */
  static thatHaveAContainer(){
    let arr = map(this.config, browser => {
      if (browser.container) return browser.name
    })
    return compact(arr)
  }

  /**
   * Get a browsers id
   * @param {string} browser              - Browser name
   * @returns {number}                    - The ID for the browser
   */
  static id(browser) {
    if (!this.config[browser]) throw new Error(`Unsupported browser "${browser}"`)
    return this.config[browser].id
  }

  /**
   * Get a browsers web driver port
   * @param {string} browser              - Browser name
   * @returns {number}                    - VNC Port for browser
   */
  static wdPort(browser) {
    if (!this.config[browser]) throw new Error(`Unsupported browser "${browser}"`)
    return Number(`${this.wd_port_prefix}${this.config[browser].id}`)
  }

  /**
   * Get a browsers VNC port
   * @param {string} browser              - Browser name
   * @returns {number}                    - Webdriver Port for browser
   */
  static vncPort(browser) {
    if (!this.config[browser]) throw new Error(`Unsupported browser "${browser}"`)
    return Number(`${this.vnc_port_prefix}${this.config[browser].id}`)
  }

}

Browsers.classInitialise()

module.exports = { Browsers }
