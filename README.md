  <h1>SENA</h1>
  <p>
    <a href="https://travis-ci.com/KIDICA/SENA" name="SENA Builds" target="_blank">
      <img src="https://travis-ci.com/KIDICA/SENA.svg?branch=master" alt="TravisCi Build Status" />
    </a>
  </p>
  <p>
    <a href="https://sena.kiondc.io" target="_blank">LIVE DEMO</a>
    <br>
    <a href="https://github.com/KIDICA/SENA/issues/new">Report bug</a>
    <br>
    <a href="https://github.com/KIDICA/SENA/issues/new">Request feature</a>
  </p>
</p>

## Table of contents

- [Quick start](#quick-start)
- [What's included](#whats-included)
- [Copyright and license](#copyright-and-license)

## Quick start

**Warning**

> Verify that you are running at least node 8.9.x and npm 5.x.x by running node -v and npm -v in a terminal/console window. Older versions produce errors, but newer versions are fine.

1. Go to project folder and install dependencies.
 ```bash
 npm install
 cd mock-api
 npm install
 ```

2. Launch development server:
 ```bash
 ng serve
 ```
 Open another terminal to start up node server, too!
  ```bash
  cd mock-api
  npm start
  ```
  
3. http://localhost:4200/search/Kion <br>
At the moment only `Kion` or `Kion Group` is supported for mocked data!
 
## What's included

+ Authentication with KION Azure AD
+ Access to <a href='https://docs.microsoft.com/en-us/azure/cognitive-services/computer-vision/home' target='_blank'>Azure Cognitive Services</a> API
* Internationalization with ng-translate and ngx-translate-extract. Also use cache busting for translation files with [webpack translate loader](https://github.com/ngx-translate/http-loader#angular-cliwebpack-translateloader-example)
* Unit tests with Jasmine and Karma including code coverage
* End-to-end tests with Protractor

Tasks                    | Description
-------------------------|---------------------------------------------------------------------------------------
npm install              | Install dependencies
npm run start            | Start the app in development mode
npm run test             | Run unit tests with karma and jasmine
npm run e2e              | Run end to end tests with protractor
npm run build            | Build the app for production
npm run lint             | Run the linter (tslint)
npm run update           | Update the project dependencies with ng update

### Travis CI

We use Travis CI to run this tasks in order:
* Linter
* Tests
* Build for production

## Copyright and license

Code and documentation copyright 2018 the authors. Code released under the [MIT License](https://github.com/KIDICA/SENA/blob/master/LICENSE).
