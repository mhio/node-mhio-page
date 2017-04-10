// # Search Example

const Promise = require('bluebird')
const { Page } = require('../')

// Extend the Page class with custom methods

class SearchPage extends Page {

  search(engine, term){
    let searchFn = `${engine}Search`
    if (!this[searchFn]) throw new Error(`No search engine ${engine}`)
    return this[searchFn](term)
  }

  bingSearch(term){
    return this.openUrl('https://www.bing.com/')
      .then(()=> this.wait('#sb_form_q'))
      .then(()=> this.browser.setValue('#sb_form_q', term))
      .then(()=> this.browser.submitForm('#sb_form'))
      .then(()=> this.wait('#b_results', 5000))
  }

  googleSearch(term){
    return this.openUrl('https://www.google.com/ncr')
      .then(()=> this.wait('#lst-ib'))
      .then(()=> this.browser.setValue('#lst-ib', term))
      .then(()=> this.browser.submitForm('#tsf'))
      .then(()=> this.wait('.srg', 5000))
  }

}


// Crete an instance of the Page object

const sp = new SearchPage({
  host: 'www.bing.com',
  scheme: 'https',
  remote_browser: 'firefox'
})

// Use the custom `.search` method
sp.screen_shot_path = __dirname
sp.search('bing','test')
  .then(()=> sp.screenShot('search-bing.png'))
  .catch(err => {
    console.error(err)
    return sp.screenShot('error-bing.png')
  })
  .then(()=> sp.search('google','test'))
  .then(()=> sp.screenShot('search-goog.png'))
  .catch(err => {
    console.error(err)
    return sp.screenShot('error-goog.png')
  })

// Promise.each(promises)
//   .then(res => console.log('done', res ))
//   .catch(err => {
//     sp.screenShot('error.png')
//     console.error(err)
//   })

