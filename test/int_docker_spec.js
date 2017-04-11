/* global expect */
const { Docker, Browsers } = require('../')


describe('Integration::page::Docker', function(){

  describe('stub container', function(){

    const browser = 'chrome'

    before(function(){
      Docker.testingInit()
    })

    after(function(){
      Docker.init()
    })

    it('should down any running instances', function(){
      return expect( Docker.down(browser) ).to.eventually.eql( {state: 'none'} )
    })

    it('should check', function(){
      return expect( Docker.check(browser) ).to.eventually.eql( {state: 'none'} )
    })

    it('should run', function(){
      return expect( Docker.run(browser) ).to.eventually.eql( {state: 'started'} )
    })

    it('should check', function(){
      return expect( Docker.check(browser) ).to.eventually.eql( {state: 'running'} )
    })

    it('should stop', function(){
      return expect( Docker.stop(browser) ).to.eventually.eql( {state: 'stopped'} )
    })

    it('should start', function(){
      return expect( Docker.start(browser) ).to.eventually.eql( {state: 'started'} )
    })

    it('should check', function(){
      return expect( Docker.check(browser) ).to.eventually.eql( {state: 'running'} )
    })

    it('should stop', function(){
      return expect( Docker.stop(browser) ).to.eventually.eql( {state: 'stopped'} )
    })

    it('should down any running instances', function(){
      return expect( Docker.down(browser) ).to.eventually.eql( {state: 'none'} )
    })

    it('should up', function(){
      this.timeout(4000)
      return expect( Docker.up(browser) )
        .to.eventually.have.property('state').and.equal('running')
    })

    it('should start while already up', function(){
      return expect( Docker.start(browser) ).to.eventually.eql( {state: 'started'} )
    })

    it('should up while already started', function(){
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

  Browsers.thatHaveAContainer().forEach(browser => {

    describe(`${browser}`, function(){

      before(function(){
        Docker.init()
      })

      it('should up a browser container', function(){
        this.timeout(5000)
        return expect( Docker.up(browser) )
          .to.eventually.have.property('state').and.equal('running')
      })

      it('should down the browser container', function(){
        return expect( Docker.down(browser) ).to.eventually.eql( {state: 'none'} )
      })

    })

  })

})
