// # Extendebale Page class for Webdriver.io

const { Page } = require('./page')
const { Docker } = require('./docker')
const { Browsers } = require('./browsers')
const webdriverio = require('webdriverio')

module.exports = { Docker, Page, Browsers, webdriverio }

