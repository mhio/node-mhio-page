// # Search Example

const path = require('path')
const { Docker, Page } = require('../')

// Extend the Page class with custom methods

class SearchPage extends Page {

  search(engine, term){
    if (!this[engine]) throw new Error(`No search engine ${engine}`)
    return this[engine](term)
  }

  google(term){
    return this.openUrl('https://www.google.com')
      .then(()=> this.wait('#lst-ib'))
      .then(()=> this.browser.setValue('#lst-ib', term))
      .then(()=> this.browser.submitForm('#tsf'))
      .then(()=> this.wait('#b_results', 5000))
  }
  
  bing(term){
    return this.openUrl('https://www.bing.com')
      .then(()=> this.wait('#sb_form_q'))
      .then(()=> this.browser.setValue('#sb_form_q', term))
      .then(()=> this.browser.submitForm('#sb_form'))
      .then(()=> this.wait('#b_results', 5000))
  }
 
}


// Crete a class instance

const lp = new SearchPage({
  host: 'www.bing.com',
  scheme: 'https',
  remote_browser: 'firefox',
  remote_port: 44446
})

// Use the custom `.search` method

lp.search('bing','test').then(res => {
  console.log('search', res)
  console.log('title', lp.title())
  return lp.screenShot(path.join(__dirname,'output','search.png')
})
.then(res => console.log('ss', res))
.catch(err => {
 lp.screenShot(path.join(__dirname,'output','error.png')
 console.error(err)
})

