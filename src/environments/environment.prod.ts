export const environment = {
  url: 'https://sena.kiondc.io/',
  production: true,
  disableAuthentication: false,
  snapshotIntervalInSeconds: 5,
  config: {
    url: 'https://yacovi-config-service.azurewebsites.net/api/GetConfig'
  },
  references: {
    url: 'https://yacovi-config-service.azurewebsites.net/api/SearchReferences'
  },
  image: {
    url: 'https://yacovi-config-service.azurewebsites.net/api/Image'
  },
  contentAvailable: {
    url: 'https://yacovi-config-service.azurewebsites.net/api/ContentAvailable'
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
      redirectUri: 'https://kidica.github.io/SENA/',
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
