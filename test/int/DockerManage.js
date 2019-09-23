/* global expect chai */
const { DockerManage } = require('../../src')
chai.should()

describe('Integration::page::DockerManage', function(){

  describe('Commands on stub container', function(){
    this.timeout(11000)

    const container_image = 'mhio/selenium-standalone-stub'
    const container_name = `docker-manage-test-stub-${Date.now()}`

    after(function(){
      return DockerManage.rmf(container_name)
    })

    it('should down any running instances', async function(){
      let res = await DockerManage.down(container_name)
      return expect( res ).to.containSubset({ state: 'none' })
    })

    it('should check they are down', function(){
      return DockerManage.check(container_name).should.eventually
        .containSubset({ state: 'none' })
    })

    it('should run from down', function(){
    this.timeout(15000)
      return DockerManage.run(container_image, { name: container_name }).should.eventually
        //.eql({ state: 'running' })
        .containSubset({ state: 'running' })
    })

    it('should check running', function(){
      return DockerManage.check(container_name).should.eventually
        //.eql({ state: 'running' })
        .containSubset({ state: 'running' })
    })

    it('should stop from running', function(){
      return DockerManage.stop(container_name).should.eventually
        .containSubset({ state: 'exited' })
    })

    it('should start from stopped', function(){
      return DockerManage.start(container_name).should.eventually
        //.eql({ state: 'running' })
        .containSubset({ state: 'running' })
    })

    it('should check started', function(){
      return DockerManage.check(container_name).should.eventually
        //.eql({ state: 'running' })
        .containSubset({ state: 'running' })
    })


    describe('testTcp', function(){

      let server = null

      before(function(done){
        server = require('net').createServer(function(socket){
          socket.write('Echo server\r\n')
          socket.pipe(socket)
        })
        server.listen(50505, '127.0.0.1', done)
      })

      after(function(){
        server.close()
      })

      it('should fail to test a closed tcp port', async function(){
        return DockerManage.testTcp('127.0.0.1', 50504, 2, 50).should
          .be.rejectedWith(/connect ECONNREFUSED/)
      })

      it('should test a tcp port', function(){
        return DockerManage.testTcp('127.0.0.1', 50505, 2, 50)
      })

    })

    describe('testHttp', function(){

      let server = null
      let port = null
      let host = '127.0.0.1'

      before(function(done){
        let app = require('express')()
        app.use((req, res, next) => {
          if (req.url === '/good') res.send('good')
          if (req.url === '/bad') res.status(403).send('bad')
          next()
        })
        server = app.listen(()=> {
          port = server.address().port
          done()
        })
      })

      after(function(){
        server.close()
      })

      it('should fail to test a closed tcp port', async function(){
        return DockerManage.testHttp(`http://${host}:${port-1}/`, 2, 50).should
          .be.rejectedWith(/connect ECONNREFUSED/)
      })

      it('should test a bad request (404)', function(){
        return DockerManage.testHttp(`http://${host}:${port}/bad`, 2, 50).should
          .be.rejectedWith(/Bad status code for/)
      })

      it('should test a good request (200)', function(){
        return DockerManage.testHttp(`http://${host}:${port}/good`, 2, 50)
      })

    })


    describe('runWaitTcp', function(){

      before(function () {
        return DockerManage.rmf(container_name)
      })

      after(function () {
        return DockerManage.rmf(container_name)
      })

      it('should run and wait for port', function(){
        return DockerManage.runWaitTcp(
          container_image,
          { p: '40404:4444', name: container_name },
          '127.0.0.1',
          40404
        ).should.eventually
          //.have.property('state').and.equal('running')
          .containSubset({ state: 'running' })
      })

    })


    describe('runWaitHttp', function(){

      before(function () {
        return DockerManage.rmf(container_name)
      })

      after(function () {
        return DockerManage.rmf(container_name)
      })

      it('should run and wait for http', function(){
        return DockerManage.runWaitHttp(
          container_image,
          { p: '40404:4444', name: container_name },
          'http://localhost:40404/'
        ).should.eventually
          //.have.property('state').and.equal('running')
          .containSubset({ state: 'running' })
      })

    })


    describe('down from running', function(){

      before(function () {
        return DockerManage.up(container_image, container_name).delay(20)
      })

      after(function () {
        return DockerManage.rmf(container_name)
      })

      it('should down a running container', function(){
        return DockerManage.down(container_name).should.eventually
          //.have.property('state').and.equal('running')
          .containSubset({ state: 'none' })
      })

      it('should check that container is actually down', function(){
        return DockerManage.check(container_name).should.eventually
          //.have.property('state').and.equal('running')
          .containSubset({ state: 'none' })
      })

    })


    it('should stop', function(){
      return DockerManage.stop(container_name).should.eventually
        //.eql({ state: 'stopped' })
        .containSubset({ state: 'exited' })
    })

    it('should down any running instances', function(){
      return DockerManage.down(container_name).should.eventually
        //.eql({ state: 'none' })
        .containSubset({ state: 'none' })
    })

    it('should up', function(){
      return DockerManage.up(container_image, container_name).should.eventually
        //.have.property('state').and.equal('running')
        .containSubset({ state: 'running' })
    })

    it('should start while already up', function(){
      return DockerManage.start(container_name).should.eventually
        //.eql({ state: 'started' })
        .containSubset({ state: 'running' })
    })

    it('should up while already started', function(){
      return DockerManage.up(container_image, container_name).should.eventually
        //.have.property('state').and.equal('running')
        .containSubset({ state: 'running' })
    })

    it('should stop', function(){
      return DockerManage.stop(container_name).should.eventually
        //.eql({ state: 'stopped' })
        .containSubset({ state: 'exited' })
    })

    it('should down any running instances', function(){
      return DockerManage.down(container_name).should.eventually
        //.eql({ state: 'none' })
        .containSubset({ state: 'none' })
    })

  })

})
