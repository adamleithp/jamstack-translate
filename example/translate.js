require('dotenv').config()
const translate = require('../index.js');

const GOOGLEKEY = process.env.GOOGLE_API_KEY
const OPTIONS = {
  targetLanguages: [
    'es',
  ],
  targetFiles: [
    './src/index.html',
  ],
  targetDirectory: './src/__generated__/',
  sourceDirectory: './src/',
  translationFile: './translations.json',
  loadTranslationsFromFile: false,
}

const init = async () => {
  const result = await translate(GOOGLEKEY, OPTIONS);
  console.log(result);
}

init();
