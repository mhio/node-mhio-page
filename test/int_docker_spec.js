/* global expect */
const { Docker, Browsers } = require('../')


describe('Integration::page::Docker', function(){

  Browsers.thatHaveAContainer().forEach(browser => {

    describe(`${browser}`, function(){

      it('should down any running instances', function(){
        return expect( Docker.down(browser) ).to.eventually.eql( {state: 'none'} )
      })

      it('should check', function(){
        return expect( Docker.check(browser) ).to.eventually.eql( {state: 'none'} )
      })

      it('should run', function(){
        this.timeout(3000)
        return expect( Docker.run(browser) ).to.eventually.eql( {state: 'running'} )
      })

      it('should stop', function(){
        return expect( Docker.stop(browser) ).to.eventually.eql( {state: 'stopped'} )
      })

      it('should start', function(){
        this.timeout(3000)
        return expect( Docker.start(browser) ).to.eventually.eql( {state: 'running'} )
      })

      it('should down any running instances', function(){
        return expect( Docker.down(browser) ).to.eventually.eql( {state: 'none'} )
      })

      it('should up', function(){
        this.timeout(4000)
        return expect( Docker.up(browser) )
          .to.eventually.have.property('state').and.equal('running')
      })

      it('should start', function(){
        this.timeout(3000)
        return expect( Docker.start(browser) ).to.eventually.eql( {state: 'running'} )
      })

      it('should up', function(){
        this.timeout(4000)
        return expect( Docker.up(browser) )
          .to.eventually.have.property('state').and.equal('running')
      })

      it('should stop', function(){
        return expect( Docker.stop(browser) ).to.eventually.eql( {state: 'stopped'} )
      })

      it('should down any running instances', function(){
        return expect( Docker.down(browser) ).to.eventually.eql( {state: 'none'} )
      })

    })

  })

})
