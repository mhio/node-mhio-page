/* global expect chai */
const { Docker, Browsers } = require('../src')
chai.should()

describe('Integration::page::Docker', function(){

  describe('Commands on stub container', function(){
    this.timeout(11000)

    const browser = 'chrome'

    before(function(){
      Docker.testingInit()
    })

    after(function(){
      Docker.rmf('chrome')
    })

    after(function(){
      Docker.init()
    })

    it('should down any running instances', async function(){
      let res = await Docker.down(browser)
      return expect( res ).to.containSubset( {state: 'none'} )
    })

    it('should check they are down', function(){
      return Docker.check(browser).should.eventually
        .containSubset( {state: 'none'} )
    })

    it('should run from down', function(){
      return Docker.run(browser).should.eventually
        //.eql( {state: 'running'} )
        .containSubset( {state: 'running'} )
    })

    it('should check running', function(){
      return Docker.check(browser).should.eventually
        //.eql( {state: 'running'} )
        .containSubset( {state: 'running'} )
    })

    it('should stop from running', function(){
      return Docker.stop(browser).should.eventually
        .containSubset( {state: 'exited'} )
    })

    it('should start from stopped', function(){
      return Docker.start(browser).should.eventually
        //.eql( {state: 'running'} )
        .containSubset( {state: 'running'} )

    })

    it('should check started', function(){
      return Docker.check(browser).should.eventually
        //.eql( {state: 'running'} )
        .containSubset( {state: 'running'} )
    })

    it('should startWait', function(){
      return Docker.startWait(browser).should.eventually
        //.have.property('state').and.equal('running')
        .containSubset( {state: 'running'} )
    })

    it('should stop', function(){
      return Docker.stop(browser).should.eventually
        //.eql( {state: 'stopped'} )
        .containSubset( {state: 'exited'} )
    })

    it('should down any running instances', function(){
      return Docker.down(browser).should.eventually
        //.eql( {state: 'none'} )
        .containSubset( {state: 'none'} )
    })

    it('should up', function(){
      return Docker.up(browser).should.eventually
        //.have.property('state').and.equal('running')
        .containSubset( {state: 'running'} )
    })

    it('should start while already up', function(){
      return Docker.start(browser).should.eventually
        //.eql( {state: 'started'} )
        .containSubset( {state: 'running'} )
    })

    it('should up while already started', function(){
      return Docker.up(browser).should.eventually
        //.have.property('state').and.equal('running')
        .containSubset( {state: 'running'} )
    })

    it('should stop', function(){
      return Docker.stop(browser).should.eventually
        //.eql({ state: 'stopped' })
        .containSubset( {state: 'exited'} )
    })

    it('should down any running instances', function(){
      return Docker.down(browser).should.eventually
        //.eql({ state: 'none' })
        .containSubset( {state: 'none'} )
    })

  })

  Browsers.thatHaveAContainer().forEach(browser => {

    describe(`Commands on ${browser} container`, function(){

      before(function(){
        Docker.init()
      })

      after(function(){
        Docker.rmf(`${browser}`)
      })

      it('should up a browser container', function(){
        this.timeout(5000)
        return Docker.up(browser).should
          .eventually.have.property('state').and.equal('running')
      })

      it('should down the browser container', function(){
        return Docker.down(browser).should
          .eventually.have.property('state').and.equal('none')
      })

    })

  })

})
