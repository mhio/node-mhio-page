# [deployable-page](https://github.com/deployable/node-deployable-page)

## Page layout and component testing with Webdriver.io

This provides a `Page` class that contains all the standard webdriver tasks and setup
required for a web application. 

This class can be used on it's own but would normally be extended to contain 
test helpers for your page layouts and components

## Usage

```javascript

const { Page } = require('@deployable/page')

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
    npm install @deployable/page --save-dev

    yarn add @deployable/page --dev

```

## About

deployable-page is released under the MIT license.

Copyright 2016 Matt Hoyle - code at deployable.co

https://github.com/deployable/node-deployable-page
https://deployable.co/code/node/page

