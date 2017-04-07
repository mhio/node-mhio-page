/* global expect */
const debug = require('debug')('dply:test:int:page')
const { Page } = require('../')
const {first, find, map, compact} = require('lodash')
const _ = require('lodash')

// Test fixture app
const app = require('express')()
app.get('/test',(req, res)=> {
  res.send('<body><title>atitle</title></head><body><div>abody</div></body>')
})

// IP fixture
// Find the first, external, IPv4 address
let ip = _(require('os').networkInterfaces())
  .map(o => find(o, {internal: false, family: 'IPv4'}))
  .compact()
  .first()
  .address
if (!ip) throw new Error('Couldn\'t find a local IP to connect to')


describe('Integration::page::Page', function(){

  describe('class tests', function(){

    this.timeout(5000)
    let page = null

    before('create Page/app', function(){
      this.timeout(30000)
      page = new Page({
        app: app,
        browser: 'firefox',
        host: ip
      })
      return page.promise
    })

    it('should generate a local url', function(){
      expect( page.url('/test') ).to.match( /^http:\/\/.+:\d+\/test$/ )
    })

    it('should set a url /test', function(){
      return expect( page.open('/test') ).to.become.ok
    })

    it('should get the urls title', function(){
      return expect( page.title() ).to.become( 'atitle' )
    })

  })

})
