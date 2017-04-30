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

const sp = new SearchPage({
  host: 'www.google.com',
  scheme: 'https',
  browser: 'firefox'
})

// Creating a new `Page` can run some async tasks in the background
// to setup the app, docker and selenium. These need to be waited for.

sp.promise
  .then(()=> sp.google('test'))
  .then(res => {
    console.log('title', sp.title())
    return sp.screenShot('./search.png')
  })
  .catch(err => {
   sp.screenShot('./error.png')
   console.error(err)
  })

```
You can return the init promise via the static method `setupAsync`
instead of calling `new Page`.

```
describe('webdriver', function(){
  let page = null
  before('Setup Page', function(){
    return SearchPage.setupAsync({ app: app, browser: 'chrome' })
      .then(res => page = res)
  })
  it('searches for test', function(){
    return page.google('test')
  })
})
```


## Environment variables.

The following environment variables will override the default paramaters
for any options. Options specified in code take precedence over environment.

Page/testing options
```
PAGE_SCHEME=http
PAGE_HOST=localhost
PAGE_PORT=8080
PAGE_PATH=/some/prefix
```

Webdriver options
```
PAGE_BROWSER=chrome
PAGE_REMOTE_HOST=localhost
PAGE_REMOTE_PORT=4444
PAGE_REMOTE_PATH=/wdui
```

Debug
```
DEBUG='dply:page:*'
DEBUG='webdriver:*'

## API

### `new Page`

`new Page({options})` returns a `Page` instance. The `.promises` property contains
the array of initialisation promises and can be waited on with `Promise.all`.

`Page.setupAsync({options})` resolves the `Page` instance after initialisation has completed

#### Options:

`label` - A label to use for the page in logging/errors.

`app` - An express app to launch and test against.

`docker` - Use selenium in a container (firefox/chrome)

##### Async notifiers

`cb_app` - Callback function for app init completed

`cb_docker` - Callback function for docker init completed

`cb_wd` - Callback function for webdriver init completed

`cb` - Callback function for init completed

##### Url options

`scheme` - Scheme to use in default testing URL. Env: `PAGE_SCHEME`.

`host` - Host to use in default testing URL. Env: `PAGE_HOST`.

`port` - Port to use in default testing URL. Env: `PAGE_PORT`.

`path` - Path to use in default testing URL. Env `PAGE_PATH`.

##### Webdriver remote options

`remote_browser` - Name of remote webdriver browser.
Env `PAGE_BROWSER`.

`remote_host` - Host name of remote webdriver server.
Env `PAGE_BROWSER`.

`remote_port` - Port of remote webdriver server.
Env `PAGE_REMOTE_PORT`.

`remote_path` - Path for of remote webdriver URL.
Env `PAGE_REMOTE_PATH`.

`no_async_init` - Do no start async init tasks (app, docker, webdriver)


### `.browser`

The [webdriverio](https://webdriver.io) instance is available to complete any
custom actions you require.


### `.title()`

Get the current pages title.


### `.exists(css_String)`

Does a css selector exist in the current page.


### `.wait( css_String, ms_Number` )

Wait for a selector to exist.
`timeout` defaults to 500ms.


### `.html( css_String )`

Get the html from the current browser, with an optional selector.
The selector defaults to `body`.


### `.source()`

Get the complete source of the current browser.


### `.screenShotPath( paths... )`

Set the default screen shot path


### `.screenShot( name )`
Take a screenshot of the current browser. Relative paths require `.screenShotPath()` to have been set.



## About

deployable-page is released under the MIT license.

Copyright 2016 Matt Hoyle - code atat deployable.co

https://github.com/deployable/node-deployable-page
https://deployable.co/code/node/page

