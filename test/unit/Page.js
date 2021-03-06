/* global expect */
const debug = require('debug')('mhio:page:test:unit:Page')
const { Page } = require('../../src')
const app = require('express')()


describe('Unit::page::Page', function(){

  describe('module', function(){

    it('should have Page attached', function(){
      expect( Page ).to.be.ok
    })

  })

  it('should create Page instance', function(){
    let browsers = []
    Page.eachBrowser(b => browsers.push(b))
    expect( browsers ).to.eql(['chrome','firefox'])
  })

  it('should create Page instance', function(){
    expect( Page.browsers() ).to.eql(['chrome','firefox'])
  })

  describe('class', function(){

    let page = null

    afterEach(function(){
      if (page && page.appserver) page.appserver.close()
    })

    it('should create Page instance', function(){
      expect( new Page({ no_async_init: true }) ).to.be.ok
    })

    it('should create Page instance with an app', function(){
      page = new Page({ app: app, no_async_init: true })
      expect( page ).to.be.ok
    })

    it('should run the app callback', function(done){
      page = new Page({
        app: app,
        no_async_init: true,
        cb_app: (err, res) => { debug(res); done(err) }
      })
      page.initApp()
    })

    it('should run the wd callback', function(done){
      page = new Page({
        app: app,
        no_async_init: true,
        cb_wd: (err, res) => { debug('test cb_wd', res); done(err) }
      })
      page.initWebdriver({test:true})
    })

    it('should run the docker callback', function(done){
      page = new Page({
        app: app,
        no_async_init: true,
        cb_docker: (err, res) => { debug('test cb_docker', res); done(err) }
      })
      page.initDocker({ test:{ state:'running' }})
    })

    it('should run the everything callback', function(done){
      page = new Page({
        app: app,
        no_async_init: true,
        cb: (err, res) => { debug('test cb',res); done(err) }
      })
      page.initAsync({test:true})
    })

    it('should generate a url for a Page instance', function(){
      page = new Page({
        app: app,
        no_async_init: true,
      })
      expect( page.generateUrl('/whatever') ).to.equal('http://localhost/whatever')
    })
  })

})
