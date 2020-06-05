
require('dotenv').config()
const translate = require('./index.js');

const targetLanguages = [
  'fr',
  'es',
]
const sourceFolder = './test-src/'
const folderStructure = [
  {
    src: [
      'App.svelte',
      'components/**/*.svelte',
      'views/**/*.svelte'
    ]
  },
  {
    dist: '__generated__/{language}/'
  }
]

const options = {
  translationFile: './translations.json',
  loadCustomTranslation: true,
}

const GOOGLEKEY = process.env.GOOGLE_API_KEY

const init = async () => {
  const result = await translate(GOOGLEKEY, {
    targetLanguages,
    sourceFolder,
    folderStructure,
    options,
  });
  console.log(result);
}

init();
