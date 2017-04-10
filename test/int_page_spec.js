/* global expect */
const debug = require('debug')('dply:test:int:page')
const { Page, Docker, Browsers } = require('../')
const { TestEnv } = require('@deployable/test')


// Test fixture app
const app = require('express')()
app.get('/',(req, res)=> res.send('hello!'))
app.get('/test',(req, res)=> {
  res.send('<body><title>atitle</title></head><body><div id="adiv">abody</div></body>')
})


describe('Integration::page::Page', function(){

  const test_env = TestEnv.setupTestDir(__dirname)

  Browsers.thatHaveAContainer().forEach(browser => {

    describe(`setup ${browser}`, function(){

      let page = null

      afterEach(function(){
        return page.end()
      })

      it('should create docker Page/app', function(){
        this.timeout(15000)
        page = new Page({
          app: app,
          docker: true
        })
        return page.promise
      })

      it('should create standard Page/app', function(){
        this.timeout(15000)
        page = new Page({
          app: app,
          host: Page.ip()
        })
        return page.promise
      })

    })


    describe(`${browser}`, function(){

      this.timeout(5000)
      let page = null

      before('create Page/app', function(){
        this.timeout(15000)
        page = new Page({
          app: app,
          browser: browser,
          docker: true
        })
        return page.promise
      })

      after('end webdriver/selenium session', function(){
        return page.end()
      })

      afterEach('Test failure debug', function(){
        //debug('test `%s` %s', this.currentTest.title, this.currentTest.state)
        if (this.currentTest.state === 'failed') {
          return page.source().then(src => debug('page source', src))
        }
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
