// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  disableAuthentication: false,
  snapshotIntervalInSeconds: 5,
  config: {
    url: 'https://yacovi-config-service.azurewebsites.net/api/GetYaCoViConfig'
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
      textAnalysisKeyPhrasesUrl: 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases',
      textAnalysisSentimentUrl: 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment'

    }
  },
  google: {
    search: {
      googleSearchUrl: 'https://www.google.com/search',
      userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.64 Safari/537.31',
      resultCount: '5'
    }
  }
};
