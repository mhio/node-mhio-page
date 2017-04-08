/* global expect */
const debug = require('debug')('dply:test:int:page')
const { Page, Docker, Browsers } = require('../')
const _ = require('lodash')
const { TestEnv } = require('@deployable/test')
const Promise = require('bluebird')


// Test fixture app
const app = require('express')()
app.get('/test',(req, res)=> {
  res.send('<body><title>atitle</title></head><body><div id="adiv">abody</div></body>')
})

// IP fixture
// Find the first, external, IPv4 address
let ip = _(require('os').networkInterfaces())
  .map(o => _.find(o, {internal: false, family: 'IPv4'}))
  .compact()
  .first()
  .address
if (!ip) throw new Error('Couldn\'t find a local IP to connect to')



describe('Integration::page::Page', function(){

  const test_env = TestEnv.setupTestDir(__dirname)

  Browsers.thatHaveAContainer().forEach(browser => {

    describe(`${browser}`, function(){

      this.timeout(5000)
      let page = null

      before('starting container', function(){
        this.timeout(15000)
        return Docker.up(browser)
      })

      before('create Page/app', function(){
        this.timeout(30000)
        page = new Page({
          app: app,
          browser: browser,
          host: ip
        })
        return page.promise
      })


      it('should generate a local url', function(){
        expect( page.url('/test') ).to.match( /^http:\/\/.+:\d+\/test$/ )
      })

      it('should set a url /test', function(){
        return expect( page.open('/test') )
          .to.eventually.have.property('state')
          .and.equal('success')
      })

      it('should set a url /test', function(){
        return expect( page.open() )
          .to.eventually.have.property('state')
          .and.equal('success')
      })

      it('should set a full url /test', function(){
        let full_url = page.url('/testa')
        return expect( page.openUrl(full_url) )
          .to.eventually.have.property('state')
          .and.equal('success')
      })


      describe('/test', function(){

        before('opening /test', function(){
          return page.open('/test')
        })

        it('should get the urls title', function(){
          return expect( page.title() ).to.become( 'atitle' )
        })

        it('should get the #adiv element', function(){
          return expect( page.exists('#adiv') ).to.become( true )
        })

        it('should wait for the #adiv element', function(){
          return expect( page.wait('#adiv') ).to.become( true )
        })

        it('should get the #adiv html', function(){
          return expect( page.html('#adiv') ).to.become( '<div id="adiv">abody</div>' )
        })

      })


      describe('screen shot', function(){

        const output = test_env.output('ss')

        before('clean', function(){
          return output.clean()
        })

        after('clean', function(){
          return output.clean()
        })

        it('should take a screen to output', function(){
          page.screenShotPath(output.path())
          return page.screenShot('testing.png').then(res => {
            expect( __dirname, 'output', 'testing' ).to.be.a.file
          })
        })

      })

    })

  })

})
