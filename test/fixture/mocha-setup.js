/* global chai */
global.chai = require('chai')
//global.sinon = require('sinon')
global.expect = chai.expect
chai.use(require('chai-fs'))
chai.use(require('chai-as-promised'))

require('source-map-support').install()

require('bluebird').config({
  longStackTraces: true,
  warnings: true
})

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'test'
