// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  url: 'http://localhost:4200/',
  production: false,
  disableAuthentication: false,
  snapshotIntervalInSeconds: 5,
  config: {
    url: 'https://yacovi-config-service.azurewebsites.net/api/GetConfig'
  },
  references: {
    url: 'http://localhost:7071/api/SearchReferences'
  },
  image: {
    url: 'http://localhost:7071/api/Image'
  },
  contentAvailable: {
    url: 'http://localhost:7071/api/ContentAvailable'
  },
  bing: {
    url: 'https://bing.com',
    searchUrl: 'https://bing.com/search'
  },
  canvas: {
    font: {
      size: '25px',
      family: 'Arial'
    },
    colors: {
      success: '#00FF00',
      error: '#FF0000'
    }
  },
  azure: {
    adal: {
      tenant: '13c728e0-bb0c-4cf7-8e10-5b327279d6d9',
      clientId: '9046ce57-3082-4d8b-bec4-3b76ac73f4bc',
      redirectUri: 'http://localhost:4200/',
      endpoints: ['https://vault.azure.net']
    },
    cognitiveServices: {

      // https://dev.cognitive.microsoft.com/docs/services/e5e22123c5d24f1081f63af1548defa1/operations/56b449fbcf5ff81038d15cdf
      newsSearchUrl: 'https://westeurope.api.cognitive.microsoft.com/bing/v7.0/news/search',
      searchUrl: 'https://westeurope.api.cognitive.microsoft.com/bing/v7.0/search',

      // https://westus.dev.cognitive.microsoft.com/docs/services/TextAnalytics.V2.0/operations/56f30ceeeda5650db055a3c9
      textAnalysisLanguageUrl: 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/languages',
      textAnalysisKeyPhrasesUrl: 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases',
      textAnalysisSentimentUrl: 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment'

    }
  }
};
