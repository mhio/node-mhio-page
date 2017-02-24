# [webdriverio-page](https://github.com/deployable/webdriverio-page)

## Page webdriverio class

This provides a Page class that completes all the standard webdriver tasks required for 
an application. 

This class can be extended to match your needs

## Usage

```javascript

const { Page } = require('webdriverio-page')

class SearchPage extends Page {

  google(term){
    return this.openUrl('https://www.google.com')
      .then(()=> this.wait('#lst-ib'))
      .then(()=> this.browser.setValue('#lst-ib', term))
      .then(()=> this.browser.submitForm('#tsf'))
      .then(()=> this.wait('#b_results', 5000))
  }

}

const lp = new LandingPage({
  host: 'www.google.com',
  scheme: 'https',
  remote_browser: 'firefox'
})

lp.google('test').then(res => {
  console.log('title', lp.title())
  return lp.screenShot('./search.png')
})
.catch(err => {
 lp.screenShot('./error.png')
 console.error(err)
})
```

## Install
 

```
    npm install webdriverio-page --save-dev

    yarn add webdriverio-page --dev

```

## About

webdriverio-page is released under the MIT license.

Copyright 2016 Matt Hoyle - code at deployable.co

https://github.com/deployable/webdriverio-page

