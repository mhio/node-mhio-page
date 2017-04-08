/* global expect */
const { Page } = require('../')
const app = require('express')()


describe('Unit::page::Page', function(){

  describe('module', function(){

    it('should have Page attached', function(){
      expect( Page ).to.be.ok
    })

  })

  describe('class', function(){

    it('should create Page instance', function(){
      expect( new Page({no_async_init: true}) ).to.be.ok
    })

    it('should create Page instance with an app', function(){
      expect( new Page({app: app, no_async_init: true}) ).to.be.ok
    })

  })

})
