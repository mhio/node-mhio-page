const { Docker } = require('../')

describe('Unit::page::Docker', function(){

  describe('Includes modules', function(){
  
    it('should have Docker attached', function(){
      expect( Docker ).to.be.ok
    })

  })

})
