const wdio_page = require('../')

describe('Unit::webdriverio-page', function(){

  describe('Includes modules', function(){
  
    it('should have Page attached', function(){
      expect( wdio_page.Page ).to.be.ok
    })

    it('should have Docker attached', function(){
      expect( wdio_page.Docker ).to.be.ok
    })

  })

})
