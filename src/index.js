// # Extendebale Page class for Webdriver.io

const { Page } = require('./page')
const { Docker } = require('./docker')
const { DockerManage } = require('./DockerManage')
const { Browsers } = require('./browsers')
const webdriverio = require('webdriverio')

module.exports = { Docker, DockerManage, Page, Browsers, webdriverio }

