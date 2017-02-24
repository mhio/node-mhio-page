// # Extendebale Page class for Webdriver.io

const { Page } = require('./page')
const { Docker } = require('./docker')
const webdriverio = require('webdriverio')

module.exports = { Docker, Page, webdriverio }

