

// This file is an example of the usage of this package
// Place this file in the root of your directory,
// * Input your google API key (or us dotenv)
// * Choose your target lanuages,
// * Choose your source directory
// * Choose your files to translate (file, or glob)
// * Choose options
// * * Target translation file to save all translations
// * * Load Custom transaltion file (do not translate, simply build generated file structure from saved JSON)
require('dotenv').config()
const translate = require('../index.js');

const GOOGLEKEY = process.env.GOOGLE_API_KEY
const OPTIONS = {
  targetLanguages: [
    'fr',
    'es',
  ],
  targetFiles: [
    './src/App.vue',
    './src/components/**/*.vue',
    './src/views/**/*.vue',
  ],
  targetDirectory: './src/__generated__/',
  sourceDirectory: './src/',
  translationFile: './translations.json',
  loadTranslationsFromFile: true,
}

const init = async () => {
  const result = await translate(GOOGLEKEY, OPTIONS);
  console.log(result);
}

init();
