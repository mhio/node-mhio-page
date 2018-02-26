/* global expect chai */
const debug = require('debug')('dply:test:int:page')
const { Page, Browsers } = require('../src')
const { TestEnv } = require('@deployable/test')
chai.should()

// Test fixture app
const app = require('express')()
const app_html = '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>atitle</title></head><body><div id="adiv">abody</div></body></html>'
app.get('/',(req, res)=> res.send('hello!'))
app.get('/test',(req, res)=> {
  res.send(app_html)
})


describe('Integration::page::Page', function(){

  const test_env = TestEnv.setupTestDir(__dirname)

  Browsers.thatHaveAContainer().forEach(browser => {

    describe(`setup for ${browser}`, function(){

      let page = null

      afterEach('end page', function(){
        this.timeout(5000)
        return page.end()
      })

      afterEach('close app server', function(){
        if (page && page.appserver) page.appserver.close()
      })

      it('should create standard Page/app with docker webdriver', function(){
        this.timeout(15000)
        page = new Page({
          app: app,
          docker: true
        })
        return page.promise
      })

      it('should create standard Page/app relying on webdriver', function(){
        this.timeout(15000)
        page = new Page({
          app: app,
          host: Page.ip()
        })
        return page.promise
      })

      it('should create standard Page/app via setupAsync relying on webdriver', function(){
        this.timeout(15000)
        return Page.setupAsync({ app: app, host: Page.ip() })
          .then(res => page = res)
      })

    })


    describe(`testing for ${browser}`, function(){

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
        if (page) return page.end()
      })

      afterEach('Test failure Page debug', async function(){
        //debug('test `%s` %s', this.currentTest.title, this.currentTest.state)
        if (this.currentTest.state === 'failed') {
          if (page && debug) {
            let src = await page.source()
            debug('failed page source', src)
            let txt = await page.text('body')
            debug('failed page text', txt)
          }
        }
      })

      after('Test failure debug', function(){
        if (page && page.appserver) page.appserver.close()
      })

      it('should generate a local url', function(){
        expect( page.generateUrl('/test') ).to.match( /^http:\/\/.+:\d+\/test$/ )
      })

      it('should open a url /test', function(){
        this.timeout(15000)
        return page.open('/test').should
          .eventually.have.property('status')
          .and.equal(0)
      })

      it('should open a default url', function(){
        return page.open().should
          .eventually.have.property('status')
          .and.equal(0)
      })

      it('should open a full url for /test', function(){
        let full_url = page.generateUrl('/test')
        return page.openUrl(full_url).should
          .eventually.have.property('status')
          .and.equal(0)
      })


      describe('/test', function(){

        before('test opening /test', function(){
          return page.testOpen('/test')
        })

        before('opening /test', function(){
          return page.open('/test')
        })

        it('should get the source', function(){
          return expect( page.source() ).to.become( app_html )
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

        it('should get the source', function(){
          return expect( page.source() ).to.become( app_html )
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

        it('should error when taking a screen shot without a path', function(){
          return expect( page.screenShot('testing.png') ).to.be.rejectedWith(Error, /path/)
        })

        it('should take a screen to output', function(){
          page.screenShotPath(output.path())
          return page.screenShot('testing.png').then(()=> {
            expect( __dirname, 'output', 'testing' ).to.be.a.file
          })
        })

      })

    })

  })

})
