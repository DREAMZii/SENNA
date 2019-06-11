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

- [Introduction](#introduction)
- [Quick start](#quick-start)
- [Architecture](#architecture)
- [Views](#views)
- [Tasks](#tasks)
- [Copyright and license](#copyright-and-license)

## Introduction

SENA is the short term for "Sentiment Analysis". We use the "Bing News-Search API (https://azure.microsoft.com/en-us/services/cognitive-services/bing-news-search-api/) to display news for the given term. Those news are displayed in a circle (also called "Bubbles"). We display 7 news max. for every bubble for readability. Every bubble has 7 segments, every segment displays a single news. When you click on a single segment it displays some short facts about the news. Every segment has a score which gets decided by an AI (https://azure.microsoft.com/en-us/services/cognitive-services/text-analytics/). The rated segment also gets a color for whatever rating it gets (green >= 0.6, negative <= 0.4, gray = everything between 0.4 and 0.6). We also display 0-4 "related searchterms" for every searchterm (every related bubble also displays 0-7 news). With a click on a related bubble, it spreads out more related searchterms. This can lead to an endless "mindmap-style" news rating system.

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
 
## Architecture

SENA has 4 (+1) main components:
* An angular frontend written in typescript
* Azure Functions for getting the azure cognitive service api-key, getting the related searchterms from bing and getting the related image for a searchterm. (written in Java)
* The Bing News-Search AP to get all recent news for a searchterm
* The Microsoft Cognitive Text-Analytics API to give the news an automatic rating
* (An express.js backend for mocking search results and images, so everyone can start up this project without any paid API-key)

## Views

SENA has 3 main views:
* /login:
> → Login to your KION account for all features including authentication
> → To disable this, look into the environment file (disableAuthentication)
* /:
> → The initial searchfield to start searching for news
* /search/{searchTerm}
> → The main view of the application
> → Bubbles are also displayed in here with all features available

All assets including SVG-files etc. can be found in assets/.

## Tasks

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
