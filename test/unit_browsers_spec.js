/* global expect */

const { Browsers } = require('../')

describe('Unit::page::Browsers', function(){

  describe('module', function(){

    it('should have Browsers attached', function(){
      expect( Browsers ).to.be.ok
    })

    it('should return browsers that have a container', function(){
      expect( Browsers.thatHaveAContainer() ).to.eql( ['chrome','firefox'] )
    })

    it('should have chrome Browsers attached', function(){
      expect( Browsers.id('chrome') ).to.equal( 5 )
    })

    it('should have firefox Browsers attached', function(){
      expect( Browsers.id('firefox') ).to.equal( 6 )
    })

    it('should have phantom Browsers attached', function(){
      expect( Browsers.id('phantom') ).to.equal( 7 )
    })

    it('should have ie Browsers attached', function(){
      expect( Browsers.id('ie') ).to.equal( 8 )
    })

    it('should have safari Browsers attached', function(){
      expect( Browsers.id('safari') ).to.equal( 9 )
    })

    it('should not have nope Browsers attached', function(){
      expect( ()=> Browsers.id('nope') ).to.throw(/Unsupported browser/)
    })

  })

})
