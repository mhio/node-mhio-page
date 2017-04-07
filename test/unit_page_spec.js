/* global expect */
const { Page } = require('../')
const app = require('express')()


describe('Integration::page::Page', function(){

  describe('module', function(){

    it('should have Page attached', function(){
      expect( Page ).to.be.ok
    })

  })

  describe('class', function(){

    it('should create Page instance', function(){
      expect( new Page() ).to.be.ok
    })

    it('should create Page instance with an app', function(){
      expect( new Page({app:app}) ).to.be.ok
    })

    it('should create Page instance with an app and cb', function(done){
      let page = null
      let fn = function cb(){
        expect( page.appserver ).to.be.ok
        done()
      }
      page = new Page({ app:app, app_callback:fn })
    })

  })

})
