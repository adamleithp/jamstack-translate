
# jamstack-translate

#### Generate static translations for any front end project.
Google Translate your source folder and compile to static dist language directories without writing convoluted references to json files... I hate i18n libraries so much, here is my personal fix.


#### What does this package do?
Create static translated copies of any source folder in your project, then simply load that translated html/bundle on load.

Options are below.

```
.
├── src
|   └── components
|   |   └── Header.svelte
|   └── App.svelte
|   └── main.js
```

Becomes...
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

##### src/Components/Header.svelte
```
<header>
  <t>Welcome</t>
</header>
```
##### src/__generated__/fr/components/Header.svelte
```
<header>
  <t>Bienvenue</t>
</header>
```


## Requirements
* Node.js
* Google Cloud Translate account + API Key

## Getting started
`npm install --save-dev jamstack-translate`

Note: View our `example` folder for a complete working example.

```javascript
require('dotenv').config()
const translate = require('jamstack-translate');

const targetLanguages = [
  'fr',
  'es',
]
const sourceFolder = './src/'
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
  loadCustomTranslation: false,
  uniqueIdsForDomElements: false,
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
```

## Usage with JS frameworks
*Note: Below is with Rollup/Svelte v3, other docs for webpack etc. will coming soon.*

#### Entry files
Create new main.js files for each new langauge,
```
.
├── src
|   └── App.svelte
|   └── main-es.js <<<<
|   └── main-fr.js <<<<
|   └── main.js
```

Edit each new main file, and point to your new entry file

// `main-fr.js`
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

#### Bundler (Rollup.js)

Generate a new bundle for each main file

// `Rollup.config.js`
```javascript
//...
import multiInput from 'rollup-plugin-multi-input';

export default {
	input: [{
		bundle_en: 'src/main.js',
		bundle_fr: 'src/main-fr.js',
		bundle_es: 'src/main-es.js',
	}],
	output: {
		sourcemap: true,
		name: 'app',
		format: 'es',
		dir: 'public/build'
	},
	plugins: [
		multiInput(),
		// ...
```


#### Index.html (using new bundle)
In your HTML, instead of a script tag for bundle.js, dynamically load your new bundle depending on query param `?lng={language}`
```html
<!-- <script defer src='/build/bundle.js'></script> -->
<script>
	var urlParams = new URLSearchParams(window.location.search);
	var language = urlParams.get('lng') || 'en';
	language = language.toLowerCase()

	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'module';
	script.src = '/build/bundle_' + language + '.js';
	head.appendChild(script);
</script>

```

#### Testing each language
And then use like so:

`http://localhost:5000/?lng=es`

**Note for Svelte.js**:  
Svelte splits elements apart on compile, so in order to a dynamic string inside a translated file, you must set InnerHTML like so; This works really well :D
```javascript
{@html `<t>Hello my name is ${name}, nice to meet you!</t>`}
```


## TODO
- [x] Proof of concept with only HTML files (`index.html` => `fr/index.html`)
- [x] Parse target folder (src) for all <t> tags.
- [x] Build JSON file of translations from English
- [x] Copy `src/` to `dist/${lang}/`
- [x] Replace each `dist/${lang}/` with their translations.
- [x] Clean up translation.json file, duplicates in there.
- [ ] Allow `<title>` translations, as this is parsed as a string inside the html. Do replace?
- [x] Reimplement loading of already generated translation.json file
- [x] Test Svelte.js cli starter
- [ ] Test Vue.js cli starter
- [ ] Test React.js cli starter
- [x] Framework agnostic
- [ ] Typescript
- [ ] Tests