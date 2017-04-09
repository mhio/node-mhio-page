# [deployable-page](https://github.com/deployable/node-deployable-page)

## Page layout and component testing with Webdriver.io

This provides a `Page` class that contains all the standard webdriver tasks and setup
required for a web application.

This class can be used on it's own but would normally be extended to contain
test helpers for your page layouts and components


## Install

Yarn

    yarn add @deployable/page --dev

NPM

    npm install @deployable/page --save-dev


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

const lp = new SearchPage({
  host: 'www.google.com',
  scheme: 'https',
  browser: 'firefox'
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


### Environment variables.

Page testing
```
PAGE_SCHEME=http
PAGE_HOST=localhost
PAGE_PORT=8080
PAGE_PATH=/some/prefix
```

Webdriver
```
PAGE_BROWSER=chrome
PAGE_REMOTE_HOST=localhost
PAGE_REMOTE_PORT=4444
PAGE_REMOTE_PATH=/wdui
```


## About

deployable-page is released under the MIT license.

Copyright 2016 Matt Hoyle - code atat deployable.co

https://github.com/deployable/node-deployable-page
https://deployable.co/code/node/page

