
# jamstack-translate

### Generate static translations for any front end project.
Google Translate your source folder and compile to static dist language directories without writing convoluted references to json files... I hate i18n libraries so much, here is my personal fix.


#### What does this package do?
* Translates all strings inside `<t>Some String</t>`
* Supports all file types.
* Copies your source files into a generated/translated folder of your choice.
* Generate a named JSON file with all your translations.
* Load specified JSON file to generate files.


#### Example

##### Before...
```
.
├── src
|   └── components
|   |   └── Header.svelte
|   |   └── NoTranslations.svelte
|   └── helpers.js
|   └── App.svelte
|   └── main.js
```

```html
<!-- ./src/components/Header.svelte -->
<header>
  <t>Welcome</t>
</header>
```
```javascript
// ./src/helpers.js
const string = `<t>Welcome to ${name}</t>`
```



##### After...
```
.
├── src
|   ├── __generated__
|   |   └── es
|   |   |   └── components
|   |   |   |   └── Header.svelte
|   |   |   |   └── NoTranslations.svelte
|   |   |   └── helpers.js
|   |   |   └── App.svelte
|   |   └── fr
|   |   |   └── components
|   |   |   |   └── Header.svelte
|   |   |   |   └── NoTranslations.svelte
|   |   |   └── helpers.js
|   |   |   └── App.svelte
|   └── components
|   |   └── Header.svelte
|   |   └── NoTranslations.js
|   └── helpers.js
|   └── App.svelte
|   └── main.js
```

```html
<!-- ./src/__generated__/fr/components/Header.svelte -->
<header>
  <t>Bienvenue</t>
</header>
```
```javascript
// ./src/__generated__/fr/helpers.js
const string = `<t>Bienvenue sur ${name}</t>`
```


The package also produces a (specified) JSON file with your translations, so you may load from file, adjusting translations after initial run. 

```json
[
  {
    "_src": "./src/components/Header.svelte",
    "en": "Welcome",
    "es": "Bienvenidos",
    "fr": "Bienvenue"
  },
  {
    "_src": "./src/helpers.js",
    "en": "Welcome to ${name}",
    "es": "Bienvenido a ${name}",
    "fr": "Bienvenue sur ${name}"
  },
]
```

This file allows version control of your translations, also allows easy A/B testing for your translations quite easily.

See the [Example Svelte.js](./example-svelte) or [Example Vue.js](./example-vue) for how your project can look.

## Requirements
* Node.js > 10
* Google Cloud Translate account + API Key

## Getting started

### Install
`npm install --save-dev jamstack-translate`

### Usage
Create a file in your root directory (ex: translate.js)
```javascript
require('dotenv').config()
const translate = require('../index.js');

const GOOGLEKEY = process.env.GOOGLE_API_KEY
const OPTIONS = {
  targetLanguages: [
    'fr',
    'es',
  ],
  targetFiles: [
    './src/App.svelte',
    './src/components/**/*.svelte',
    './src/views/**/*.svelte',
    './src/helpers.js',
    // etc
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
```

### Run
then simply run
`node translate.js`

---

## Current Issues and best practices and how to avoid them
The pacakge does some rudimentary regex/replace in order to address most issues (mostly caused by Google translate), here are those issues currenlty active and observed.

For most issues, you can manually fix these issues in your created JSON file, and compile with fixes.

#### CSS BEM (Modifier) classes
 
Currently, this...
```html
<t><span class="text--green">hello</span> there</t>
```
Becomes...
```html
<t><span class="text - green"> bonjour </span> là</t>
```

#### Single quotes when inside a JS file

Currently, if you translate a string inside a JS file, like so...
```js
const string = '<t>Please</t>'
```
Becomes 
```js
const string = '<t>S'il vous plaît</t>'
```

Which is unnescaped, and will cause and compile/runtime error. 

Best to use backticks instead of single quotes.
```js
const string = `<t>Please</t>`
```

If you can't use backticks, you must manually escape the single quotes created in your created JSON file, and compile with fixes. 
```json
[
 {
  _file: "file.html",
  en: "Please",
  fr: "S\\'il vous plaît"
 }
]
```


---

## Usage with JS frameworks

#### TLDR
For every new language folder you create, create a new entry file (multi input) for your application and point the respective imports to their lanuage folder. Then, in your `index.html` file, dynamically load your `bundle.js` depending on your method of choosing languages (I prefer URL parameters `?lng={language}`).


### Full Example
*Note: Below is with Rollup/Svelte v3, other docs for webpack etc. will coming soon.*

#### Entry files
Create new main.js files for each new langauge,
```
.
├── src
|   └── App.svelte
|   └── main-es.js <<<< New
|   └── main-fr.js <<<< New
|   └── main.js
```

Edit each new main file, and point to your new entry file

`main-fr.js`
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

`Rollup.config.js`
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

## TODO
- [x] Test static HTML files (`index.html` => `fr/index.html`)
- [x] Parse target folder (src) for all <t> tags.
- [x] Build JSON file of output.
- [x] Load JSON file for input.
- [x] Copy `src/` to `src/__generated__/${lang}/`
- [x] Replace each `src/__generated__/${lang}/` with their translations.
- [x] Clean up translation.json file, duplicates in there.
- [x] Generate `__generated__` folder, and language folders inside.
- [x] Refactor, ready for tests
- [ ] Copy of other folders (non translated) into `dist`.
- [ ] Allow `<title>` translations, as this is parsed as a string inside the html. Do replace?
- [ ] Test React.js cli starter
- [x] Framework agnostic
- [x] Test Svelte.js cli starter
- [x] Test Vue.js cli starter
- [ ] Typescript Support
- [ ] Tests

## Stretch goals
- [ ] Look into an "escape keywork" for variables. Without handlebar variable ${var}, google translate can transform our variables: `{name}` becomes `{nombre}` etc.
  - [ ] Triple underscore idea: `<t>Hello ___{name}___</t>` => `<t>Hola {name}</t>`