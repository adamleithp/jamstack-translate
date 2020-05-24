
## ih8i18n / I hate internationalization

#### Static Translations for any front end project.
Google Translate your source folder and compile to static dist language directories without writing convoluted references to json files... I hate i18n libraries so much.

### The End Goal
(TO BE) Used as a webpack/rollup config, which will allow you to simply wrap all strings in your source code with `<t>` and a `</t>`, and on compile for production, it will spit out a translated `${lang}.bundle.js` file. Then simply create a route switch to change bundles/languages.

## Uses
Use Nodejs to pull in a source file, use JSDOM to get all `<t>` tags within dom, create unique className, replace and translate each elements content, then finally copy source file with new DOM to repective dist/lang folder.

## How to use 
* Create your `.env` file from `.env.example`, put your Google Translate API key there.
* Edit your `./src/index.html` file (Put all your translated content in `<t>` (t-tags))
* Open index.js, and add your languages you want to support. (check ./lib/translate.js) for supported languages.
* `node index.js`
* Your `./dist/` folder will now hold your translated html in static form.






## TODO
- [x] Proof of concept with only HTML files (`index.html` => `fr/index.html`)
- [x] Parse target folder (src) for all <t> tags.
- [x] Build JSON file of translations from English
- [x] Copy `src/` to `dist/${lang}/`
- [x] Replace each `dist/${lang}/` with their translations.
- [ ] Clean up translation.json file, duplicates in there.
- [ ] Allow `<title>` translations, as this is parsed as a string inside the html. Do replace?
- [x] Reimplement loading of translation.json file, instead of creating one everytime. (need to use classname in file as-well.)
- [ ] Test Vue.js cli starter
- [ ] Test React.js cli starter
- [ ] Test Svelte.js cli starter



### Translation.json (Created/Pulled)
```
[
  {
    "id": "ii8n-6FlSguT4K",
    "_src": "./src/index.html",
    "_dist": "./dist/es/index.html",
    "en": "Hello, my name is Adam",
    "fr": "Bonjour mon nom est adam",
    "es": "Hola mi nombre es Adam"
  },
  {
    "id": "ii8n-m13WqyfIDh",
    "_src": "./src/index.html",
    "_dist": "./dist/es/index.html",
    "en": "Welcome to my site.",
    "fr": "Bienvenue sur mon site.",
    "es": "Bienvenido a mi sitio."
  }
]
```



### NPM Module
`npm install <name>`
`touch translate.js`
`nano translate.js`

```javascript
const translate = require('translate');

const targetLanguages = [
  'fr',
  'es',
]
const sourceFolder = './src/'
const folderStructure = [
  {
    src: [
      'App.svelte',
      'components/**/*.svelte'
    ]
  },
  {
    dist: '__generated__/{language}/'
  }
]

const GOOGLEKEY = 'GOOGLE API KEY HERE'

const init = async () => {
  const result = await translate(GOOGLEKEY, {
    targetLanguages,
    sourceFolder,
    folderStructure
  });
}

init();
```
`node translate.js`

With the above settings, your source folder will look like this after.
```
.
├── src
|   ├── __generated__
|   |   └── es
|   |   |   └── components
|   |   |   |   └── Header.svelte
|   |   |   └── App.svelte
|   |   └── fr
|   |   |   └── components
|   |   |   |   └── Header.svelte
|   |   |   └── App.svelte
|   └── components
|   |   └── Header.svelte
|   └── App.svelte
|   └── main.js
```

Create new main.js files for each new langauge,
```
.
├── src
|   └── App.svelte
|   └── main-es.js
|   └── main-fr.js
|   └── main.js
```

Edit each new main file, and point to your new entry file

Example `main-fr.js`

```javascript
import App from './__generated__/fr/App.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;
```

Generate a new bundle for each main file,
then in your html, instead of a script tag for bundle.js
```html
<script>
  var urlParams = new URLSearchParams(window.location.search);
  var language = urlParams.get('lng');
  language = language.toLowerCase()

  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'module';
  script.src = '/build/bundle_' + language + '.js';
  head.appendChild(script);
</script>

<!-- <script defer src='/build/bundle.js'></script> -->
```

And then use like so:

`http://localhost:5000/?lng=es`