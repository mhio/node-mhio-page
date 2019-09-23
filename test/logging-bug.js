async function test(){
  try {
    let conf = { capabilities: {}, logLevel: 'silent', logLevels: { webdriver: 'silent' }}
    const browser = await require('webdriverio').remote(conf)
    browser.url('/test')
  }
  catch (e) {}
}
test()
