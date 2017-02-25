const page = require('../')

describe('Unit::deployable::page', function(){

  describe('Includes modules', function(){
  
    it('should have Page attached', function(){
      expect( page.Page ).to.be.ok
    })

    it('should have Docker attached', function(){
      expect( page.Docker ).to.be.ok
    })

  })

})
