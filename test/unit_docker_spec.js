/* global expect */
const { Docker } = require('../')

describe('Unit::page::Docker', function(){

  describe('module', function(){

    it('should have a selenium image prefix', function(){
      expect( Docker.image_prefix ).to.equal( 'selenium/standalone-' )
    })

    it('should have a container name prefix', function(){
      expect( Docker.name_prefix ).to.equal( 'dply-selenium-standalone-' )
    })

  })

})
