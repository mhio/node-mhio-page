## Classes

<dl>
<dt><a href="#DockerManage">DockerManage</a></dt>
<dd><p>Manage the selenium docker containers.
Should be using an API rather than docker command line</p></dd>
<dt><a href="#Page">Page</a></dt>
<dd><p>Generic Page helper, to be extended</p></dd>
</dl>

<a name="DockerManage"></a>

## DockerManage
<p>Manage the selenium docker containers.
Should be using an API rather than docker command line</p>

**Kind**: global class  

* [DockerManage](#DockerManage)
    * [.command(args)](#DockerManage.command)
    * [.testTcp(host, port, [retries], [delay], [retry])](#DockerManage.testTcp)
    * [.testHttp(url, [retries], [delay], [retry])](#DockerManage.testHttp)
    * [.up(image_name, container_name, options)](#DockerManage.up)
    * [.down(container_name)](#DockerManage.down)
    * [.check(container_name)](#DockerManage.check)
    * [.stop(container_name)](#DockerManage.stop) ⇒ <code>object</code>
    * [.stopNice(container_name)](#DockerManage.stopNice)
    * [.startWaitTcp(container_name, host, port, retries, delay)](#DockerManage.startWaitTcp)
    * [.startWaitHttp(container_name, url, retries, delay)](#DockerManage.startWaitHttp)
    * [.start(container_name)](#DockerManage.start)
    * [.rm(container_name)](#DockerManage.rm)
    * [.rmf(container_name)](#DockerManage.rmf)
    * [.runWaitTcp(container_name, options, host, port)](#DockerManage.runWaitTcp)
    * [.runWaitHttp(container_name, options, url)](#DockerManage.runWaitHttp)
    * [.run(image, options)](#DockerManage.run) ⇒ <code>Object</code>


* * *

<a name="DockerManage.command"></a>

### DockerManage.command(args)
<p>Run a generic <code>docker</code> passing along all args.</p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>array</code> | <p><code>docker</code> argv array</p> |


* * *

<a name="DockerManage.testTcp"></a>

### DockerManage.testTcp(host, port, [retries], [delay], [retry])
<p>Test a TCP host/port for response</p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| host | <code>string</code> |  | <p>Host or IP to test</p> |
| port | <code>number</code> |  | <p>TCP Port number to test</p> |
| [retries] | <code>number</code> | <code>10</code> | <p>Number of retries</p> |
| [delay] | <code>number</code> | <code>200</code> | <p>Delay between retries in milliseconds</p> |
| [retry] | <code>number</code> | <code>1</code> | <p>Current retry count</p> |


* * *

<a name="DockerManage.testHttp"></a>

### DockerManage.testHttp(url, [retries], [delay], [retry])
<p>Test a HTTP(S) URL for response</p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  | <p>URL to test</p> |
| [retries] | <code>number</code> | <code>10</code> | <p>Number of retries</p> |
| [delay] | <code>number</code> | <code>200</code> | <p>Delay between retries in milliseconds</p> |
| [retry] | <code>number</code> | <code>1</code> | <p>Current retry count</p> |


* * *

<a name="DockerManage.up"></a>

### DockerManage.up(image_name, container_name, options)
<p>Bring up a docker container</p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  

| Param | Type | Description |
| --- | --- | --- |
| image_name | <code>string</code> | <p>Container image name</p> |
| container_name | <code>string</code> | <p>Name of the container to run</p> |
| options | <code>object</code> | <p>Options passed to <code>Docker#run</code></p> |


* * *

<a name="DockerManage.down"></a>

### DockerManage.down(container_name)
<p>Bring down a running docker container</p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  

| Param | Type | Description |
| --- | --- | --- |
| container_name | <code>string</code> | <p>Name of the container to stop</p> |


* * *

<a name="DockerManage.check"></a>

### DockerManage.check(container_name)
<p>Check the state of a container
Docker states:
https://github.com/moby/moby/blob/66e6beeb249948634e2815ef5cac97984d5c0d56/container/state.go#L114-L138
<code>paused</code> implies running
<code>restarting</code> implies running
<code>removing</code>
<code>dead</code>
<code>created</code>
<code>exited</code></p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  

| Param | Type | Description |
| --- | --- | --- |
| container_name | <code>string</code> | <p>Container name to check</p> |


* * *

<a name="DockerManage.stop"></a>

### DockerManage.stop(container_name) ⇒ <code>object</code>
<p>Stop a container</p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  
**Returns**: <code>object</code> - <ul>
<li></li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| container_name | <code>string</code> | <p>Container name to check</p> |


* * *

<a name="DockerManage.stopNice"></a>

### DockerManage.stopNice(container_name)
<p>Nicely stop a container</p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  

| Param | Type | Description |
| --- | --- | --- |
| container_name | <code>string</code> | <p>Container name</p> |


* * *

<a name="DockerManage.startWaitTcp"></a>

### DockerManage.startWaitTcp(container_name, host, port, retries, delay)
<p>Start a container and wait for a TCP port</p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  

| Param | Type | Description |
| --- | --- | --- |
| container_name | <code>string</code> | <p>Container name</p> |
| host | <code>string</code> | <p>Host name or IP to check</p> |
| port | <code>number</code> \| <code>string</code> | <p>TCP port to wit on</p> |
| retries | <code>number</code> | <p>Number of retries</p> |
| delay | <code>number</code> | <p>Delay between retries in milliseconds</p> |


* * *

<a name="DockerManage.startWaitHttp"></a>

### DockerManage.startWaitHttp(container_name, url, retries, delay)
<p>Start a container and wait for a URL to respond</p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  

| Param | Type | Description |
| --- | --- | --- |
| container_name | <code>string</code> | <p>Container name</p> |
| url | <code>string</code> | <p>URL to check</p> |
| retries | <code>number</code> | <p>Number of retries</p> |
| delay | <code>number</code> | <p>Delay between retries in milliseconds</p> |


* * *

<a name="DockerManage.start"></a>

### DockerManage.start(container_name)
<p>Start a container</p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  

| Param | Type | Description |
| --- | --- | --- |
| container_name | <code>string</code> | <p>Container name</p> |


* * *

<a name="DockerManage.rm"></a>

### DockerManage.rm(container_name)
<p>Remove a container</p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  

| Param | Type | Description |
| --- | --- | --- |
| container_name | <code>string</code> | <p>Container name</p> |


* * *

<a name="DockerManage.rmf"></a>

### DockerManage.rmf(container_name)
<p>Forcibly removes a container</p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  

| Param | Type | Description |
| --- | --- | --- |
| container_name | <code>string</code> | <p>Container name</p> |


* * *

<a name="DockerManage.runWaitTcp"></a>

### DockerManage.runWaitTcp(container_name, options, host, port)
<p>Run a container and wait for TCP port</p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  

| Param | Type | Description |
| --- | --- | --- |
| container_name | <code>string</code> | <p>Container name</p> |
| options | <code>Object</code> | <ul> <li></li> </ul> |
| host | <code>string</code> | <p>Hostname or IP</p> |
| port | <code>string</code> \| <code>number</code> | <p>TCP Port</p> |


* * *

<a name="DockerManage.runWaitHttp"></a>

### DockerManage.runWaitHttp(container_name, options, url)
<p>Run a container and wait for HTTP URL</p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  

| Param | Type | Description |
| --- | --- | --- |
| container_name | <code>string</code> | <p>Container name</p> |
| options | <code>Object</code> | <ul> <li></li> </ul> |
| url | <code>string</code> | <p>HTTP(S) URL to check</p> |


* * *

<a name="DockerManage.run"></a>

### DockerManage.run(image, options) ⇒ <code>Object</code>
<p>Run a container, with command line options</p>

**Kind**: static method of [<code>DockerManage</code>](#DockerManage)  
**Returns**: <code>Object</code> - <ul>
<li>Status</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| image | <code>string</code> | <p>Image name</p> |
| options | <code>Object</code> | <p>Object of command line args</p> |


* * *

<a name="Page"></a>

## Page
<p>Generic Page helper, to be extended</p>

**Kind**: global class  

* [Page](#Page)
    * [new Page(msg, [options])](#new_Page_new)
    * _instance_
        * [.uid](#Page+uid)
        * [.debug](#Page+debug)
        * [.promises](#Page+promises)
        * [.init()](#Page+init)
        * [.initAsync(options)](#Page+initAsync)
        * [.initDocker()](#Page+initDocker)
        * [.initWebdriverTest()](#Page+initWebdriverTest)
        * [.initWebdriverReal()](#Page+initWebdriverReal)
        * [.initWebdriver(options)](#Page+initWebdriver)
        * [.end()](#Page+end)
        * [.close()](#Page+close)
        * [.generateUrl(path)](#Page+generateUrl)
        * [.testOpen(path)](#Page+testOpen)
        * [.open(path)](#Page+open)
        * [.openUrl(full_url)](#Page+openUrl)
        * [.findElement(selector)](#Page+findElement)
            * [.$(selector)](#Page+findElement+$)
        * [.setValue(selector, value)](#Page+setValue)
            * [.fillField(selector, value)](#Page+setValue+fillField)
        * [.getValue(selector)](#Page+getValue)
        * [.title()](#Page+title)
        * [.exists(selector)](#Page+exists)
        * [.wait(selector, [timeout])](#Page+wait)
        * [.html([selector])](#Page+html) ⇒ <code>string</code>
        * [.source()](#Page+source) ⇒ <code>string</code>
        * [.text([selector])](#Page+text) ⇒ <code>string</code>
        * [.screenShotPath(...dir_paths)](#Page+screenShotPath) ⇒ <code>string</code>
        * [.screenShot(file_name)](#Page+screenShot)
    * _static_
        * [.eachBrowser(fn)](#Page.eachBrowser)
        * [.browsers()](#Page.browsers) ⇒ <code>array</code>
        * [.ip([family], [internal])](#Page.ip)
        * [.setupAsync(options)](#Page.setupAsync) ⇒ [<code>Promise.&lt;Page&gt;</code>](#Page)


* * *

<a name="new_Page_new"></a>

### new Page(msg, [options])

| Param | Type |
| --- | --- |
| msg | <code>string</code> | 
| [options] | <code>object</code> | 


* * *

<a name="Page+uid"></a>

### page.uid
<p>Unique ID</p>

**Kind**: instance property of [<code>Page</code>](#Page)  

* * *

<a name="Page+debug"></a>

### page.debug
<p>debug log instance</p>

**Kind**: instance property of [<code>Page</code>](#Page)  

* * *

<a name="Page+promises"></a>

### page.promises
<p>The instance property <code>promises</code> will be an array populated with
any initialisation promises.</p>

**Kind**: instance property of [<code>Page</code>](#Page)  

* * *

<a name="Page+init"></a>

### page.init()
<p>Setup a browser instance for testing
A constructor can't return a promise to signal
startup, but we can store one for external interrogation</p>

**Kind**: instance method of [<code>Page</code>](#Page)  

* * *

<a name="Page+initAsync"></a>

### page.initAsync(options)
<p>Does the async initialisation of the class,
Stores promise functions in <code>this.promises</code> for serial initialisation
Stores overall status in <code>this.promise</code></p>

**Kind**: instance method of [<code>Page</code>](#Page)  

| Param | Type |
| --- | --- |
| options | <code>\*</code> | 


* * *

<a name="Page+initDocker"></a>

### page.initDocker()
<p>Resolves promise when docker selenium is up.
Also calls <code>cb_docker</code> if it exists.</p>

**Kind**: instance method of [<code>Page</code>](#Page)  

* * *

<a name="Page+initWebdriverTest"></a>

### page.initWebdriverTest()
**Kind**: instance method of [<code>Page</code>](#Page)  

* * *

<a name="Page+initWebdriverReal"></a>

### page.initWebdriverReal()
**Kind**: instance method of [<code>Page</code>](#Page)  

* * *

<a name="Page+initWebdriver"></a>

### page.initWebdriver(options)
<p>Resolves promise when webdriver is ready.
Also calls <code>cb_wd</code> if it exists.</p>

**Kind**: instance method of [<code>Page</code>](#Page)  

| Param | Type |
| --- | --- |
| options | <code>\*</code> | 


* * *

<a name="Page+end"></a>

### page.end()
<p>End the browser, usually in <code>after</code></p>

**Kind**: instance method of [<code>Page</code>](#Page)  

* * *

<a name="Page+close"></a>

### page.close()
<p>Close down everything, end the browser and any selenium, usually in <code>after</code></p>

**Kind**: instance method of [<code>Page</code>](#Page)  

* * *

<a name="Page+generateUrl"></a>

### page.generateUrl(path)
<p>Generate a url from the class host/port</p>

**Kind**: instance method of [<code>Page</code>](#Page)  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | <p>URL Path to append to host</p> |


* * *

<a name="Page+testOpen"></a>

### page.testOpen(path)
<p>Test a URL with needle</p>

**Kind**: instance method of [<code>Page</code>](#Page)  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | <p>URL path to append to host</p> |


* * *

<a name="Page+open"></a>

### page.open(path)
<p>Open a path, built from the default URL.</p>

**Kind**: instance method of [<code>Page</code>](#Page)  

| Param | Type |
| --- | --- |
| path | <code>string</code> | 


* * *

<a name="Page+openUrl"></a>

### page.openUrl(full_url)
<p>Open a full url, not relying on default host</p>

**Kind**: instance method of [<code>Page</code>](#Page)  

| Param | Type | Description |
| --- | --- | --- |
| full_url | <code>string</code> | <p>Full URL to open including host</p> |


* * *

<a name="Page+findElement"></a>

### page.findElement(selector)
<p>Select an element</p>

**Kind**: instance method of [<code>Page</code>](#Page)  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | <p>CSS/XPath selector</p> |


* * *

<a name="Page+findElement+$"></a>

#### findElement.$(selector)
<p>Select an element</p>

**Kind**: instance method of [<code>findElement</code>](#Page+findElement)  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | <p>CSS/XPath selector</p> |


* * *

<a name="Page+setValue"></a>

### page.setValue(selector, value)
<p>Find an input element and set the value.</p>

**Kind**: instance method of [<code>Page</code>](#Page)  

| Param | Type |
| --- | --- |
| selector | <code>\*</code> | 
| value | <code>\*</code> | 


* * *

<a name="Page+setValue+fillField"></a>

#### setValue.fillField(selector, value)
<p>Find an input element and set the value.</p>

**Kind**: instance method of [<code>setValue</code>](#Page+setValue)  

| Param | Type |
| --- | --- |
| selector | <code>\*</code> | 
| value | <code>\*</code> | 


* * *

<a name="Page+getValue"></a>

### page.getValue(selector)
<p>Find an  element and get the value.</p>

**Kind**: instance method of [<code>Page</code>](#Page)  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | <p>CSS/XPath selector</p> |


* * *

<a name="Page+title"></a>

### page.title()
<p>Get the current pages title.</p>

**Kind**: instance method of [<code>Page</code>](#Page)  

* * *

<a name="Page+exists"></a>

### page.exists(selector)
<p>Does a css/xpath selector exist in the current page.</p>

**Kind**: instance method of [<code>Page</code>](#Page)  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | <p>CSS/XPath selector</p> |


* * *

<a name="Page+wait"></a>

### page.wait(selector, [timeout])
<p>Wait for a selector to exist</p>

**Kind**: instance method of [<code>Page</code>](#Page)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| selector | <code>string</code> |  | <p>CSS/XPath selector</p> |
| [timeout] | <code>number</code> | <code>500</code> | <p>Timeout in milliseconds</p> |


* * *

<a name="Page+html"></a>

### page.html([selector]) ⇒ <code>string</code>
<p>Get the html from the current browser, with an optional selector.
The selector defaults to <code>body</code>.</p>

**Kind**: instance method of [<code>Page</code>](#Page)  
**Returns**: <code>string</code> - <ul>
<li>HTML of selected element</li>
</ul>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [selector] | <code>string</code> | <code>&quot;body&quot;</code> | <p>CSS/XPath selector</p> |


* * *

<a name="Page+source"></a>

### page.source() ⇒ <code>string</code>
<p>Get the complete source of the current browser.</p>

**Kind**: instance method of [<code>Page</code>](#Page)  
**Returns**: <code>string</code> - <p>Complete source of page</p>  

* * *

<a name="Page+text"></a>

### page.text([selector]) ⇒ <code>string</code>
<p>Get the text component of an element</p>

**Kind**: instance method of [<code>Page</code>](#Page)  
**Returns**: <code>string</code> - <ul>
<li>Complete text of selected element</li>
</ul>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [selector] | <code>string</code> | <code>&quot;body&quot;</code> | <p>CSS/XPath selector</p> |


* * *

<a name="Page+screenShotPath"></a>

### page.screenShotPath(...dir_paths) ⇒ <code>string</code>
<p>Set the default screen shot path</p>

**Kind**: instance method of [<code>Page</code>](#Page)  
**Returns**: <code>string</code> - <ul>
<li>Complete path</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| ...dir_paths | <code>any</code> | <p>Directory strings to <code>path.join</code></p> |


* * *

<a name="Page+screenShot"></a>

### page.screenShot(file_name)
<p>Take a screenshot of the current browser. Relative paths require <code>.screenShotPath()</code> to have been set.</p>

**Kind**: instance method of [<code>Page</code>](#Page)  

| Param | Type | Description |
| --- | --- | --- |
| file_name | <code>string</code> | <p>File name for screen shot image</p> |


* * *

<a name="Page.eachBrowser"></a>

### Page.eachBrowser(fn)
<p>Does something for all browsers in page.
Usually for a mocha <code>describe</code> or <code>it</code> block.</p>

**Kind**: static method of [<code>Page</code>](#Page)  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | <p>The function you want to run.</p> |


* * *

<a name="Page.browsers"></a>

### Page.browsers() ⇒ <code>array</code>
<p>Does something for all browsers in page.
Usually for a mocha <code>describe</code> or <code>it</code> block.</p>

**Kind**: static method of [<code>Page</code>](#Page)  
**Returns**: <code>array</code> - <p>List of browsers that have a container config</p>  

* * *

<a name="Page.ip"></a>

### Page.ip([family], [internal])
<p>Find the first, external, IPv4 address on the host running the tests
Won't always be right but close enough.
Useful for docker containers to connect out to</p>

**Kind**: static method of [<code>Page</code>](#Page)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [family] | <code>string</code> | <code>&quot;IPv4&quot;</code> | <p>IPv4 or IPv6</p> |
| [internal] | <code>boolean</code> | <code>false</code> | <p>List internal addresses</p> |


* * *

<a name="Page.setupAsync"></a>

### Page.setupAsync(options) ⇒ [<code>Promise.&lt;Page&gt;</code>](#Page)
<p>Do the class setup and await the promise</p>

**Kind**: static method of [<code>Page</code>](#Page)  
**Returns**: [<code>Promise.&lt;Page&gt;</code>](#Page) - <ul>
<li>page instance after async setup has been done</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | <p>Page options</p> |


* * *

