/* global expect */
const { Page, Docker } = require('../../src')

describe('Unit::page::index', function(){

  describe('Includes modules', function(){

    it('should have Page attached', function(){
      expect( Page ).to.be.ok
    })

    it('should have Docker attached', function(){
      expect( Docker ).to.be.ok
    })

  })

})
