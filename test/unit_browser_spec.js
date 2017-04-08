/* global expect */

const { Browser } = require('../')

describe('Unit::page::Browser', function(){

  describe('module', function(){

    it('should have Browser attached', function(){
      expect( Browser ).to.be.ok
    })

    it('should have chrome Browser attached', function(){
      expect( Browser.id('chrome') ).to.equal( 5 )
    })

    it('should have firefox Browser attached', function(){
      expect( Browser.id('firefox') ).to.equal( 6 )
    })

    it('should have phantom Browser attached', function(){
      expect( Browser.id('phantom') ).to.equal( 7 )
    })

    it('should have ie Browser attached', function(){
      expect( Browser.id('ie') ).to.equal( 8 )
    })

    it('should have safari Browser attached', function(){
      expect( Browser.id('safari') ).to.equal( 9 )
    })

    it('should not have nope Browser attached', function(){
      expect( ()=> Browser.id('nope') ).to.throw(/Unsupported browser/)
    })

  })

})
