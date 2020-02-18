/* global expect */
const { Docker, Page } = require('../../lib')

describe('built module', function(){

 it('loads a Docker module', function(){
   expect( Docker ).to.be.ok
 })

 it('loads a Page module', function(){
   expect( Page ).to.be.ok
 })

})
